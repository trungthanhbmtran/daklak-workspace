/**
 * Cấu hình notification service – đọc từ env, adapter config từ file hoặc env JSON.
 * Không gán cứng secret: dùng config ref (tên env) để resolve tại runtime.
 */
const path = require('path');
const fs = require('fs');

const dotenv = require('dotenv');
dotenv.config();

// Resolve value: nếu là string dạng "env:VAR_NAME" hoặc key nằm trong config mà value là tên env thì lấy process.env[VAR_NAME].
function resolveConfigValue(val) {
  if (val == null) return val;
  if (typeof val === 'string' && val.startsWith('env:')) {
    return process.env[val.slice(4).trim()] || '';
  }
  return val;
}

// Đọc toàn bộ object config, replace mọi value có dạng env:XXX bằng process.env.XXX.
function resolveConfig(obj) {
  if (obj == null) return obj;
  if (typeof obj !== 'object') return resolveConfigValue(obj);
  const out = Array.isArray(obj) ? [] : {};
  for (const [k, v] of Object.entries(obj)) {
    if (typeof v === 'object' && v !== null && !Array.isArray(v)) {
      out[k] = resolveConfig(v);
    } else {
      out[k] = resolveConfigValue(v);
    }
  }
  return out;
}

function loadAdaptersConfig() {
  // Ưu tiên env NOTIFICATION_ADAPTERS_JSON (JSON string), sau đó file config/adapters.json.
  const envJson = process.env.NOTIFICATION_ADAPTERS_JSON;
  if (envJson) {
    try {
      return resolveConfig(JSON.parse(envJson));
    } catch (e) {
      console.warn('NOTIFICATION_ADAPTERS_JSON parse error:', e.message);
    }
  }
  const configPath = path.join(__dirname, 'adapters.json');
  if (fs.existsSync(configPath)) {
    try {
      const raw = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      return resolveConfig(raw);
    } catch (e) {
      console.warn('adapters.json parse error:', e.message);
    }
  }
  // Mặc định: chỉ console adapter (dev).
  return {
    adapters: [
      { id: 'console', type: 'console', enabled: true }
    ]
  };
}

const adaptersConfig = loadAdaptersConfig();

const config = {
  env: process.env.NODE_ENV || 'development',
  server: {
    port: parseInt(process.env.PORT || '50075', 10),
    host: process.env.HOST || '0.0.0.0',
  },
  // Cấu hình adapter: danh sách kênh, mỗi kênh có id, type, config (giá trị lấy từ env theo ref).
  notification: {
    adapters: adaptersConfig.adapters || [],
    defaultChannel: process.env.NOTIFICATION_DEFAULT_CHANNEL || 'console',
  },
  rabbitmq: {
    url: process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672',
    queues: {
      notifications: process.env.NOTIFICATION_QUEUE || 'notifications',
    },
  },
  logging: {
    level: process.env.LOG_LEVEL || 'info',
  },
};

module.exports = config;
