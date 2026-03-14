const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Tag = sequelize.define('Tag', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: true,
        len: [1, 50]
      }
    },
    slug: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive'),
      defaultValue: 'active'
    }
  }, {
    timestamps: true,
    // indexes: [
    //   {
    //     name: 'tags_name_unique',
    //     unique: true,
    //     fields: ['name']
    //   },
    //   {
    //     name: 'tags_slug_unique',
    //     unique: true,
    //     fields: ['slug']
    //   },
    //   {
    //     name: 'tags_status_idx',
    //     fields: ['status']
    //   }
    // ]
  });

  Tag.associate = (models) => {
    Tag.belongsToMany(models.Post, {
      through: 'PostTags',
      foreignKey: 'tagId',
      as: 'posts'
    });
  };

  return Tag;
};
