const https = require('https');

async function testApi() {
  const agent = new https.Agent({ rejectUnauthorized: false });

  const tokenParams = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: "FzrjcMAfdzJOPs6WwJXCW_Fl9KUa",
    client_secret: "_PO6wzmftVSL4Q2juiqzP44n6I74VgxCgHzfchAw0Yka",
    scope: "read:btc"
  }).toString();

  const tokenReqOptions = {
    hostname: 'lifesso.daklak.gov.vn',
    port: 9445,
    path: '/oauth2/token',
    method: 'POST',
    agent,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': Buffer.byteLength(tokenParams)
    }
  };

  const getToken = () => new Promise((resolve, reject) => {
    const req = https.request(tokenReqOptions, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({status: res.statusCode, data: JSON.parse(data)}));
    });
    req.on('error', reject);
    req.write(tokenParams);
    req.end();
  });

  let tokenData;
  try {
    const res = await getToken();
    tokenData = res.data;
  } catch(e) {
    return;
  }

  const token = tokenData.access_token;
  const bodyData = `<?xml version="1.0" encoding="UTF-8"?>\n<Data>\n    <Header>\n        <Receiver_Code>H15</Receiver_Code>\n    </Header>\n    <BODY>\n        <DATA>\n            <CHAN_DATE>20260724</CHAN_DATE>\n            <DT></DT>\n        </DATA>\n    </BODY>\n</Data>`;

  const apiReqOptions = {
    hostname: 'lifelgsp.daklak.gov.vn',
    port: 8243,
    path: '/btc/ver_1/apiBTC_IOC/1.1/nsnn_thu?Page_Number=0',
    method: 'POST',
    agent,
    headers: {
      'Content-Type': 'application/xml',
      'Accept': 'application/xml',
      'SystemCode': '000.00.00.VNPT',
      'Authorization': `Bearer ${token}`,
      'Content-Length': Buffer.byteLength(bodyData)
    }
  };

  const callApi = () => new Promise((resolve, reject) => {
    const req = https.request(apiReqOptions, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({status: res.statusCode, data}));
    });
    req.on('error', reject);
    req.write(bodyData);
    req.end();
  });

  try {
    const res = await callApi();
    console.log("API Data with Accept XML:", res.data);
  } catch (e) {
    console.error("API request failed:", e);
  }
}

testApi();
