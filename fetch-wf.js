const http = require('http');

http.get('http://localhost:3000/api/workflow/cmum2tymt0000f4eqvr6wbala', (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    console.log("Status:", res.statusCode);
    const parsed = JSON.parse(data);
    if (parsed.data && parsed.data.definition) {
       console.log("Definition keys:", Object.keys(parsed.data.definition));
       if (parsed.data.definition.nodes) {
         console.log("First node:", JSON.stringify(parsed.data.definition.nodes[0], null, 2));
       } else {
         console.log("No nodes array");
       }
    } else {
       console.log("Response:", JSON.stringify(parsed).substring(0, 500));
    }
  });
}).on('error', (err) => {
  console.log("Error: " + err.message);
});
