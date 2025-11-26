import uuid
import requests
import sys
from datetime import datetime
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# --- KONFIGURATION ---
EXCHANGE_ACCOUNT_ID = "exchange"

# WICHTIG: Wir nutzen direkt den Container-Namen 'wallet-backend'.
# Das funktioniert innerhalb des Docker-Netzwerks sehr zuverlässig.
WALLET_SERVICE_URL = "http://wallet-backend:8080/api/wallet"

print(f"--- STARTUP CONFIG ---")
print(f"Exchange Service startet auf Port 8080.")
print(f"Verbinde zu Wallet API: {WALLET_SERVICE_URL}")
print(f"----------------------")
sys.stdout.flush() # Erzwingt sofortige Ausgabe im Docker Log

# --- DATENHALTUNG BÖRSE ---
orders_db = []

# --- HELPER: KOMMUNIKATION MIT WALLET API ---

def get_auth_header(user_id):
    """Erstellt den Header für die Wallet API Calls"""
    # Der Wallet-Service erwartet die User-ID im Header 'X-User-ID'
    return {'X-User-ID': user_id}

def wallet_get_balance(user_id):
    """Ruft das Guthaben vom echten Wallet-Service ab."""
    try:
        url = f"{WALLET_SERVICE_URL}/balance"
        headers = get_auth_header(user_id)
        
        # Timeout verhindert, dass der Service ewig hängt, wenn Wallet down ist
        response = requests.get(url, headers=headers, timeout=5)
        
        if response.status_code == 200:
            data = response.json()
            return {
                "eur": float(data.get("moneyBalance", 0.0)),
                "tokens": float(data.get("co2Balance", 0.0))
            }
        else:
            print(f"[Wallet Error] Get Balance failed ({response.status_code}): {response.text}")
            return {"eur": 0.0, "tokens": 0.0}
    except Exception as e:
        print(f"[Internal Error] Connection to Wallet Service failed: {e}")
        return {"eur": 0.0, "tokens": 0.0}

def wallet_transfer(from_id, to_id, amount_eur, amount_token, description="Trade"):
    """Führt eine Transaktion im Wallet-Service durch."""
    try:
        url = f"{WALLET_SERVICE_URL}/transfer-combined"
        headers = get_auth_header(from_id) # Wichtig: Der Sender muss im Header stehen
        
        payload = {
            "toUserId": to_id,
            "moneyAmount": float(amount_eur),
            "co2Amount": float(amount_token),
            "description": description
        }

        response = requests.post(url, json=payload, headers=headers, timeout=5)

        if response.status_code == 200:
            print(f"[Wallet Success] {from_id} -> {to_id}: {amount_eur}€ | {amount_token} CO2")
            return True
        else:
            print(f"[Wallet Error] Transfer failed ({response.status_code}): {response.text}")
            return False

    except Exception as e:
        print(f"[Internal Error] Transfer Request failed: {e}")
        return False

# --- HILFSFUNKTIONEN ---
def get_user_id_from_header():
    """
    Liest die User-ID aus den Headern.
    Unterstützt sowohl 'X-User-ID' als auch 'Authorization: Bearer <ID>'.
    """
    # 1. Priorität: Direkter Header (wird oft von Proxies oder internen Services genutzt)
    user_id = request.headers.get('X-User-ID')
    if user_id:
        return user_id

    # 2. Priorität: Authorization Header (Standard für Frontends)
    auth_header = request.headers.get('Authorization')
    if auth_header and ' ' in auth_header:
        # Schneidet "Bearer " ab und nimmt den Rest
        return auth_header.split(' ')[1]
    
    return "anonym"

# ==================================================================
# API ENDPUNKTE
# ==================================================================

# 1. Guthaben anzeigen
@app.route('/api/exchange-service/balance', methods=['GET'])
def get_my_balance():
    user_id = get_user_id_from_header()
    balance = wallet_get_balance(user_id)
    return jsonify(balance), 200

# 2. Alle Orders abrufen
@app.route('/api/exchange-service/orders', methods=['GET'])
def get_orders():
    # Zeige nur offene Orders an
    active_orders = [o for o in orders_db if o['status'] == 'open']
    return jsonify(active_orders), 200

# 3. ORDER ERSTELLEN
@app.route('/api/exchange-service/orders', methods=['POST'])
def create_order():
    try:
        user_id = get_user_id_from_header()
        data = request.json

        amount_token = float(data.get('amount_token', 0))
        amount_cash = float(data.get('amount_cash', 0.0))
        order_type = data.get('type') # 'buy' oder 'sell'

        if amount_token <= 0 or amount_cash <= 0:
            return jsonify({"error": "Werte müssen positiv sein"}), 400

        # --- LOGIK: Vorkasse an Treuhandkonto ---
        
        # A) KAUFEN: User sendet GELD an Treuhand
        if order_type == 'buy':
            success = wallet_transfer(
                from_id=user_id, 
                to_id=EXCHANGE_ACCOUNT_ID, 
                amount_eur=amount_cash, 
                amount_token=0.0,
                description=f"Order Deposit (Buy) {user_id}"
            )
            if not success:
                return jsonify({"error": "Transfer fehlgeschlagen (Nicht genug EUR)!"}), 400
        
        # B) VERKAUFEN: User sendet TOKENS an Treuhand
        elif order_type == 'sell':
            success = wallet_transfer(
                from_id=user_id, 
                to_id=EXCHANGE_ACCOUNT_ID, 
                amount_eur=0.0, 
                amount_token=amount_token,
                description=f"Order Deposit (Sell) {user_id}"
            )
            if not success:
                return jsonify({"error": "Transfer fehlgeschlagen (Nicht genug Tokens)!"}), 400

        # C) Order speichern
        new_order = {
            "order_id": str(uuid.uuid4()),
            "user_id": user_id,
            "type": order_type,
            "amount_token": amount_token,
            "amount_cash": amount_cash,
            "status": "open",
            "created_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        }
        orders_db.append(new_order)
        
        return jsonify(new_order), 201

    except Exception as e:
        print(f"Error creating order: {e}")
        return jsonify({"error": "Serverfehler"}), 500

# 4. ORDER LÖSCHEN (Rückerstattung)
@app.route('/api/exchange-service/orders/<order_id>', methods=['DELETE'])
def delete_order(order_id):
    user_id = get_user_id_from_header()
    order = next((o for o in orders_db if o['order_id'] == order_id), None)
    
    if not order: return jsonify({"error": "Order nicht gefunden"}), 404
    if order['user_id'] != user_id: return jsonify({"error": "Das ist nicht deine Order"}), 403
    if order['status'] != 'open': return jsonify({"error": "Order ist nicht mehr offen"}), 400

    # --- RÜCKZAHLUNG ---
    success = False
    if order['type'] == 'buy':
        # Geld zurück
        success = wallet_transfer(EXCHANGE_ACCOUNT_ID, user_id, order['amount_cash'], 0.0, f"Refund {order_id}")
    elif order['type'] == 'sell':
        # Tokens zurück
        success = wallet_transfer(EXCHANGE_ACCOUNT_ID, user_id, 0.0, order['amount_token'], f"Refund {order_id}")

    if not success: return jsonify({"error": "Rückerstattung fehlgeschlagen"}), 500

    order['status'] = 'deleted'
    return jsonify({"message": "Order gelöscht und Guthaben erstattet"}), 200

# 5. ORDER ANNEHMEN (Trade Execution)
@app.route('/api/exchange-service/orders/<order_id>/accept', methods=['POST'])
def accept_order(order_id):
    taker_id = get_user_id_from_header()
    order = next((o for o in orders_db if o['order_id'] == order_id), None)
    
    if not order or order['status'] != 'open': return jsonify({"error": "Order nicht verfügbar"}), 404
    maker_id = order['user_id']
    if taker_id == maker_id: return jsonify({"error": "Du kannst nicht deine eigene Order annehmen"}), 400

    # --- TRADE LOGIK ---
    if order['type'] == 'buy':
        # Maker will Kaufen (Geld ist schon bei Treuhand)
        # Taker muss Tokens an Treuhand senden
        if not wallet_transfer(taker_id, EXCHANGE_ACCOUNT_ID, 0.0, order['amount_token'], "Trade: Taker Deposit"):
             return jsonify({"error": "Du hast nicht genug Tokens!"}), 400
        
        # Swap: Geld an Taker, Tokens an Maker
        wallet_transfer(EXCHANGE_ACCOUNT_ID, taker_id, order['amount_cash'], 0.0, "Trade: Cash to Taker")
        wallet_transfer(EXCHANGE_ACCOUNT_ID, maker_id, 0.0, order['amount_token'], "Trade: Tokens to Maker")

    elif order['type'] == 'sell':
        # Maker will Verkaufen (Tokens sind schon bei Treuhand)
        # Taker muss Geld an Treuhand senden
        if not wallet_transfer(taker_id, EXCHANGE_ACCOUNT_ID, order['amount_cash'], 0.0, "Trade: Taker Deposit"):
             return jsonify({"error": "Du hast nicht genug Geld!"}), 400

        # Swap: Tokens an Taker, Geld an Maker
        wallet_transfer(EXCHANGE_ACCOUNT_ID, taker_id, 0.0, order['amount_token'], "Trade: Tokens to Taker")
        wallet_transfer(EXCHANGE_ACCOUNT_ID, maker_id, order['amount_cash'], 0.0, "Trade: Cash to Maker")

    order['status'] = 'closed'
    order['filled_by'] = taker_id
    
    return jsonify({"message": "Trade erfolgreich ausgeführt!", "order": order}), 200

if __name__ == '__main__':
    # Wichtig: 0.0.0.0 für Docker Erreichbarkeit
    app.run(host='0.0.0.0', port=8080, debug=True)