const http = require('http');

const options = {
  hostname: 'localhost',
  port: 8080,
  path: '/api/hrm/tasks?planId=3',
  method: 'GET',
};

const req = http.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    console.log(JSON.stringify(JSON.parse(data), null, 2));
  });
});

req.on('error', (error) => {
  console.error(error);
});

req.end();
