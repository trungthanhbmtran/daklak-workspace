const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const packageDefinition = protoLoader.loadSync('/app/protos/reports/report.proto', { includeDirs: ['/app/protos'] });
const reportProto = grpc.loadPackageDefinition(packageDefinition).reports.ReportService;
const client = new reportProto('daklak-workspace-report-service-1:50062', grpc.credentials.createInsecure());
client.GetReportCatalog({ payload: '{}', userData: '{}' }, (err, response) => {
  if (err) console.error(err);
  else console.log(response);
});
