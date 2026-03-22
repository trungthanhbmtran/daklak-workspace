const amqp = require('amqp-connection-manager');
const { v4: uuidv4 } = require('uuid');
const config = require('../config');

// --- CẤU HÌNH KẾT NỐI ---
const RABBITMQ_URL = config.rabbitmq.url;

class RabbitMQClient {
  constructor() {
    this.connection = null;
    this.channelWrapper = null;
    this.eventEmitter = new (require('events'))();
    this.replyQueue = null;
  }

  async connect() {
    if (this.connection) return;

    try {
      console.log(`⏳ [RabbitMQ] Connecting to ${RABBITMQ_URL}...`);
      
      this.connection = amqp.connect([RABBITMQ_URL]);
      
      this.connection.on('connect', () => {
        console.log('✅ [RabbitMQ] Connected successfully');
      });

      this.connection.on('disconnect', (params) => {
        console.error('❌ [RabbitMQ] Disconnected:', params.err.message);
      });

      this.channelWrapper = this.connection.createChannel({
        json: true,
        setup: (channel) => {
          // Setup initial state for the channel if needed
          return Promise.all([
            // example: channel.assertQueue('my-queue', { durable: true })
          ]);
        },
      });

      await this.channelWrapper.waitForConnect();
    } catch (error) {
      console.error('❌ [RabbitMQ] Failed to connect:', error.message);
      throw error;
    }
  }

  /**
   * Fire and forget - Gửi message tới một queue
   */
  async emit(queueName, data) {
    if (!this.channelWrapper) await this.connect();

    try {
      // Đảm bảo data là object để không bị double stringify
      let parsedData = data;
      if (typeof data === 'string') {
        try {
          const json = JSON.parse(data);
          // Nếu data string có dạng { pattern, data }, ta chỉ lấy phần data
          parsedData = json.data !== undefined ? json.data : json;
        } catch (e) {
          // Nếu không phải JSON thù cứ để nguyên string
          parsedData = data;
        }
      }

      // Format chuẩn NestJS: { pattern, data }
      const message = {
        pattern: queueName,
        data: parsedData
      };

      console.log(`🚀 [RabbitMQ] Emitting message to: "${queueName}"`);
      
      await this.channelWrapper.sendToQueue(queueName, message, {
        persistent: true
      });
      return true;
    } catch (error) {
      console.error(`❌ [RabbitMQ] Error emitting message to ${queueName}:`, error);
      return false;
    }
  }

  /**
   * Request-Response (RPC) - Gửi message và chờ phản hồi
   */
  async sendRequest(queueName, data) {
    if (!this.channelWrapper) await this.connect();

    if (!this.replyQueue) {
      await this.channelWrapper.addSetup(async (channel) => {
        const q = await channel.assertQueue('', { exclusive: true });
        this.replyQueue = q.queue;

        channel.consume(this.replyQueue, (msg) => {
          if (msg && msg.properties.correlationId) {
            const content = JSON.parse(msg.content.toString());
            this.eventEmitter.emit(msg.properties.correlationId, content);
          }
        }, { noAck: true });
      });
    }

    const correlationId = uuidv4();
    const message = { pattern: queueName, data: data };

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.eventEmitter.removeAllListeners(correlationId);
        reject(new Error(`[RabbitMQ] Request timeout for pattern: ${queueName}`));
      }, 10000);

      this.eventEmitter.once(correlationId, (response) => {
        clearTimeout(timeout);
        resolve(response);
      });

      console.log(`🚀 [RabbitMQ] Sending RPC request to: "${queueName}"`);
      
      this.channelWrapper.sendToQueue(queueName, message, {
        correlationId: correlationId,
        replyTo: this.replyQueue,
      }).catch(err => {
        clearTimeout(timeout);
        this.eventEmitter.removeAllListeners(correlationId);
        reject(err);
      });
    });
  }

  /**
   * Consume message từ một queue
   */
  async consume(queueName, callback) {
    if (!this.channelWrapper) await this.connect();

    console.log(`🎧 [RabbitMQ] Registering consumer for queue: ${queueName}`);

    await this.channelWrapper.addSetup(async (channel) => {
      await channel.assertQueue(queueName, { durable: true });
      
      await channel.consume(queueName, async (msg) => {
        if (msg !== null) {
          try {
            const content = JSON.parse(msg.content.toString());
            // content thường có dạng { pattern, data } từ NestJS
            await callback(content);
            channel.ack(msg);
          } catch (error) {
            console.error(`❌ [RabbitMQ] Error processing message in ${queueName}:`, error.message);
            // Mặc định ack để tránh kẹt, hoặc nack nếu muốn retry
            channel.ack(msg);
          }
        }
      });
    });
  }
}

module.exports = new RabbitMQClient();