# Gemini CLI Prompt: Konzeptuelle Erstellung des CO2-Wallet-Service

**Ziel:** Generiere einen Spring Boot (Kotlin/Gradle) Microservice namens `wallet-service`, der als zentrale Buchungsstelle für CO2-Token und Geld dient und seine Aktionen als Events auf einem Bus meldet.

---

## 1. Projekt-Setup und Abhängigkeiten

**Anweisung:** Initialisiere ein Spring Boot Projekt mit Gradle und Kotlin (Java 17). Füge die folgenden vier (4) Kern-Abhängigkeiten hinzu:
1.  **Spring Web:** Für die Erstellung von REST-Controllern (API-Endpunkte).
2.  **Spring Data JPA:** Für die Datenbankanbindung und Repositories.
3.  **H2 Database:** Als unsere In-Memory/File-Datenbank für die Demo.
4.  **Spring AMQP:** Für die Verbindung mit dem RabbitMQ Event Bus.

---

## 2. Service-Konfiguration

**Anweisung:** Erstelle die `application.properties`-Datei.
* **H2-Datenbank:** Konfiguriere die H2-Datenbank so, dass sie dateibasiert ist (z.B. unter `jdbc:h2:file:./data/walletdb`), damit die Daten einen Neustart überleben. Aktiviere die H2-Webkonsole unter dem Pfad `/h2-console`.
* **JPA:** Setze `ddl-auto` auf `update`, damit die Tabellen automatisch aus dem Code generiert werden.
* **RabbitMQ:** Konfiguriere die Verbindungsdaten (Host, Port, User, Pass), um einen RabbitMQ-Container namens `rabbitmq` zu erreichen.

---

## 3. Datenmodell (Die Wahrheit)

**Anweisung:** Definiere das Kern-Datenmodell.
* Erstelle ein JPA-Entity namens `Wallet`.
* Dieses Entity muss folgende Felder enthalten: eine auto-generierte ID, eine `userId` (als String, muss `unique` sein), eine `co2Balance` (als Double) und eine `moneyBalance` (als Double).

---

## 4. Datenbankzugriff

**Anweisung:** Erstelle das Repository für das `Wallet`-Entity.
* Nenne es `WalletRepository`.
* Es muss von `JpaRepository` erben.
* Füge eine benutzerdefinierte Abfrage-Methode hinzu, die ein Wallet anhand der `userId` finden kann (z.B. `findByUserId(userId: String)`).

---

## 5. Event Bus Konfiguration

**Anweisung:** Konfiguriere den Event-Bus-Kanal.
* Erstelle eine `@Configuration`-Klasse.
* Definiere darin eine `@Bean`, die einen `TopicExchange` für RabbitMQ erstellt.
* Der Name dieses Exchanges soll global verfügbar sein (z.B. `demo_events_exchange`).

---

## 6. API-Datenstrukturen (DTOs)

**Anweisung:** Definiere alle notwendigen DTOs (Data Transfer Objects) für die API und die Events.
* **Requests (Eingehend):** `CreateWalletRequest`, `Co2TransferRequest`, `MoneyTransferRequest`. Diese müssen alle Felder enthalten, die der Service für die jeweilige Operation benötigt (z.B. `toUserId`, `amount`, `description`).
* **Responses (Ausgehend):** `BalanceResponse`, um die aktuellen Stände von CO2 und Geld an ein Frontend zu senden.
* **Events (Ausgehend):** `TransactionEvent`, ein DTO, das alle relevanten Infos für das Dashboard enthält (z.B. `eventType`, `from`, `to`, `amount`, `description`, `timestamp`).

---

## 7. Service-Logik (Das Gehirn)

**Anweisung:** Erstelle den `WalletService`. Dieser Service muss den `WalletRepository` und den `RabbitTemplate` (für den Event Bus) injizieren.

Erstelle folgende öffentliche Methoden:
1.  **`createWallet(...)`:** Nimmt die Daten aus dem DTO entgegen, prüft, ob der `userId` bereits existiert (wirft sonst einen Fehler), und speichert ein neues `Wallet` mit den Startguthaben. Sendet danach ein `WALLET_CREATED`-Event an den Bus.
2.  **`getBalance(...)`:** Nimmt eine `userId` entgegen, findet das Wallet (wirft sonst einen `Not Found`-Fehler) und gibt eine `BalanceResponse` zurück.
3.  **`transferCo2(...)`:** (Muss `@Transactional` sein). Nimmt `fromUserId`, `toUserId` und `amount` entgegen. Findet beide Wallets. Prüft, ob `fromWallet` genug `co2Balance` hat (wirft sonst einen `Bad Request`-Fehler). Zieht den Betrag bei 'from' ab und addiert ihn bei 'to'. Sendet danach ein `CO2_TRANSFER`-Event an den Bus.
4.  **`transferMoney(...)`:** (Muss `@Transactional` sein). Identisch zu `transferCo2`, aber für `moneyBalance` und feuert ein `MONEY_TRANSFER`-Event.

---

## 8. API-Endpunkte (Der Eingang)

**Anweisung:** Erstelle den `WalletController` unter dem Basispfad `/api/wallet`.
* Füge eine `@CrossOrigin`-Annotation für die lokale Entwicklung hinzu.
* Injiziere den `WalletService`.
* Erstelle vier (4) Endpunkte, die die vier öffentlichen Methoden des `WalletService` aufrufen:
	1.  `POST /wallets` (für `createWallet`).
	2.  `GET /balance` (für `getBalance`). Dieser Endpunkt muss die `userId` aus dem `X-User-ID`-Header lesen.
	3.  `POST /transfer-co2` (für `transferCo2`). Muss `fromUserId` aus dem `X-User-ID`-Header lesen.
	4.  `POST /transfer-money` (für `transferMoney`). Muss `fromUserId` aus dem `X-User-ID`-Header lesen.

---

## 9. Demo-Vorbereitung

**Anweisung:** Erstelle einen `DataInitializer` als `@Component`, der `CommandLineRunner` implementiert.
* Injiziere den `WalletService`.
* Rufe in der `run`-Methode `walletService.createWallet` auf, um die Demo-Accounts (z.B. `person_a_uuid`, `person_b_uuid` und die Shop-Wallets) mit ihren jeweiligen Startguthaben (Geld und CO2) anzulegen.
* Fange mögliche Fehler ab (z.B. in einem `try/catch`-Block), falls die Wallets beim Neustart bereits existieren.