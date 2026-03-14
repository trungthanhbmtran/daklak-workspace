const grpc= require('@grpc/grpc-js');

const verifyToken = async (token) => {
  const secret = process.env.ACCESS_TOKEN_SECRET;
  try {
    // Remove 'Bearer ' prefix if present
    const actualToken = token.replace('Bearer ', '');
    return jwt.verify(actualToken, secret);
  } catch (error) {
    throw new Error('Invalid token');
  }
};


const authMiddleware = () => {
  return async (call, callback) => {
    try {
      console.log("call in auth",call)

      console.log("call meta",call.metadata)
      const token = call.metadata.get('authorization')[0];

      console.log("token",token)
      
      if (!token) {
        throw new Error('No token provided');
      }

      // Verify JWT token
      const decoded = await verifyToken(token);

      console.log("decoded",decoded)
      
      // Add user info to metadata
      call.metadata.add('userId', decoded.userId);
      call.metadata.add('userRole', decoded.role);

      return { authorized: true };
    } catch (error) {
      return {
        code: grpc.status.UNAUTHENTICATED,
        message: 'Invalid authentication credentials'
      };
    }
  };
};

module.exports ={
  authMiddleware
}