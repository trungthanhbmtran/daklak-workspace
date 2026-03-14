const { Sequelize, Op, Model, DataTypes } = require('@sequelize/core');
// const uniqid  = require('uniqid');
// const { Attribute, NotNull, Default, DeletedAt } = require('@sequelize/core/decorators-legacy');

// const sequelize = new Sequelize('postgres://postgres:password@localhost:5432/rbac_project', {
//   logging: false, // Thay đổi tùy theo nhu cầu
// });

const sequelize = new Sequelize('admin_hrm', 'root', 'mypassword', {
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

module.exports = sequelize