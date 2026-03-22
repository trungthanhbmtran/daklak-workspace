const { DataTypes } = require('sequelize');
const rabbitClient = require('../services/rabbitmq');
const { renderLexicalToHtml } = require('../services/flexical.service');

module.exports = (sequelize) => {

  // Hàm remove dấu tiếng Việt
  const removeVietnameseTones = (str) => {
    return str
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/Đ/g, 'D');
  };

  const Post = sequelize.define('Post', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { notEmpty: true, len: [1, 255] }
    },
    content: {
      type: DataTypes.TEXT('long'),
      allowNull: true,
      comment: 'Chứa HTML đã render từ Lexical, dùng để hiển thị',
    },
    contentJson: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Chứa Lexical State JSON, dùng để khôi phục editor',
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    slug: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
      validate: { notEmpty: true }
    },
    authorId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    categoryId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'Category',
        key: 'id'
      }
    },
    reviewerId: {
      type: DataTypes.UUID,
      allowNull: true,
      comment: 'Người thực hiện duyệt bài cuối cùng (Lãnh đạo/Trưởng ban)',
    },
    moderationNote: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Ghi chú của người duyệt (Lý do trả về, yêu cầu sửa, hoặc bút phê)',
    },
    language: {
      type: DataTypes.STRING(5), // Lưu mã chuẩn ISO 639-1 (vi, en, zh-CN...)
      allowNull: false,
      defaultValue: 'vi', // Mặc định là tiếng Việt
      validate: {
        isIn: [['vi', 'en', 'zh', 'ja', 'ko']] // Tùy chọn: giới hạn ngôn ngữ hỗ trợ
      },
      comment: 'Ngôn ngữ gốc của bài viết'
    },
    status: {
      type: DataTypes.ENUM(
        'draft',            // Bản nháp: Đang soạn thảo, chưa trình.
        'pending',          // Chờ duyệt: Đã trình lên cấp trên/Ban biên tập.
        'editing',          // Yêu cầu chỉnh sửa: Lãnh đạo trả về yêu cầu sửa lại.
        'approved',         // Đã duyệt: Nội dung đã được thông qua (chờ ngày public hoặc chờ kỹ thuật đưa lên).
        'published',        // Đã xuất bản: Đang hiển thị công khai trên cổng.
        'rejected',         // Từ chối: Hủy bỏ hoàn toàn bài viết (không sửa nữa).
        'archived'          // Lưu trữ: Bài viết cũ, gỡ khỏi trang chủ nhưng vẫn lưu trong CSDL.
      ),
      defaultValue: 'draft',
      validate: {
        isIn: [['draft', 'pending', 'editing', 'approved', 'published', 'rejected', 'archived']]
      }
    },
    thumbnail: {
      type: DataTypes.STRING,
      allowNull: true
    },
    isFeatured: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    isNotification: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
      comment: 'Đánh dấu là thông báo (Hiển thị ở Widget Thông báo / Gửi Push Notification)'
    },
    viewCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    publishedAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    createdAt: {
      type: DataTypes.DATE,
      field: 'created_at'
    },
    updatedAt: {
      type: DataTypes.DATE,
      field: 'updated_at'
    }
  }, {
    timestamps: true,
    // --- PHẦN INDEX TỐI ƯU ---
    indexes: [
      { unique: true, name: 'posts_slug_unique', fields: ['slug'] },
      { name: 'posts_category_status_index', fields: ['category_id', 'status'] },
      { name: 'posts_author_index', fields: ['author_id'] },
      { name: 'posts_status_published_at_index', fields: ['status', 'published_at'] },
      { name: 'posts_featured_status_index', fields: ['is_featured', 'status'] },
      { name: 'posts_notification_status_index', fields: ['is_notification', 'status'] },
      // { name: 'posts_reviewer_index', fields: ['reviewer_id'] }, 
      { name: 'posts_title_index', fields: ['title'] },
      { name: 'posts_language_index', fields: ['language'] } 
    ]
  });

  Post.beforeValidate(async (post) => {
    if (post.title && !post.slug) {
      let slug = removeVietnameseTones(post.title.toLowerCase().trim());
      slug = slug.replace(/[\s]+/g, '-').replace(/[^\w\-]+/g, '');
      post.slug = slug;
    }
  });

Post.beforeSave(async (post, options) => {
  console.log("Hook beforeSave đang chạy...");

  // 1. Tự động set ngày xuất bản
  if (post.status === 'published' && !post.publishedAt) {
    post.publishedAt = new Date();
  }

  // 2. Reset ngày xuất bản nếu bài bị gỡ
  if (['draft', 'pending', 'editing', 'rejected'].includes(post.status)) {
    post.publishedAt = null;
  }

  // 3. Render HTML từ JSON (Đây là phần quan trọng nhất)
  // Kiểm tra nếu status chuyển sang published HOẶC contentJson bị thay đổi
  // if (post.status === 'published') {
  //   if (post.changed('contentJson') || post.changed('status') || !post.contentJson) {
  //     console.log("Đang render Lexical to HTML...");
  //     try {
  //       console.log("post content",post.contentJson)
  //       const htmlResult = await renderLexicalToHtml(post.contentJson);
  //       post.content = htmlResult;
  //     } catch (err) {
  //       console.error("Render error:", err);
  //     }
  //   }
  // }

  // 4. Chống sửa bài đã xuất bản
  if (!post.isNewRecord && post.previous('status') === 'published' && post.status === 'published') {
    if (post.changed('title') || post.changed('description') || post.changed('contentJson')) {
      throw new Error("Không được sửa bài viết đang xuất bản. Vui lòng gỡ bài về nháp trước.");
    }
  }
});

  Post.afterCreate(async (post, options) => {
    try {
      const payload = {
        postId: post.id,
        title: post.title,
        description: post.description,
        sourceLang: post.language,
        content: post.contentJson, // HTML content
        targetLanguages: ['en'] // Ví dụ: Dịch sang Anh và Trung
      };
      // Gửi vào hàng đợi 'translation_request'
      await rabbitClient.emit('translation_request', payload);
      // await rabbitClient.sendRequest('translation_request', payload);

    } catch (error) {
      // Log lỗi nhưng KHÔNG chặn quy trình tạo bài viết (Non-blocking)
      console.error(`⚠️ Failed to push translation job for Post ID ${post.id}:`, error);
    }
  });



  Post.associate = (models) => {
    Post.hasMany(models.Variable, { foreignKey: 'postId', as: 'variables' });
    Post.belongsToMany(models.Tag, { through: 'PostTags', foreignKey: 'postId', as: 'tags' });
    Post.belongsTo(models.Category, { foreignKey: 'categoryId', as: 'category' });
    Post.hasMany(models.PostTranslate, { foreignKey: 'postId', as: 'translations' });
  };

  Post.searchableFields = ['title', 'content'];

  return Post;
};