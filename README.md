# Vedoo — portfólio de Gustavo Azevedo

Site de cinco páginas, feito só com **HTML, CSS e JavaScript**. Não tem framework, build nem dependência em produção: dá pra abrir o `index.html` direto ou publicar a pasta em qualquer hospedagem estática (Netlify, Vercel, GitHub Pages).

## Rodar localmente

`npm start` e acesse http://127.0.0.1:4173. O `server.cjs` e o Playwright existem só para desenvolvimento.

## Páginas

| Página | Arquivo | Conteúdo |
|---|---|---|
| Início | `index.html` | a "mesa": projetos reais em janelas de navegador que dá pra arrastar, cursores "Gustavo" e "Você", processo e chamada pro contato |
| Portfólio | `portfolio.html` | o hero GUSTAVO com a abertura, o manifesto IMPACTO e a chamada pro contato |
| Sobre | `sobre.html` | sua apresentação, a história do nome, serviços e como você trabalha |
| Projetos | `projetos.html` | grade de cards montada a partir do `projects.js` |
| Contato | `contato.html` | conversa em formato de chat (uma pergunta por vez) que termina com a mensagem pronta pro WhatsApp; WhatsApp, e-mail e Instagram diretos |

Os projetos ficam publicados junto com o site, cada um na sua pasta:

- `burger/`: a hamburgueria (versão compilada do projeto React/Vite, com `base: /burger/`).
- `vet/`: a Cauda Leve Vet (cópia do site estático, com as imagens convertidas pra `.webp`).

Esses sites aparecem pelo preview (`assets/js/preview.js`): qualquer elemento com `data-preview="pasta/"` abre a janela. Os cards da página Projetos usam o mesmo preview.

Em hospedagens com "URL limpa" (Netlify, Vercel) o portfólio abre em `/portfolio`.

## A mesa (página inicial)

- É uma prancha de 1440 × 900 que escala inteira pra caber na tela (`assets/js/mesa.js`).
- Clique numa janela de projeto abre o **preview**: o site roda de verdade (com as animações de entrada dele) dentro de uma janela da Vedoo, com opção Computador/Celular e o botão "Quero um site assim". Links pra fora (WhatsApp, Instagram) ficam bloqueados no preview. A janela do portfólio abre a página normalmente. Arrastar só move a janela. Ao passar o mouse, o print rola devagar e mostra o site inteiro.
- Posição, tamanho e inclinação de cada janela ficam no `style` dela no `index.html` (`--x`, `--y`, `--w`, `--h`, `--r`).
- Os prints ficam em `assets/mesa/` (página inteira, 1000 px de largura). Quando um projeto mudar, é só tirar um print novo da página inteira e trocar o arquivo.
- O cursor "Gustavo" passeia pelas janelas; o "Você" fica perto da janela vazia "seu-negocio.com.br", que leva pro contato.
- No celular as janelas viram um carrossel que passa com o dedo.

## O que editar

| O quê | Onde |
|---|---|
| Projetos | `projects.js` (instruções no topo do arquivo). Com `status: 'no-ar'` e `link`, o card vira link |
| Prints dos projetos | `assets/projetos/` (paisagem 4:3, ~1200 × 900, de preferência `.webp`) |
| Sua foto na página Sobre | salve em `assets/gustavo.webp` e siga o comentário `TROCAR` no `sobre.html` |
| Textos da página Sobre | `sobre.html` (procure `TROCAR`) |
| WhatsApp e e-mail | `contato.html` (lista de contato direto e `window.VEDOO_CONTACT` no fim do arquivo) |
| Perguntas da conversa do contato | `assets/js/conversa.js` (lista `STEPS` no topo) |
| Cores e fontes | topo do `styles.css` (`:root`) |

## Estrutura

- `styles.css`: identidade (paleta Cobre × Petróleo + vermelho), layout de todas as páginas, abertura animada e versão mobile.
- `app.js`: fim da abertura, cabeçalho ao rolar, menu, grade de projetos, formulário de contato e revelação das seções.
- `projects.js`: a lista de projetos.
- `assets/foto-principal.webp`: foto do hero.
- `assets/impacto.webp`: foto da outra modelo em tons de vermelho (do teste de paleta "cereja"), usada parada dentro das letras de "IMPACTO" (com o contorno vermelho por trás).
- `assets/marca/`: logo, símbolo e avatar da Vedoo.
- `assets/fonts/`: Bebas Neue, Inter e Instrument Serif, locais. Licenças OFL.

O cabeçalho e o rodapé se repetem nas quatro páginas: se mudar um link, mude nos quatro arquivos.

## Hero

O hero é uma prancha de 1440 × 900 em SVG (foto + nome **GUSTAVO** no mesmo sistema de coordenadas) que escala inteira, então o texto fica sempre alinhado ao rosto e a cabeça nunca é cortada. Em telas largas e baixas a prancha fica um pouco mais estreita e as laterais recebem a própria foto desfocada. G, U, S e O são sólidos; T, A e V são só contorno vermelho de 1 px. Há duas composições: uma horizontal (desktop) e uma vertical (celular e tablet em pé), trocadas por `max-aspect-ratio: 4/5`.

## Abertura

Cortina com o símbolo da Vedoo se desenhando → cortina sobe → foto assenta → nome sobe → contorno do T, A e V é traçado → textos entram. Cerca de 3 segundos, toda vez que o portfólio carrega (na página inicial, só a cortina, e depois as janelas caem na mesa). Com "reduzir movimento" ativado no sistema, tudo aparece direto, sem animação.

## Movimento ao rolar (GSAP + Lenis)

- `assets/vendor/`: GSAP 3.15 + ScrollTrigger e Lenis 1.3, locais (sem CDN).
- `assets/js/motion.js`: rolagem suave (Lenis), cabeçalho que some ao descer e volta ao subir, títulos com palavras subindo, hero que sai de cena ao rolar (foto desce, nome sobe, textos somem), linhas do processo se desenhando e logo do rodapé subindo. Os botões não se mexem: só mudam de cor no hover.
- Se as bibliotecas não carregarem, ou com "reduzir movimento" ativado, o site continua funcionando só com o CSS.

## Observação

Os scripts em `.verification/` eram da versão anterior (hero de uma tela só, sem rolagem) e não valem mais para este layout.

A troca entre páginas usa um fade curto (View Transitions) nos navegadores que suportam.

## Tamanho no desktop (escala de 95%)

`assets/escala-desktop.css` é **gerado** a partir do `styles.css`: ele repete as regras com os px × 0,95, só acima de 761px (a página inicial não usa).
Sempre que mudar o `styles.css`, gere de novo, senão no desktop vale o valor antigo:

```sh
pip install tinycss2
python ferramentas/escala.py
```

Pra mudar a escala, troque `FATOR = 0.95` no início do script.
