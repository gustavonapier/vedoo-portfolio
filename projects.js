/*
  PROJETOS — edite só esta lista.

  Cada projeto:
    nome       nome que aparece embaixo do card
    tipo       ex.: "Site institucional", "Landing page", "E-commerce"
    ano        ex.: 2026
    link       endereço do site no ar (ou null enquanto não estiver publicado)
    imagem     print do site, ex.: "assets/projetos/nome-do-projeto.webp"
               (formato 4:3, uns 1200 x 900 px; ou null para mostrar "Em breve")
    preview    print da página inteira mostrado enquanto o preview carrega (opcional)
    status     "no-ar" ou "em-breve" (no ar: o card abre o preview do site, sem sair da Vedoo)

  A ordem da lista é a ordem na página Projetos. O card "Seu projeto pode ser o próximo" entra sozinho no fim.
*/
window.VEDOO_PROJECTS = [
  { nome: 'Burger', tipo: 'Landing page · hamburgueria', ano: 2026, link: 'burger/', imagem: 'assets/projetos/burger.webp', preview: 'assets/mesa/burger.webp', status: 'no-ar' },
  { nome: 'Cauda Leve Vet', tipo: 'Site institucional · veterinária', ano: 2026, link: 'vet/', imagem: 'assets/projetos/vet.webp', preview: 'assets/mesa/vet.webp', status: 'no-ar' },
];
