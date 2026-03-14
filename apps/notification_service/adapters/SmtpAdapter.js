const BaseAdapter = require('./BaseAdapter');
const nodemailer = require('nodemailer');

/** Resolve "env:VAR_NAME" tại runtime (phòng config chưa resolve khi load). */
function resolveEnv(val) {
  if (val == null) return val;
  if (typeof val === 'string' && val.startsWith('env:')) {
    return process.env[val.slice(4).trim()] || '';
  }
  return val;
}

/**
 * Adapter gửi email qua SMTP – thông số lấy từ config (có thể dạng env:VAR, resolve tại đây).
 */
class SmtpAdapter extends BaseAdapter {
  constructor(id, config = {}) {
    super(id, config);
    this._transporter = null;
  }

  _getTransporter() {
    if (this._transporter) return this._transporter;
    const host = resolveEnv(this.config.host);
    const port = resolveEnv(this.config.port);
    const secure = resolveEnv(this.config.secure);
    const user = resolveEnv(this.config.user);
    const passwordRef = resolveEnv(this.config.passwordRef);
    const portNum = port ? parseInt(port, 10) : 587;
    this._transporter = nodemailer.createTransport({
      host: host || 'localhost',
      port: portNum,
      secure: secure === 'true' || secure === true,
      auth: user && passwordRef ? { user, pass: passwordRef } : undefined,
    });
    return this._transporter;
  }

  async isReady() {
    const host = resolveEnv(this.config.host);
    return !!host;
  }

  async send({ recipient, subject, body, metadata = {} }) {
    const transporter = this._getTransporter();
    const from = metadata.from || resolveEnv(this.config.from) || resolveEnv(this.config.user) || 'noreply@localhost';
    const mailOptions = {
      from,
      to: recipient,
      subject: subject || '(No subject)',
      text: body,
      html: metadata.html || undefined,
      replyTo: metadata.replyTo,
    };
    try {
      const info = await transporter.sendMail(mailOptions);
      return { success: true, message_id: info.messageId };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }
}

module.exports = SmtpAdapter;
