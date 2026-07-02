/**
 * Smart Notification Router
 * Consumes 'send_notification' messages, fetches active configs from PostgreSQL,
 * and dynamically broadcasts messages to configured channels (inapp, telegram, etc).
 */
const amqp = require('amqplib');
const { Client } = require('pg');
const config = require('../config');
const { createAdapter } = require('../adapters');

const queueName = config.rabbitmq.queues.notifications;
const rabbitUrl = config.rabbitmq.url;
const dbUrl = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/daklak_db?schema=public';

let connection = null;
let channel = null;
let dbClient = null;

function parseMessage(content) {
  const raw = typeof content === 'string' ? JSON.parse(content) : content;
  const data = raw.data != null ? raw.data : raw;
  return {
    recipients: data.recipients || (data.recipient ? [data.recipient] : []),
    subject: data.subject || data.title || '',
    body: data.body || data.message || data.text || '',
    metadata: data.metadata || {},
  };
}

const INTEGRATION_MAP = {
  'NOTIFY_INAPP': 'inapp',
  'NOTIFY_TELEGRAM': 'telegram',
  'NOTIFY_ZALO': 'zalo',
  'NOTIFY_SMTP': 'smtp',
};

async function fetchActiveAdapters() {
  const adapters = [];
  try {
    if (!dbClient) {
      dbClient = new Client({ connectionString: dbUrl });
      await dbClient.connect();
    }
    const res = await dbClient.query('SELECT integration_code, config_data FROM integration_configs WHERE is_active = true');

    for (const row of res.rows) {
      const type = INTEGRATION_MAP[row.integration_code];
      if (type) {
        const adapter = createAdapter({ id: row.integration_code, type, enabled: true, config: row.config_data });
        if (adapter) adapters.push(adapter);
      }
    }
  } catch (err) {
    console.error('[Notification] Error fetching integration configs:', err.message);
  }
  return adapters;
}

async function handleMessage(msg) {
  const payload = parseMessage(msg.content.toString());

  if (payload.recipients.length === 0) {
    console.warn('[Notification] No recipients, skip.');
    return;
  }

  const activeAdapters = await fetchActiveAdapters();

  if (activeAdapters.length === 0) {
    console.warn('[Notification] No active notification channels configured.');
    return;
  }

  for (const adapter of activeAdapters) {
    try {
      const result = await adapter.send({
        recipient: payload.recipients,
        subject: payload.subject,
        body: payload.body,
        metadata: payload.metadata,
      });
      if (result.success) {
        console.log(`[Notification] Broadcasted to ${adapter.id} ok`);
      } else {
        console.error(`[Notification] Broadcast to ${adapter.id} failed:`, result.error);
      }
    } catch (err) {
      console.error(`[Notification] Adapter ${adapter.id} error:`, err.message);
    }
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function startConsumer() {
  const maxAttempts = parseInt(process.env.RABBITMQ_CONNECT_ATTEMPTS || '5', 10);
  const retryDelayMs = parseInt(process.env.RABBITMQ_RETRY_DELAY_MS || '3000', 10);
  let lastErr;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      connection = await amqp.connect(rabbitUrl);
      break;
    } catch (err) {
      lastErr = err;
      console.warn(`[Notification] RabbitMQ connect attempt ${attempt}/${maxAttempts} failed:`, err.message);
      if (attempt < maxAttempts) {
        console.log(`[Notification] Retrying in ${retryDelayMs / 1000}s...`);
        await sleep(retryDelayMs);
      }
    }
  }
  if (!connection) {
    console.error('[Notification] Không kết nối được RabbitMQ.');
    throw lastErr || new Error('RabbitMQ connection failed');
  }
  channel = await connection.createChannel();
  await channel.assertQueue(queueName, { durable: false });
  channel.prefetch(50);
  console.log(`[Notification] Consuming queue: ${queueName}`);
  channel.consume(queueName, async (msg) => {
    if (!msg) return;
    try {
      await handleMessage(msg);
      channel.ack(msg);
    } catch (err) {
      channel.nack(msg, false, true);
    }
  }, { noAck: false });
  connection.on('close', () => { connection = null; channel = null; });
  connection.on('error', (err) => console.error('[Notification] RabbitMQ error:', err.message));
}

async function stopConsumer() {
  if (channel) await channel.close();
  if (connection) await connection.close();
  if (dbClient) {
    await dbClient.end();
    dbClient = null;
  }
}

module.exports = { startConsumer, stopConsumer };
