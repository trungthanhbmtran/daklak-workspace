// ⚠️ Script benchmark DESTRUCTIVE — script đo hiệu năng xóa toàn bộ bảng notification_log
if (process.env.ALLOW_DESTRUCTIVE_BENCHMARK !== 'true') {
  console.error(
    '[Benchmark] DỪNG: benchmark.js sẽ XÓA TOÀN BỘ dữ liệu bảng notification_log (deleteMany).' +
      ' Script chỉ dành cho môi trường dev/test riêng biệt.' +
      ' Nếu chắc chắn muốn chạy, đặt biến môi trường ALLOW_DESTRUCTIVE_BENCHMARK=true (ví dụ: ALLOW_DESTRUCTIVE_BENCHMARK=true node benchmark.js).'
  );
  process.exit(2);
}

const { PrismaClient } = require('./generated/prisma/client');
const { PrismaMariaDb } = require('@prisma/adapter-mariadb');
const url = process.env.DATABASE_URL;
if (!url) {
  console.error('[Benchmark] Thiếu biến môi trường DATABASE_URL. Không chạy benchmark với connection string mặc định. Hãy cấu hình .env hoặc export DATABASE_URL trước khi chạy.');
  process.exit(2);
}
const adapter = new PrismaMariaDb(url.replace(/^mysql:\/\//, 'mariadb://'));
const prisma = new PrismaClient({ adapter });
const { performance } = require('perf_hooks');

async function benchmark() {
  console.log('--- Bắt đầu Benchmark: N+1 Inserts vs Batch Insert ---');
  const numRecords = 1000;
  
  // 1. Dọn dẹp dữ liệu cũ (nếu có)
  await prisma.notificationLog.deleteMany({});
  
  // Mock data
  const logs = Array.from({ length: numRecords }).map((_, i) => ({
    channelId: 1, // ID ảo
    recipient: `user${i+1}@example.com`,
    subject: 'Test Subject',
    body: 'Test Body',
    status: 'SENT',
    sentAt: new Date(),
  }));

  // --- Cách 1: N+1 (Cách cũ) ---
  console.log(`\nĐang chạy Cách 1: Vòng lặp N+1 (Tạo từng bản ghi một cho ${numRecords} records)...`);
  const startNPlus1 = performance.now();
  for (const log of logs) {
    await prisma.notificationLog.create({
      data: log
    });
  }
  const endNPlus1 = performance.now();
  const timeNPlus1 = (endNPlus1 - startNPlus1).toFixed(2);
  console.log(`⏱ Thời gian Cách 1 (N+1): ${timeNPlus1} ms`);

  // Xóa đi để test cách 2
  await prisma.notificationLog.deleteMany({});

  // --- Cách 2: Batch Insert (Đã tối ưu) ---
  console.log(`\nĐang chạy Cách 2: Batch Insert (createMany cho ${numRecords} records)...`);
  const startBatch = performance.now();
  await prisma.notificationLog.createMany({
    data: logs,
    skipDuplicates: true
  });
  const endBatch = performance.now();
  const timeBatch = (endBatch - startBatch).toFixed(2);
  console.log(`⏱ Thời gian Cách 2 (Batch): ${timeBatch} ms`);

  // Phân tích
  console.log(`\n=== KẾT QUẢ TỐI ƯU ===`);
  const speedup = (parseFloat(timeNPlus1) / parseFloat(timeBatch)).toFixed(2);
  console.log(`🚀 Batch Insert nhanh gấp ${speedup} lần so với vòng lặp N+1!`);
  
  await prisma.$disconnect();
}

benchmark().catch(e => {
  console.error(e);
  process.exit(1);
});
