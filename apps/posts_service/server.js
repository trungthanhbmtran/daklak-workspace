const { Server, ServerCredentials } = require('@grpc/grpc-js');
const { ReflectionService } = require('@grpc/reflection');
const { HealthImplementation } = require('grpc-health-check');
const path = require('path');
const util = require('util'); // Dùng để promisify
const _ = require('lodash');  // (Optional) Dùng để merge object nếu cần

const fs = require('fs');
const config = require('./config');
const { loadProto } = require('./utils/grpc.loader');
const { loadGrpcHandlers } = require('./utils/loadHandlers');
const rabbitClient = require('./services/rabbitmq');
const initWorkers = require('./worker');
const db = require('./models');

function getSharedDir() {
  if (process.env.SHARED_DIR) {
    return path.isAbsolute(process.env.SHARED_DIR) ? process.env.SHARED_DIR : path.resolve(process.cwd(), process.env.SHARED_DIR);
  }
  const a = path.join(__dirname, '..', 'shared');
  const b = path.join(__dirname, '..', '..', 'shared');
  if (fs.existsSync(path.join(a, 'grpc-proto-loader.js'))) return a;
  if (fs.existsSync(path.join(b, 'grpc-proto-loader.js'))) return b;
  return b;
}
const { getProtoBaseDir } = require(path.join(getSharedDir(), 'grpc-proto-loader.js'));

const PROTO_DIR = getProtoBaseDir(__dirname, 'proto');
const HANDLERS_DIR = path.resolve(__dirname, 'controllers');
const useRootProtos = !!process.env.PROTO_PATH;
const postsSubdir = useRootProtos ? 'posts' : '';

class GrpcServer {
  constructor() {
    this.server = new Server();
    this.services = [];
    this.port = null;

    this.serviceConfigs = [
      { path: path.join(PROTO_DIR, postsSubdir, 'post.proto'), name: 'PostService' },
      { path: path.join(PROTO_DIR, postsSubdir, 'category.proto'), name: 'CategoryService' },
      { path: path.join(PROTO_DIR, postsSubdir, 'tag.proto'), name: 'TagService' },
      { path: path.join(PROTO_DIR, postsSubdir, 'banner.proto'), name: 'BannerService' },
      { path: path.join(PROTO_DIR, postsSubdir, 'translation.proto'), name: 'TranslationService' }
    ];
  }

  /**
   * Load và Merge tất cả Proto Definitions
   */
  async loadServices() {
    try {
      // Load song song tất cả proto
      const loaded = await Promise.all(
        this.serviceConfigs.map(({ path, name }) => {
          const { service, packageDefinition } = loadProto(path, name);
          return { service, packageDefinition, name };
        })
      );

      this.services = loaded;

      // TỐI ƯU: Merge tất cả packageDefinition lại để Reflection hoạt động đủ cho mọi service
      // Nếu các proto dùng chung package thì không sao, nhưng nếu khác package thì cần bước này
      const mergedDefinition = loaded.reduce((acc, curr) => {
        return { ...acc, ...curr.packageDefinition };
      }, {});

      return mergedDefinition;
    } catch (error) {
      throw new Error(`Failed to load services: ${error.message}`);
    }
  }

  setupReflection(packageDefinition) {
    // ReflectionService cần full package definition
    const reflection = new ReflectionService(packageDefinition);
    reflection.addToServer(this.server);
  }

  setupHealthCheck() {
    const healthMap = {
      '': 'SERVING',
      ...this.serviceConfigs.reduce((acc, curr) => {
        // Giả sử package name là tên file thường (post.PostService). 
        // Cần chính xác namespace từ proto file.
        // Ở đây tạm dùng convention tên service.
        acc[curr.name] = 'SERVING'; 
        return acc;
      }, {})
    };
    
    const healthImpl = new HealthImplementation(healthMap);
    healthImpl.addToServer(this.server);
  }

 async setupHandlers() {
    // groupedHandlers có dạng: { PostService: { ... }, TagService: { ... } }
    const groupedHandlers = await loadGrpcHandlers(HANDLERS_DIR);
    
    this.services.forEach(({ service, name }) => {
      // Lấy đúng handler cho service này dựa vào tên
      const serviceHandler = groupedHandlers[name];

      if (serviceHandler) {
        this.server.addService(service.service, serviceHandler);
        // console.log(`✓ Bound implementation for: ${name}`);
      } else {
        console.warn(`⚠️  Warning: No implementation found for service: ${name}. Client calls will fail.`);
      }
    });
    
    console.log(`✓ All gRPC services bound.`);
  }

  /**
   * Khởi tạo các kết nối hạ tầng (Rabbit, DB, Redis...)
   */
 async initInfrastructure() {
    console.log('⏳ Initializing infrastructure...');
    
    try {
      // 1. Kết nối Database (Gọi hàm chúng ta vừa viết)
      await db.connectDB();

      // 2. Kết nối RabbitMQ
      await rabbitClient.connect();

      // 3. Khởi động Workers (Chỉ chạy khi DB và Rabbit đã sẵn sàng)
      await initWorkers();

      console.log('✅ Infrastructure initialized successfully');
    } catch (error) {
      console.error('❌ Infrastructure initialization failed:', error);
      throw error; // Để hàm start() bắt được và dừng server
    }
  }

  async start() {
    try {
      // 1. Setup Infra
      await this.initInfrastructure();

      // 2. Load gRPC Resources
      const packageDefinition = await this.loadServices();
      this.setupReflection(packageDefinition);
      this.setupHealthCheck();
      await this.setupHandlers();

      // 3. Bind Port (TỐI ƯU: Dùng util.promisify thay vì callback hell)
      const bindAsync = util.promisify(this.server.bindAsync).bind(this.server);
      const address = `${config.server.host}:${config.server.port}`;
      
      this.port = await bindAsync(address, ServerCredentials.createInsecure());
      
      console.log(`🚀 gRPC server running at ${address} (Port: ${this.port})`);
      return this.port;

    } catch (error) {
      console.error('❌ Server startup failed:', error);
      process.exit(1); // Exit luôn nếu không start được
    }
  }

  async shutdown() {
    console.log('🛑 Stopping gRPC Server...');
    return new Promise((resolve) => {
      this.server.tryShutdown(async () => {
        console.log('✓ gRPC socket closed');
        // Tắt các kết nối khác nếu cần
        // await rabbitClient.close();
        // await sequelize.close();
        resolve();
      });
    });
  }
}

// --- MAIN EXECUTION ---

const server = new GrpcServer();

// Xử lý Graceful Shutdown tập trung
const gracefulShutdown = async (signal) => {
  console.log(`\nReceived ${signal}. Shutting down gracefully...`);
  await server.shutdown();
  process.exit(0);
};

['SIGINT', 'SIGTERM'].forEach(signal => process.on(signal, () => gracefulShutdown(signal)));

// Self-invoking async function (IIFE) pattern
if (require.main === module) {
  (async () => {
    await server.start();
  })();
}

module.exports = GrpcServer;