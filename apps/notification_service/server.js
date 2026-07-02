/**
 * Notification service – chạy consumer RabbitMQ và REST API quản lý cấu hình
 */

const express = require('express');
const cors = require('cors');
const config = require('./config');
const { startConsumer, stopConsumer } = require('./worker/consumer');
const { PrismaClient } = require('@prisma/client');
const { PrismaMariaDb } = require('@prisma/adapter-mariadb');

const app = express();
app.use(cors());
app.use(express.json());

const url = process.env.DATABASE_URL || 'mysql://root:mypassword@127.0.0.1:3306/admin_notification';
const adapter = new PrismaMariaDb(url);
const prisma = new PrismaClient({ adapter });

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
    const parsedConfig = JSON.parse(configData || '{}');
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
    const parsedConfig = JSON.parse(configData || '{}');
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
