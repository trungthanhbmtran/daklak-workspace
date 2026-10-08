const http = require('http');

const req = http.request({
  hostname: 'localhost',
  port: 8080,
  path: '/api/v1/admin/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  }
}, (res) => {
  console.log('STATUS:', res.statusCode);
  console.log('HEADERS:', res.headers['set-cookie']);
  
  if (res.statusCode === 200) {
    let rawCookies = res.headers['set-cookie'] || [];
    let cookieStr = rawCookies.map(c => c.split(';')[0]).join('; ');
    
    console.log('Sending Cookie:', cookieStr);
    
    const menuReq = http.request({
      hostname: 'localhost',
      port: 8080,
      path: '/api/v1/admin/menus/sidebar?code=API_MANAGER_GROUP',
      method: 'GET',
      headers: {
        'Cookie': cookieStr
      }
    }, (menuRes) => {
      console.log('SIDEBAR STATUS:', menuRes.statusCode);
      let data = '';
      menuRes.on('data', chunk => data += chunk);
      menuRes.on('end', () => console.log('SIDEBAR DATA:', data));
    });
    
    menuReq.on('error', e => console.error('Menu error:', e));
    menuReq.end();
  }
});

req.on('error', (e) => {
  console.error(`problem with request: ${e.message}`);
});

req.write(JSON.stringify({ username: 'admin', password: 'Admin@123' }));
req.end();
