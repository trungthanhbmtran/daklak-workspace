const http = require('http');

const payload = JSON.stringify({
  baseUrl: "https://lifelgsp.daklak.gov.vn:8243/btc/ver_1",
  endpointPath: "/apiBTC_IOC/1.1/nsnn_thu",
  method: "POST",
  headers: {
    "Content-Type": "application/xml",
    "SystemCode": "000.00.00.VNPT"
  },
  authType: "OAUTH2",
  authConfig: {
    authUrl: "https://lifesso.daklak.gov.vn:9445/oauth2/token",
    clientId: "FzrjcMAfdzJOPs6WwJXCW_Fl9KUa",
    clientSecret: "_PO6wzmftVSL4Q2juiqzP44n6I74VgxCgHzfchAw0Yka",
    scope: "read:btc"
  },
  params: {
    "Page_Number": "0"
  },
  body: `<?xml version="1.0" encoding="UTF-8"?>\n<Data>\n    <Header>\n        <Receiver_Code>H15</Receiver_Code>\n    </Header>\n    <BODY>\n        <DATA>\n            <CHAN_DATE>20260724</CHAN_DATE>\n            <DT></DT>\n        </DATA>\n    </BODY>\n</Data>`
});

const req = http.request({
  hostname: 'localhost',
  port: 3000,
  path: '/admin/api/reports/preview',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(payload)
  }
}, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log("Status:", res.statusCode);
    console.log("Response:", data);
  });
});

req.on('error', (e) => {
  console.error(e);
});
req.write(payload);
req.end();
