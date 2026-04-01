# 📡 Event Driven Architecture - Dokumentation

Diese Datei dokumentiert die asynchrone Schnittstelle zwischen den Microservices. Der Datenaustausch erfolgt über **RabbitMQ** auf dem Exchange `co2_events`.

---

## 1. Globales Event Format (Envelope)

Jedes Event im System folgt einem strikten Wrapper-Format (Envelope), um Einheitlichkeit zwischen Kotlin-, Node.js- und Python-Services zu gewährleisten.

### Struktur

```json
{
  "eventId": "UUID (String)",
  "source": "service-name (String)",
  "type": "EVENT_NAME_UPPERCASE (String)",
  "timestamp": "ISO-8601 String (z.B. 2026-01-14T12:00:00Z)",
  "data": {
    // Spezifischer Payload des Events
  }
}
```

### Felder Beschreibung

| Feld | Typ | Beschreibung |
| :--- | :--- | :--- |
| `eventId` | String | Eindeutige ID des Events (UUID v4). |
| `source` | String | Kennung des erzeugenden Services (z.B. `flight-service`, `wallet-service`). |
| `type` | String | Der Typ des Events. Wird vom Consumer für das Routing/Switching genutzt. |
| `timestamp`| String | Zeitpunkt der Erstellung (UTC, ISO-8601). |
| `data` | Object | Ein Map/JSON-Objekt mit den fachlichen Daten. |

---

## 2. Flight Service Events

Der `flight-service` publiziert Events, wenn Flüge gebucht werden.

### ✈️ Event: `FLIGHT_BOOKED`

Wird gesendet, nachdem die Zahlung (EUR + CO2) erfolgreich beim Wallet-Service durchgeführt wurde.

* **Producer:** `flight-service`
* **Exchange:** `co2_events`
* **Type:** `topic`
* **Routing Key:** `flight.booked`
* **Durable:** `true`

#### Payload (`data` Objekt)

| Feld | Typ | Beschreibung | Beispiel |
| :--- | :--- | :--- | :--- |
| `flightId` | Number/String | Interne Datenbank-ID des Flugs. | `101` |
| `flightNumber` | String | Die offizielle Flugnummer. | `"LH2024"` |
| `userId` | String | ID des Nutzers, der gebucht hat. | `"user-550e84"` |
| `from` | String | IATA Code Startflughafen. | `"BER"` |
| `to` | String | IATA Code Zielflughafen. | `"MUC"` |
| `priceEur` | Number | Bezahlter Preis in Euro. | `150.00` |
| `priceCo2` | Number | Berechneter CO2-Ausstoß in kg. | `45.5` |

#### JSON Beispiel (Vollständig)

```json
{
  "eventId": "a1b2c3d4-e5f6-7890-1234-56789abcdef0",
  "source": "flight-service",
  "type": "FLIGHT_BOOKED",
  "timestamp": "2026-01-14T14:30:00.000Z",
  "data": {
    "flightId": 42,
    "flightNumber": "LH2024",
    "userId": "user-123",
    "from": "FRA",
    "to": "JFK",
    "priceEur": 450.00,
    "priceCo2": 850.5
  }
}
```

---

## 3. Wallet Service Events

Diese Events stammen aus dem zentralen `wallet-service`.

### 💰 Event: `WALLET_CREATED`
* **Routing Key:** `wallet.created`
* **Payload:** `{ "userId": "...", "initialBalance": 0 }`

### 💸 Event: `MONEY_TRANSFER`
* **Routing Key:** `money.transfer`
* **Payload:**
  ```json
  {
    "fromUserId": "user-a",
    "toUserId": "shop-b",
    "amount": 100.00,
    "description": "Payment for X"
  }
  ```

### 🌱 Event: `CO2_TRANSFER`
* **Routing Key:** `co2.transfer`
* **Payload:**
  ```json
  {
    "fromUserId": "user-a",
    "toUserId": "shop-b",
    "amount": 50.0,
    "description": "Offset for Flight"
  }
  ```


## 4. Exchange Service Events

Der `exchange-service` publiziert Events, wenn ein Handel (Trade) zwischen zwei Bürgern erfolgreich abgeschlossen wurde.

### 📈 Event: `TRADE_EXECUTED`

Dieses Event wird gefeuert, sobald eine Order (Kauf oder Verkauf) gematcht wurde und die entsprechenden Vermögenswerte (Tokens und Euro) erfolgreich transferiert wurden.

* **Producer:** `exchange-service`
* **Exchange:** `co2_events`
* **Type:** `topic`
* **Routing Key:** `exchange.trade_executed`
* **Durable:** `true`

#### Payload (`data` Objekt)

| Feld | Typ | Beschreibung | Beispiel |
| :--- | :--- | :--- | :--- |
| `makerId` | String | ID des Nutzers, der die ursprüngliche Order erstellt hat. | `"user-123"` |
| `takerId` | String | ID des Nutzers, der die Order angenommen hat. | `"user-456"` |
| `amount` | Number | Die Menge der transferierten CO2-Tokens. | `15.5` |
| `makerSide` | String | Gibt an, ob der Maker gekauft (`"buy"`) oder verkauft (`"sell"`) hat. | `"sell"` |
| `timestamp` | String | Interner Zeitpunkt der Trade-Ausführung im ISO-8601 Format. | `"2026-03-11T12:00:00"` |

#### JSON Beispiel (Vollständig)

```json
{
  "eventId": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "source": "exchange-service",
  "type": "TRADE_EXECUTED",
  "timestamp": "2026-03-11T12:00:00.000Z",
  "data": {
    "makerId": "citizen-a",
    "takerId": "citizen-b",
    "amount": 50.0,
    "makerSide": "buy",
    "timestamp": "2026-03-11T12:00:00.123456"
  }
}
```

---

## 5. Fashion Shop Events

Der `fashion-shop` publiziert Events, wenn Produkte (Kleidung) gekauft werden.

### 👕 Event: `PRODUCT_PURCHASED`

Wird gesendet, nachdem der Warenkorb erfolgreich über den Wallet-Service bezahlt wurde.

* **Producer:** `fashion-shop`
* **Exchange:** `co2_events`
* **Type:** `topic`
* **Routing Key:** `fashion.purchased`
* **Durable:** `true`

#### Payload (`data` Objekt)

| Feld | Typ | Beschreibung | Beispiel |
| :--- | :--- | :--- | :--- |
| `userId` | String | ID des Käufers. | `"user-123"` |
| `merchantId` | String | ID des Shops. | `"shop-eco-fashion"` |
| `priceEur` | Number | Gesamtpreis in Euro. | `89.99` |
| `priceCo2` | Number | Gesamte CO2-Kosten in kg. | `12.5` |
| `items` | Array | Liste der gekauften Produkte. | `[...]` |
| `description` | String | Zusammenfassung des Kaufs. | `"Checkout 2 items from EcoFashion"` |

#### JSON Beispiel (Vollständig)

```json
{
  "eventId": "b2c3d4e5-f6a7-8901-2345-6789abcdef01",
  "source": "fashion-shop",
  "type": "PRODUCT_PURCHASED",
  "timestamp": "2026-04-01T13:30:00.000Z",
  "data": {
    "userId": "user-123",
    "merchantId": "shop-eco-fashion",
    "priceEur": 120.50,
    "priceCo2": 15.2,
    "items": [
      { "id": "p1", "name": "Eco Shirt", "quantity": 2, "euroPrice": 30.25 },
      { "id": "p2", "name": "Recycled Jeans", "quantity": 1, "euroPrice": 60.00 }
    ],
    "description": "Checkout 3 items from EcoFashion"
  }
}
```

---

## 6. Train Shop Events

Der `train-service` publiziert Events, wenn Zugreisen gebucht werden.

### 🚆 Event: `TRAIN_BOOKED`

Wird gesendet, nachdem eine Zugreise erfolgreich über den Wallet-Service bezahlt wurde.

* **Producer:** `train-service`
* **Exchange:** `co2_events`
* **Type:** `topic`
* **Routing Key:** `train.booked`
* **Durable:** `true`

#### Payload (`data` Objekt)

| Feld | Typ | Beschreibung | Beispiel |
| :--- | :--- | :--- | :--- |
| `trainId` | Number | Interne ID des Zuges. | `1` |
| `userId` | String | ID des Buchenden. | `"user-456"` |
| `from` | String | Abfahrtsort. | `"Berlin"` |
| `to` | String | Zielort. | `"Paris"` |
| `priceEur` | Number | Ticketpreis in Euro. | `89.0` |
| `priceCo2` | Number | CO2-Emissionen in kg. | `12.0` |
| `trainNumber` | String | Zugnummer/Name. | `"ICE 9568"` |

#### JSON Beispiel (Vollständig)

```json
{
  "eventId": "c3d4e5f6-a7b8-9012-3456-7890abcdef01",
  "source": "train-service",
  "type": "TRAIN_BOOKED",
  "timestamp": "2026-04-01T14:30:00.000Z",
  "data": {
    "trainId": 1,
    "userId": "user-456",
    "from": "Berlin",
    "to": "Paris",
    "priceEur": 89.0,
    "priceCo2": 12.0,
    "trainNumber": "ICE 9568"
  }
}
```
