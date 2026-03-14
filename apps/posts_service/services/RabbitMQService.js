const amqp = require('amqplib');
const EventEmitter = require('events');

class RabbitMQService extends EventEmitter {
  constructor(rabbitmqUrl, options = {}) {
    super(); // Kế thừa EventEmitter
    this.rabbitmqUrl = rabbitmqUrl;
    this.connection = null;
    this.channel = null;
    
    // Config
    this.reconnectTimeout = options.reconnectTimeout || 5000;
    this.maxReconnectAttempts = options.maxReconnectAttempts || 10;
    this.reconnectAttempts = 0;
    this.prefetchCount = options.prefetchCount || 10;
    
    this.queues = options.queues || {};
    this.exchanges = options.exchanges || {};
    
    this.consumers = new Map();
    
    // Dùng Promise để quản lý trạng thái đang kết nối (Fix Race Condition)
    this.connectionPromise = null; 
  }

  /**
   * Kết nối tới RabbitMQ (Singleton Promise pattern)
   */
  async connect() {
    // Nếu đang kết nối, trả về promise hiện tại để các request khác cùng chờ
    if (this.connectionPromise) {
      return this.connectionPromise;
    }

    this.connectionPromise = new Promise(async (resolve, reject) => {
      try {
        console.log('🔌 Connecting to RabbitMQ...');
        
        this.connection = await amqp.connect(this.rabbitmqUrl);
        this.channel = await this.connection.createChannel();
        
        // Setup Error Listeners
        this.connection.on('error', (err) => {
          console.error('❌ RabbitMQ connection error:', err);
          this.emit('error', err);
          this.handleDisconnect();
        });

        this.connection.on('close', () => {
          console.warn('⚠️ RabbitMQ connection closed');
          this.emit('close');
          this.handleDisconnect();
        });

        // Setup Prefetch
        await this.channel.prefetch(this.prefetchCount);
        
        // Setup Exchanges
        for (const [name, config] of Object.entries(this.exchanges)) {
          await this.channel.assertExchange(name, config.type || 'direct', config.options || { durable: true });
        }

        // Setup Queues
        for (const [name, options] of Object.entries(this.queues)) {
          await this.channel.assertQueue(name, options);
        }

        // Khôi phục Consumers nếu kết nối lại
        if (this.consumers.size > 0) {
          console.log(`♻️ Restoring ${this.consumers.size} consumers...`);
          for (const [queueName, { handler, options }] of this.consumers.entries()) {
            await this._setupConsumerInternal(queueName, handler, options);
          }
        }

        console.log('✅ Connected to RabbitMQ successfully');
        this.reconnectAttempts = 0;
        this.emit('connected');
        resolve(this.channel);

      } catch (error) {
        console.error('❌ RabbitMQ connection failed:', error);
        this.connectionPromise = null; // Reset promise để cho phép thử lại
        this.handleDisconnect();
        reject(error);
      }
    });

    return this.connectionPromise;
  }

  /**
   * Xử lý khi mất kết nối (Exponential Backoff)
   */
  handleDisconnect() {
    // Reset connection/channel
    this.channel = null;
    this.connection = null;
    this.connectionPromise = null; // Cho phép gọi connect() lại

    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error(`💀 Max reconnection attempts (${this.maxReconnectAttempts}) reached.`);
      this.emit('max_reconnect_attempts_reached');
      // Có thể throw error hoặc kill process tùy chiến lược
      return;
    }

    // Tính toán thời gian chờ (Jitter Backoff)
    const backoff = Math.min(
      30000, 
      this.reconnectTimeout * Math.pow(1.5, this.reconnectAttempts) * (0.9 + Math.random() * 0.2)
    );
    
    this.reconnectAttempts++;
    console.log(`🔄 Attempting reconnect ${this.reconnectAttempts}/${this.maxReconnectAttempts} in ${Math.round(backoff/1000)}s...`);
    
    setTimeout(() => this.connect().catch(() => {}), backoff);
  }

  /**
   * Đảm bảo đã kết nối trước khi thực hiện hành động
   */
  async ensureConnection() {
    if (!this.channel) {
      await this.connect();
    }
  }

  /**
   * Publish message vào Queue
   */
  async publishMessage(queueName, message, options = {}) {
    try {
      await this.ensureConnection();
      
      // Xử lý Buffer thông minh hơn
      const content = Buffer.isBuffer(message) 
        ? message 
        : Buffer.from(typeof message === 'object' ? JSON.stringify(message) : String(message));
      
      const result = this.channel.sendToQueue(queueName, content, { 
        persistent: true,
        ...options
      });
      
      if (!result) {
        console.warn(`⚠️ Queue ${queueName} is full (Backpressure)`);
      }
      return result;
    } catch (error) {
      console.error(`❌ Failed to publish to ${queueName}:`, error);
      throw error;
    }
  }

  /**
   * Publish message vào Exchange
   */
  async publishToExchange(exchangeName, routingKey, message, options = {}) {
    try {
      await this.ensureConnection();

      const content = Buffer.isBuffer(message) 
        ? message 
        : Buffer.from(typeof message === 'object' ? JSON.stringify(message) : String(message));
      
      return this.channel.publish(exchangeName, routingKey, content, { 
        persistent: true,
        ...options
      });
    } catch (error) {
      console.error(`❌ Failed to publish to exchange ${exchangeName}:`, error);
      throw error;
    }
  }

  /**
   * Đăng ký Consumer
   */
  async consume(queueName, handler, options = {}) {
    // Lưu lại thông tin consumer để phục hồi khi reconnect
    this.consumers.set(queueName, { handler, options });
    
    await this.ensureConnection();
    return this._setupConsumerInternal(queueName, handler, options);
  }

  /**
   * Logic nội bộ để setup consumer (tách ra để dùng lại khi reconnect)
   */
  async _setupConsumerInternal(queueName, handler, options) {
    try {
      if (!this.channel) return;

      await this.channel.assertQueue(queueName, { durable: true });

      return await this.channel.consume(queueName, async (msg) => {
        if (!msg) return;
        
        try {
          // Parse nội dung
          let content = msg.content.toString();
          // Cố gắng parse JSON, nếu không được thì để nguyên string
          try {
            if (msg.properties.contentType === 'application/json' || content.startsWith('{') || content.startsWith('[')) {
               content = JSON.parse(content);
            }
          } catch (e) { /* Ignore parse error */ }
          
          // Gọi handler của user
          await handler(content, msg);
          
          if (!options.noAck) {
            this.channel.ack(msg);
          }
        } catch (processingError) {
          console.error(`❌ Error processing message in ${queueName}:`, processingError);
          
          // Logic Retry / Reject
          const requeue = options.requeue === true; // Mặc định là false để tránh loop vô hạn nếu lỗi code
          
          // Nếu reject mà không requeue -> Message sẽ vào Dead Letter Exchange (nếu đã cấu hình Queue có DLX)
          this.channel.reject(msg, requeue);
          
          // Nếu bạn vẫn muốn log manual vào DLQ code (dù không khuyến khích bằng Native DLX)
          if (!requeue && options.deadLetterQueue) {
             // Cẩn thận loop vô tận ở đây, nên try catch
             this.publishMessage(options.deadLetterQueue, {
                originalMsg: msg.content.toString(),
                error: processingError.message,
                timestamp: new Date()
             }).catch(e => console.error("Failed to send to manual DLQ", e));
          }
        }
      }, options);
    } catch (error) {
      console.error(`❌ Error setting up consumer for ${queueName}:`, error);
    }
  }

  /**
   * Đóng kết nối an toàn
   */
  async close() {
    try {
      this.consumers.clear(); // Xóa consumers để không reconnect lại
      if (this.channel) await this.channel.close();
      if (this.connection) await this.connection.close();
      console.log('👋 RabbitMQ connection closed gracefully');
    } catch (error) {
      console.error('Error closing connection:', error);
    } finally {
      this.channel = null;
      this.connection = null;
      this.connectionPromise = null;
    }
  }
}

module.exports = RabbitMQService;