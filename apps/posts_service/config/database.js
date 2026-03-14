const { Sequelize } = require('sequelize');
const { logger } = require('./logger');

const sequelize = new Sequelize(process.env.MYSQL_URL, {
  logging: (msg) => logger.debug(msg),
  dialectOptions: {
    timezone: 'UTC'
  }
});

module.exports = { sequelize };

