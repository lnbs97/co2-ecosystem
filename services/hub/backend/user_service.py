import uuid
# import requests # 1. Import auskommentiert (wird nicht mehr gebraucht)
from flask import Flask, request, jsonify
from flask_cors import CORS

# --- KONFIGURATION ---
# (Ledger-URL wird nicht mehr gebraucht)
# LEDGER_SERVICE_URL = "http://127.0.0.1:5002/ledger-service/create-account"
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

# Deine Registrierungs-Route
@app.route('/api/user-service/register', methods=['POST'])
def register_user():
    global user_counter
    try:
        data = request.json
        vorname = data.get('vorname')
        if not vorname:
            return jsonify({"error": "Vorname fehlt"}), 400

        # --- Deine Logik (UUID, reich/arm) ---
        user_id = str(uuid.uuid4())
        is_rich = user_counter % 2 == 1
        user_type = 'reich' if is_rich else 'arm'
        # initial_tokens = 5000 if is_rich else 500 # (Wird für den Ledger gebraucht, hier nicht)
        user_counter += 1

        user_database.append({
            "userId": user_id,
            "vorname": vorname,
            "userType": user_type
        })
        print(f"--- USER DB (Service 1) --- \n{user_database}\n")

        # --- INTERNER API-AUFRUF ZUM LEDGER SERVICE (JETZT AUSKOMMENTIERT) ---
        
        # 2. Den gesamten Block auskommentieren
        # print(f"Rufe Ledger Service auf: {LEDGER_SERVICE_URL}")
        # ledger_payload = {
        #     "userId": user_id,
        #     "initialBalance": initial_tokens
        # }
        # response = requests.post(LEDGER_SERVICE_URL, json=ledger_payload)
        # response.raise_for_status() 
        
        print(">>> Ledger-Aufruf übersprungen (Testmodus) <<<")

        # --- Antwort an das Frontend ---
        # Dies funktioniert jetzt immer, da der Ledger-Teil übersprungen wird
        return jsonify({"userId": user_id}), 201

    # 3. Die spezielle Fehlerbehandlung für 'requests' ist nicht mehr nötig
    # except requests.exceptions.RequestException as e:
    #     print(f"!! FEHLER: Ledger Service nicht erreichbar unter {LEDGER_SERVICE_URL}")
    #     ...
    except Exception as e:
        print(e)
        return jsonify({"error": "Interner Serverfehler"}), 500

# Server auf Port 8080 starten
if __name__ == '__main__':
    app.run(port=8080, debug=True)