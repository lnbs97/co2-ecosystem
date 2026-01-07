import uuid
import requests
import sys
from datetime import datetime
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# --- CONFIGURATION ---
EXCHANGE_ACCOUNT_ID = "exchange"

# IMPORTANT: We use the container name 'wallet-backend' directly.
# This works very reliably within the Docker network.
WALLET_SERVICE_URL = "http://wallet-backend:8080/api/wallet"

print(f"--- STARTUP CONFIG ---")
print(f"Exchange Service startet auf Port 8080.")
print(f"Verbinde zu Wallet API: {WALLET_SERVICE_URL}")
print(f"----------------------")
sys.stdout.flush() # Forces immediate output in the Docker log

# --- EXCHANGE DATA STORAGE ---
orders_db = []

# --- HELPER: COMMUNICATION WITH WALLET API ---

def get_auth_header(user_id):
    """Creates the header for the Wallet API calls"""
    # The Wallet Service expects the User ID in the header 'X-User-ID'
    return {'X-User-ID': user_id}

def wallet_get_balance(user_id):
    """Retrieves the balance from the real Wallet Service."""
    try:
        url = f"{WALLET_SERVICE_URL}/balance"
        headers = get_auth_header(user_id)
        
        # Timeout prevents the service from hanging forever if Wallet is down
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
    """Executes a transaction in the Wallet Service."""
    try:
        url = f"{WALLET_SERVICE_URL}/transfer-combined"
        headers = get_auth_header(from_id) # Important: The sender must be in the header
        
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

# --- HELPER FUNCTIONS ---
def get_user_id_from_header():
    """
    Reads the User ID from the headers.
    Supports both 'X-User-ID' and 'Authorization: Bearer <ID>'.
    """
    # 1. Priority: Direct header (often used by proxies or internal services)
    user_id = request.headers.get('X-User-ID')
    if user_id:
        return user_id

    # 2. Priority: Authorization Header (Standard for frontends)
    auth_header = request.headers.get('Authorization')
    if auth_header and ' ' in auth_header:
        # Cuts off "Bearer " and takes the rest
        return auth_header.split(' ')[1]
    
    return "anonym"

# ==================================================================
# API ENDPOINTS
# ==================================================================

# 1. Show balance
@app.route('/api/exchange-service/balance', methods=['GET'])
def get_my_balance():
    user_id = get_user_id_from_header()
    balance = wallet_get_balance(user_id)
    return jsonify(balance), 200

# 2. Get all orders
@app.route('/api/exchange-service/orders', methods=['GET'])
def get_orders():
    # Show only open orders
    active_orders = [o for o in orders_db if o['status'] == 'open']
    return jsonify(active_orders), 200

# 3. CREATE ORDER
@app.route('/api/exchange-service/orders', methods=['POST'])
def create_order():
    try:
        user_id = get_user_id_from_header()
        data = request.json

        amount_token = float(data.get('amount_token', 0))
        amount_cash = float(data.get('amount_cash', 0.0))
        order_type = data.get('type') # 'buy' or 'sell'

        if amount_token <= 0 or amount_cash <= 0:
            return jsonify({"error": "Values must be positive"}), 400

        # --- LOGIC: Prepayment to escrow account ---
        
        # A) BUY: User sends MONEY to escrow
        if order_type == 'buy':
            success = wallet_transfer(
                from_id=user_id, 
                to_id=EXCHANGE_ACCOUNT_ID, 
                amount_eur=amount_cash, 
                amount_token=0.0,
                description=f"Order Deposit (Buy) {user_id}"
            )
            if not success:
                return jsonify({"error": "Transfer failed (Not enough EUR)!"}), 400
        
        # B) SELL: User sends TOKENS to escrow
        elif order_type == 'sell':
            success = wallet_transfer(
                from_id=user_id, 
                to_id=EXCHANGE_ACCOUNT_ID, 
                amount_eur=0.0, 
                amount_token=amount_token,
                description=f"Order Deposit (Sell) {user_id}"
            )
            if not success:
                return jsonify({"error": "Transfer failed (Not enough tokens)!"}), 400

        # C) Save order
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
        return jsonify({"error": "Server error"}), 500

# 4. DELETE ORDER (Refund)
@app.route('/api/exchange-service/orders/<order_id>', methods=['DELETE'])
def delete_order(order_id):
    user_id = get_user_id_from_header()
    order = next((o for o in orders_db if o['order_id'] == order_id), None)

    if not order: return jsonify({"error": "Order not found"}), 404
    if order['user_id'] != user_id: return jsonify({"error": "This is not your order"}), 403
    if order['status'] != 'open': return jsonify({"error": "Order is no longer open"}), 400

    # --- REFUND ---
    success = False
    if order['type'] == 'buy':
        # Money back
        success = wallet_transfer(EXCHANGE_ACCOUNT_ID, user_id, order['amount_cash'], 0.0, f"Refund {order_id}")
    elif order['type'] == 'sell':
        # Tokens back
        success = wallet_transfer(EXCHANGE_ACCOUNT_ID, user_id, 0.0, order['amount_token'], f"Refund {order_id}")

    if not success: return jsonify({"error": "Refund failed"}), 500

    order['status'] = 'deleted'
    return jsonify({"message": "Order deleted and funds refunded"}), 200

# 5. ACCEPT ORDER (Trade Execution)
@app.route('/api/exchange-service/orders/<order_id>/accept', methods=['POST'])
def accept_order(order_id):
    taker_id = get_user_id_from_header()
    order = next((o for o in orders_db if o['order_id'] == order_id), None)

    if not order or order['status'] != 'open': return jsonify({"error": "Order not available"}), 404
    maker_id = order['user_id']
    if taker_id == maker_id: return jsonify({"error": "You cannot accept your own order"}), 400

    # --- TRADE LOGIC ---
    if order['type'] == 'buy':
        # Maker wants to buy (Money is already in escrow)
        # Taker must send tokens to escrow
        if not wallet_transfer(taker_id, EXCHANGE_ACCOUNT_ID, 0.0, order['amount_token'], "Trade: Taker Deposit"):
             return jsonify({"error": "You don't have enough tokens!"}), 400
        
        # Swap: Money to Taker, Tokens to Maker
        wallet_transfer(EXCHANGE_ACCOUNT_ID, taker_id, order['amount_cash'], 0.0, "Trade: Cash to Taker")
        wallet_transfer(EXCHANGE_ACCOUNT_ID, maker_id, 0.0, order['amount_token'], "Trade: Tokens to Maker")

    elif order['type'] == 'sell':
        # Maker wants to sell (Tokens are already in escrow)
        # Taker must send money to escrow
        if not wallet_transfer(taker_id, EXCHANGE_ACCOUNT_ID, order['amount_cash'], 0.0, "Trade: Taker Deposit"):
             return jsonify({"error": "You don't have enough money!"}), 400

        # Swap: Tokens to Taker, Money to Maker
        wallet_transfer(EXCHANGE_ACCOUNT_ID, taker_id, 0.0, order['amount_token'], "Trade: Tokens to Taker")
        wallet_transfer(EXCHANGE_ACCOUNT_ID, maker_id, order['amount_cash'], 0.0, "Trade: Cash to Maker")

    order['status'] = 'closed'
    order['filled_by'] = taker_id

    return jsonify({"message": "Trade successfully executed!", "order": order}), 200

if __name__ == '__main__':
    # Important: 0.0.0.0 for Docker accessibility
    app.run(host='0.0.0.0', port=8080, debug=True)