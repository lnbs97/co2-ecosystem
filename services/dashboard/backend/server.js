const express = require('express');
const http = require('http'); // Server für Socket.IO
const httpClient = require('http'); // Client für interne Requests an Hub
const { Server } = require("socket.io");
const amqp = require('amqplib');
const cors = require('cors');

// --- Configuration ---
const PORT = 8080;
const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://rabbitmq';
const EXCHANGE_NAME = 'co2_events';
// URL zum User-Service (Hub) innerhalb des Docker-Netzwerks
const HUB_HOST = 'hub-backend';
const HUB_PORT = 8080;

// --- Setup Express & Socket.IO ---
const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
    path: '/socket.io',
    cors: { origin: "*", methods: ["GET", "POST"] }
});

// --- User Name Resolution Helper ---
// Cache, damit wir nicht für jedes Event den Hub fragen müssen
const userCache = {};

function resolveUser(userId) {
    if (!userId) return Promise.resolve('Unbekannt');

    // 1. Bekannte System-Accounts direkt auflösen
    if (userId === 'exchange') return Promise.resolve('Exchange)');
    if (userId === 'shop-eco-fashion') return Promise.resolve('Fashion Shop');

    // 2. Cache prüfen
    if (userCache[userId]) return Promise.resolve(userCache[userId]);

    // 3. User-Service fragen
    return new Promise((resolve) => {
        const options = {
            hostname: HUB_HOST,
            port: HUB_PORT,
            path: `/api/user-service/users/${userId}`,
            method: 'GET',
            timeout: 1000 // Schneller Failover, falls Hub down ist
        };

        const req = httpClient.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                if (res.statusCode === 200) {
                    try {
                        const user = JSON.parse(data);
                        if (user && user.vorname) {
                            userCache[userId] = user.vorname;
                            resolve(user.vorname);
                            return;
                        }
                    } catch (e) { /* ignore parse error */ }
                }
                // Fallback: Die ersten Zeichen der ID anzeigen
                resolve(`User ${userId.substring(0, 5)}...`);
            });
        });

        req.on('error', () => resolve(`User ${userId.substring(0, 5)}...`));
        req.end();
    });
}

// --- RabbitMQ Logic ---
async function startRabbitConsumer() {
    try {
        console.log(`[RABBIT] Attempting to connect to ${RABBITMQ_URL}...`);
        const connection = await amqp.connect(RABBITMQ_URL);
        const channel = await connection.createChannel();

        await channel.assertExchange(EXCHANGE_NAME, 'topic', { durable: true });
        const q = await channel.assertQueue('', { exclusive: true });
        await channel.bindQueue(q.queue, EXCHANGE_NAME, '#');

        console.log(`[RABBIT] Connected! Waiting for events...`);

        channel.consume(q.queue, async (msg) => {
            if (msg.content) {
                try {
                    const contentJSON = JSON.parse(msg.content.toString());
                    const data = contentJSON.data || {};
                    const type = contentJSON.type;

                    // --- NACHRICHT FORMATIEREN ---
                    let readableMessage = data.description || `Event ${type}`;

                    // Je nach Typ die Namen auflösen und Text bauen
                    if (type === 'WALLET_CREATED') {
                        const name = await resolveUser(data.userId);
                        readableMessage = `Wallet created for ${name}`;
                    }
                    else if (type === 'CO2_TRANSFER') {
                        const from = await resolveUser(data.fromUserId);
                        const to = await resolveUser(data.toUserId);
                        readableMessage = `${from} sent ${data.amount} CO2 to ${to}`;
                    }
                    else if (type === 'MONEY_TRANSFER') {
                        const from = await resolveUser(data.fromUserId);
                        const to = await resolveUser(data.toUserId);
                        readableMessage = `${from} sent ${data.amount}€ to ${to}`;
                    }

                    // Frontend Event bauen
                    const frontendEvent = {
                        service: contentJSON.source,
                        type: type,
                        timestamp: contentJSON.timestamp,
                        message: readableMessage, // Hier ist jetzt der schöne Text
                        amount: data.amount,
                        details: data
                    };

                    io.emit('dashboard_event', frontendEvent);

                } catch (err) {
                    console.error('[ERROR] Processing message:', err);
                }
            }
        }, { noAck: true });

        connection.on('close', () => setTimeout(startRabbitConsumer, 5000));

    } catch (error) {
        console.error('[RABBIT] Connection failed (retrying in 5s):', error.message);
        setTimeout(startRabbitConsumer, 5000);
    }
}

// --- Start Services ---
io.on('connection', (socket) => {
    socket.emit('dashboard_event', {
        service: 'Dashboard',
        type: 'INFO',
        message: 'Connected to Global Event Stream',
        timestamp: new Date().toISOString()
    });
});

server.listen(PORT, () => {
    console.log(`[SERVER] Dashboard Backend running on port ${PORT}`);
    startRabbitConsumer();
});