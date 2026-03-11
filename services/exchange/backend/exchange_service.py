import json
from time import time
import uuid
import requests
import sys
import pika
from datetime import datetime
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# --- CONFIGURATION ---
EXCHANGE_ACCOUNT_ID = "exchange"
WALLET_SERVICE_URL = "http://wallet-backend:8080/api/wallet"
# USER_SERVICE_URL brauchen wir hier gar nicht mehr! 
RABBITMQ_HOST = "rabbitmq"
EXCHANGE_NAME = "co2_events"

print(f"--- STARTUP CONFIG ---")
print(f"Exchange Service (Lean Version) startet auf Port 8080.")
sys.stdout.flush() 

orders_db = []

# --- RABBITMQ (Mit Retry Logic) ---
rabbitmq_connection = None
rabbitmq_channel = None

def get_rabbitmq_channel():
    global rabbitmq_connection, rabbitmq_channel
    if rabbitmq_connection and rabbitmq_connection.is_open and rabbitmq_channel and rabbitmq_channel.is_open:
        return rabbitmq_channel
    try:
        rabbitmq_connection = pika.BlockingConnection(pika.ConnectionParameters(host=RABBITMQ_HOST, heartbeat=600))
        rabbitmq_channel = rabbitmq_connection.channel()
        rabbitmq_channel.exchange_declare(exchange=EXCHANGE_NAME, exchange_type='topic')
        return rabbitmq_channel
    except Exception as e:
        print(f"[RabbitMQ Error] {e}")
        return None

def publish_trade_event(maker_id, taker_id, amount_token, maker_side):
    """
    Sendet ein generisches Event: TRADE_EXECUTED.
    Keine Business-Logik hier! Nur Fakten.
    """
    global rabbitmq_connection, rabbitmq_channel
    for attempt in range(2):
        try:
            channel = get_rabbitmq_channel()
            if not channel:
                rabbitmq_connection = None
                continue

            # Das Event enthält alle Infos über den Deal
            data_payload = {
                "makerId": maker_id,
                "takerId": taker_id,
                "amount": amount_token,
                "makerSide": maker_side, # 'buy' oder 'sell'
                "timestamp": datetime.utcnow().isoformat()
            }

            event = {
                "eventId": str(uuid.uuid4()),
                "source": "exchange-service",
                "type": "TRADE_EXECUTED", # <--- NEUER EVENT TYP
                "timestamp": datetime.utcnow().isoformat() + "Z",
                "data": data_payload
            }

            channel.basic_publish(
                exchange=EXCHANGE_NAME,
                routing_key="exchange.trade_executed",
                body=json.dumps(event)
            )
            print(f"[RabbitMQ] TRADE_EXECUTED gesendet (Versuch {attempt+1})")
            return 
        except Exception as e:
            print(f"[RabbitMQ Retry] {e}")
            rabbitmq_connection = None
            time.sleep(0.1)

# --- HELPER & ENDPOINTS (Gekürzt) ---

def get_auth_header(user_id): return {'X-User-ID': user_id}

def wallet_transfer(from_id, to_id, amount_eur, amount_token, description="Trade"):
    try:
        url = f"{WALLET_SERVICE_URL}/transfer-combined"
        r = requests.post(url, json={ "toUserId": to_id, "moneyAmount": float(amount_eur), "co2Amount": float(amount_token), "description": description }, headers=get_auth_header(from_id), timeout=5)
        return r.status_code == 200
    except: return False

def wallet_get_balance(user_id):
    try:
        r = requests.get(f"{WALLET_SERVICE_URL}/balance", headers=get_auth_header(user_id), timeout=2)
        if r.status_code == 200: return {"eur": float(r.json().get("moneyBalance",0)), "tokens": float(r.json().get("co2Balance",0))}
    except: pass
    return {"eur": 0.0, "tokens": 0.0}

def get_user_id_from_header():
    uid = request.headers.get('X-User-ID')
    if uid: return uid
    auth = request.headers.get('Authorization')
    if auth and ' ' in auth: return auth.split(' ')[1]
    return "anonym"

@app.route('/api/exchange-service/balance', methods=['GET'])
def get_my_balance(): return jsonify(wallet_get_balance(get_user_id_from_header())), 200

@app.route('/api/exchange-service/orders', methods=['GET'])
def get_orders(): return jsonify([o for o in orders_db if o['status'] == 'open']), 200

@app.route('/api/exchange-service/orders', methods=['POST'])
def create_order():
    try:
        uid = get_user_id_from_header()
        data = request.json
        amt_tok = float(data.get('amount_token', 0)); amt_cash = float(data.get('amount_cash', 0)); typ = data.get('type')
        if amt_tok <= 0 or amt_cash <= 0: return jsonify({"error": "Positiv only"}), 400

        if typ == 'buy': 
            if not wallet_transfer(uid, EXCHANGE_ACCOUNT_ID, amt_cash, 0.0, f"Dep(Buy) {uid}"): return jsonify({"error": "No EUR"}), 400
        elif typ == 'sell':
             if not wallet_transfer(uid, EXCHANGE_ACCOUNT_ID, 0.0, amt_tok, f"Dep(Sell) {uid}"): return jsonify({"error": "No Tokens"}), 400

        order = { "order_id": str(uuid.uuid4()), "user_id": uid, "type": typ, "amount_token": amt_tok, "amount_cash": amt_cash, "status": "open", "created_at": datetime.now().strftime("%Y-%m-%d") }
        orders_db.append(order)
        return jsonify(order), 201
    except: return jsonify({"error": "Error"}), 500

@app.route('/api/exchange-service/orders/<order_id>', methods=['DELETE'])
def delete_order(order_id):
    uid = get_user_id_from_header()
    o = next((x for x in orders_db if x['order_id'] == order_id), None)
    if not o or o['user_id'] != uid or o['status'] != 'open': return jsonify({"error": "N/A"}), 400
    if o['type'] == 'buy': wallet_transfer(EXCHANGE_ACCOUNT_ID, uid, o['amount_cash'], 0.0, "Refund")
    else: wallet_transfer(EXCHANGE_ACCOUNT_ID, uid, 0.0, o['amount_token'], "Refund")
    o['status'] = 'deleted'
    return jsonify({"message": "Deleted"}), 200

@app.route('/api/exchange-service/orders/<order_id>/accept', methods=['POST'])
def accept_order(order_id):
    taker_id = get_user_id_from_header()
    o = next((x for x in orders_db if x['order_id'] == order_id), None)
    if not o or o['status'] != 'open': return jsonify({"error": "N/A"}), 404
    maker_id = o['user_id']
    if taker_id == maker_id: return jsonify({"error": "Self-trade"}), 400

    amt_tok = o['amount_token']; amt_cash = o['amount_cash']; maker_type = o['type']

    # --- NUR NOCH GELD TRANSFERIEREN ---
    if maker_type == 'buy':
        if not wallet_transfer(taker_id, EXCHANGE_ACCOUNT_ID, 0.0, amt_tok, "Taker Dep"): return jsonify({"error": "No Tokens"}), 400
        wallet_transfer(EXCHANGE_ACCOUNT_ID, taker_id, amt_cash, 0.0, "Cash->Taker")
        wallet_transfer(EXCHANGE_ACCOUNT_ID, maker_id, 0.0, amt_tok, "Tok->Maker")
    elif maker_type == 'sell':
        if not wallet_transfer(taker_id, EXCHANGE_ACCOUNT_ID, amt_cash, 0.0, "Taker Dep"): return jsonify({"error": "No Cash"}), 400
        wallet_transfer(EXCHANGE_ACCOUNT_ID, taker_id, 0.0, amt_tok, "Tok->Taker")
        wallet_transfer(EXCHANGE_ACCOUNT_ID, maker_id, amt_cash, 0.0, "Cash->Maker")

    # --- NUR EIN EVENT SENDEN ---
    publish_trade_event(maker_id, taker_id, amt_tok, maker_type)

    o['status'] = 'closed'; o['filled_by'] = taker_id
    return jsonify({"message": "Done", "order": o}), 200

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8080, debug=True)