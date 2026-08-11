const { credentials } = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const grpc = require('@grpc/grpc-js');
const path = require('path');

const packageDefinition = protoLoader.loadSync(
  path.join(__dirname, 'shared/protos/chat/chat.proto'),
  { keepCase: false, longs: String, enums: String, defaults: true, oneofs: true }
);

const chatProto = grpc.loadPackageDefinition(packageDefinition).chat;
const client = new chatProto.ChatService('localhost:50061', grpc.credentials.createInsecure());

client.SendMessage({
  conversationId: 'test',
  senderId: 'test',
  content: 'test content'
}, (err, response) => {
  if (err) {
    console.error('Error:', err);
  } else {
    console.log('Response:', response);
  }
});
