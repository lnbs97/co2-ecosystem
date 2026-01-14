const express = require('express');
const amqp = require('amqplib');
const fetch = require('node-fetch'); // oder axios
const app = express();

app.use(express.json());

const RABBIT_URL = 'amqp://guest:guest@rabbitmq:5672';
const WALLET_URL = 'http://wallet-backend:8080/api/wallet'; // Interne Docker-URL

async function publishEvent(eventData) {
    try {
        const connection = await amqp.connect(RABBIT_URL);
        const channel = await connection.createChannel();
        const exchange = 'co2_events';

        await channel.assertExchange(exchange, 'topic', { durable: false });

        const routingKey = 'flight.booked';
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
            throw new Error('Payment failed');
        }

        // 2. Event nach erfolgreicher Zahlung senden
        const event = {
            eventType: 'flightBooked',
            flightId: flight.id,
            userId: userId,
            timestamp: new Date().toISOString(),
            details: {
                from: flight.departure.code,
                to: flight.arrival.code,
                priceEur: flight.priceEur,
                priceCo2: flight.priceCo2
            }
        };

        await publishEvent(event);

        res.json({ success: true, message: 'Flight booked and event published' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});

app.listen(8080, () => console.log('Flight Backend listening on port 8080'));