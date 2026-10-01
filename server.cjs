const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const root = __dirname;
const types = {'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.png':'image/png','.woff2':'font/woff2','.woff':'font/woff','.ico':'image/x-icon','.svg':'image/svg+xml','.webp':'image/webp','.jpg':'image/jpeg','.json':'application/json','.txt':'text/plain; charset=utf-8'};
const pages = ['index.html', 'portfolio.html', 'sobre.html', 'projetos.html', 'contato.html', 'styles.css', 'app.js', 'projects.js'];
const folders = ['assets/', 'burger/', 'vet/'];
const server = http.createServer((req, res) => {
  let pathname;
  try { pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname); }
  catch { res.writeHead(400); return res.end('Bad request'); }
  let relative = pathname === '/' ? 'index.html' : pathname.slice(1);
  if (relative.endsWith('/')) relative += 'index.html';
  if (folders.some(f => relative === f.slice(0, -1))) { res.writeHead(301, { Location: `/${relative}/` }); return res.end(); }
  const allowed = pages.includes(relative) || folders.some(f => relative.startsWith(f));
  const target = path.resolve(root, relative);
  if (!allowed || !target.startsWith(root + path.sep)) { res.writeHead(404); return res.end('Not found'); }
  fs.readFile(target, (error, body) => {
    if (error) { res.writeHead(404); return res.end('Not found'); }
    res.writeHead(200, {'Content-Type':types[path.extname(target)] || 'application/octet-stream','Cache-Control':'no-cache'});
    res.end(body);
  });
});
server.listen(4173, '127.0.0.1', () => console.log('Portfolio: http://127.0.0.1:4173'));
