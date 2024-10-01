import http from 'http';

const port = process.env.PORT || 3000;

const requestListener = (
  req: http.IncomingMessage,
  res: http.ServerResponse,
) => {
  if (req.url === '/health' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('OK');
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  }
};

const server = http.createServer(requestListener);

server.listen(port, () => {
  console.log(`Health check server is running on port ${port}`);
});
