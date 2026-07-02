/**
 * Smart Notification Router
 * Consumes 'send_notification' messages, fetches active configs from PostgreSQL,
 * and dynamically broadcasts messages to configured channels (inapp, telegram, etc).
 */
const amqp = require('amqplib');
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { PrismaMariaDb } = require('@prisma/adapter-mariadb');
const mariadb = require('mariadb');

const url = process.env.DATABASE_URL || 'mysql://root:mypassword@127.0.0.1:3306/admin_notification';
const adapter = new PrismaMariaDb(url);
const prisma = new PrismaClient({ adapter });
const config = require('../config');
const { createAdapter } = require('../adapters');

const queueName = config.rabbitmq.queues.notifications;
const rabbitUrl = config.rabbitmq.url;

let connection = null;
let channel = null;

function parseMessage(content) {
  const raw = typeof content === 'string' ? JSON.parse(content) : content;
  const data = raw.data != null ? raw.data : raw;
  
  let recipients = [];
  if (data.recipients) recipients = data.recipients;
  else if (data.recipient) recipients = [data.recipient];
  else if (data.email) recipients = [data.email]; // for notification.position_assigned
  else if (data.userId) recipients = [data.userId];
  
  return {
    pattern: raw.pattern || '',
    recipients,
    subject: data.subject || data.title || (raw.pattern === 'notification.position_assigned' ? 'Thông báo giao việc' : ''),
    body: data.body || data.message || data.text || (raw.pattern === 'notification.position_assigned' ? `Bạn đã được giao vị trí ${data.position} tại ${data.department}` : ''),
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
    const rows = await prisma.notificationChannel.findMany({ where: { isActive: true } });

    for (const row of rows) {
      const type = INTEGRATION_MAP[row.code];
      if (type) {
        const adapter = createAdapter({ id: row.code, type, enabled: true, config: row.config });
        if (adapter) {
          adapters.push({ adapter, channelId: row.id });
        }
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

  for (const { adapter, channelId } of activeAdapters) {
    let result = { success: false, error: 'Unknown' };
    try {
      result = await adapter.send({
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
      result.error = err.message;
    }

    // Save to NotificationLog
    for (const recipient of payload.recipients) {
      try {
        await prisma.notificationLog.create({
          data: {
            channelId: channelId,
            recipient: recipient,
            subject: payload.subject,
            body: payload.body,
            status: result.success ? 'SENT' : 'FAILED',
            errorMsg: result.success ? null : (result.error || 'Unknown error'),
            sentAt: result.success ? new Date() : null,
          }
        });
      } catch (logErr) {
        console.error('[Notification] Failed to write log:', logErr.message);
      }
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
  await channel.assertQueue(queueName, { durable: true });
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
  await prisma.$disconnect();
}

module.exports = { startConsumer, stopConsumer };
