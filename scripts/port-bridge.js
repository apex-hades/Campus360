const http = require('http');

const PORT = 3001;
const TARGET_PORT = 3000;

const server = http.createServer((req, res) => {
  // If browser HTML navigation, redirect to 3000 so the user is on the canonical dev port
  if (req.headers.accept && req.headers.accept.includes('text/html')) {
    const target = `http://localhost:${TARGET_PORT}${req.url}`;
    res.writeHead(302, {
      'Location': target,
      'Content-Type': 'text/html'
    });
    res.end(`<!DOCTYPE html><html><head><meta http-equiv="refresh" content="0; url=${target}"></head><body>Redirecting to <a href="${target}">${target}</a></body></html>`);
    return;
  }

  // Otherwise proxy the request
  const options = {
    hostname: '127.0.0.1',
    port: TARGET_PORT,
    path: req.url,
    method: req.method,
    headers: {
      ...req.headers,
      host: `localhost:${TARGET_PORT}`
    }
  };

  const proxyReq = http.request(options, (proxyRes) => {
    res.writeHead(proxyRes.statusCode, proxyRes.headers);
    proxyRes.pipe(res, { end: true });
  });

  proxyReq.on('error', (err) => {
    res.writeHead(502, { 'Content-Type': 'text/plain' });
    res.end('Campus360 Dev Gateway: Waiting for Next.js on port 3000...');
  });

  req.pipe(proxyReq, { end: true });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Port bridge listening on http://localhost:${PORT} -> forwarding to http://localhost:${TARGET_PORT}`);
});
