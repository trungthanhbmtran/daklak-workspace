async function testFetch() {
  try {
    const loginRes = await fetch('http://localhost:8080/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'admin_td',
        password: 'Password123'
      })
    });
    const loginData = await loginRes.json();
    console.log(loginData);
  } catch (err) {
    console.error(err);
  }
}
testFetch();
