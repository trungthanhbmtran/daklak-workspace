/**
 * Script test gRPC User Service (CreateUser, FindOne).
 * Chạy: node test-grpc-client.js
 * Cần user-service đang chạy: npm run start:dev (hoặc start)
 */

const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');

const PROTO_PATH = path.join(__dirname, 'proto', 'user.proto');
const TARGET = process.env.GRPC_URL || 'localhost:50051';

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});
const proto = grpc.loadPackageDefinition(packageDefinition).user;
const client = new proto.UserService(TARGET, grpc.credentials.createInsecure());

function createUser(email) {
  return new Promise((resolve, reject) => {
    client.CreateUser({ email }, (err, response) => {
      if (err) return reject(err);
      resolve(response);
    });
  });
}

function findOne(id) {
  return new Promise((resolve, reject) => {
    client.FindOne({ id }, (err, response) => {
      if (err) return reject(err);
      resolve(response);
    });
  });
}

async function run() {
  console.log('=== Test User Service gRPC ===');
  console.log('Target:', TARGET);
  console.log('');

  try {
    // 1. CreateUser
    const email = `test-${Date.now()}@example.com`;
    console.log('1. CreateUser:', email);
    const created = await createUser(email);
    console.log('   -> id:', created.id, 'email:', created.email);
    console.log('   OK');
    console.log('');

    // 2. FindOne
    const id = created.id;
    console.log('2. FindOne id:', id);
    const user = await findOne(id);
    console.log('   -> id:', user.id, 'email:', user.email);
    console.log('   OK');
    console.log('');

    // 3. FindOne không tồn tại
    console.log('3. FindOne id: 999999 (không tồn tại)');
    try {
      await findOne(999999);
      console.log('   FAIL: Mong đợi lỗi NOT_FOUND');
    } catch (e) {
      console.log('   -> Lỗi như mong đợi:', e.message || e.code);
      console.log('   OK');
    }
    console.log('');

    console.log('=== Tất cả test gRPC đã chạy xong ===');
  } catch (err) {
    console.error('Lỗi:', err.message || err);
    if (err.code) console.error('Code:', err.code);
    process.exit(1);
  }
}

run();
