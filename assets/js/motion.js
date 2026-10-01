/*
  Movimento do site: Lenis (rolagem suave) + GSAP/ScrollTrigger (efeitos ao rolar).
  Se as bibliotecas não carregarem, ou se a pessoa pedir "reduzir movimento" no sistema,
  o site continua funcionando só com as animações de CSS.
*/
(() => {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce || !window.gsap || !window.ScrollTrigger) return;

  const { gsap, ScrollTrigger } = window;
  gsap.registerPlugin(ScrollTrigger);
  const root = document.documentElement;
  root.classList.add('has-gsap');
  const hasIntro = !!document.querySelector('.intro') && !root.classList.contains('no-intro');

  /* ---------- Lenis: rolagem suave ---------- */
  let lenis = null;
  if (window.Lenis) {
    lenis = new window.Lenis({
      duration: 1.15,
      easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(time => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);

    // Segura a rolagem enquanto a abertura acontece (só na página inicial).
    if (hasIntro) {
      lenis.stop();
      setTimeout(() => lenis.start(), 2300);
    }

    // Links internos (#projetos, #contato...) passam pelo Lenis.
    document.addEventListener('click', e => {
      const a = e.target.closest('a[href^="#"]');
      if (!a) return;
      const id = a.getAttribute('href');
      const target = id.length > 1 && document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      const menu = document.querySelector('#menu');
      if (menu && menu.open) menu.close();
      lenis.start();
      lenis.scrollTo(target, { offset: id === '#inicio' ? 0 : -72, duration: 1.4 });
      history.replaceState(null, '', id);
    });

    // Com o menu do celular aberto, a página de trás não rola.
    const menu = document.querySelector('#menu');
    if (menu) {
      new MutationObserver(() => (menu.open ? lenis.stop() : lenis.start()))
        .observe(menu, { attributes: true, attributeFilter: ['open'] });
    }

    // Cabeçalho some ao descer e volta ao subir.
    const header = document.querySelector('.header');
    lenis.on('scroll', ({ scroll, direction }) => {
      header.classList.toggle('is-hidden', direction === 1 && scroll > 240);
    });
  }

  /* ---------- Títulos: palavras sobem uma a uma ---------- */
  const splitWords = el => {
    const walk = node => {
      [...node.childNodes].forEach(n => {
        if (n.nodeType === Node.TEXT_NODE) {
          const frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach(part => {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(' ')); return; }
            const w = document.createElement('span');
            w.className = 'w';
            const inner = document.createElement('span');
            inner.className = 'wi';
            inner.textContent = part;
            w.appendChild(inner);
            frag.appendChild(w);
          });
          n.replaceWith(frag);
        } else if (n.nodeType === Node.ELEMENT_NODE && n.tagName !== 'BR' && n.tagName !== 'SUP') {
          walk(n);
        }
      });
    };
    walk(el);
    return el.querySelectorAll('.wi');
  };

  document.querySelectorAll('.section-head .display, .manifesto__title, .page-hero__title, .name-story__title, .cta-band__title, .footer__tag').forEach(el => {
    el.classList.remove('reveal');
    const words = splitWords(el);
    gsap.from(words, {
      yPercent: 115,
            duration: 1.1,
      ease: 'expo.out',
      stagger: 0.045,
      scrollTrigger: { trigger: el, start: 'top 86%', once: true },
    });
  });

  /* ---------- Hero: sai de cena ao rolar (página inicial) ---------- */
  if (document.querySelector('.hero')) {
    const heroArt = document.querySelectorAll('.hero__stage, .hero__art--tall');
    const heroName = document.querySelectorAll('.hero__stage g[clip-path], .hero__art--tall g[clip-path]');
    const heroUi = document.querySelectorAll('.hero__year, .hero__services, .hero__intro, .hero__cta');
    gsap.timeline({
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
    })
      .to(heroArt, { yPercent: 16, scale: 1.05, ease: 'none' }, 0)
      .to(heroName, { y: -140, ease: 'none' }, 0)
      .to(heroUi, { autoAlpha: 0, ease: 'none', duration: 0.5 }, 0);
  }

  /* ---------- Processo: linha de cada etapa se desenha ---------- */
  gsap.utils.toArray('.step').forEach((step, i) => {
    gsap.from(step, {
      '--draw': 0,
      duration: 1.2,
      delay: i * 0.08,
      ease: 'power3.inOut',
      scrollTrigger: { trigger: step, start: 'top 88%', once: true },
    });
  });

  /* ---------- Rodapé: logo sobe devagar ---------- */
  gsap.from('.footer__top img', {
    yPercent: 60,
    autoAlpha: 0,
    ease: 'none',
    scrollTrigger: { trigger: '.footer', start: 'top bottom', end: 'top 45%', scrub: true },
  });

  // Recalcula posições quando as fontes terminam de carregar.
  if (document.fonts) document.fonts.ready.then(() => ScrollTrigger.refresh());
})();
