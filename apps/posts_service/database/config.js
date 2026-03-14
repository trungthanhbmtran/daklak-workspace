// config.js
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('admin_posts', 'root', 'mypassword', {
  host: 'localhost',
  dialect: 'mysql',
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  timezone: '+00:00', // Set the timezone for the connection (default: 'local')
  charset: 'utf8mb4', // Set the character set for the connection (default: 'utf8')
});

module.exports = sequelize;
