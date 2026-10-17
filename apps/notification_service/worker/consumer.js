/**
 * Smart Notification Router
 * Consumes 'send_notification' messages, fetches active configs from PostgreSQL,
 * and dynamically broadcasts messages to configured channels (inapp, telegram, etc).
 */
const amqp = require('amqplib');
require('dotenv').config();
const { PrismaClient } = require('../generated/prisma/client');
const { PrismaMariaDb } = require('@prisma/adapter-mariadb');

const url = process.env.DATABASE_URL;
if (!url) {
  console.error('[Notification Worker] Thiếu biến môi trường DATABASE_URL. Không chạy worker với connection string mặc định. Hãy cấu hình DATABASE_URL trong .env.');
  process.exit(2);
}
const mariadbUrl = url.replace(/^mysql:\/\//, 'mariadb://');
const adapter = new PrismaMariaDb(mariadbUrl);
const prisma = new PrismaClient({ adapter });
const config = require('../config');
const { createAdapter } = require('../adapters');

const queueName = config.rabbitmq.queues.notifications;
const rabbitUrl = config.rabbitmq.url;
if (!rabbitUrl) {
  console.error('[Notification Worker] Thiếu biến môi trường RABBITMQ_URL. Worker yêu cầu RabbitMQ để consume queue notifications (đã xóa fallback credentials).');
  process.exit(2);
}

let connection = null;
let channel = null;

function parseMessage(content) {
  let raw;
  try {
    raw = typeof content === 'string' ? JSON.parse(content) : content;
  } catch (err) {
    // Ledger #26: payload không phải JSON hợp lệ → reject (nack không requeue) thay vì crash worker.
    const e = new Error(`[Notification Worker] Invalid JSON payload: ${err.message}`);
    e.isInvalidPayload = true;
    throw e;
  }
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
    // Ledger #24: payload.recipients là MẢNG → adapter.send phải được gọi PER recipient.
    // Truyền cả mảng làm recipient khiến Telegram trả 400 / sender trùng PSID,...
    const logsToCreate = [];

    for (const recipient of payload.recipients) {
      let result = { success: false, error: 'Unknown' };
      try {
        result = await adapter.send({
          recipient: recipient,
          subject: payload.subject,
          body: payload.body,
          metadata: payload.metadata,
        });
        if (result.success) {
          // gửi thành công per recipient — không phát debug log, kết quả ghi vào NotificationLog
        } else {
          console.error(`[Notification] Send to ${adapter.id} recipient ${recipient} failed: ${result.error}`);
        }
      } catch (err) {
        console.error(`[Notification] Adapter ${adapter.id} recipient ${recipient} error: ${err.message}`);
        result = { success: false, error: err.message };
      }

      logsToCreate.push({
        channelId: channelId,
        recipient: recipient,
        subject: payload.subject,
        body: payload.body,
        status: result.success ? 'SENT' : 'FAILED',
        errorMsg: result.success ? null : (result.error || 'Unknown error'),
        sentAt: result.success ? new Date() : null,
      });
    }

    // Save to NotificationLog (batch per adapter, status per recipient)
    try {
      if (logsToCreate.length > 0) {
        await prisma.notificationLog.createMany({
          data: logsToCreate
        });
      }
    } catch (logErr) {
      console.error('[Notification] Failed to write batch logs:', logErr.message);
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
  
  // Tối ưu hoá RabbitMQ: Cấu hình DLX (Dead Letter Exchange)
  const dlxExchange = 'dlx_notifications';
  const dlxQueue = 'dlx_notifications_queue';
  await channel.assertExchange(dlxExchange, 'direct', { durable: true });
  await channel.assertQueue(dlxQueue, { durable: true });
  await channel.bindQueue(dlxQueue, dlxExchange, queueName);

  await channel.assertQueue(queueName, { 
    durable: true,
    deadLetterExchange: dlxExchange,
    deadLetterRoutingKey: queueName
  });
  
  // Tối ưu hoá RabbitMQ: Cấu hình Prefetch
  channel.prefetch(50);
  console.log(`[Notification] Consuming queue: ${queueName} with DLX enabled`);
  channel.consume(queueName, async (msg) => {
    if (!msg) return;
    try {
      await handleMessage(msg);
      channel.ack(msg); // Manual ACK
    } catch (err) {
      console.error('[Notification] Error handling message, sending to DLX:', err.message);
      // NACK với requeue=false để đẩy message sang DLX
      channel.nack(msg, false, false);
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
