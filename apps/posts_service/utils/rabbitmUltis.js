const createMessage = (data, type) => ({
    message: data,
    type,
    dateTime: new Date().toISOString(),
    messageId: generateMessageId()
  });
  
  const generateMessageId = () => {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  };
  
  module.exports = {
    createMessage,
    generateMessageId
  };