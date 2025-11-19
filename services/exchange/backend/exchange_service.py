# exchange_service.py
import uuid
import requests # (Hier nicht aktiv genutzt, aber für echten Ledger nötig)
from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime

# --- KONFIGURATION & APP ---
app = Flask(__name__)
CORS(app) 
# Wir simulieren, dass der Ledger auf Port 5002 läuft
LEDGER_SERVICE_URL_BASE = "http://127.0.0.1:5002/api/ledger-service"

# --- DEMO IN-MEMORY DATENBANK ---
# Diese globalen Variablen sind unser "flüchtiger" Speicher.
# Sie werden bei jedem Server-Neustart zurückgesetzt.

# 1. Das Auftragsbuch: Liste aller Aufträge
# Status: 'open', 'filled', 'cancelled'
order_book = []

# 2. Die Handelshistorie: Liste aller erfolgreichen Trades
trade_history = []
# ---------------------------------


# --- MOCK-FUNKTIONEN (LEDGER-SIMULATION) ---
# Diese simulieren die Anrufe an deinen Ledger-Service.
# Wir definieren zwei Test-User für den Postman-Test:
# 'armer_user': Hat viele Tokens, wenig Geld
# 'reicher_user': Hat wenig Tokens, viel Geld

def _get_total_balance_from_ledger(user_id):
    """
    SIMULIERT einen API-Aufruf an den Ledger-Service.
    Gibt das *Gesamtguthaben* des Nutzers zurück.
    """
    print(f"[Mock Ledger] Rufe Gesamtguthaben für {user_id} ab...")
    if user_id == "armer_user":
        # Dieser Nutzer ist "arm" (wenig Geld, viele Tokens)
        return {"eur": 100.0, "tokens": 500.0}
    elif user_id == "reicher_user":
        # Dieser Nutzer ist "reich" (viel Geld, wenig Tokens)
        return {"eur": 10000.0, "tokens": 10.0}
    else:
        # Standard-Nutzer
        return {"eur": 500.0, "tokens": 50.0}

def _execute_trade_on_ledger(buyer_id, seller_id, amount_tokens, amount_eur):
    """
    SIMULIERT die "atomare" Transaktion beim Ledger.
    Gibt True bei Erfolg oder False (z.B. nicht gedeckt) zurück.
    In dieser Demo nehmen wir an, dass es immer klappt,
    da wir die Deckung *vorher* im Exchange-Service prüfen.
    """
    print(f"[Mock Ledger] FÜHRE TRADE AUS:")
    print(f"  > Käufer: {buyer_id}, Verkäufer: {seller_id}")
    print(f"  > Betrag: {amount_tokens} Tokens für {amount_eur} EUR")
    
    # Hier würde der echte API-Aufruf (requests.post(...)) stattfinden.
    # Der echte Ledger würde dann die Konten prüfen und buchen.
    # Wir simulieren, dass es immer erfolgreich ist.
    return True
# --- ENDE MOCK-FUNKTIONEN ---


# --- HILFSFUNKTIONEN (INTERNE LOGIK) ---

def get_user_id_from_header():
    """ 
    Identifiziert den Nutzer anhand des Auth-Headers.
    Wirft einen ValueError, wenn der Header fehlt oder ungültig ist.
    """
    auth_header = request.headers.get('Authorization')
    if not auth_header:
        raise ValueError("Authorization-Header fehlt")
    try:
        token_type, user_id = auth_header.split(' ')
        if token_type.lower() != 'bearer':
            raise ValueError
        return user_id
    except ValueError:
        raise ValueError("Ungültiger Authorization-Header")

def _get_user_reservations(user_id):
    """
    Berechnet das *reservierte* Guthaben eines Nutzers,
    indem alle seine 'open'-Aufträge im Orderbuch summiert werden.
    """
    reserved_eur = 0.0
    reserved_tokens = 0.0
    
    for order in order_book:
        if order['userId'] == user_id and order['status'] == 'open':
            if order['type'] == 'buy':
                # Reserviert EUR für Kaufaufträge
                reserved_eur += order['amount_remaining'] * order['price']
            elif order['type'] == 'sell':
                # Reserviert Tokens für Verkaufsaufträge
                reserved_tokens += order['amount_remaining']
                
    return {"eur": reserved_eur, "tokens": reserved_tokens}

def _get_available_balance(user_id):
    """
    Berechnet das *verfügbare* Guthaben.
    Formel: Verfügbar = Gesamt (vom Ledger) - Reserviert (aus 'open' Orders)
    """
    total = _get_total_balance_from_ledger(user_id)
    reserved = _get_user_reservations(user_id)
    
    available_eur = total['eur'] - reserved['eur']
    available_tokens = total['tokens'] - reserved['tokens']
    
    return {"eur": available_eur, "tokens": available_tokens}

def _find_and_execute_matches(new_order):
    """
    Das Herzstück: Die PARTIAL-FILL Matching-Engine.
    Wird aufgerufen, sobald ein neuer Auftrag erstellt wird.
    """
    print(f"[Matching Engine] Starte Suche für Auftrag {new_order['orderId']}...")
    
    # Wir suchen, solange der neue Auftrag noch 'open' ist und Füllmenge hat
    while new_order['status'] == 'open' and new_order['amount_remaining'] > 0:
        
        best_match = None
        
        if new_order['type'] == 'buy':
            # KÄUFER (new_order) sucht VERKÄUFER (match)
            # Kriterium: Günstigster Preis (min(price)), der <= dem Kauf-Limit ist
            potential_matches = [
                o for o in order_book 
                if o['status'] == 'open' and \
                   o['type'] == 'sell' and \
                   o['userId'] != new_order['userId'] and \
                   o['price'] <= new_order['price']
            ]
            if not potential_matches:
                print("[Matching Engine] Kein passender Verkäufer gefunden.")
                break # Schleife beenden, kein Match
                
            # Sortieren, um den GÜNSTIGSTEN Verkäufer zuerst zu nehmen
            potential_matches.sort(key=lambda o: o['price'])
            best_match = potential_matches[0]
            trade_price = best_match['price'] # Handel findet zum Preis des Verkäufers statt
            
        else: # new_order['type'] == 'sell'
            # VERKÄUFER (new_order) sucht KÄUFER (match)
            # Kriterium: Teuerster Preis (max(price)), der >= dem Verkaufs-Limit ist
            potential_matches = [
                o for o in order_book 
                if o['status'] == 'open' and \
                   o['type'] == 'buy' and \
                   o['userId'] != new_order['userId'] and \
                   o['price'] >= new_order['price']
            ]
            if not potential_matches:
                print("[Matching Engine] Kein passender Käufer gefunden.")
                break # Schleife beenden, kein Match
            
            # Sortieren, um den HÖCHSTBIETENDEN Käufer zuerst zu nehmen
            potential_matches.sort(key=lambda o: o['price'], reverse=True)
            best_match = potential_matches[0]
            trade_price = best_match['price'] # Handel findet zum Preis des Käufers statt

        # --- MATCH GEFUNDEN! ---
        print(f"[Matching Engine] Match gefunden! {new_order['orderId']} mit {best_match['orderId']}")

        # 1. Handelsmenge bestimmen (die kleinere der beiden)
        trade_amount = min(new_order['amount_remaining'], best_match['amount_remaining'])
        trade_eur = trade_amount * trade_price
        
        # 2. IDs bestimmen
        buyer_id = new_order['userId'] if new_order['type'] == 'buy' else best_match['userId']
        seller_id = new_order['userId'] if new_order['type'] == 'sell' else best_match['userId']

        # 3. Ledger Service aufrufen (simuliert)
        trade_success = _execute_trade_on_ledger(buyer_id, seller_id, trade_amount, trade_eur)
        
        if not trade_success:
            # Sollte in unserer Demo nicht passieren, aber in echt:
            # Der Handel ist geplatzt (z.B. Ledger sagt "nicht gedeckt")
            print(f"[Matching Engine] !! LEDGER FEHLER !! Handel geplatzt.")
            # Wir könnten den 'best_match' als 'failed' markieren und weitersuchen
            break # Brechen die Suche für den 'new_order' ab

        # 4. Handel war erfolgreich! Aufträge aktualisieren.
        print(f"[Matching Engine] Handel erfolgreich. Aktualisiere Aufträge.")
        new_order['amount_remaining'] -= trade_amount
        best_match['amount_remaining'] -= trade_amount
        
        # 5. Status der Aufträge prüfen
        if new_order['amount_remaining'] == 0:
            new_order['status'] = 'filled'
        if best_match['amount_remaining'] == 0:
            best_match['status'] = 'filled'
            
        # 6. Handel in Historie speichern
        trade_history.append({
            "tradeId": str(uuid.uuid4()),
            "price": trade_price,
            "amount": trade_amount,
            "timestamp": datetime.utcnow().isoformat()
        })


# --- API-ENDPUNKTE ---

@app.route('/api/exchange-service/test', methods=['GET'])
def test_route():
    return jsonify({"message": "Hallo vom Exchange-Service auf Port 8081!"})

@app.route('/api/exchange-service/my-balance', methods=['GET'])
def get_my_balance():
    """
    Gibt das Gesamt-, Reservierte- und Verfügbare-Guthaben
    des eingeloggten Nutzers zurück.
    """
    try:
        user_id = get_user_id_from_header()
        
        total = _get_total_balance_from_ledger(user_id)
        reserved = _get_user_reservations(user_id)
        
        available = {
            "eur": total['eur'] - reserved['eur'],
            "tokens": total['tokens'] - reserved['tokens']
        }
        
        return jsonify({
            "total": total,
            "reserved": reserved,
            "available": available
        }), 200
        
    except ValueError as e:
        return jsonify({"error": str(e)}), 401
    except Exception as e:
        return jsonify({"error": f"Interner Serverfehler: {e}"}), 500

@app.route('/api/exchange-service/orders', methods=['GET'])
def get_open_orders():
    """
    Gibt das öffentliche Orderbuch zurück (alle offenen Aufträge).
    Keine Authentifizierung nötig.
    """
    # Wir geben nur die Aufträge zurück, die noch 'open' sind
    open_orders = [o for o in order_book if o['status'] == 'open']
    
    # (Optional: Für ein besseres UI die 'buy' und 'sell' trennen)
    buy_orders = sorted(
        [o for o in open_orders if o['type'] == 'buy'], 
        key=lambda o: o['price'], reverse=True
    )
    sell_orders = sorted(
        [o for o in open_orders if o['type'] == 'sell'], 
        key=lambda o: o['price']
    )
    
    return jsonify({"buy_orders": buy_orders, "sell_orders": sell_orders}), 200

@app.route('/api/exchange-service/market-price', methods=['GET'])
def get_market_price():
    """
    Gibt den Preis des letzten Handels zurück ("Last Traded Price").
    Keine Authentifizierung nötig.
    """
    if not trade_history:
        # Kein Handel passiert
        return jsonify({"last_price": None}), 200
    
    # Den Preis des letzten Trades zurückgeben
    return jsonify({"last_price": trade_history[-1]['price']}), 200

@app.route('/api/exchange-service/orders', methods=['POST'])
def create_order():
    """
    Erstellt einen neuen 'buy' oder 'sell' Auftrag.
    Prüft sofort auf verfügbares Guthaben (Asset Locking).
    Startet sofort die Matching-Engine.
    """
    try:
        user_id = get_user_id_from_header()
        data = request.json
        
        order_type = data.get('type')
        amount = float(data.get('amount'))
        price = float(data.get('price'))
        
        if not all([order_type, amount, price]) or order_type not in ['buy', 'sell'] or amount <= 0 or price <= 0:
            return jsonify({"error": "Ungültige Auftragsdaten"}), 400

        # --- ASSET LOCKING PRÜFUNG ---
        available = _get_available_balance(user_id)
        
        if order_type == 'buy':
            required_eur = amount * price
            if required_eur > available['eur']:
                return jsonify({
                    "error": "Nicht genügend verfügbares EUR-Guthaben.",
                    "available_eur": available['eur'],
                    "required_eur": required_eur
                }), 400 # 400 Bad Request
        
        elif order_type == 'sell':
            if amount > available['tokens']:
                return jsonify({
                    "error": "Nicht genügend verfügbare Tokens.",
                    "available_tokens": available['tokens'],
                    "required_tokens": amount
                }), 400 # 400 Bad Request

        # --- PRÜFUNG BESTANDEN ---
        new_order = {
            "orderId": str(uuid.uuid4()),
            "userId": user_id,
            "type": order_type,
            "amount_initial": amount, # Die ursprüngliche Menge
            "amount_remaining": amount, # Die Menge, die noch gefüllt werden muss
            "price": price,
            "status": "open", # 'open', 'filled', 'cancelled'
            "created_at": datetime.utcnow().isoformat()
        }
        
        order_book.append(new_order)
        
        # --- MATCHING-ENGINE STARTEN ---
        _find_and_execute_matches(new_order)
        
        print(f"--- ORDER BOOK (Service 2) --- \n{order_book}\n")
        return jsonify(new_order), 201

    except ValueError as e:
        return jsonify({"error": str(e)}), 401
    except Exception as e:
        print(e)
        return jsonify({"error": f"Interner Serverfehler: {e}"}), 500

@app.route('/api/exchange-service/orders/<string:order_id>', methods=['DELETE'])
def cancel_order(order_id):
    """
    Löscht einen 'open' Auftrag.
    Gibt reserviertes Guthaben wieder frei.
    """
    try:
        user_id = get_user_id_from_header()
        
        # 1. Auftrag finden
        order_to_cancel = next((o for o in order_book if o['orderId'] == order_id), None)
        
        if not order_to_cancel:
            return jsonify({"error": "Auftrag nicht gefunden"}), 404
            
        # 2. Besitz prüfen
        if order_to_cancel['userId'] != user_id:
            return jsonify({"error": "Keine Berechtigung, diesen Auftrag zu löschen"}), 403 # 403 Forbidden
            
        # 3. Status prüfen
        if order_to_cancel['status'] != 'open':
            return jsonify({"error": f"Auftrag kann nicht gelöscht werden (Status: {order_to_cancel['status']})"}), 400
            
        # 4. Löschen (Status ändern)
        order_to_cancel['status'] = 'cancelled'
        
        print(f"--- ORDER BOOK (Service 2) --- \n{order_book}\n")
        return jsonify({"message": "Auftrag erfolgreich gelöscht"}), 200
        
    except ValueError as e:
        return jsonify({"error": str(e)}), 401
    except Exception as e:
        return jsonify({"error": f"Interner Serverfehler: {e}"}), 500


# --- Server starten ---
if __name__ == '__main__':
    # WICHTIG: Auf einem anderen Port als der User Service (8080)!
    app.run(port=8081, debug=True)