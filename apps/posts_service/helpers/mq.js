// src/lib/mq.js
const amqp = require('amqplib');

let channel = null;

const connectRabbitMQ = async () => {
  const connection = await amqp.connect('amqp://localhost');
  channel = await connection.createChannel();
  await channel.assertQueue('translation_queue', { durable: true });
};

const publishToQueue = async (queueName, data) => {
  if (!channel) await connectRabbitMQ();
  channel.sendToQueue(queueName, Buffer.from(JSON.stringify(data)), {
    persistent: true
  });
};

module.exports = { publishToQueue };