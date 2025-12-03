const express = require('express');
const http = require('http');
const { Server } = require("socket.io");
const amqp = require('amqplib');
const cors = require('cors');

// --- Configuration ---
const PORT = 8080;
const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://rabbitmq';
const EXCHANGE_NAME = 'co2_events_fanout'; // We listen to everything published here

// --- Setup Express & Socket.IO ---
const app = express();
app.use(cors()); // Allow all origins (simplify dev)

const server = http.createServer(app);
const io = new Server(server, {
    path: '/socket.io', // The path the client will ping
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// --- RabbitMQ Logic ---
async function startRabbitConsumer() {
    try {
        console.log(`[RABBIT] Attempting to connect to ${RABBITMQ_URL}...`);
        const connection = await amqp.connect(RABBITMQ_URL);
        const channel = await connection.createChannel();

        // 1. Assert the Exchange
        // We use 'fanout' because we want to hear messages intended for anyone
        // (e.g., if WalletService sends a message, we want it AND the Ledger to hear it)
        await channel.assertExchange(EXCHANGE_NAME, 'fanout', { durable: false });

        // 2. Create a Temporary Queue
        // Exclusive: true means when this connection closes, delete the queue
        const q = await channel.assertQueue('', { exclusive: true });

        // 3. Bind Queue to Exchange
        // This tells RabbitMQ: "Send a copy of everything from 'co2_events_fanout' to my temp queue"
        await channel.bindQueue(q.queue, EXCHANGE_NAME, '');

        console.log(`[RABBIT] Connected! Waiting for events in queue: ${q.queue}`);

        // 4. Consume Messages
        channel.consume(q.queue, (msg) => {
            if (msg.content) {
                try {
                    const contentString = msg.content.toString();
                    const contentJSON = JSON.parse(contentString);

                    console.log(`[EVENT RECEIVED] ${contentJSON.service}: ${contentJSON.type}`);

                    // 5. Broadcast to Frontend
                    // This pushes the data to every connected browser instantly
                    io.emit('dashboard_event', contentJSON);

                } catch (err) {
                    console.error('[ERROR] Could not parse message:', err);
                }
            }
        }, { noAck: true }); // noAck: We don't need to confirm receipt, speed is key here

        // Handle connection closure
        connection.on('close', () => {
            console.error('[RABBIT] Connection closed, retrying...');
            setTimeout(startRabbitConsumer, 5000);
        });

    } catch (error) {
        console.error('[RABBIT] Connection failed (retrying in 5s):', error.message);
        setTimeout(startRabbitConsumer, 5000);
    }
}

// --- Start Services ---
io.on('connection', (socket) => {
    console.log(`[WEBSOCKET] Client connected: ${socket.id}`);

    // Send a welcome message just to verify connection works
    socket.emit('dashboard_event', {
        service: 'Dashboard',
        type: 'INFO',
        data: { message: 'Connected to Realtime Stream' },
        timestamp: new Date().toISOString()
    });

    socket.on('disconnect', () => {
        console.log(`[WEBSOCKET] Client disconnected: ${socket.id}`);
    });
});

server.listen(PORT, () => {
    console.log(`[SERVER] Dashboard Backend running on port ${PORT}`);
    startRabbitConsumer();
});