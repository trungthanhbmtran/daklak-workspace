/**
 * Notification service – chạy consumer RabbitMQ và REST API quản lý cấu hình
 */

const express = require('express');
const cors = require('cors');
const config = require('./config');
const { startConsumer, stopConsumer } = require('./worker/consumer');
const { PrismaClient } = require('./generated/prisma/client');
const { PrismaMariaDb } = require('@prisma/adapter-mariadb');

const app = express();
app.use(cors());
app.use(express.json());

// ── Fail-fast: không chạy với connection string/secret mặc định ──
const url = process.env.DATABASE_URL;
if (!url) {
  console.error('[Notification] Thiếu biến môi trường DATABASE_URL. Cấu hình DATABASE_URL trong .env trước khi khởi động (đã xóa fallback credentials).');
  process.exit(2);
}
const INTERNAL_TOKEN = process.env.INTERNAL_TOKEN;
if (!INTERNAL_TOKEN) {
  console.error('[Notification] Thiếu biến môi trường INTERNAL_TOKEN. Các REST API quản lý cấu hình (integrations/channels) yêu cầu xác thực nội bộ qua header "x-internal-token". Cấu hình INTERNAL_TOKEN trong .env trước khi khởi động.');
  process.exit(2);
}
const mariadbUrl = url.replace(/^mysql:\/\//, 'mariadb://');
const adapter = new PrismaMariaDb(mariadbUrl);
const prisma = new PrismaClient({ adapter });

// Safe-parse JSON: trả về null khi payload không phải JSON hợp lệ (không throw)
function safeParseJson(str) {
  try {
    return JSON.parse(str || '{}');
  } catch {
    return null;
  }
}

// ── Auth middleware: khóa TẤT CẢ route /api(/*) bằng header x-internal-token ──
// Quyết định scope (ledger #18): GET cũng bị khóa vì GET /integrations trả về
// full config chứa bot token / SMTP credentials nên coi như lộ secret cấp 2.
// Caller hợp lệ duy nhất hiện tại: api-gateway IntegrationsController
// (http://notification-service:50075/api/v1/integrations) → gateway phải forward
// header "x-internal-token" khi gọi (blocker đã ghi trong báo cáo lane).
app.use('/api', (req, res, next) => {
  const provided = req.get('x-internal-token');
  if (!provided || provided !== INTERNAL_TOKEN) {
    return res.status(401).json({ success: false, message: 'Unauthorized: thiếu hoặc sai header x-internal-token' });
  }
  next();
});

// Map NotificationChannel to Integration for frontend
const mapToIntegration = (c) => ({
  id: c.id,
  systemName: c.name,
  integrationCode: c.code,
  configData: typeof c.config === 'string' ? c.config : JSON.stringify(c.config),
  isActive: c.isActive,
  createdAt: c.createdAt ? c.createdAt.toISOString() : '',
  updatedAt: c.updatedAt ? c.updatedAt.toISOString() : '',
});

app.get('/api/v1/integrations', async (req, res) => {
  try {
    const search = req.query.search;
    const where = search ? { name: { contains: search } } : {};
    const channels = await prisma.notificationChannel.findMany({ where });
    res.json({
      success: true,
      message: 'Success',
      data: channels.map(mapToIntegration),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post('/api/v1/integrations', async (req, res) => {
  try {
    const { systemName, integrationCode, configData } = req.body;
    const parsedConfig = safeParseJson(configData);
    if (parsedConfig === null) {
      return res.status(400).json({ success: false, message: 'configData không phải JSON hợp lệ' });
    }
    const channel = await prisma.notificationChannel.create({
      data: {
        name: systemName,
        code: integrationCode,
        config: parsedConfig,
        isActive: true,
      }
    });
    res.json({
      success: true,
      message: 'Tạo cấu hình thành công',
      data: mapToIntegration(channel),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

app.put('/api/v1/integrations/:id', async (req, res) => {
  try {
    const { systemName, integrationCode, configData } = req.body;
    const parsedConfig = safeParseJson(configData);
    if (parsedConfig === null) {
      return res.status(400).json({ success: false, message: 'configData không phải JSON hợp lệ' });
    }
    const channel = await prisma.notificationChannel.update({
      where: { id: parseInt(req.params.id) },
      data: {
        name: systemName,
        code: integrationCode,
        config: parsedConfig,
      }
    });
    res.json({
      success: true,
      message: 'Cập nhật cấu hình thành công',
      data: mapToIntegration(channel),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

app.put('/api/v1/integrations/:id/active', async (req, res) => {
  try {
    const { isActive } = req.body;
    const channel = await prisma.notificationChannel.update({
      where: { id: parseInt(req.params.id) },
      data: { isActive },
    });
    res.json({
      success: true,
      message: 'Cập nhật trạng thái thành công',
      data: mapToIntegration(channel),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

app.delete('/api/v1/integrations/:id', async (req, res) => {
  try {
    await prisma.notificationChannel.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ success: true, message: 'Xóa cấu hình thành công' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

async function main() {
  console.log('[Notification] Starting consumer...');
  await startConsumer();
  console.log('[Notification] Consumer ready.');
  
  const port = process.env.PORT || 50075;
  app.listen(port, () => {
    console.log(`[Notification] API Server ready on port ${port}`);
  });
}

['SIGINT', 'SIGTERM'].forEach((sig) => {
  process.on(sig, async () => {
    console.log(`[Notification] ${sig}, shutting down...`);
    await stopConsumer();
    await prisma.$disconnect();
    process.exit(0);
  });
});

main().catch((err) => {
  console.error('[Notification] Startup failed:', err);
  process.exit(1);
});
