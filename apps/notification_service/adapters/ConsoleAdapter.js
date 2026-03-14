const BaseAdapter = require('./BaseAdapter');

/**
 * Adapter ghi log ra console – dùng cho dev/test. Cấu hình: config rỗng hoặc tùy chọn.
 */
class ConsoleAdapter extends BaseAdapter {
  async send({ recipient, subject, body, metadata = {} }) {
    const id = `console-${Date.now()}`;
    console.log(`[Notification][${this.id}] ${id}`, {
      recipient,
      subject,
      body: body?.substring?.(0, 100) || body,
      metadata,
    });
    return { success: true, message_id: id };
  }
}

module.exports = ConsoleAdapter;
