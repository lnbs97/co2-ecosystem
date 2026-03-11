import eventlet
eventlet.monkey_patch()

import uuid
import requests
from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_socketio import SocketIO, emit
import user_worker

# ==============================================================================
# KONFIGURATION & EXTERNE DIENSTE
# ==============================================================================

# URL zum Wallet-Backend (Kotlin/Spring Boot). 
# Hierhin senden wir Requests, um Konten für neue User zu erstellen.
WALLET_SERVICE_URL = "http://wallet-backend:8080/api/wallet/wallets"

# 🚫 BLACKLIST KONFIGURATION
# Diese UUIDs werden in öffentlichen Listen (z.B. Überweisungs-Dropdowns) ausgeblendet.
# "exchange" ist der feste Account für die Börse/Bank.
BOERSE_UUID = "exchange" 
ShOP_UUID = "shop-eco-fashion"
USER_BLACKLIST = [BOERSE_UUID]

# ==============================================================================
# APP SETUP
# ==============================================================================
app = Flask(__name__)

# CORS (Cross-Origin Resource Sharing) aktivieren, damit das Frontend (z.B. auf Port 3000)
# Anfragen an dieses Backend (Port 8080/5000) senden darf, ohne blockiert zu werden.
CORS(app) 

socketio = SocketIO(app, cors_allowed_origins="*", async_mode='eventlet')

# ==============================================================================
# MOCK DATENBANK (In-Memory)
# ==============================================================================
# Da wir keine echte SQL-Datenbank haben, speichern wir User hier in einer Liste.
# Achtung: Beim Neustart des Servers gehen diese Daten verloren!
user_database = []

# Zähler, um abwechselnd "reiche" und "arme" User zu generieren.
user_counter = 0


# ==============================================================================
# ENDPUNKTE
# ==============================================================================

# ------------------------------------------------------------------------------
# 1. GET /api/user-service/users
# Zweck: Liefert eine Liste aller verfügbaren User für das Frontend (z.B. Dropdown).
# Logik: Filtert System-Accounts (Blacklist) heraus.
# ------------------------------------------------------------------------------
@app.route('/api/user-service/users', methods=['GET'])
def get_all_users():
    public_user_list = []

    for user in user_database:
        # Schritt 1: Blacklist prüfen
        # System-Accounts wie die "Börse" sollen nicht im Dropdown für normale Überweisungen auftauchen.
        if user['userId'] in USER_BLACKLIST:
            continue # Diesen Schleifendurchlauf überspringen
        
        # Schritt 2: Sensible Daten filtern
        # Wir geben nur ID und Vorname zurück. Kontostände oder User-Typen sind hier irrelevant.
        user_info = {
            "userId": user['userId'],
            "vorname": user['vorname']
        }
        public_user_list.append(user_info)

    return jsonify(public_user_list), 200


# ------------------------------------------------------------------------------
# 2. GET /api/user-service/me
# Zweck: Gibt die Profil-Daten des aktuell eingeloggten Nutzers zurück.
# Auth: Erwartet einen "Authorization: Bearer <userId>" Header.
# ------------------------------------------------------------------------------
@app.route('/api/user-service/me', methods=['GET'])
def get_user_me():
    # Schritt 1: Authentifizierungs-Header auslesen
    auth_header = request.headers.get('Authorization')

    if not auth_header:
        return jsonify({"error": "Authorization-Header fehlt"}), 401

    # Schritt 2: Token parsen (Format: "Bearer <UUID>")
    try:
        token_type, user_id = auth_header.split(' ')
        if token_type.lower() != 'bearer':
            raise ValueError
    except ValueError:
        return jsonify({"error": "Ungültiger Authorization-Header"}), 401

    # Schritt 3: Nutzer in der "Datenbank" suchen
    # next() sucht das erste Element, das passt. Gibt None zurück, wenn nicht gefunden.
    user = next((u for u in user_database if u['userId'] == user_id), None)

    if user:
        # Nutzer gefunden -> Profildaten zurückgeben
        return jsonify({
            "userId": user['userId'],
            "vorname": user['vorname'],
            "userType": user['userType']
        }), 200
    else:
        # ID im Token existiert nicht in unserer DB
        return jsonify({"error": "Nutzer nicht gefunden"}), 404


# ------------------------------------------------------------------------------
# 3. Test-Route
# Zweck: Einfacher Health-Check, um zu sehen, ob der Server läuft.
# ------------------------------------------------------------------------------
@app.route('/api/user-service/test', methods=['GET'])
def get_hello():
    return jsonify({"message": "Hallo Welt vom Flask-Backend auf Port 8080!"})


# ------------------------------------------------------------------------------
# 4. POST /api/user-service/register
# Zweck: Registriert einen neuen User und erstellt automatisch ein Wallet im Wallet-Service.
# Logik: Weist User abwechselnd dem Typ "reich" oder "arm" zu (Spielmechanik).
# ------------------------------------------------------------------------------
@app.route('/api/user-service/register', methods=['POST'])
def register_user():
    global user_counter
    
    # Äußerer Try-Block für allgemeine Server-Fehler
    try:
        # Schritt 1: Request Daten validieren
        data = request.json
        vorname = data.get('vorname')
        if not vorname:
            return jsonify({"error": "Vorname fehlt"}), 400

        # Neue eindeutige ID generieren
        user_id = str(uuid.uuid4())

        # Schritt 2: Spielmechanik "Reich vs. Arm"
        # Wir nutzen Modulo (%), um bei jeder Registrierung abzuwechseln.
        is_rich = user_counter % 2 == 1
        
        if is_rich:
            user_type = 'reich'
            initial_money = 1000.0  # Viel Geld, wenig CO2-Rechte
            initial_co2 = 5.0       
        else:
            user_type = 'arm'
            initial_money = 50.0    # Wenig Geld, viele CO2-Rechte
            initial_co2 = 100.0     
        
        user_counter += 1

        # Schritt 3: User lokal speichern
        user_database.append({
            "userId": user_id,
            "vorname": vorname,
            "userType": user_type
        })
        print(f"--- USER DB UPDATE (Lokal) --- \n{user_database}\n")

        # Schritt 4: Synchroner Aufruf zum Wallet-Service
        # Wir müssen dem Wallet-Service mitteilen, dass er ein Konto für diesen neuen User anlegt.
        try:
            print(f"Info: Erstelle Wallet für User {user_id} bei {WALLET_SERVICE_URL}...")

            # Payload passend zum DTO des Wallet-Services (Kotlin)
            wallet_payload = {
                "userId": user_id,
                "co2Balance": initial_co2,
                "moneyBalance": initial_money,
            }

            # HTTP POST Request an den anderen Microservice senden
            response = requests.post(WALLET_SERVICE_URL, json=wallet_payload, timeout=5)

            # Fehlerprüfung: Hat der Wallet-Service gemeckert (z.B. 400 oder 500)?
            if response.status_code != 200:
                print(f"Warnung: Fehler vom Wallet-Service: {response.text}")

            # Wirft eine Exception, falls status_code 4xx oder 5xx ist
            response.raise_for_status()

            print(">>> Erfolg: Wallet erfolgreich erstellt! <<<")

        except requests.exceptions.RequestException as e:
            # WICHTIG: Wenn das Wallet nicht erstellt werden kann, ist die Registrierung fehlerhaft.
            print(f"!! CRITICAL: Fehler beim Erstellen des Wallets: {e}")
            
            # Optional: Hier könnte man den User aus user_database wieder entfernen (Rollback).
            # Für diesen Prototypen geben wir einfach einen 500er Fehler zurück.
            return jsonify({"error": "Konnte Wallet nicht erstellen. Registrierung abgebrochen."}), 500

        # Alles erfolgreich -> 201 Created zurückgeben
        return jsonify({"userId": user_id, "userType": user_type}), 201

    except Exception as e:
        print(f"Unerwarteter Fehler: {e}")
        return jsonify({"error": "Interner Serverfehler"}), 500


# ------------------------------------------------------------------------------
# 5. GET /api/user-service/users/<user_id>
# Zweck: Öffentlicher Endpunkt, um den Namen zu einer ID zu finden.
# Nützlich, um in Listen (Transaktionen etc.) statt der ID den Namen anzuzeigen.
# ------------------------------------------------------------------------------
@app.route('/api/user-service/users/<user_id>', methods=['GET'])
def get_user_by_id(user_id):
    # Durchsuche die Datenbank nach der ID
    user = next((u for u in user_database if u['userId'] == user_id), None)

    if user:
        # Gefunden: Gib ID und Vorname zurück
        return jsonify({
            "userId": user['userId'],
            "vorname": user['vorname'],
            "userType": user['userType']
        }), 200
    else:
        # Nicht gefunden
        return jsonify({"error": "Nutzer nicht gefunden"}), 404

# Dieser Endpunkt wird von deinem 'user_worker.py' aufgerufen
@app.route('/api/user-service/users/<user_id>/tasks', methods=['POST'])
def add_task(user_id):
    data = request.json
    task_id = data.get('taskId')
    
    user = next((u for u in user_database if u['userId'] == user_id), None)
    if not user: return jsonify({"error": "User not found"}), 404
        
    if 'completed_tasks' not in user:
        user['completed_tasks'] = []
        
    # Task speichern
    if task_id not in user['completed_tasks']:
        user['completed_tasks'].append(task_id)
        
        print(f"🚀 PUSH: Sende WebSocket Event für User {user_id} -> {task_id}")
        
        # ⭐️ WEBSOCKET EMIT
        # Wir senden eine Nachricht 'task_update' an ALLE verbundenen Clients.
        # Das Frontend prüft dann, ob die userId passt.
        socketio.emit('task_update', {
            'userId': user_id,
            'taskId': task_id
        })
        
        return jsonify({"status": "added", "tasks": user['completed_tasks']}), 200
    
    return jsonify({"status": "exists"}), 200

@app.route('/api/user-service/users/<user_id>/tasks', methods=['GET'])
def get_user_tasks(user_id):
    # User suchen
    user = next((u for u in user_database if u['userId'] == user_id), None)
    
    # Wenn User nicht existiert oder keine Tasks hat -> leere Liste
    if not user: 
        return jsonify({"completed_tasks": []}), 200
    
    # Liste zurückgeben
    return jsonify({
        "completed_tasks": user.get('completed_tasks', [])
    }), 200
# ==============================================================================
# SERVER START
# ==============================================================================
if __name__ == '__main__':
    # Startet den Flask Development Server.
    # host='0.0.0.0' macht den Server im lokalen Netzwerk verfügbar.
    socketio.run(app, host='0.0.0.0', port=8080, debug=True)