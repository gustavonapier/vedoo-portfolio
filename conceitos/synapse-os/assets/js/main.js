/**
 * Synapse OS — Orquestrador de Animação de Cortina & Zoom
 * Transição suave para Seção 2 com título superior e blocos estratégicos
 */

document.addEventListener('DOMContentLoaded', () => {
  const heroSection = document.getElementById('heroSection');
  const panelLeft = document.getElementById('panelLeft');
  const panelRight = document.getElementById('panelRight');
  const sectionPortal = document.getElementById('sectionPortal');
  const heroCenterContainer = document.getElementById('heroCenterContainer');
  const heroImage = document.getElementById('heroImage');
  const heroGlow = document.getElementById('heroGlowBackdrop');
  const ctaBtn = document.getElementById('cta-button');
  const portalHeader = document.querySelector('.portal-header-center');
  const strategicCards = document.querySelectorAll('.strategic-card');
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const mobileViewport = window.matchMedia('(max-width: 720px)');

  let targetProgress = 0;
  let currentProgress = 0;

  const clamp01 = (value) => Math.min(Math.max(value, 0), 1);
  const smoothstep = (value) => {
    const clamped = clamp01(value);
    return clamped * clamped * (3 - (2 * clamped));
  };

  function updatePortalContent(progress) {
    if (prefersReducedMotion) return;

    // O cabeçalho sobe suavemente enquanto a cortina revela a seção.
    const headerReveal = smoothstep((progress - 0.24) / 0.28);
    if (portalHeader) {
      portalHeader.style.setProperty('--header-reveal-opacity', headerReveal.toFixed(3));
      portalHeader.style.setProperty('--header-reveal-y', `${((1 - headerReveal) * 36).toFixed(2)}px`);
    }

    // Os cards entram em sequência e ficam nítidos conforme a rolagem avança.
    strategicCards.forEach((card, index) => {
      const start = 0.42 + (index * 0.08);
      const cardReveal = smoothstep((progress - start) / 0.3);

      card.style.setProperty('--card-reveal-opacity', cardReveal.toFixed(3));
      card.style.setProperty('--card-reveal-y', `${((1 - cardReveal) * 42).toFixed(2)}px`);
      card.style.setProperty('--card-reveal-scale', (0.96 + (cardReveal * 0.04)).toFixed(4));
      card.style.setProperty('--card-reveal-blur', `${((1 - cardReveal) * 16).toFixed(2)}px`);
    });
  }

  // Calcula o progresso do scroll de 0.0 a 1.0
  function calculateTargetProgress() {
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    if (maxScroll <= 0) return 0;
    const scrollY = window.pageYOffset || document.documentElement.scrollTop || 0;
    return Math.min(Math.max(scrollY / maxScroll, 0), 1);
  }

  window.addEventListener('scroll', () => {
    targetProgress = calculateTargetProgress();
  }, { passive: true });

  function updateScene() {
    // Interpolação suave (LERP) para transição fluida
    currentProgress += (targetProgress - currentProgress) * 0.085;
    const p = currentProgress;

    // 1. ABERTURA DAS JANELAS DA HERO (CORTINAS LATERAIS)
    const curtainProgress = Math.min(p / 0.55, 1);
    const easeCurtain = curtainProgress * curtainProgress * (3 - 2 * curtainProgress);
    const panelTranslateX = easeCurtain * 110; // em vw

    if (panelLeft && panelRight) {
      panelLeft.style.transform = `translateX(-${panelTranslateX}vw)`;
      panelRight.style.transform = `translateX(${panelTranslateX}vw)`;

      // Gerencia visibilidade e cliques
      if (curtainProgress >= 0.98) {
        heroSection.style.visibility = 'hidden';
        heroSection.style.pointerEvents = 'none';
      } else {
        heroSection.style.visibility = 'visible';
        heroSection.style.pointerEvents = curtainProgress > 0.4 ? 'none' : 'auto';
      }
    }

    // 2. ENTRADA DA SEÇÃO 2 (FUNDO PRETO & ZOOM SUTIL)
    const zoomProgress = Math.min(p / 0.58, 1);
    const easeZoom = zoomProgress * zoomProgress * (3 - 2 * zoomProgress);
    const portalScale = 0.90 + (0.10 * easeZoom); // De 0.90 para 1.00
    const portalOpacity = Math.min(zoomProgress * 1.4, 1);

    if (sectionPortal) {
      sectionPortal.style.transform = `scale(${portalScale})`;
      sectionPortal.style.opacity = portalOpacity;
      sectionPortal.style.pointerEvents = zoomProgress > 0.6 ? 'auto' : 'none';
    }

    updatePortalContent(p);

    // 3. MOVIMENTO DA IMAGEM HERO: DIMINUI DE TAMANHO E DESCE SUAVEMENTE
    if (heroCenterContainer && heroImage) {
      // No mobile, a imagem reduz levemente e permanece ancorada na base.
      const imgScale = mobileViewport.matches
        ? 1 - (0.32 * p)
        : 1 - (0.24 * p);
      const imgTranslateY = mobileViewport.matches
        ? 42 * p
        : 48 * p;

      // Imagem estática horizontalmente (sem oscilar com o mouse)
      heroCenterContainer.style.transform = `translateX(-50%) translateY(${imgTranslateY}px) scale(${imgScale})`;

      // Ajuste suave do brilho dos olhos no escuro
      if (heroGlow) {
        const glowOpacity = 0.32 + (0.18 * p);
        heroGlow.style.background = `radial-gradient(circle, rgba(244, 63, 94, ${glowOpacity}) 0%, rgba(244, 63, 94, 0) 70%)`;
      }
    }

    requestAnimationFrame(updateScene);
  }

  // Inicia loop a 60fps
  requestAnimationFrame(updateScene);

  // Botão CTA da Hero: Rola suavemente abrindo as cortinas
  if (ctaBtn) {
    ctaBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      window.scrollTo({
        top: maxScroll * 0.75,
        behavior: 'smooth'
      });
    });
  }

});
