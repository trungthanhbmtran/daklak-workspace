const BaseAdapter = require('./BaseAdapter');
const https = require('https');

/**
 * Adapter gửi tin qua Telegram Bot API – config: botToken (env:TELEGRAM_BOT_TOKEN).
 * recipient = chat_id (số hoặc @username).
 */
class TelegramAdapter extends BaseAdapter {
  async send({ recipient, subject, body, metadata = {} }) {
    const token = this.config.botToken || this.config.token;
    if (!token) return { success: false, error: 'Missing Telegram bot token' };
    const chatId = recipient || metadata.chat_id;
    if (!chatId) return { success: false, error: 'Missing recipient (chat_id)' };
    const text = subject ? `${subject}\n\n${body}` : (body || '');
    const payload = JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: metadata.parse_mode || undefined,
      disable_web_page_preview: metadata.disable_web_page_preview,
    });
    const url = new URL(`https://api.telegram.org/bot${token}/sendMessage`);
    return new Promise((resolve) => {
      const req = https.request(url, { method: 'POST', headers: { 'Content-Type': 'application/json' } }, (res) => {
        let data = '';
        res.on('data', (c) => (data += c));
        res.on('end', () => {
          try {
            const j = JSON.parse(data);
            resolve(j.ok ? { success: true, message_id: String(j.result?.message_id) } : { success: false, error: j.description || data });
          } catch {
            resolve({ success: false, error: data || res.statusCode });
          }
        });
      });
      req.on('error', (e) => resolve({ success: false, error: e.message }));
      req.write(payload);
      req.end();
    });
  }

  async isReady() {
    return !!(this.config.botToken || this.config.token);
  }
}

module.exports = TelegramAdapter;
