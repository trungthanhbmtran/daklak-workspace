const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Category = sequelize.define('Category', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },

    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true // Lưu ý: Nếu làm nested menu phức tạp có thể cần bỏ unique này và xử lý logic riêng
    },

    slug: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },

    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },

    thumbnail: {
      type: DataTypes.STRING,
      allowNull: true
    },

    // 1. Loại điều hướng: 
    // - 'standard': Trang danh mục thường (dynamic, list bài viết)
    // - 'static': Trang nội bộ khác (VD: /gioi-thieu, /lien-he)
    // - 'external': Link ra website khác (VD: Shopee, Facebook)
    linkType: {
      type: DataTypes.ENUM('standard', 'static', 'external'),
      defaultValue: 'standard',
      allowNull: false
    },

    // 2. Đường dẫn tùy chỉnh:
    // - Nếu linkType = 'standard': Có thể để null (sẽ dùng field 'slug' mặc định)
    // - Nếu linkType = 'static': Điền path nội bộ (VD: '/pages/about-us')
    // - Nếu linkType = 'external': Điền full URL (VD: 'https://google.com')
    customUrl: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        // Validate URL nếu là external (tuỳ chọn logic validate ở đây hoặc controller)
        isUrlIfExternal(value) {
          if (this.linkType === 'external' && value) {
            // Regex check URL đơn giản hoặc dùng thư viện validator
            if (!/^http(s)?:\/\//.test(value)) {
              throw new Error('External link phải bắt đầu bằng http:// hoặc https://');
            }
          }
        }
      }
    },

    // 3. Cách mở liên kết (_self hoặc _blank)
    target: {
      type: DataTypes.STRING(20),
      defaultValue: '_self', // _self: mở tab hiện tại, _blank: mở tab mới
      allowNull: false
    },


    parentId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'Category',
        key: 'id'
      }
    },
    // Nested set fields
    lft: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    rgt: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    depth: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },

    orderIndex: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },

    status: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },

    metaTitle: {
      type: DataTypes.STRING,
      allowNull: true
    },

    metaDescription: {
      type: DataTypes.TEXT,
      allowNull: true
    }

  }, {
    timestamps: true,
    indexes: [
      // Index slug
      {
        unique: true,
        name: 'categories_slug_unique',
        fields: ['slug']
      },
    
      // Index nested set
      {
        name: 'categories_lft_index',
        fields: ['lft']
      },
      {
        name: 'categories_nested_set_index',
        fields: ['lft', 'rgt']
      },
    
      // Index cho parent_id (snake_case)
      {
        name: 'categories_parent_id_index',
        fields: ['parent_id']  // <-- sửa từ 'parentId' sang 'parent_id'
      },
    
      // Index kết hợp status
      {
        name: 'categories_status_slug_index',
        fields: ['status', 'slug']
      }
    ],
    hooks: {
      beforeValidate: (category) => {
        // Logic tạo slug giữ nguyên
        // Slug vẫn cần thiết để định danh Category trong database ngay cả khi là external link
        if (category.name && !category.slug) {
          const slug = category.name
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/đ/g, "d")
            .replace(/Đ/g, "D")
            .toLowerCase()
            .trim()
            .replace(/\s+/g, "-")
            .replace(/[^\w\-]+/g, "");

          category.slug = slug;
        }
      }
    }
  });

  Category.associate = (models) => {
    Category.hasMany(models.Post, {
      foreignKey: 'categoryId',
      as: 'posts'
    });

    Category.hasMany(models.Category, {
      foreignKey: 'parentId',
      as: 'children'
    });

    Category.belongsTo(models.Category, {
      foreignKey: 'parentId',
      as: 'parent'
    });
  };

  return Category;
};