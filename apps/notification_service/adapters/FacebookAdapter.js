const BaseAdapter = require('./BaseAdapter');
const https = require('https');

/**
 * Adapter gửi tin qua Facebook Messenger Send API – config: pageAccessToken (env).
 * recipient = PSID (Page-Scoped ID). Ref: https://developers.facebook.com/docs/messenger-platform/send-messages
 */
class FacebookAdapter extends BaseAdapter {
  async send({ recipient, subject, body, metadata = {} }) {
    const token = this.config.pageAccessToken || this.config.accessToken || this.config.token;
    if (!token) return { success: false, error: 'Missing Facebook page access token' };
    const psid = recipient || metadata.psid || metadata.recipient_id;
    if (!psid) return { success: false, error: 'Missing recipient (PSID)' };
    const text = subject ? `${subject}\n${body}` : (body || '');
    const version = this.config.apiVersion || 'v18.0';
    const path = `/${version}/me/messages?access_token=${encodeURIComponent(token)}`;
    const payload = JSON.stringify({
      recipient: { id: psid },
      messaging_type: metadata.messaging_type || 'RESPONSE',
      message: { text },
    });
    return this._post('graph.facebook.com', path, payload);
  }

  _post(hostname, path, payload) {
    return new Promise((resolve) => {
      const req = https.request({
        hostname,
        port: 443,
        path,
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      }, (res) => {
        let data = '';
        res.on('data', (c) => (data += c));
        res.on('end', () => {
          try {
            const j = JSON.parse(data);
            const ok = res.statusCode >= 200 && res.statusCode < 300 && !j.error;
            resolve(ok ? { success: true, message_id: j.message_id || '' } : { success: false, error: j.error?.message || data });
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
    return !!(this.config.pageAccessToken || this.config.accessToken || this.config.token);
  }
}

module.exports = FacebookAdapter;
