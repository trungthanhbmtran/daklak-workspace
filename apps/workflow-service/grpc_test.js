const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');

const PROTO_PATH = path.join(__dirname, '../../shared/protos/workflow/workflow.proto');
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: false,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
  includeDirs: [path.join(__dirname, '../../shared/protos')]
});
const workflowProto = grpc.loadPackageDefinition(packageDefinition).workflow;
const client = new workflowProto.WorkflowService('localhost:50060', grpc.credentials.createInsecure());

client.FindOneWorkflow({ id: 'cmum2tymt0000f4eqvr6wbala' }, (err, response) => {
  if (err) {
    console.error('Error:', err);
  } else {
    console.log(JSON.stringify(response, null, 2));
  }
});
