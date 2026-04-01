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
const userCache = {};

function resolveUser(userId) {
    if (!userId) return Promise.resolve('Unbekannt');

    if (userId === 'exchange') return Promise.resolve('Exchange');
    if (userId === 'shop-eco-fashion') return Promise.resolve('Fashion Shop');
    if (userId === 'shop-eco-flights') return Promise.resolve('Flight Shop');

    if (userCache[userId]) return Promise.resolve(userCache[userId]);

    return new Promise((resolve) => {
        const options = {
            hostname: HUB_HOST,
            port: HUB_PORT,
            path: `/api/user-service/users/${userId}`,
            method: 'GET',
            timeout: 1000
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
                    } catch (e) { /* ignore */ }
                }
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

        // Wir hören auf alles ('#')
        await channel.bindQueue(q.queue, EXCHANGE_NAME, '#');

        console.log(`[RABBIT] Connected! Waiting for events...`);

        channel.consume(q.queue, async (msg) => {
            if (msg.content) {
                try {
                    const contentJSON = JSON.parse(msg.content.toString());

                    // Struktur anpassen an SystemEvent (kotlin)
                    const data = contentJSON.data || {};
                    const type = contentJSON.type;

                    // --- NACHRICHT FORMATIEREN ---
                    let readableMessage = data.description || `Event ${type}`;
                    console.log(`[DASHBOARD] Processing Event: ${type} from ${contentJSON.source}`);

                    // Case: Wallet Created
                    if (type === 'WALLET_CREATED') {
                        const name = await resolveUser(data.userId);
                        readableMessage = `Wallet created for ${name}`;
                    }
                    // Case: CO2 Transfer
                    else if (type === 'CO2_TRANSFER') {
                        const from = await resolveUser(data.fromUserId);
                        const to = await resolveUser(data.toUserId);
                        readableMessage = `${from} sent ${data.amount} CO2 to ${to}`;
                    }
                    // Case: Money Transfer
                    else if (type === 'MONEY_TRANSFER') {
                        const from = await resolveUser(data.fromUserId);
                        const to = await resolveUser(data.toUserId);
                        readableMessage = `${from} sent ${data.amount}€ to ${to}`;
                    }
                    // --- NEU: FLIGHT BOOKED ---
                    else if (type === 'FLIGHT_BOOKED') {
                        const user = await resolveUser(data.userId);
                        // Zugriff auf die Felder im 'data' Objekt des Events
                        readableMessage = `${user} booked Flight ${data.flightNumber} (${data.from} → ${data.to})`;
                    }
                    // --- NEU: PRODUCT PURCHASED ---
                    else if (type === 'PRODUCT_PURCHASED') {
                        console.log(`[DASHBOARD] Handling PRODUCT_PURCHASED for user ${data.userId}`);
                        const user = await resolveUser(data.userId);
                        const itemCount = data.items ? data.items.length : 0;
                        const firstItem = itemCount > 0 ? data.items[0].name : 'Products';
                        
                        if (itemCount > 1) {
                            readableMessage = `${user} bought ${firstItem} and ${itemCount - 1} other items`;
                        } else {
                            readableMessage = `${user} bought ${firstItem}`;
                        }
                        console.log(`[DASHBOARD] Formatted message: ${readableMessage}`);
                    }

                    // Frontend Event bauen
                    const frontendEvent = {
                        service: contentJSON.source, // z.B. "flight-service"
                        type: type,
                        timestamp: contentJSON.timestamp,
                        message: readableMessage,
                        amount: data.amount || data.priceEur, // Fallback für Anzeige
                        details: data // Das gesamte Data-Objekt mitsenden für Details-Ansicht
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