/*
  PROJETOS — edite só esta lista.

  Cada projeto:
    nome       nome do projeto
    tipo       ex.: "Site institucional · restaurante", "Landing page · hamburgueria"
    ano        ex.: 2026 (opcional)
    link       endereço do site no ar (ou null enquanto não estiver publicado)
    imagem     print do site, ex.: "assets/projetos/nome-do-projeto.webp" (paisagem, uns 1200 px de largura)
    preview    print da página inteira (opcional): é o que aparece na janela da mesa e rola ao passar o mouse
    status     "no-ar" ou "em-breve" (só os "no-ar" com link e imagem vão pra mesa)
    externo    true quando o site fica em outro endereço (ex.: site de cliente no domínio dele):
               a janela abre o site em nova aba, em vez do preview
    destaque   true nos projetos que aparecem no Início (deixe uns três); o card mostra a `imagem`

  A ordem da lista é a ordem na mesa da página Projetos: quatro janelas por vez, e a primeira de cada
  grupo de quatro é a janela grande do meio.
*/
window.VEDOO_PROJECTS = [
  { nome: 'Curso de IA', tipo: 'Hero · curso online', link: 'conceitos/curso-ia/', imagem: 'assets/projetos/conceito-curso-ia.webp', status: 'no-ar' },
  { nome: 'Brasas e Fogão', tipo: 'Site institucional · restaurante', ano: 2026, link: 'https://brasasefogao.com.br/', imagem: 'assets/projetos/brasas.webp', preview: 'assets/mesa/brasas.webp', status: 'no-ar', externo: true, destaque: true },
  // TROCAR: quando o site da Quanta estiver publicado, ponha o endereço em "link", status 'no-ar' e externo: true. Aí ele entra na mesa também.
  { nome: 'Quanta Corp', tipo: 'Landing page · simulador de receita', ano: 2026, link: null, imagem: 'assets/projetos/quanta.webp', status: 'em-breve', destaque: true },
  { nome: 'Burger', tipo: 'Landing page · hamburgueria', ano: 2026, link: 'burger/', imagem: 'assets/projetos/burger.webp', preview: 'assets/mesa/burger.webp', status: 'no-ar' },
  { nome: 'Flux', tipo: 'Hero · agência criativa', link: 'conceitos/flux/', imagem: 'assets/projetos/conceito-flux.webp', status: 'no-ar' },

  // As outras páginas da pasta conceitos/ (uma pasta por página). O Curso de IA, lá em cima, também fica nela.
  { nome: 'Jardim de Luz', tipo: 'Hero · galeria de arte', link: 'conceitos/jardim-de-luz/', imagem: 'assets/projetos/conceito-jardim-de-luz.webp', status: 'no-ar' },
  { nome: 'Cauda Leve Vet', tipo: 'Site institucional · veterinária', ano: 2026, link: 'vet/', imagem: 'assets/projetos/vet.webp', preview: 'assets/mesa/vet.webp', status: 'no-ar' },
  { nome: 'Revelar Estético', tipo: 'Hero · clínica de estética', link: 'conceitos/estetica-revelacao/', imagem: 'assets/projetos/conceito-estetica-revelacao.webp', status: 'no-ar', destaque: true },
  { nome: 'Branding em Pixels', tipo: 'Hero · identidade visual', link: 'conceitos/branding-pixels/', imagem: 'assets/projetos/conceito-branding-pixels.webp', status: 'no-ar' },
  { nome: 'Aurea Residences', tipo: 'Hero · imóveis', link: 'conceitos/aurea/', imagem: 'assets/projetos/conceito-aurea.webp', status: 'no-ar' },
  { nome: 'Dra. Sofia Miranda', tipo: 'Hero · odontologia', link: 'conceitos/dra-sofia/', imagem: 'assets/projetos/conceito-dra-sofia.webp', status: 'no-ar' },
  { nome: 'White Reveal', tipo: 'Hero · posicionamento de marca', link: 'conceitos/white-reveal/', imagem: 'assets/projetos/conceito-white-reveal.webp', status: 'no-ar' },
  { nome: 'Synapse OS', tipo: 'Hero · tecnologia', link: 'conceitos/synapse-os/', imagem: 'assets/projetos/conceito-synapse-os.webp', status: 'no-ar' },
];
