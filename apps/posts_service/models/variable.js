const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Variable = sequelize.define('Variable', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    options: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: ''
    },
    dataType: {
      type: DataTypes.ENUM('text', 'number', 'date', 'email', 'phone','information','select','checkbox','radio','address'),
      defaultValue: 'text'
    },
    isMultiValue :{
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    required: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    description: {
      type: DataTypes.STRING
    },
    defaultValue: {
      type: DataTypes.STRING
    },
    validation: {
      type: DataTypes.JSON,
      defaultValue: {}
    },
    PostId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'posts',
        key: 'id'
      }
    }
  }, {
    timestamps: true,
    // indexes: [
    //   {
    //     fields: ['PostId']
    //   }
    // ]
  });

  // Define associations if needed
  Variable.associate = (models) => {
    // Example: If you have a User model
      Variable.belongsTo(models.Post, {
        foreignKey: 'postId',
        as: 'post'
      });
  };

  return Variable;
};

