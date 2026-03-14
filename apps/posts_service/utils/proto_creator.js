const fs = require('fs');

function createProtoContent(messageName, messageFields, serviceName, serviceMethods) {
    // Validate input (optional, but recommended for robustness)
    if (!messageName || !messageFields || !serviceName || !serviceMethods) {
      throw new Error('Missing required arguments: messageName, messageFields, serviceName, serviceMethods');
    }
  
    const messageLines = messageFields.map(field => `  ${field.type} ${field.name} = ${field.number};`);
    const serviceMethodLines = serviceMethods.map(method => `  rpc ${method.name} (${method.requestType}) returns (${method.responseType}) {}`);
  
    return `
  syntax = "proto3";
  
  package mypackage;
  
  message ${messageName} {
  ${messageLines.join('\n')}
  }
  
  service ${serviceName} {
  ${serviceMethodLines.join('\n')}
  }
  `;
  }

  fs.writeFile('my_service.proto', protoContent, (err) => {
    if (err) {
      console.error('Error creating proto file:', err);
    } else {
      console.log(`Proto file created successfully: my_service.proto`);
    }
  });

  module.exports = {
    createProtoContent,
  };