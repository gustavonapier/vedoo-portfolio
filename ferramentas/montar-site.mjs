// Monta a pasta dist/ com só o que vai pro ar. A Cloudflare publica essa pasta (veja o wrangler.jsonc).
// Rodar: npm run build
// Página ou pasta nova no site? Acrescente o nome na lista abaixo.
import { cpSync, rmSync, mkdirSync, existsSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(raiz, 'dist');

const itens = [
  'index.html', 'sobre.html', 'projetos.html', 'contato.html', '404.html',
  'styles.css', 'app.js', 'projects.js',
  'robots.txt', 'sitemap.xml', '_headers', '_redirects',
  'assets', 'burger', 'vet', 'conceitos',
];

// Limpa o que tinha dentro da dist/ sem apagar a pasta em si: no Windows a pasta fica "presa"
// quando outro programa está com ela aberta (npm run preview, Live Server, o Explorer).
mkdirSync(dist, { recursive: true });
const presos = [];
for (const nome of readdirSync(dist)) {
  try { rmSync(path.join(dist, nome), { recursive: true, force: true, maxRetries: 5, retryDelay: 200 }); }
  catch { presos.push(nome); }
}

const faltando = [];
for (const item of itens) {
  const origem = path.join(raiz, item);
  if (!existsSync(origem)) { faltando.push(item); continue; }
  cpSync(origem, path.join(dist, item), { recursive: true, force: true });
}
if (faltando.length) {
  console.error('Faltou no projeto: ' + faltando.join(', '));
  process.exit(1);
}
if (presos.length) {
  console.warn('Aviso: não deu pra limpar ' + presos.join(', ') + ' (algum programa está usando a dist/). Os arquivos foram copiados por cima.');
}
console.log('dist/ montada com ' + itens.length + ' itens.');
