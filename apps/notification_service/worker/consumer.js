/**
 * Consumer RabbitMQ – nhận message từ queue, gửi qua adapter theo channel (config-driven).
 * Message format: { channel, recipient, subject, body, metadata } hoặc { data: { ... } } (NestJS style).
 */
const amqp = require('amqplib');
const config = require('../config');
const { buildRegistry } = require('../adapters');

const registry = buildRegistry(config.notification.adapters);
const defaultChannel = config.notification.defaultChannel;
const queueName = config.rabbitmq.queues.notifications;
const rabbitUrl = config.rabbitmq.url;

let connection = null;
let channel = null;

function parseMessage(content) {
  const raw = typeof content === 'string' ? JSON.parse(content) : content;
  const data = raw.data != null ? raw.data : raw;
  return {
    channel: data.channel || defaultChannel,
    recipient: data.recipient || '',
    subject: data.subject || data.title || '',
    body: data.body || data.text || '',
    metadata: data.metadata || {},
  };
}

async function handleMessage(msg) {
  const payload = parseMessage(msg.content.toString());
  const adapter = registry.get(payload.channel);
  if (!adapter) {
    console.warn(`[Notification] Unknown channel: ${payload.channel}, skip. Available: ${[...registry.keys()].join(', ')}`);
    return;
  }
  try {
    const result = await adapter.send({
      recipient: payload.recipient,
      subject: payload.subject,
      body: payload.body,
      metadata: payload.metadata,
    });
    if (result.success) {
      console.log(`[Notification] ${payload.channel} -> ${payload.recipient} ok`);
    } else {
      console.error(`[Notification] ${payload.channel} -> ${payload.recipient} failed:`, result.error);
    }
  } catch (err) {
    console.error(`[Notification] ${payload.channel} error:`, err.message);
    throw err;
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
    console.error('  - Kiểm tra RabbitMQ đã chạy chưa (port 5672). Ví dụ: docker run -d -p 5672:5672 rabbitmq:3-management');
    console.error('  - Set RABBITMQ_URL trong .env (ví dụ: RABBITMQ_URL=amqp://guest:guest@localhost:5672)');
    throw lastErr || new Error('RabbitMQ connection failed');
  }
  channel = await connection.createChannel();
  await channel.assertQueue(queueName, { durable: false });
  channel.prefetch(1);
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
}

module.exports = { startConsumer, stopConsumer };
