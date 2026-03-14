const { status } = require('@grpc/grpc-js');

/**
 * Base Controller class that provides common functionality for all gRPC controllers
 * Includes standardized error handling, logging, and response formatting
 */
class BaseController {
  constructor() {
    this.serviceName = this.constructor.name;
  }

  /**
   * Wrapper for gRPC methods to provide consistent error handling
   * @param {Function} serviceMethod - The service method to call
   * @param {Object} call - gRPC call object
   * @param {Function} callback - gRPC callback function
   * @param {string} methodName - Name of the method for logging
   */
  async handleGrpcCall(serviceMethod, call, callback, methodName) {
    const startTime = Date.now();
    const requestId = this.generateRequestId();
    
    try {
      // Log incoming request
      this.logRequest(methodName, call.request, requestId);
      
      // Validate request if validation method exists
      if (this.validateRequest && typeof this.validateRequest === 'function') {
        await this.validateRequest(call.request, methodName);
      }
      
      // Execute service method
      const result = await serviceMethod(call.request);
      
      // Log successful response
      this.logResponse(methodName, result, requestId, Date.now() - startTime);
      
      // Send response
      callback(null, result);
      
    } catch (error) {
      // Log error
      this.logError(methodName, error, requestId, Date.now() - startTime);
      
      // Convert error to gRPC error
      const grpcError = this.convertToGrpcError(error);
      callback(grpcError);
    }
  }

  /**
   * Convert application errors to gRPC errors
   * @param {Error} error - The error to convert
   * @returns {Object} gRPC error object
   */
  convertToGrpcError(error) {
    // Handle different types of errors
    if (error.name === 'ValidationError') {
      return {
        code: status.INVALID_ARGUMENT,
        message: error.message,
        details: error.details || []
      };
    }
    
    if (error.name === 'NotFoundError') {
      return {
        code: status.NOT_FOUND,
        message: error.message
      };
    }
    
    if (error.name === 'UnauthorizedError') {
      return {
        code: status.UNAUTHENTICATED,
        message: error.message
      };
    }
    
    if (error.name === 'ForbiddenError') {
      return {
        code: status.PERMISSION_DENIED,
        message: error.message
      };
    }
    
    if (error.name === 'ConflictError') {
      return {
        code: status.ALREADY_EXISTS,
        message: error.message
      };
    }
    
    // Default to internal error
    return {
      code: status.INTERNAL,
      message: process.env.NODE_ENV === 'production' 
        ? 'Internal server error' 
        : error.message
    };
  }

  /**
   * Generate unique request ID for tracing
   * @returns {string} Request ID
   */
  generateRequestId() {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Log incoming request
   * @param {string} methodName - Name of the method
   * @param {Object} request - Request data
   * @param {string} requestId - Request ID for tracing
   */
  logRequest(methodName, request, requestId) {
    console.log(`📥 [${requestId}] ${this.serviceName}.${methodName}`, {
      timestamp: new Date().toISOString(),
      method: methodName,
      requestId,
      data: this.sanitizeLogData(request)
    });
  }

  /**
   * Log successful response
   * @param {string} methodName - Name of the method
   * @param {Object} result - Response data
   * @param {string} requestId - Request ID for tracing
   * @param {number} duration - Request duration in milliseconds
   */
  logResponse(methodName, result, requestId, duration) {
    console.log(`📤 [${requestId}] ${this.serviceName}.${methodName} ✅`, {
      timestamp: new Date().toISOString(),
      method: methodName,
      requestId,
      duration: `${duration}ms`,
      data: this.sanitizeLogData(result)
    });
  }

  /**
   * Log error
   * @param {string} methodName - Name of the method
   * @param {Error} error - Error object
   * @param {string} requestId - Request ID for tracing
   * @param {number} duration - Request duration in milliseconds
   */
  logError(methodName, error, requestId, duration) {
    console.error(`❌ [${requestId}] ${this.serviceName}.${methodName}`, {
      timestamp: new Date().toISOString(),
      method: methodName,
      requestId,
      duration: `${duration}ms`,
      error: {
        name: error.name,
        message: error.message,
        stack: process.env.NODE_ENV !== 'production' ? error.stack : undefined
      }
    });
  }

  /**
   * Sanitize data for logging (remove sensitive information)
   * @param {Object} data - Data to sanitize
   * @returns {Object} Sanitized data
   */
  sanitizeLogData(data) {
    if (!data || typeof data !== 'object') {
      return data;
    }

    const sensitiveFields = ['password', 'token', 'secret', 'key', 'authorization'];
    const sanitized = { ...data };

    sensitiveFields.forEach(field => {
      if (sanitized[field]) {
        sanitized[field] = '[REDACTED]';
      }
    });

    return sanitized;
  }

  /**
   * Create a standardized success response
   * @param {any} data - Response data
   * @param {string} message - Success message
   * @returns {Object} Standardized response
   */
  createSuccessResponse(data, message = 'Success') {
    return {
      success: true,
      message,
      data,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Create a standardized error response
   * @param {string} message - Error message
   * @param {string} code - Error code
   * @returns {Object} Standardized error response
   */
  createErrorResponse(message, code = 'ERROR') {
    return {
      success: false,
      message,
      code,
      timestamp: new Date().toISOString()
    };
  }
}

module.exports = BaseController; 