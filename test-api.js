const axios = require('axios');

async function testFetch() {
  try {
    const loginRes = await axios.post('http://localhost:8080/api/v1/auth/login', {
      username: 'admin_td',
      password: 'Password123'
    });
    const token = loginRes.data.data.accessToken;

    const res = await axios.get('http://localhost:8080/api/v1/admin/workflow/cmuu017910000uceqxrsxrn96', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log(JSON.stringify(res.data, null, 2));
  } catch (err) {
    console.error(err.response?.data || err.message);
  }
}
testFetch();
