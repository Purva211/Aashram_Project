const http = require('http');

const data = JSON.stringify({ email: 'test@example.com' });

const req = http.request({
  hostname: 'localhost',
  port: 5000,
  path: '/api/auth/resend-otp',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
}, res => {
  let body = '';
  res.on('data', chunk => body += chunk.toString());
  res.on('end', () => console.log('Status:', res.statusCode, 'Body:', body));
});

req.on('error', error => console.error(error));
req.write(data);
req.end();
