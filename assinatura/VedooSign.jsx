// Assinatura Gustavo · Vedoo para projetos React. Importe o assinatura.css no projeto.
export function VedooSign({ cliente = 'NOMEDOCLIENTE' }) {
  return (
    <a className="vd-sign" href={`https://vedoo.studio/?ref=${cliente}`} target="_blank" rel="noopener" aria-label="Site desenvolvido por Gustavo, da Vedoo (abre em nova aba)">
      <span>Desenvolvimento</span>
      <svg className="vd-sign__mark" viewBox="0 0 28 18" aria-hidden="true">
        <clipPath id="vd-sign-clip"><circle cx="9" cy="9" r="7" /></clipPath>
        <g clipPath="url(#vd-sign-clip)"><circle className="vd-sign__lens" cx="19" cy="9" r="7" /></g>
        <circle cx="9" cy="9" r="7" />
        <circle className="vd-sign__b" cx="19" cy="9" r="7" />
      </svg>
      <span className="vd-sign__who">@gustavovedoo</span>
    </a>
  );
}
