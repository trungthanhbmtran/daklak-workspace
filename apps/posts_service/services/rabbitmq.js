// services/rabbitmq.client.js
const amqp = require('amqplib');
const { v4: uuidv4 } = require('uuid');

// --- CẤU HÌNH KẾT NỐI ---
// Ưu tiên lấy từ biến môi trường (Docker), nếu không có thì fallback về localhost (Chạy tay)
// Lưu ý: user/pass mặc định là guest/guest
const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672';

class RabbitMQClient {
  constructor() {
    this.connection = null;
    this.channel = null;
    this.replyQueue = null;
    this.eventEmitter = new (require('events'))();
  }

  async connect() {
    // Nếu đã kết nối rồi thì bỏ qua
    if (this.connection) return;

    try {
      console.log(`⏳ [RabbitMQ] Connecting to ${RABBITMQ_URL}...`);
      
      this.connection = await amqp.connect(RABBITMQ_URL);
      this.channel = await this.connection.createChannel();
      
      console.log('✅ [RabbitMQ] Connected successfully');
      
      // Xử lý khi connection bị đóng đột ngột (để app không bị treo mà không biết)
      this.connection.on('close', () => {
        console.error('❌ [RabbitMQ] Connection closed');
        this.connection = null;
        this.channel = null;
      });

      this.connection.on('error', (err) => {
        console.error('❌ [RabbitMQ] Connection error:', err);
        this.connection = null;
        this.channel = null;
      });

    } catch (error) {
      console.error('❌ [RabbitMQ] Failed to connect:', error.message);
      // Ném lỗi ra ngoài để Server biết (vì nếu không kết nối được RabbitMQ thì Server không nên start)
      throw error;
    }
  }

  async emit(queueName, data) {
    if (!this.channel) await this.connect();

    // 1. Đảm bảo queue tồn tại (quan trọng để tránh mất tin)
    await this.channel.assertQueue(queueName, { durable: true });

    // 2. Format dữ liệu chuẩn NestJS { pattern, data }
    const payload = JSON.stringify({
        pattern: queueName, // Khớp với @MessagePattern bên NestJS
        data: data
    });

    console.log(`🚀 [Fire & Forget] Bắn tin tới: "${queueName}"`);

    // 3. Gửi luôn và không cần chờ reply
    // Dùng try-catch ở đây để nếu lỗi kết nối thì không sập app
    try {
        this.channel.sendToQueue(queueName, Buffer.from(payload), {
            persistent: true // Lưu tin nhắn vào ổ cứng phòng khi RabbitMQ sập
        });
        return true;
    } catch (error) {
        console.error(`❌ Lỗi gửi RabbitMQ:`, error);
        return false;
    }
}

  // --- PHẦN 1: GỬI REQUEST VÀ CHỜ KẾT QUẢ (RPC) ---
  async sendRequest(queueName, data) {
    if (!this.channel) await this.connect();

    // Setup hàng đợi reply một lần duy nhất
    if (!this.replyQueue) {
      const q = await this.channel.assertQueue('', { exclusive: true });
      this.replyQueue = q.queue;
      
      // Lắng nghe phản hồi
      this.channel.consume(this.replyQueue, (msg) => {
        if (msg && msg.properties.correlationId) {
          const content = JSON.parse(msg.content.toString());
          this.eventEmitter.emit(msg.properties.correlationId, content);
        }
      }, { noAck: true });
    }

    const correlationId = uuidv4();
    // Format chuẩn cho NestJS Microservice: { pattern, data }
    const payload = JSON.stringify({ pattern: queueName, data: data });
    console.log(`🚀 [Express] Đang gửi tin đến queue: "${queueName}"`); // <--- THÊM LOG NÀY

    return new Promise((resolve, reject) => {
      // Timeout 10s
      const timeout = setTimeout(() => {
        this.eventEmitter.removeAllListeners(correlationId);
        reject(new Error(`[RabbitMQ] Request timeout for pattern: ${queueName}`));
      }, 10000);

      // Lắng nghe event trả về
      this.eventEmitter.once(correlationId, (response) => {
        clearTimeout(timeout);
        resolve(response);
      });

      // Gửi tin nhắn
      const sent = this.channel.sendToQueue(queueName, Buffer.from(payload), {
        correlationId: correlationId,
        replyTo: this.replyQueue,
      });
      if (!sent) {
         console.warn("⚠️ [Express] Buffer đầy, tin nhắn có thể chưa được gửi ngay.");
      }
    });
  }

  // --- PHẦN 2: LẮNG NGHE BACKGROUND (WORKER) ---
  async consume(queueName, callback) {
    if (!this.channel) await this.connect();

    // Durable = true: Giữ tin nhắn nếu consumer chưa kịp nhận
    await this.channel.assertQueue(queueName, { durable: true });

    console.log(`🎧 [RabbitMQ] Waiting for messages in queue: ${queueName}`);

    this.channel.consume(queueName, async (msg) => {
      if (msg !== null) {
        try {
          const content = JSON.parse(msg.content.toString());
          
          // Gọi logic bên ngoài
          await callback(content);

          // Xác nhận đã xử lý xong (ACK)
          this.channel.ack(msg);
        } catch (error) {
          console.error(`❌ [RabbitMQ] Error processing message in ${queueName}:`, error);
          // Tùy chọn: this.channel.nack(msg) nếu muốn RabbitMQ gửi lại tin này cho worker khác
          // Ở đây mình ack luôn để tránh kẹt queue nếu lỗi do format data
          this.channel.ack(msg); 
        }
      }
    });
  }
}

module.exports = new RabbitMQClient();