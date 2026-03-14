const path = require('path');
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

// Cache để tránh load lại proto files
const protoCache = new Map();

/**
 * Load and return a gRPC service definition and package definition.
 * Handles both proto files with or without a package declaration.
 * Includes caching for better performance.
 *
 * @param {string} protoPath - Relative or absolute path to the .proto file.
 * @param {string} serviceName - Name of the gRPC service (e.g., "PostService").
 * @returns {{ service: object, packageDefinition: object }} - The loaded service and packageDefinition.
 */
function loadProto(protoPath, serviceName) {
  const absolutePath = path.resolve(protoPath);
  const cacheKey = `${absolutePath}:${serviceName}`;

  // Check cache first
  if (protoCache.has(cacheKey)) {
    return protoCache.get(cacheKey);
  }

  try {
    // Validate file exists
    const fs = require('fs');
    if (!fs.existsSync(absolutePath)) {
      throw new Error(`Proto file not found: ${absolutePath}`);
    }

    const protoDir = path.dirname(absolutePath);
    const protoRoot = path.join(protoDir, '..');
    const packageDefinition = protoLoader.loadSync(absolutePath, {
      keepCase: true,
      longs: String,
      enums: String,
      defaults: true,
      oneofs: true,
      includeDirs: [protoDir, protoRoot], // posts/ cho tag.proto, category.proto; root cho common.proto
    });

    const grpcObject = grpc.loadPackageDefinition(packageDefinition);

    // Tìm service trong tất cả các packages
    for (const pkgKey of Object.keys(grpcObject)) {
      const pkg = grpcObject[pkgKey];

      if (pkg && typeof pkg === 'object' && pkg[serviceName]) {
        const result = {
          service: pkg[serviceName],
          packageDefinition,
        };
        
        // Cache the result
        protoCache.set(cacheKey, result);
        return result;
      }
    }

    // Nếu không có package (service nằm trực tiếp)
    if (grpcObject[serviceName]) {
      const result = {
        service: grpcObject[serviceName],
        packageDefinition,
      };
      
      // Cache the result
      protoCache.set(cacheKey, result);
      return result;
    }

    throw new Error(`Service "${serviceName}" not found in ${protoPath}`);
  } catch (error) {
    throw new Error(`Failed to load proto file ${protoPath}: ${error.message}`);
  }
}

/**
 * Clear the proto cache (useful for testing or hot reloading)
 */
function clearProtoCache() {
  protoCache.clear();
}

/**
 * Get cache statistics
 */
function getCacheStats() {
  return {
    size: protoCache.size,
    keys: Array.from(protoCache.keys())
  };
}

module.exports = { 
  loadProto, 
  clearProtoCache, 
  getCacheStats 
};
