const fs = require('fs');
const path = require('path');

// Cache để tránh load lại
const handlersCache = new Map();

/**
 * Load gRPC handlers và nhóm chúng theo Service Name.
 * Return structure:
 * {
 * 'PostService': { Create: [Function], Get: [Function] },
 * 'TagService': { Create: [Function], Delete: [Function] }
 * }
 */
function loadGrpcHandlers(dirPath) {
  const cacheKey = dirPath;
  
  if (handlersCache.has(cacheKey)) {
    return handlersCache.get(cacheKey);
  }

  // Object chứa handlers đã được phân nhóm: { [ServiceName]: { methods... } }
  const groupedHandlers = {}; 
  const errors = [];

  try {
    if (!fs.existsSync(dirPath)) {
      throw new Error(`Controllers directory not found: ${dirPath}`);
    }

    const files = fs.readdirSync(dirPath);
    
    files.forEach((file) => {
      // Chỉ load file .controller.js
      if (file.endsWith('.controller.js')) {
        try {
          const filePath = path.join(dirPath, file);
          const controllerInstance = require(filePath);

          // 1. Validate Controller Instance
          if (!controllerInstance || typeof controllerInstance !== 'object') {
            throw new Error(`Invalid export in ${file}: must export a class instance (new Controller())`);
          }

          // 2. Validate Service Name (BẮT BUỘC ĐỂ TRÁNH CONFLICT)
          // Controller phải có property: this.serviceName = 'PostService'
          const serviceName = controllerInstance.serviceName;
          if (!serviceName) {
            console.warn(`⚠️  Skipping ${file}: Controller instance missing 'serviceName' property.`);
            return;
          }

          if (groupedHandlers[serviceName]) {
            throw new Error(`Duplicate serviceName '${serviceName}' found in ${file}. It was already loaded.`);
          }

          // 3. Load methods
          const methods = loadGrpcMethods(controllerInstance, file);
          
          if (Object.keys(methods).length === 0) {
            console.warn(`⚠️  No public methods found in ${file}`);
          } else {
            groupedHandlers[serviceName] = methods;
            console.log(`✓ Loaded ${serviceName} from ${file} (${Object.keys(methods).length} methods)`);
          }

        } catch (error) {
          errors.push(`Failed to load ${file}: ${error.message}`);
        }
      }
    });

    if (errors.length > 0) {
      console.error('❌ Handler loading errors:', errors);
      // Tùy chọn: throw error nếu muốn dừng server khi có lỗi load file
    }

    handlersCache.set(cacheKey, groupedHandlers);
    return groupedHandlers;

  } catch (error) {
    throw new Error(`Failed to load handlers from ${dirPath}: ${error.message}`);
  }
}

/**
 * Lấy các public methods và bind context
 */
function loadGrpcMethods(controllerInstance, fileName) {
  const prototype = Object.getPrototypeOf(controllerInstance);
  if (!prototype) return {};

  const methodNames = Object.getOwnPropertyNames(prototype);

  return methodNames
    .filter(fn => {
      const method = controllerInstance[fn];
      return typeof method === 'function' && 
             fn !== 'constructor' && 
             !fn.startsWith('_'); // Bỏ qua private methods
    })
    .reduce((methods, methodName) => {
      // Bind `this` để dùng được this.service, this.repository trong controller
      const boundMethod = controllerInstance[methodName].bind(controllerInstance);
      methods[methodName] = boundMethod;
      return methods;
    }, {});
}

module.exports = { loadGrpcHandlers };