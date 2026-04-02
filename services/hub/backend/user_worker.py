import pika
import json
import time
import requests

# Wir nutzen localhost, weil der Worker im selben Container läuft wie der User-Service
INTERNAL_API_URL = "http://localhost:8080/api/user-service"
RABBITMQ_HOST = "rabbitmq"
EXCHANGE_NAME = "co2_events"

def get_user_data(user_id):
    """Fragt den lokalen User-Service nach dem Typ (Reich/Arm)"""
    try:
        resp = requests.get(f"{INTERNAL_API_URL}/users/{user_id}", timeout=2)
        if resp.status_code == 200:
            return resp.json()
    except Exception as e:
        print(f" [!] Error fetching user {user_id}: {e}")
    return None

def complete_task(user_id, task_id):
    """Markiert den Task als erledigt via API"""
    try:
        requests.post(f"{INTERNAL_API_URL}/users/{user_id}/tasks", json={"taskId": task_id}, timeout=2)
        print(f" [✓] Task {task_id} für User {user_id} erledigt!")
    except Exception as e:
        print(f" [!] Error completing task: {e}")

def process_trade_event(data):
    """
    Hier liegt jetzt die BUSINESS LOGIC!
    Wir prüfen BEIDE Parteien (Maker und Taker).
    """
    maker_id = data.get('makerId')
    taker_id = data.get('takerId')
    maker_side = data.get('makerSide') # 'buy' oder 'sell'
    amount = data.get('amount')

    print(f" [?] Prüfe Trade Regeln für Maker={maker_id} und Taker={taker_id}...")

    # 1. MAKER PRÜFEN (Passiv)
    maker_user = get_user_data(maker_id)
    if maker_user:
        u_type = maker_user.get('userType')
        # Regel: Reich & Buy
        if u_type == 'reich' and maker_side == 'buy':
            complete_task(maker_id, 'rich_liq')
        # Regel: Arm & Sell
        elif u_type == 'arm' and maker_side == 'sell':
            complete_task(maker_id, 'poor_sell')

    # 2. TAKER PRÜFEN (Aktiv)
    # Wenn Maker 'buy' war, dann hat Taker 'sell' gemacht (und umgekehrt)
    taker_action = 'sell' if maker_side == 'buy' else 'buy'
    
    taker_user = get_user_data(taker_id)
    if taker_user:
        u_type = taker_user.get('userType')
        # Regel: Reich & Buy
        if u_type == 'reich' and taker_action == 'buy':
            complete_task(taker_id, 'rich_liq')
        # Regel: Arm & Sell
        elif u_type == 'arm' and taker_action == 'sell':
            complete_task(taker_id, 'poor_sell')

def process_flight_event(data):
    """
    GRUNDGERÜST FÜR FLUG-LOGIK
    Hier kommt später die Prüfung (z.B. Zielort JFK) rein.
    """
    print(f" [✈️] Verarbeite Flug-Event: {data}")

    user_id = data.get('userId') #
    destination = data.get('to') #
    
    # Deine gewünschten Destinationen
    allowed_destinations = ['LHR', 'CDG', 'AMS', 'VIE']

    print(f" [✈️] Prüfe Flug-Regel für User={user_id} nach {destination}...")

    # 1. User-Profil vom User-Service abrufen
    user_info = get_user_data(user_id) #
    if not user_info:
        print(f" [!] User {user_id} nicht gefunden. Abbruch.")
        return

    user_type = user_info.get('userType') #

    # 2. Bedingung: User muss 'reich' sein und das Ziel muss in der Liste sein
    # Der Task-ID 'rich_flight' stammt aus deinem OnboardingModal
    if user_type == 'reich' and destination in allowed_destinations:
        complete_task(user_id, 'rich_flight') #
    else:
        print(f" [i] Flug für User {user_id} (Typ: {user_type}) nach {destination} triggert keinen Task.")

def process_shop_event(data):
    """
    BUSINESS LOGIC für den Shop-Task.
    Prüft, ob die Ziel-ID in der Liste der gekauften Items enthalten ist.
    """
    user_id = data.get('userId')
    # Das Event schickt jetzt eine Liste 'items'
    purchased_items = data.get('items', []) 

    print(f" [🛍️] Prüfe Shop-Regel für User={user_id}...")
    print(f" [DEBUG] Gekaufte Items: {purchased_items}")

    # User-Profil abrufen
    user_info = get_user_data(user_id)
    if not user_info:
        return

    user_type = user_info.get('userType')

    # Wir extrahieren alle IDs aus der Liste der gekauften Items.
    # Da 'items' Objekte sind (wie in deinem Frontend), greifen wir auf item['id'] zu.
    # Wir wandeln alles in Strings um, um sicherzugehen.
    try:
        item_ids = [str(item.get('id')) for item in purchased_items if isinstance(item, dict)]
    except Exception as e:
        print(f" [!] Fehler beim Extrahieren der Item-IDs: {e}")
        return

    print(f" [DEBUG] Gefundene IDs im Warenkorb: {item_ids}")

    # Prüfung der Tasks
    if user_type == 'arm' and '1' in item_ids:
        print(f" [✅] Match gefunden: Arme Person hat 'Essential Black T-Shirt' (ID 1) gekauft.")
        complete_task(user_id, 'poor_jacket')
        
    elif user_type == 'reich' and '8' in item_ids:
        print(f" [✅] Match gefunden: Reiche Person hat 'Navy Blue Blazer' (ID 8) gekauft.")
        complete_task(user_id, 'rich_suit')
        
    else:
        print(f" [i] Keine Task-relevanten Items für Typ '{user_type}' gefunden.")

def process_train_event(data):
    """
    LOGIK FÜR ZUG-BUCHUNGEN
    Prüft, ob eine 'arme' Person eine nachhaltige Reise getätigt hat.
    """
    print(f" [🚄] Verarbeite Zug-Event: {data}", flush=True)

    user_id = data.get('userId')
    destination = data.get('to')
    train_number = data.get('trainNumber')

    print(f" [🚄] Prüfe Zug-Regel für User={user_id} nach {destination} ({train_number})...", flush=True)

    # 1. User-Profil vom User-Service abrufen
    user_info = get_user_data(user_id)
    if not user_info:
        print(f" [!] User {user_id} nicht gefunden. Abbruch.", flush=True)
        return

    user_type = user_info.get('userType')

    # 2. Bedingung: User muss 'arm' sein.
    # Jede Zugbuchung (egal wohin) zählt für die arme Persona als "Sustainable Mobility".
    if user_type == 'arm':
        # Wir nutzen die ID 'poor_bike', da diese in deiner Task-Liste steht
        complete_task(user_id, 'poor_bike')
        print(f" [✅] Task 'Sustainable Mobility' (ID: poor_bike) für {user_id} erledigt!", flush=True)
    else:
        print(f" [i] Zugfahrt für User {user_id} (Typ: {user_type}) triggert keinen Task (nur für Typ 'arm').", flush=True)

def listen_to_system_events():
    connection = None
    while True:
        try:
            connection = pika.BlockingConnection(pika.ConnectionParameters(host=RABBITMQ_HOST, heartbeat=600))
            channel = connection.channel()
            channel.exchange_declare(exchange=EXCHANGE_NAME, exchange_type='topic', durable=True)

            # Wir hören jetzt auf ALLES (oder spezifisch auf trade_executed)
            queue_name = channel.queue_declare(queue='', exclusive=True).method.queue
            channel.queue_bind(exchange=EXCHANGE_NAME, queue=queue_name, routing_key="exchange.#")
            channel.queue_bind(exchange=EXCHANGE_NAME, queue=queue_name, routing_key="flight.#")
            channel.queue_bind(exchange=EXCHANGE_NAME, queue=queue_name, routing_key="fashion.#")
            channel.queue_bind(exchange=EXCHANGE_NAME, queue=queue_name, routing_key="train.#")

            print(f" [*] Worker gestartet. Warte auf Events...", flush=True)

            def callback(ch, method, properties, body):
                try:
                    msg = json.loads(body)
                    print(f"DEBUG: Empfange Routing-Key: {method.routing_key} | Typ: {msg.get('type')}")
                    event_type = msg.get('type')
                    data = msg.get('data')
                    
                    print(f" [!] Event empfangen: {event_type}", flush=True)

                    if event_type == 'TRADE_EXECUTED':
                        process_trade_event(data)
                    
                    elif event_type == 'FLIGHT_BOOKED': # NEU: Der Einstiegspunkt für deinen 2. Task
                        process_flight_event(data)
                    
                    elif event_type == 'PRODUCT_PURCHASED':
                        process_shop_event(data)
                    
                    elif event_type == 'TRAIN_BOOKED':
                        process_train_event(data)
                        
                    # Hier könnte man auch auf 'WALLET_UPDATE' o.ä. hören
                    
                except Exception as e:
                    print(f" [!] Fehler im Callback: {e}")

            channel.basic_consume(queue=queue_name, on_message_callback=callback, auto_ack=True)
            channel.start_consuming()

        except pika.exceptions.AMQPConnectionError:
            print(" [!] RabbitMQ nicht erreichbar. Retry in 5s...")
            time.sleep(5)
        except Exception as e:
            print(f" [!] Worker Fehler: {e}")
            time.sleep(5)

if __name__ == "__main__":
    listen_to_system_events()