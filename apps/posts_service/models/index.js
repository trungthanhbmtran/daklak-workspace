// models/index.js
const fs = require('fs');
const path = require('path');
const { Sequelize } = require('sequelize');
const config = require('../config');

// 1. Khởi tạo instance
const sequelize = new Sequelize(
  config.database.database,
  config.database.username,
  config.database.password,
  {
    host: config.database.host,
    port: config.database.port,
    dialect: config.database.dialect,
    logging: config.database.logging, // Nên tắt false ở production
    pool: config.database.pool,
    define: {
      freezeTableName: true,
      underscored: true,
      timestamps: true
    }
  }
);

const models = {};

// 2. Load models động
fs.readdirSync(__dirname)
  .filter(file => {
    return (
      file.indexOf('.') !== 0 &&
      file !== 'index.js' &&
      file.slice(-3) === '.js'
    );
  })
  .forEach(file => {
    // Model files phải export function: module.exports = (sequelize) => { ... }
    const model = require(path.join(__dirname, file))(sequelize);
    models[model.name] = model;
  });

// 3. Thiết lập quan hệ (Associations)
Object.keys(models).forEach(modelName => {
  if (models[modelName].associate) {
    models[modelName].associate(models);
  }
});

// 4. Hàm khởi tạo Database (Sẽ được gọi ở server.js)
const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected successfully.');
    
    //   await sequelize.sync({
    //   alter: true,   // 👈 Sequelize sẽ sửa cột content thành NULL
    // });

    // Lưu ý: alter: true sẽ tự sửa bảng nếu model thay đổi (an toàn hơn force)
    // Production thì nên tắt sync và dùng Migration
    // await sequelize.sync({ force: false, alter: true }); 
    // await sequelize.sync(); // chỉ tạo bảng mới
    // console.log('✅ Models synchronized.');
    
  } catch (err) {
    console.error('❌ Database connection failed:', err);
    throw err; // Ném lỗi để Server biết mà dừng lại
  }
};

// 5. Export sạch sẽ
module.exports = {
  sequelize,
  Sequelize,
  connectDB,
  ...models // Export trực tiếp các model (db.Post, db.Tag...)
};