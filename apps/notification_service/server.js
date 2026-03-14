/**
 * Notification service – chỉ chạy consumer RabbitMQ (không gRPC).
 * Nhận message từ queue, gửi qua adapter theo channel (email, telegram, zalo, facebook, console).
 */

const config = require('./config');
const { startConsumer, stopConsumer } = require('./worker/consumer');

async function main() {
  console.log('[Notification] Starting consumer...');
  await startConsumer();
  console.log('[Notification] Consumer ready.');
}

['SIGINT', 'SIGTERM'].forEach((sig) => {
  process.on(sig, async () => {
    console.log(`[Notification] ${sig}, shutting down...`);
    await stopConsumer();
    process.exit(0);
  });
});

main().catch((err) => {
  console.error('[Notification] Startup failed:', err);
  process.exit(1);
});
