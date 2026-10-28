/* Sobre (sobre.html): entrada da abertura e aviso do varal.
   (As fotos da abertura só flutuam sozinhas, pelo CSS; não seguem o mouse.) */
document.addEventListener("DOMContentLoaded", () => {
  // varal: sem o aviso "arraste pro lado" quando todas as fotos já cabem na tela
  const varal = document.querySelector("[data-varal]"), dica = document.querySelector(".g-varal__dica");
  const fit = () => { if (varal && dica) dica.style.visibility = varal.scrollWidth - varal.clientWidth > 4 ? "" : "hidden"; };
  fit(); addEventListener("resize", fit); addEventListener("load", fit);

  const s = document.querySelector(".vsb");
  if (s) requestAnimationFrame(() => s.classList.add("is-in"));
});
