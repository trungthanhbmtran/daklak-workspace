// workers/index.js
const translationWorker = require('./translation.worker');
// const emailWorker = require('./email.worker');

const initWorkers = async () => {
  // Khởi chạy tất cả các worker
  await translationWorker.start();
  // await emailWorker.start();
  
  console.log('🚀 All workers initialized');
};

module.exports = initWorkers;