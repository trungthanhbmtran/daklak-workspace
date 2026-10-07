const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');

const PROTO_DIR = path.resolve(__dirname, '../../shared/protos');
const PROTO_PATH = path.resolve(PROTO_DIR, 'workflow/workflow.proto');
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
  includeDirs: [PROTO_DIR]
});

const workflowProto = grpc.loadPackageDefinition(packageDefinition).workflow;
const client = new workflowProto.WorkflowService('localhost:50060', grpc.credentials.createInsecure());

client.FindOneWorkflow({ id: 'cmuu017910000uceqxrsxrn96' }, (err, response) => {
  if (err) {
    console.error(err);
  } else {
    console.log(JSON.stringify(response, null, 2));
  }
});
