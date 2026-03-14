const BaseAdapter = require('./BaseAdapter');
const https = require('https');

/**
 * Adapter gửi tin qua Zalo Official Account API – config từ env (accessToken, apiUrl).
 * recipient = user_id (Zalo user id). Message text gửi qua API gửi tin nhắn OA.
 * Ref: https://developers.zalo.me/docs/api/official-account-api
 */
class ZaloAdapter extends BaseAdapter {
  async send({ recipient, subject, body, metadata = {} }) {
    const token = this.config.accessToken || this.config.token;
    if (!token) return { success: false, error: 'Missing Zalo access token' };
    const userId = recipient || metadata.user_id || metadata.recipient_id;
    if (!userId) return { success: false, error: 'Missing recipient (user_id)' };
    const text = subject ? `${subject}\n${body}` : (body || '');
    const apiUrl = this.config.apiUrl || 'https://graph.zalo.me/v2.0/me/message';
    const payload = JSON.stringify({
      recipient: { user_id: userId },
      message: { text },
    });
    return this._post(apiUrl, payload, token);
  }

  _post(urlStr, payload, accessToken) {
    return new Promise((resolve) => {
      const url = new URL(urlStr);
      const options = {
        hostname: url.hostname,
        port: url.port || 443,
        path: url.pathname + url.search,
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${accessToken}` },
      };
      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', (c) => (data += c));
        res.on('end', () => {
          try {
            const j = JSON.parse(data);
            const ok = res.statusCode >= 200 && res.statusCode < 300 && (j.error === 0 || !j.error);
            resolve(ok ? { success: true, message_id: j.message_id || '' } : { success: false, error: j.message || data });
          } catch {
            resolve({ success: false, error: data || String(res.statusCode) });
          }
        });
      });
      req.on('error', (e) => resolve({ success: false, error: e.message }));
      req.write(payload);
      req.end();
    });
  }

  async isReady() {
    return !!(this.config.accessToken || this.config.token);
  }
}

module.exports = ZaloAdapter;
