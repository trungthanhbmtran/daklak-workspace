// models/PostTranslate.js
const { DataTypes } = require('sequelize');
const { renderLexicalToHtml } = require('../services/flexical.service');

module.exports = (sequelize) => {
  const PostTranslate = sequelize.define('PostTranslate', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    postId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Post', 
        key: 'id'
      },
      onDelete: 'CASCADE', // Xóa bài gốc thì xóa luôn bản dịch
      comment: 'ID của bài viết gốc'
    },
    language: {
      type: DataTypes.STRING(10), // 'en', 'zh', 'ja'
      allowNull: false,
      comment: 'Mã ngôn ngữ đích'
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'Tiêu đề đã dịch'
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Mô tả ngắn đã dịch'
    },
    
    // --- CẶP ĐÔI QUAN TRỌNG NHẤT ---
    contentJson: {
      type: DataTypes.JSON, // Postgre/MySQL hỗ trợ JSON native
      allowNull: true,      // Có thể null nếu lỗi dịch, nhưng thường là có dữ liệu
      comment: 'Dữ liệu JSON State của Editor (Lexical/Slate). Dùng để Load vào CMS cho Admin sửa.'
    },
    content: {
      type: DataTypes.TEXT('long'), // Hoặc LONGTEXT nếu bài quá dài
      allowNull: true,      // Ban đầu AI dịch xong có thể chưa có HTML ngay (nếu render bằng FE)
      comment: 'HTML đã render. Dùng để hiển thị ra trang Public cho người dùng.'
    },
    // --------------------------------

    status: {
      type: DataTypes.ENUM('draft', 'pending_review', 'published', 'rejected'),
      defaultValue: 'draft',
      comment: 'draft: AI đang dịch/vừa dịch xong; pending_review: Chờ sếp duyệt; published: Đã hiện lên web'
    },
    metaData: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Lưu thêm info SEO nếu cần (keywords, meta description riêng cho bản dịch)'
    }
  }, {
    tableName: 'post_translates',
    timestamps: true,
     hooks: {
      beforeUpdate: async (record) => {
        // 1. LOGIC BẢO VỆ (GUARD): Chặn sửa nếu đang Published
        // Nếu trạng thái cũ là 'published' VÀ trạng thái mới VẪN là 'published'
        if (record.previous('status') === 'published' && record.status === 'published') {
            // Kiểm tra xem có cố tình sửa nội dung không
            const isContentChanged = 
                record.changed('title') || 
                record.changed('description') || 
                record.changed('contentJson');

            if (isContentChanged) {
                throw new Error("KHÔNG ĐƯỢC PHÉP SỬA: Bài viết đang xuất bản. Vui lòng gỡ bài (chuyển về nháp) trước khi sửa.");
            }
        }

        // 2. LOGIC RENDER HTML: Chỉ chạy khi CHUYỂN TRẠNG THÁI sang Published
        // record.changed('status'): Xác nhận có đổi trạng thái
        // record.status === 'published': Trạng thái mới là published
        if (record.changed('status') && record.status === 'published') {
            if (record.contentJson) {
                try {
                    // Convert JSON -> HTML để lưu trữ hiển thị
                    record.content = await renderLexicalToHtml(record.contentJson);
                } catch (e) {
                    console.error("Render HTML failed:", e);
                }
            }
        }
      },

      /**
       * Hook cho trường hợp tạo mới (ít gặp nhưng vẫn cần render nếu tạo phát publish luôn)
       */
      beforeCreate: async (record) => {
        if (record.status === 'published' && record.contentJson) {
            record.content = await renderLexicalToHtml(record.contentJson);
        }
      }
    },

    indexes: [
      // Index tối ưu: Đảm bảo 1 bài viết chỉ có 1 bản dịch cho 1 ngôn ngữ
      // Ví dụ: Bài A chỉ có 1 bản tiếng Anh. Không thể tạo 2 bản tiếng Anh cho bài A.
      {
        unique: true,
        fields: ['post_id', 'language'] 
      }
    ]
  });

  PostTranslate.associate = (models) => {
    PostTranslate.belongsTo(models.Post, { foreignKey: 'postId', as: 'originalPost' });
  };

  return PostTranslate;
};