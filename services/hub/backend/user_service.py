import uuid
import requests
from flask import Flask, request, jsonify
from flask_cors import CORS

# --- KONFIGURATION ---
WALLET_SERVICE_URL = "http://wallet-backend:8080/api/wallet/wallets"
# ---------------------

app = Flask(__name__)
CORS(app) 

# --- Simulation deiner User-Datenbank ---
user_database = []
user_counter = 0
# ----------------------------------------

# ⭐️ --- NEUER ENDPUNKT --- ⭐️
# Dieser Endpunkt gibt die Daten des eingeloggten Nutzers zurück.
# Das Frontend muss die userId als "Bearer Token" im Header mitschicken.
@app.route('/api/user-service/me', methods=['GET'])
def get_user_me():
    # 1. Hole den "Authorization" Header aus der Anfrage
    auth_header = request.headers.get('Authorization')

    if not auth_header:
        return jsonify({"error": "Authorization-Header fehlt"}), 401

    # Der Header sollte so aussehen: "Bearer a1b2c3d4-..."
    try:
        # Teile den Header in "Bearer" und die "userId"
        token_type, user_id = auth_header.split(' ')
        if token_type.lower() != 'bearer':
            raise ValueError
    except ValueError:
        return jsonify({"error": "Ungültiger Authorization-Header"}), 401

    # 2. Finde den Nutzer in unserer "Datenbank" (der Liste)
    #    (next(...) durchsucht die Liste und gibt das erste Element zurück,
    #     das der Bedingung entspricht, oder None)
    user = next((u for u in user_database if u['userId'] == user_id), None)

    if user:
        # 3. Nutzer gefunden! Sende den Vornamen zurück.
        return jsonify({
            "userId": user['userId'],
            "vorname": user['vorname'],
            "userType": user['userType']
        }), 200
    else:
        # 4. Nutzer nicht gefunden (ungültige/alte userId)
        return jsonify({"error": "Nutzer nicht gefunden"}), 404

# Test-Route (kannst du so lassen)
@app.route('/api/user-service/test', methods=['GET'])
def get_hello():
    return jsonify({"message": "Hallo Welt vom Flask-Backend auf Port 8080!"})

@app.route('/api/user-service/register', methods=['POST'])
def register_user():
    global user_counter
    try:
        data = request.json
        vorname = data.get('vorname')
        if not vorname:
            return jsonify({"error": "Vorname fehlt"}), 400

        # --- Deine Logik ---
        user_id = str(uuid.uuid4())

        # Reich/Arm Logik wieder aktivieren für das Startguthaben
        is_rich = user_counter % 2 == 1
        user_type = 'reich' if is_rich else 'arm'
        initial_balance = 1000.0 if is_rich else 50.0 # Beispielwerte

        user_counter += 1

        # User lokal speichern
        user_database.append({
            "userId": user_id,
            "vorname": vorname,
            "userType": user_type
        })
        print(f"--- USER DB (Service 1) --- \n{user_database}\n")

        # ⭐️ --- AUFRUF ZUM WALLET SERVICE --- ⭐️
        try:
            print(f"Erstelle Wallet für User {user_id} bei {WALLET_SERVICE_URL}...")

            # Das JSON muss zum 'CreateWalletRequest' DTO im Kotlin-Backend passen
            wallet_payload = {
                "userId": user_id,
                "co2Balance": initial_balance,
                "moneyBalance": initial_balance,
            }

            response = requests.post(WALLET_SERVICE_URL, json=wallet_payload, timeout=5)

            # Wenn der Wallet-Service z.B. 400 sendet, sehen wir jetzt den Grund im Log:
            if response.status_code != 200:
                print(f"Fehler vom Wallet-Service: {response.text}")

            response.raise_for_status()

            print(">>> Wallet erfolgreich erstellt! <<<")

        except requests.exceptions.RequestException as e:
            # Wir loggen den Fehler, aber lassen die Registrierung vielleicht trotzdem durchgehen
            # oder geben einen Fehler zurück, je nach Anforderung.
            print(f"!! FEHLER beim Erstellen des Wallets: {e}")
            # Option A: Hart abbrechen
            return jsonify({"error": "Konnte Wallet nicht erstellen. Registrierung abgebrochen."}), 500
            # Option B: Ignorieren (User hat dann kein Wallet) -> hier nicht empfohlen.

        return jsonify({"userId": user_id, "userType": user_type}), 201

    except Exception as e:
        print(e)
        return jsonify({"error": "Interner Serverfehler"}), 500

# Server auf Port 8080 starten
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8080, debug=True)