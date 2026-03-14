/**
 * Base adapter – interface gửi thông báo. Mỗi adapter được cấu hình qua config (không hardcode).
 */
class BaseAdapter {
  constructor(id, config = {}) {
    this.id = id;
    this.config = config;
  }

  /**
   * Gửi thông báo. Override trong adapter cụ thể.
   * @param {Object} params - { recipient, subject, body, metadata }
   * @returns {Promise<{ success: boolean, message_id?: string, error?: string }>}
   */
  async send(params) {
    throw new Error('Adapter must implement send()');
  }

  /**
   * Kiểm tra adapter sẵn sàng (config đủ, kết nối OK).
   */
  async isReady() {
    return true;
  }
}

module.exports = BaseAdapter;
