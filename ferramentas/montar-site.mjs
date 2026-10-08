// Monta a pasta dist/ com só o que vai pro ar. A Cloudflare publica essa pasta (veja o wrangler.jsonc).
// Rodar: npm run build
// Página ou pasta nova no site? Acrescente o nome na lista abaixo.
import { cpSync, rmSync, mkdirSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(raiz, 'dist');

const itens = [
  'index.html', 'gustavo.html', 'projetos.html', 'contato.html', '404.html',
  'styles.css', 'app.js', 'projects.js',
  'robots.txt', 'sitemap.xml', '_headers',
  'assets', 'burger', 'vet', 'conceitos',
];

rmSync(dist, { recursive: true, force: true });
mkdirSync(dist);
const faltando = [];
for (const item of itens) {
  const origem = path.join(raiz, item);
  if (!existsSync(origem)) { faltando.push(item); continue; }
  cpSync(origem, path.join(dist, item), { recursive: true });
}
if (faltando.length) {
  console.error('Faltou no projeto: ' + faltando.join(', '));
  process.exit(1);
}
console.log('dist/ montada com ' + itens.length + ' itens.');
