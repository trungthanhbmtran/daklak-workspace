const BaseAdapter = require('./BaseAdapter');
const amqp = require('amqplib');

class InAppAdapter extends BaseAdapter {
  constructor(id, config = {}) {
    super(id, config);
    this.rabbitUrl = process.env.RABBITMQ_URL || 'amqp://admin:admin123@localhost:5672';
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
