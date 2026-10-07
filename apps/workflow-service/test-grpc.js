const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');

const PROTO_PATH = path.resolve('../../shared/protos/workflow/workflow.proto');
const packageDefinition = protoLoader.loadSync(PROTO_PATH, { keepCase: true, longs: String, enums: String, defaults: true, oneofs: true, includeDirs: [path.resolve('../../shared/protos')] });
const workflowProto = grpc.loadPackageDefinition(packageDefinition).workflow;

const client = new workflowProto.WorkflowService('localhost:50060', grpc.credentials.createInsecure());

client.FindOneWorkflow({ id: 'cmuu017910000uceqxrsxrn96', organizationId: '' }, (err, response) => {
  if (err) console.error(err);
  else console.log(JSON.stringify(response, null, 2));
});
