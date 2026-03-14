const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Banner = sequelize.define('Banner', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },

    name: {
      type: DataTypes.STRING,
      allowNull: false
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

    imageUrl: {
      type: DataTypes.STRING,
      allowNull: false
    },

    linkType: {
      type: DataTypes.ENUM('internal', 'external'),
      defaultValue: 'internal',
      allowNull: false
    },

    customUrl: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        isUrlIfExternal(value) {
          if (this.linkType === 'external' && value) {
            if (!/^http(s)?:\/\//.test(value)) {
              throw new Error('External link phải bắt đầu bằng http:// hoặc https://');
            }
          }
        }
      }
    },

    target: {
      type: DataTypes.STRING(20),
      defaultValue: '_self',
      allowNull: false
    },

    // Vị trí banner: top, middle, bottom, custom
    position: {
      type: DataTypes.ENUM('top', 'middle', 'bottom', 'custom'),
      defaultValue: 'top',
      allowNull: false
    },

    // Thứ tự hiển thị
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
    },

    startAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    endAt: {
      type: DataTypes.DATE,
      allowNull: true
    }

  }, {
    timestamps: true,
    indexes: [
      {
        unique: true,
        name: 'banner_slug_unique',
        fields: ['slug']
      },
      {
        name: 'banner_status_index',
        fields: ['status']
      },
      {
        name: 'banner_order_index',
        fields: ['order_index']
      },
      {
        name: 'banner_position_index',
        fields: ['position']
      }
    ],
    hooks: {
      beforeValidate: (banner) => {
        if (banner.name && !banner.slug) {
          const slug = banner.name
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/đ/g, "d")
            .replace(/Đ/g, "D")
            .toLowerCase()
            .trim()
            .replace(/\s+/g, "-")
            .replace(/[^\w\-]+/g, "");
          banner.name = slug;
        }
      }
    }
  });

  return Banner;
};
