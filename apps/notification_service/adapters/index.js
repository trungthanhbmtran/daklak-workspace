/**
 * Registry adapter – tạo adapter theo config (type + config), không gán cứng.
 * Thêm adapter mới: thêm type trong typeMap và file adapter tương ứng.
 */
const ConsoleAdapter = require('./ConsoleAdapter');
const SmtpAdapter = require('./SmtpAdapter');
const TelegramAdapter = require('./TelegramAdapter');
const ZaloAdapter = require('./ZaloAdapter');
const FacebookAdapter = require('./FacebookAdapter');

const typeMap = {
  console: ConsoleAdapter,
  smtp: SmtpAdapter,
  email: SmtpAdapter,
  telegram: TelegramAdapter,
  zalo: ZaloAdapter,
  facebook: FacebookAdapter,
};

/**
 * Tạo một adapter từ mô tả config: { id, type, enabled, config }.
 */
function createAdapter(descriptor) {
  if (!descriptor || descriptor.enabled === false) return null;
  const { id, type, config = {} } = descriptor;
  const Cls = typeMap[type];
  if (!Cls) {
    console.warn(`Unknown adapter type: ${type}, skipping id=${id}`);
    return null;
  }
  return new Cls(id, config);
}

/**
 * Khởi tạo registry từ danh sách adapter trong config.
 * @param {Array<{ id, type, enabled?, config? }>} adaptersConfig
 * @returns {Map<string, BaseAdapter>} id -> adapter instance
 */
function buildRegistry(adaptersConfig) {
  const registry = new Map();
  if (!Array.isArray(adaptersConfig)) return registry;
  for (const desc of adaptersConfig) {
    const adapter = createAdapter(desc);
    if (adapter) registry.set(adapter.id, adapter);
  }
  return registry;
}

module.exports = {
  createAdapter,
  buildRegistry,
  typeMap,
};
