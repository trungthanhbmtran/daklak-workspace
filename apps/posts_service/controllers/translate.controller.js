// controllers/translation.controller.js
const translationService = require('../services/translation.service');

class TranslationController {
  constructor() {
    this.serviceName = 'TranslationService';
  }

  // 1. Lấy danh sách các bản dịch của một bài viết (dùng cho tab "Translations" ở frontend)
  async GetTranslationsByPost(call, callback) {
    try {
      const { postId } = call.request;
      // Service sẽ trả về list các bản dịch (EN, JP, CN...) kèm trạng thái
      const translations = await translationService.getTranslationsByPost(postId);
      callback(null, { success: true, data: translations });
    } catch (error) {
      console.error("GetTranslationsByPost Error:", error);
      callback(error);
    }
  }

  // 2. Lấy chi tiết một bản dịch (Dùng để load vào Editor cho người duyệt)
async GetTranslationDetail(call, callback) {
    try {
      const { id } = call.request; // Lưu ý: Đây là postId
      
      // Lấy dữ liệu từ Service (Sequelize Model Instance)
      const postData = await translationService.getTranslationDetail(id);
      
      if (!postData) {
        return callback({
           code: 5, // gRPC NOT_FOUND
           message: "Translation not found"
        });
      }

      const plainData = postData.toJSON ? postData.toJSON() : postData;

      // BƯỚC 2: Xử lý contentJson của bài GỐC (nếu cần stringify)
      if (plainData.contentJson && typeof plainData.contentJson === 'object') {
          plainData.contentJson = JSON.stringify(plainData.contentJson);
      }

      // BƯỚC 3: Xử lý contentJson trong mảng TRANSLATIONS
      if (plainData.translations && Array.isArray(plainData.translations)) {
          plainData.translations = plainData.translations.map(t => {
              let safeContentJson = "";

              if (t.contentJson) {
                  // Nếu là Object (JSON) -> Stringify
                  if (typeof t.contentJson === 'object') {
                      safeContentJson = JSON.stringify(t.contentJson);
                  } 
                  // Nếu đã là String -> Giữ nguyên
                  else if (typeof t.contentJson === 'string') {
                      safeContentJson = t.contentJson;
                  }
              }

              return {
                  ...t,
                  contentJson: safeContentJson // Gán lại giá trị đã xử lý
              };
          });
      }

      // Trả về kết quả
      callback(null, { 
        success: true, 
        data: plainData
      });

    } catch (error) {
      console.error("GetTranslationDetail Error:", error);
      callback(error);
    }
}

  // 3. Cập nhật bản dịch (Lưu & Xuất bản từ màn hình duyệt bài)
  async UpdateTranslation(call, callback) {
    try {
      console.log("UpdateTranslation Request:", call.request);
      const { id, title, description, contentJson, contentHtml, status } = call.request;
      
      const updatedTranslation = await translationService.updateTranslation(id, {
        title,
        description,
        contentJson, // JSON state mới từ Editor
        contentHtml, // HTML đã render từ Frontend
        status       // 'published' hoặc 'pending_review'
      });

      callback(null, { success: true, data: updatedTranslation });
    } catch (error) {
      console.error("UpdateTranslation Error:", error);
      callback(error);
    }
  }

  // 4. Kích hoạt dịch thủ công (Nút "Dịch lại" hoặc "Dịch thêm ngôn ngữ")
  async TriggerTranslation(call, callback) {
    try {
      const { postId, targetLang } = call.request;
      
      // Service sẽ bắn message vào RabbitMQ
      await translationService.triggerTranslationManual(postId, targetLang);
      
      callback(null, { success: true, message: "Translation job triggered successfully" });
    } catch (error) {
      console.error("TriggerTranslation Error:", error);
      callback(error);
    }
  }

  // 5. Xóa một bản dịch (Ít dùng, nhưng cần cho quản trị)
  async DeleteTranslation(call, callback) {
    try {
      const { id } = call.request;
      await translationService.deleteTranslation(id);
      callback(null, { success: true });
    } catch (error) {
      callback(error);
    }
  }
}

module.exports = new TranslationController();