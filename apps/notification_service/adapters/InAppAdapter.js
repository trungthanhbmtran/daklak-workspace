const BaseAdapter = require('./BaseAdapter');
const amqp = require('amqplib');

class InAppAdapter extends BaseAdapter {
  constructor(id, config = {}) {
    super(id, config);
    const rabbitUrl = process.env.RABBITMQ_URL;
    if (!rabbitUrl) {
      // Fail-fast (ledger #9): không tự gán credentials mặc định
      throw new Error('[InAppAdapter] Thiếu biến môi trường RABBITMQ_URL. InApp adapter phát thông báo qua RabbitMQ gateway_queue và yêu cầu RABBITMQ_URL được cấu hình.');
    }
    this.rabbitUrl = rabbitUrl;
    this.queueName = 'gateway_queue';
    this.connection = null;
    this.channel = null;
  }

  async connect() {
    if (!this.connection) {
      this.connection = await amqp.connect(this.rabbitUrl);
      this.channel = await this.connection.createChannel();
      await this.channel.assertQueue(this.queueName, { durable: true });
    }
  }

  async send(params) {
    try {
      await this.connect();
      
      const payload = {
        pattern: 'send_inapp_notification',
        data: {
          title: params.subject,
          message: params.body,
          type: 'SYSTEM',
          recipients: Array.isArray(params.recipient) ? params.recipient : [params.recipient],
          metadata: params.metadata || {}
        }
      };

      this.channel.sendToQueue(this.queueName, Buffer.from(JSON.stringify(payload)));
      
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

module.exports = InAppAdapter;
