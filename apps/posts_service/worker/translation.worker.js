// workers/translation.worker.js
const { PostTranslate } = require('../models'); // Import Model
const rabbitClient = require('../services/rabbitmq'); // Import Rabbit Client

const QUEUE_NAME = 'translation_results';

module.exports = {
  // Hàm khởi động worker này
  start: async () => {
    console.log(`👷 [Translation Worker] Starting...`);

    // Gọi hàm consume
    await rabbitClient.consume(QUEUE_NAME, async (message) => {
      try {
        // Cấu trúc message nhận được: { pattern: 'translation_results', data: { ... } }
        // Nên ta cần lấy dữ liệu từ message.data
        const payload = message.data;

        // console.log("message",message.d)

        if (!payload) {
          console.error("❌ [Translation Worker] Received message with no data payload:", message);
          return;
        }

        // console.log(`📥 [Translation Worker] Processing Post ID: ${payload.postId}`);
        // console.log('Loại dữ liệu của payload.content:', typeof payload.content);
        // console.log('Translation Payload:', payload);

        // Logic nghiệp vụ: Lưu vào database
        // Mapping các trường từ payload (input) sang PostTranslate model (db)
        const dataToSave = {
          postId: payload.postId,
          language: payload.lang,
          description: payload.description,
          title : payload.title,
          contentJson: payload.content,
          content: null,
          status: 'pending_review'
        };

        await PostTranslate.create(dataToSave);

        console.log(`✅ [Translation Worker] Saved translation successfully.`);
        // Lưu ý: rabbitClient.consume của bạn đã tự handle .ack() sau khi hàm này chạy xong
      } catch (error) {
        console.error(`❌ [Translation Worker] Error:`, error);
        // Tùy chọn: Gửi thông báo lỗi vào Slack/Telegram hoặc Log system
        throw error; // Ném lỗi để RabbitMQ channel biết (ack được gọi sau đó trong client)
      }
    });
  }
};