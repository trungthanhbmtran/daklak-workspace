const BaseService = require('./Base.service');
const { PostTranslate, Post } = require('../models');
const rabbitClient = require('../services/rabbitmq'); // Đảm bảo đường dẫn đúng tới file RabbitMQ client

class TranslationService extends BaseService {
  constructor() {
    super(PostTranslate);
  }

  async getTranslationsByPost(postId) {
    const translations = await this.model.findAll({
      where: { postId },
      attributes: ['id', 'language', 'title', 'status', 'updatedAt', 'createdAt'],
      order: [['language', 'ASC']],
    });
    return translations;
  }

  // 2. Lấy chi tiết bản dịch (Kèm theo bài gốc để so sánh side-by-side)
  async getTranslationDetail(id) {
   const post = await Post.findByPk(id, {
      // 2. Kèm theo danh sách các bản dịch
      include: [
        {
          model: PostTranslate,
          as: 'translations', // Đảm bảo trong Model Post bạn đã định nghĩa: Post.hasMany(PostTranslate, { as: 'translations' })
          attributes: ['id', 'language', 'title', 'contentJson', 'status', 'updatedAt'], // Lấy contentJson để hiển thị Editor
        },
      ],
      // Lấy các trường cần thiết của bài gốc
      attributes: ['id', 'title', 'contentJson','language','createdAt', 'updatedAt'], 
    });

    if (!post) throw new Error('Post not found');
    console.log("TranslationService.getTranslationDetail post:", post);
    return post;
  }

  // 3. Cập nhật bản dịch (Admin sửa và lưu lại)
  async updateTranslation(id, data) {
    const translation = await this.model.findByPk(id);
    if (!translation) throw new Error('Translation not found');

    // Chỉ cập nhật các trường cho phép
    // contentJson: state của editor, contentHtml: html hiển thị public
    const { title, description, contentJson, contentHtml, status } = data;

    await translation.update({
      title,
      description,
      contentJson,
      contentHtml,
      status, // 'pending_review' -> 'published'
    });

    return translation;
  }

  // 4. Kích hoạt dịch thủ công (Manual Trigger)
  // Dùng khi user bấm nút "Dịch lại" hoặc "Thêm ngôn ngữ mới"
  async triggerTranslationManual(postId, targetLang) {
    // a. Lấy bài viết gốc
    const post = await Post.findByPk(postId);
    if (!post) throw new Error('Original Post not found');

    // b. Kiểm tra xem đã có bản dịch ngôn ngữ này chưa (để tránh spam)
    // Tùy chọn: Có thể bỏ qua bước này nếu muốn cho phép ghi đè
    const existing = await this.model.findOne({
      where: { postId, language: targetLang }
    });
    
    // Nếu chưa có thì tạo placeholder status 'draft' để UI hiển thị "Dang xử lý..."
    if (!existing) {
        await this.create({
            postId,
            language: targetLang,
            title: `[Draft] ${post.title}`,
            status: 'draft'
        });
    }

    // c. Chuẩn bị payload gửi sang RabbitMQ
    const payload = {
      postId: post.id,
      title: post.title,
      description: post.description,
      content: post.content,         // HTML gốc
      contentJson: post.contentJson, // JSON gốc (Quan trọng để AI dịch)
      sourceLanguage: post.language || 'vi',
      targetLanguages: [targetLang], // Worker nhận mảng
    };

    // d. Bắn message (Fire & Forget)
    await rabbitClient.emit('translation_request', payload);

    return { success: true, message: `Translation job for ${targetLang} queued.` };
  }

  // 5. Xóa bản dịch
  async deleteTranslation(id) {
    const translation = await this.model.findByPk(id);
    if (!translation) throw new Error('Translation not found');
    
    await translation.destroy();
    return { success: true };
  }
}

module.exports = new TranslationService();