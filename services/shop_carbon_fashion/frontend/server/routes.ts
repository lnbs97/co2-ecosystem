import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage.ts";
import amqp from 'amqplib';
import fetch from 'node-fetch';
import crypto from 'crypto';

const RABBIT_URL = process.env.RABBITMQ_URL || 'amqp://guest:guest@rabbitmq:5672';
const WALLET_URL = process.env.WALLET_URL || 'http://wallet-backend:8080/api/wallet';

async function publishEvent(eventData: any, routingKey: string) {
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

export async function registerRoutes(app: Express): Promise<Server> {
  // New checkout endpoint that emits PRODUCT_PURCHASED
  app.post('/api/fashion/checkout', async (req, res) => {
    const { userId, toUserId, co2Amount, moneyAmount, description, items } = req.body;

    try {
      // 1. Perform payment via Wallet Service
      const paymentResponse = await fetch(`${WALLET_URL}/transfer-combined`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-ID': userId
        },
        body: JSON.stringify({
          toUserId,
          co2Amount,
          moneyAmount,
          description
        })
      });

      if (!paymentResponse.ok) {
        const errorText = await paymentResponse.text();
        throw new Error(`Payment failed: ${errorText}`);
      }

      // 2. Create System Event
      const systemEvent = {
        eventId: crypto.randomUUID(),
        source: 'fashion-shop',
        type: 'PRODUCT_PURCHASED',
        timestamp: new Date().toISOString(),
        data: {
          userId,
          merchantId: toUserId,
          priceEur: moneyAmount,
          priceCo2: co2Amount,
          items: items || [], // List of purchased items
          description
        }
      };

      // 3. Publish Event
      await publishEvent(systemEvent, 'fashion.purchased');

      res.json({ success: true, message: 'Purchase successful and event published' });
    } catch (error: any) {
      console.error('Checkout error:', error);
      res.status(500).json({ message: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
