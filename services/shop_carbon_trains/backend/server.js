const express = require('express');
const amqp = require('amqplib');
const fetch = require('node-fetch');
const crypto = require('crypto');
const app = express();

app.use(express.json());

const RABBIT_URL = process.env.RABBITMQ_URL || 'amqp://guest:guest@rabbitmq:5672';
const WALLET_URL = process.env.WALLET_URL || 'http://wallet-backend:8080/api/wallet';

// Helper for RabbitMQ
async function publishEvent(eventData, routingKey) {
    try {
        const connection = await amqp.connect(RABBIT_URL);
        const channel = await connection.createChannel();
        const exchange = 'co2_events';

        await channel.assertExchange(exchange, 'topic', { durable: true });
        channel.publish(exchange, routingKey, Buffer.from(JSON.stringify(eventData)));

        console.log(`[x] Sent '${routingKey}':`, eventData);

        await channel.close();
        await connection.close();
    } catch (error) {
        console.error('RabbitMQ Error:', error);
    }
}

app.post('/api/trains/book', async (req, res) => {
    const { train, userId } = req.body;

    try {
        // 1. Perform payment via Wallet Service
        const paymentResponse = await fetch(`${WALLET_URL}/transfer-combined`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-User-ID': userId
            },
            body: JSON.stringify({
                toUserId: 'shop-eco-trains',
                co2Amount: train.priceCo2,
                moneyAmount: train.priceEur,
                description: `Train booking: ${train.trainNumber} from ${train.from} to ${train.to}`
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

        // 2. Create System Event
        const systemEvent = {
            eventId: crypto.randomUUID(),
            source: 'train-service',
            type: 'TRAIN_BOOKED',
            timestamp: new Date().toISOString(),
            data: {
                trainId: train.id,
                userId: userId,
                from: train.from,
                to: train.to,
                priceEur: train.priceEur,
                priceCo2: train.priceCo2,
                trainNumber: train.trainNumber
            }
        };

        // 3. Publish Event
        await publishEvent(systemEvent, 'train.booked');

        res.json({ success: true, message: 'Train booked and event published' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});

const PORT = 8080;
app.listen(PORT, () => console.log(`Train Backend listening on port ${PORT}`));
