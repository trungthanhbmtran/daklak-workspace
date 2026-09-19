fetch('http://127.0.0.1:3000/api/v1/admin/organizations/31/scope').then(r => r.json()).then(j => console.log(JSON.stringify(j)))
