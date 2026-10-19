'use strict';

const http = require('http');

/** Serves each assembled interactive at /<name>. Nothing else is served. */
function startServer(pages) {
  const server = http.createServer((req, res) => {
    const name = decodeURIComponent((req.url || '').replace(/^\//, '').split('?')[0]);
    const body = pages.get(name);
    if (!body) {
      res.writeHead(404, { 'content-type': 'text/plain' });
      res.end('no such interactive: ' + name);
      return;
    }
    res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
    res.end(body);
  });
  return new Promise((resolve) => {
    server.listen(0, '127.0.0.1', () => {
      const { port } = server.address();
      resolve({ server, origin: 'http://127.0.0.1:' + port });
    });
  });
}

module.exports = { startServer };
