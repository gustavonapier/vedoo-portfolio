# Manutenção: como o site funciona por dentro

Notas pra quem for mexer no código. A apresentação do projeto está no [README](../README.md).

## Rodar localmente

`npm start` e acesse http://127.0.0.1:4173. O `server.cjs` e o Playwright existem só para desenvolvimento.

Em hospedagens com "URL limpa" (Netlify, Vercel) as páginas abrem em `/projetos`, `/gustavo` e `/contato` (o `server.cjs` local também aceita).

## Páginas

| Página | Arquivo | Conteúdo |
|---|---|---|
| Início | `index.html` | página clara "Dev & Web Design": capa com o personagem 3D, três projetos em destaque, serviços, faixa de tecnologias e contato |
| Projetos | `projetos.html` | a "mesa": todos os projetos em janelas de navegador que dá pra arrastar (quatro por vez, com setas pra trocar), cursores "Gustavo" e "Você", processo e chamada pro contato |
| Sobre | `gustavo.html` | abre no link "Sobre" do menu e em `/gustavo` (é o link da bio): sobre, currículo e contato |
| Contato | `contato.html` | conversa em formato de chat (uma pergunta por vez) que termina com a mensagem pronta pro WhatsApp; WhatsApp, e-mail e Instagram diretos. Fundo preto e quadro no estilo novo (`assets/contato-tema.css`) |

`404.html` é a página de erro (endereço que não existe): escura, sem rodapé, com um quadro de conversa sobre um 404 gigante em contorno e tipografia própria (só Inter). O quadro pergunta como a pessoa chegou ali; cada resposta tem uma réplica e um destino, e o botão redondo recomeça (lista `REPLIES` em `assets/js/404.js`; estilo em `assets/404.css`). Os caminhos nela começam com `/` porque ela pode abrir em qualquer endereço. Netlify, Vercel, Cloudflare Pages e GitHub Pages usam esse arquivo sozinhos.

Os projetos ficam publicados junto com o site, cada um na sua pasta:

- `burger/`: a hamburgueria (versão compilada do projeto React/Vite, com `base: /burger/`).
- `vet/`: a Cauda Leve Vet (cópia do site estático, com as imagens convertidas pra `.webp`).
- `conceitos/`: outras páginas (Flux, Aurea, Synapse OS…), uma pasta por página. Entram no `projects.js` como qualquer projeto; os prints ficam em `assets/projetos/conceito-<pasta>.webp`.

Esses sites aparecem pelo preview (`assets/js/preview.js`): qualquer elemento com `data-preview="pasta/"` abre a janela. As janelas da mesa usam esse preview.

## A mesa (página Projetos)

- É uma prancha de 1440 × 900 que escala inteira pra caber na tela (`assets/js/mesa.js`). Esta página não usa o `escala-desktop.css`. O fundo é preto liso com uma grade de pontinhos bem leve (`.page-mesa` e `.mesa` no `styles.css`).
- Abaixo da mesa, o Processo é um bloco claro (cor de papel) com ondas em cima e embaixo (`.onda` e `.page-mesa main > section.process` no `styles.css`).
- As janelas de projeto são montadas a partir do `projects.js`: entram os projetos `no-ar` com link e imagem, na ordem da lista, **quatro por vez**. O primeiro de cada grupo de quatro é a janela grande do meio. Os lugares (posição, tamanho, inclinação) ficam na lista `SLOTS`, no topo do `mesa.js`.
- As setas em cima do botão "Começar o meu" trocam as quatro janelas: as da vez saem e as próximas caem na mesa. O contador `01 / 03` se ajusta sozinho quando a lista cresce.
- O cursor "Gustavo" passeia pelas janelas e, no fim de cada volta, ele mesmo clica na seta de avançar. Assim que a pessoa toca na mesa (arrasta, clica), ele para de trocar sozinho e só passeia. O "Você" fica perto da janela vazia "seu-negocio.com.br", que leva pro contato e está fixa no `projetos.html`.
- Clique numa janela abre o **preview**: o site roda de verdade dentro de uma janela da Vedoo, com opção Computador/Celular e o botão "Quero um site assim". Projeto com `externo: true` (Brasas e Fogão) abre o site em nova aba. A barra de endereço de cada janela mostra `vedoo.com.br/<pasta>` (ou o domínio do cliente, nos externos). Arrastar só move a janela. Ao passar o mouse, o print rola devagar.
- A janela mostra o `preview` do projeto (print da página inteira, em `assets/mesa/`, 1000 px de largura) e, se não tiver, a `imagem`.
- No celular todas as janelas viram um carrossel só, que passa com o dedo (sem paginação).

## Páginas claras: Início e Sobre

- A página Contato é escura: a estrutura está no `styles.css` (`.conversa`, `.chat`) e a aparência (fundo preto, balões, botões vermelhos, foto do personagem) em `assets/contato-tema.css`, que carrega por último.
- Início e Sobre usam `<body class="page-gustavo">`, o estilo em `assets/gustavo.css` (tudo começa com `.g`; não passa pelo `ferramentas/escala.py`) e o comportamento em `assets/js/gustavo.js` (cada bloco só roda se o elemento existir na página).
- Pra ficarem leves: não usam a rolagem suave do Lenis (o `motion.js` pula quando o body é `page-gustavo`), o grão do papel não usa `mix-blend-mode`, e as animações da capa pausam quando ela sai da tela.
- Os estilos da página Sobre antiga (`.bio`, `.story`, `.name-story`, `.tools`…), do hero antigo (`.hero`, `.impacto`) e da grade antiga de projetos (`.work__*`) continuam no `styles.css`, sem uso.

**Início (`index.html`)**

- A capa é um "palco" que escala inteiro (medidas em `cqw`); em celular e telas em pé ela empilha, e o "&" sai de cima do rosto e fica entre "Dev" e "Web" (há dois `.g-amp` no HTML; cada tamanho de tela mostra um).
- Personagem em `assets/gustavo/`: `cabeca-sorriso`, `cabeca-piscada` e `cabeca-surpreso` são a mesma cabeça com três expressões (precisam ter o mesmo recorte, senão a troca "pula"). Ele pisca sozinho de vez em quando, pisca ao passar o mouse, se surpreende no clique e inclina de leve seguindo o cursor.
- "Design" é um SVG com o contorno das letras (texto com contorno via CSS saía serrilhado no Windows). Cada `<path>` é uma letra, "digitada" pela animação `g-key`; o cursor de texto é o `.g-caret` (`g-caret-x`). Pra trocar a palavra é preciso gerar o SVG de novo a partir da fonte.
- O cursor "Gustavo" redimensiona a caixa do "Design": uma vez na entrada e depois a cada 8 s (animações `g-resize`/`g-resize-loop`, `g-press` e `g-grab`). O que anima é o tamanho da letra, não um `scale`, pra o contorno ficar sempre nítido; o `.g-slot` guarda o lugar da caixa.
- A seção de projetos em destaque é um bloco escuro no meio da página clara, com ondas em cima e embaixo (`.g-wave`: dois SVGs que deslizam devagar, só com CSS, e pausam fora da tela). As cores do bloco ficam em `.g-work__in` no `gustavo.css`.
- Projetos em destaque: só os projetos com `destaque: true` no `projects.js` (hoje Brasas e Fogão, Quanta Corp e Revelar Estético). Cada card é a capa do site (`imagem`), sem vídeo; o clique leva pra página Projetos. Um projeto sem imagem aparece com o nome no lugar da capa. O Quanta Corp ainda está sem `link` (procure `TROCAR` no `projects.js`), por isso aparece no Início mas não na mesa.
- Serviços usa o estilo "prancheta" (papel quadriculado e a lista como um arquivo num editor de código): bloco "Serviços: prancheta" no `gustavo.css`, ligado pelo `data-estilo="prancheta"` na seção do `index.html`.
- "Com o que eu construo" é uma faixa preta com ícone + nome de cada tecnologia, em duas fileiras que andam sozinhas, aceleram com a rolagem e dá pra arrastar. A lista fica no `<ul>` dentro de `.g-band` no `index.html` (ícones de simpleicons.org): é só copiar um `<li>`.
- A foto dos quadros de conversa (Início e Contato) é `assets/gustavo/avatar.webp`: o rosto do personagem centralizado, em fundo escuro.
- Contato do Início: título e contatos (e-mail, Instagram, GitHub) à esquerda e um quadro de conversa à direita (`.g-chat`). O quadro é uma chamada: qualquer clique nele leva pra página de contato (inclusive o "campo" de baixo, que é um link com cara de campo de mensagem); na primeira vez que aparece, as falas entram como se fossem digitadas (bloco "Quadro de conversa" no `gustavo.js`); cada resposta leva o assunto escolhido (`contato.html?assunto=novo`, `reforma`, `loja` ou `duvida`), que o `conversa.js` usa pra abrir a conversa e incluir na mensagem final. A página Sobre termina com essa mesma seção.

**Sobre (`gustavo.html`)**

- Abertura escura "Oi, eu sou o Gustavo." (`.g-me__in`, com ondas embaixo): disco vermelho atrás do `busto-bracos`; um quadriculado com brilho vermelho segue o mouse (`.g-me__grid`). Nessa página o cabeçalho usa o tema escuro (classe `page-sobre` no `<body>` e logo claro).
- "Duas metades" (`.g-duo`): uma janela com um site de verdade (o Burger), à esquerda o layout desenhado (`assets/gustavo/burger-rascunho.webp`) e à direita o site pronto (`burger-pronto.webp`), separados por uma barra que arrasta (mouse, dedo ou setas do teclado); no celular entram as versões `-m`, tiradas na largura de celular. O JS fica no `gustavo.js`. As duas imagens de cada par precisam ter exatamente o mesmo tamanho e enquadramento.
- "Fora da tela" (`.g-fotos`): bloco escuro com borda de papel rasgado em cima e embaixo (`.g-rasgo`) e um varal com luzinhas e uma fila de polaroids que balançam, anda sozinha devagar e dá pra arrastar (mouse ou dedo). As fotos ficam em `assets/gustavo/fotos/` e cada uma é um `<li class="g-pola">` no HTML (as deitadas levam `g-pola--larga`): é só copiar um `<li>`, trocar a imagem e a legenda.
- Currículo (`#curriculo`): crachá que cai quando a seção aparece e fica pendurado + a folha do currículo sobre papel quadriculado. Procure `TROCAR` no `gustavo.html` pra colocar anos, faculdade e outros trabalhos.
- A página termina com a mesma seção de contato do Início (o quadro de conversa).

## Currículo em PDF

O botão "Baixar currículo em PDF" da página Sobre baixa o arquivo `assets/gustavo/curriculo-gustavo-azevedo.pdf`. Esse PDF é o currículo principal do Gustavo (voltado para vaga de desenvolvedor full stack) e é um arquivo à parte: não é gerado a partir da folha que aparece na página. Pra trocar, basta salvar o PDF novo com esse mesmo nome na mesma pasta. A folha da página (`.g-sheet`, no `gustavo.html`) é um resumo solto, com a borda de baixo rasgada, fita, marca-texto, anotações à mão e um carimbo; o texto dela é próprio, então se mudar um dado no PDF, confira se a folha continua batendo.

## SEO (aparecer no Google e nos compartilhamentos)

- Cada página tem título, descrição, `canonical` e as tags de compartilhamento (`og:` e `twitter:card`) no `<head>`. Os endereços usam `https://vedoo.com.br`: se o domínio for outro, troque nos quatro HTML, no `robots.txt` e no `sitemap.xml`.
- `assets/og-image.jpg` (1200 × 630) é a imagem que aparece quando o link é compartilhado no WhatsApp, Instagram etc.
- `robots.txt` libera o site e bloqueia as pastas de demonstração (`conceitos/`, `burger/`, `vet/`); `sitemap.xml` lista as quatro páginas (atualize o `lastmod` quando mudar algo grande).
- O Início e o Sobre têm dados estruturados (`application/ld+json`) com nome, cidade, telefone e redes.
- Depois de publicar: cadastrar o site no Google Search Console e enviar o `sitemap.xml`.

## O que editar

| O quê | Onde |
|---|---|
| Projetos | `projects.js` (instruções no topo do arquivo). A ordem da lista é a ordem na mesa; `destaque: true` põe o projeto no Início; `externo: true` (site no domínio do cliente, como o Brasas e Fogão) abre o site em nova aba |
| Prints dos projetos | `assets/projetos/` (paisagem, ~1200 px de largura, de preferência `.webp`) |
| Textos do Início | `index.html` |
| Textos da página Sobre e do currículo | `gustavo.html` (procure `TROCAR`) |
| WhatsApp e e-mail | `contato.html` (bloco "Prefere falar direto?" e `window.VEDOO_CONTACT` no fim do arquivo) e `index.html` (seção Contato) |
| Perguntas da conversa do contato | `assets/js/conversa.js` (lista `STEPS` no topo) |
| Opções do quadro de conversa do Início | links dentro de `.g-chat__opts` no `index.html` e a lista `ASSUNTOS` no `assets/js/conversa.js` (os dois precisam bater) |
| Frase do rodapé ("Seu negócio merece ser lembrado.") | `footer__tag` e `menu__foot` nos HTML |
| Cores e fontes | topo do `styles.css` (`:root`) e do `assets/gustavo.css` |

O cabeçalho (Início, Sobre, Projetos, Contato), o menu e o rodapé se repetem nas páginas: se mudar um link, mude em todos os HTML (a `404.html` usa caminhos começando com `/`).

## Movimento ao rolar (GSAP + Lenis)

- `assets/vendor/`: GSAP 3 + ScrollTrigger e Lenis, locais (sem CDN).
- `assets/js/motion.js`: rolagem suave (Lenis, só nas páginas escuras), cabeçalho que some ao descer e volta ao subir, títulos com palavras subindo, linhas do processo se desenhando e logo do rodapé subindo. Os botões não se mexem: só mudam de cor no hover.
- Se as bibliotecas não carregarem, ou com "reduzir movimento" ativado, o site continua funcionando só com o CSS.
- A troca entre páginas usa um fade curto (View Transitions) nos navegadores que suportam.

## Tamanho no desktop (escala de 95%)

`assets/escala-desktop.css` é **gerado** a partir do `styles.css`: ele repete as regras com os px × 0,95, só acima de 761px (a página Projetos, com a mesa, não usa).
Sempre que mudar o `styles.css`, gere de novo, senão no desktop vale o valor antigo:

```sh
pip install tinycss2
python ferramentas/escala.py
```

Pra mudar a escala, troque `FATOR = 0.95` no início do script.

## Prints do README

Os prints em `docs/prints/` foram tirados com o Playwright (Chrome instalado na máquina), com o servidor local rodando: desktop em 1440 × 900 e celular em 390 × 844 (2×). Se o visual mudar, tire de novo com os mesmos nomes de arquivo.
