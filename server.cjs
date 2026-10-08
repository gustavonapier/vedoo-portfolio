const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const root = __dirname;
const types = {'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.png':'image/png','.pdf':'application/pdf','.woff2':'font/woff2','.woff':'font/woff','.ico':'image/x-icon','.svg':'image/svg+xml','.webp':'image/webp','.jpg':'image/jpeg','.mp4':'video/mp4','.webm':'video/webm','.json':'application/json','.txt':'text/plain; charset=utf-8','.xml':'application/xml; charset=utf-8'};
const pages = ['index.html', 'portfolio.html', 'sobre.html', 'projetos.html', 'contato.html', 'gustavo.html', 'styles.css', 'app.js', 'projects.js', 'robots.txt', 'sitemap.xml', '404.html'];
const folders = ['assets/', 'burger/', 'vet/', 'conceitos/'];
const server = http.createServer((req, res) => {
  let pathname;
  try { pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname); }
  catch { res.writeHead(400); return res.end('Bad request'); }
  let relative = pathname === '/' ? 'index.html' : pathname.slice(1);
  if (relative.endsWith('/')) relative += 'index.html';
  if (pages.includes(`${relative}.html`)) relative += '.html'; // URL limpa: /gustavo, /portfolio...
  if (folders.some(f => relative === f.slice(0, -1))) { res.writeHead(301, { Location: `/${relative}/` }); return res.end(); }
  const allowed = pages.includes(relative) || folders.some(f => relative.startsWith(f));
  const target = path.resolve(root, relative);
  // endereço que não existe: mostra a 404.html (as hospedagens fazem o mesmo sozinhas)
  const notFound = () => fs.readFile(path.join(root, '404.html'), (e, page) => { res.writeHead(404, {'Content-Type':'text/html; charset=utf-8'}); res.end(e ? 'Not found' : page); });
  if (!allowed || !target.startsWith(root + path.sep)) return notFound();
  fs.readFile(target, (error, body) => {
    if (error) return notFound();
    res.writeHead(200, {'Content-Type':types[path.extname(target)] || 'application/octet-stream','Cache-Control':'no-cache'});
    res.end(body);
  });
});
server.listen(4173, '127.0.0.1', () => console.log('Portfolio: http://127.0.0.1:4173'));
