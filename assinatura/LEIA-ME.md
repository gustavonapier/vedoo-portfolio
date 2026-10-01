# Assinatura Gustavo · Vedoo

A assinatura que vai no rodapé de todo site que você entregar: "Desenvolvimento ⚭ @gustavovedoo", com os dois círculos da Vedoo. No hover, o círculo da direita se aproxima e a lente vermelha cresce (o "foco").

| Arquivo | Pra quê |
|---|---|
| `assinatura.html` | O HTML pra colar no rodapé de sites em HTML puro |
| `assinatura.css` | O estilo (cole no CSS do site do cliente) |
| `VedooSign.jsx` | A mesma assinatura como componente React: `<VedooSign cliente="aura-parfums" />` |
| `exemplo.html` | Prévia em fundo escuro, claro e colorido |

- Troque `NOMEDOCLIENTE` pelo nome do projeto. O link vai pra `vedoo.studio/?ref=nome`, e assim dá pra saber quais sites estão trazendo clientes.
- A cor vem do texto do rodapé do cliente (`currentColor`), então ela se adapta a qualquer site. A lente é sempre o vermelho da Vedoo.
- Se tiver mais de uma assinatura na mesma página, troque o `id` do `clipPath` (ex.: `vd-sign-clip2`).
- Combine no contrato que o rodapé leva a assinatura e que o site pode aparecer no seu portfólio.
