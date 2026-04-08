const express = require('express');
const amqp = require('amqplib');
const fetch = require('node-fetch');
const crypto = require('crypto'); // Hinzugefügt für UUID
const app = express();

app.use(express.json());

const RABBIT_URL = 'amqp://guest:guest@rabbitmq:5672';
const WALLET_URL = 'http://wallet-backend:8080/api/wallet';

// Helper für RabbitMQ
async function publishEvent(eventData, routingKey) {
    try {
        const connection = await amqp.connect(RABBIT_URL);
        const channel = await connection.createChannel();
        const exchange = 'co2_events';

        await channel.assertExchange(exchange, 'topic', { durable: true });

        // WICHTIG: Das Objekt als JSON String senden
        channel.publish(exchange, routingKey, Buffer.from(JSON.stringify(eventData)));

        console.log(`[x] Sent '${routingKey}':`, eventData);

        await channel.close();
        await connection.close();
    } catch (error) {
        console.error('RabbitMQ Error:', error);
    }
}

app.post('/api/flights/book', async (req, res) => {
    const { flight, userId } = req.body;

    try {
        // 1. Zahlung durchführen (Server-zu-Server Kommunikation mit Wallet)
        const paymentResponse = await fetch(`${WALLET_URL}/transfer-combined`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-User-ID': userId
            },
            body: JSON.stringify({
                toUserId: 'shop-eco-flights',
                co2Amount: flight.priceCo2,
                moneyAmount: flight.priceEur,
                description: `Flight booking: ${flight.flightNumber}`
            })
        });

        if (!paymentResponse.ok) {
            let errorMessage = "Payment failed";
            try {
                const errorData = await paymentResponse.json();
                errorMessage = errorData.message || errorData.error || JSON.stringify(errorData);
            } catch (e) {
                const text = await paymentResponse.text();
                if (text) errorMessage = text;
            }
            res.status(paymentResponse.status).json({ error: errorMessage });
            return;
        }

        // 2. Event erstellen (Passend zur Kotlin SystemEvent Klasse)
        const systemEvent = {
            eventId: crypto.randomUUID(),     // UUID generieren
            source: 'flight-service',         // Name dieses Services
            type: 'FLIGHT_BOOKED',            // Event Typ (Enum-Style String)
            timestamp: new Date().toISOString(), // Instant.now() kompatibler String
            data: {                           // Map<String, Any> Payload
                flightId: flight.id,
                userId: userId,
                from: flight.departure.code,
                to: flight.arrival.code,
                priceEur: flight.priceEur,
                priceCo2: flight.priceCo2,
                flightNumber: flight.flightNumber
            }
        };

        // 3. Event senden
        await publishEvent(systemEvent, 'flight.booked');

        res.json({ success: true, message: 'Flight booked and event published' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});

app.listen(8080, () => console.log('Flight Backend listening on port 8080'));