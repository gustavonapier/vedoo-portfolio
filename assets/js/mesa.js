/*
  Mesa da página inicial.
  - A prancha de 1440 × 900 escala pra caber na tela (igual ao hero do portfólio).
  - As janelas são projetos reais: dá pra arrastar; um clique sem arrastar abre o projeto.
  - O cursor "Gustavo" passeia pelas janelas como alguém trabalhando ao vivo.
*/
(() => {
  const board = document.getElementById('mesa-board');
  if (!board) return;
  const section = board.closest('.mesa');
  const mobile = window.matchMedia('(max-width: 760px)');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const W = 1440, H = 900;

  /* ---------- Escala ---------- */
  let s = 1;
  const fit = () => {
    if (mobile.matches) { s = 1; board.style.removeProperty('--s'); section.style.removeProperty('--s'); return; }
    const r = section.getBoundingClientRect();
    s = Math.min(r.width / W, r.height / H);
    board.style.setProperty('--s', s);
    section.style.setProperty('--s', s);
  };
  fit();
  window.addEventListener('resize', fit);
  mobile.addEventListener('change', fit);

  /* ---------- Arrastar ---------- */
  let front = 20;
  board.querySelectorAll('[data-win]').forEach(win => {
    let startX = 0, startY = 0, originX = 0, originY = 0, pointer = null, moved = false;

    win.addEventListener('dragstart', e => e.preventDefault());

    win.addEventListener('pointerdown', e => {
      if (mobile.matches || e.button !== 0) return;
      pointer = e.pointerId;
      moved = false;
      startX = e.clientX;
      startY = e.clientY;
      const cs = getComputedStyle(win);
      originX = parseFloat(cs.left);
      originY = parseFloat(cs.top);
      win.style.setProperty('--z', ++front);
      win.setPointerCapture(pointer);
    });

    win.addEventListener('pointermove', e => {
      if (e.pointerId !== pointer) return;
      const dx = (e.clientX - startX) / s;
      const dy = (e.clientY - startY) / s;
      if (!moved && Math.hypot(dx, dy) < 5) return;
      moved = true;
      win.classList.add('is-dragging');
      const w = win.offsetWidth, h = win.offsetHeight;
      const x = Math.min(W - w * 0.35, Math.max(-w * 0.65, originX + dx));
      const y = Math.min(H - h * 0.35, Math.max(60, originY + dy));
      win.style.setProperty('--x', `${x}px`);
      win.style.setProperty('--y', `${y}px`);
    });

    const end = e => {
      if (e.pointerId !== pointer) return;
      pointer = null;
      win.classList.remove('is-dragging');
    };
    win.addEventListener('pointerup', end);
    win.addEventListener('pointercancel', end);

    // Se arrastou, não abre o link.
    win.addEventListener('click', e => {
      if (moved) { e.preventDefault(); moved = false; }
    });
  });

  /* ---------- Cursores ---------- */
  const gsap = window.gsap;
  if (reduce || !gsap || mobile.matches) return;
  const gustavo = document.getElementById('cur-gustavo');
  const voce = board.querySelector('.cur--voce');
  const hasIntro = !!document.querySelector('.intro') && !document.documentElement.classList.contains('no-intro');
  const start = hasIntro ? 2.6 : 1.3;

  gsap.set(gustavo, { x: 1000, y: 128 });
  gsap.set(voce, { x: 1180, y: 390 });

  // "Você" balança de leve perto da janela vazia.
  gsap.to(voce, { x: '+=10', y: '+=7', duration: 2.6, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: start });

  // "Gustavo" passeia: portfólio → veterinária → hamburgueria → volta.
  const arrow = gustavo.querySelector('svg');
  const click = () => gsap.timeline()
    .to(arrow, { scale: 0.8, duration: 0.12, transformOrigin: '2px 2px', ease: 'power2.out' })
    .to(arrow, { scale: 1, duration: 0.25, ease: 'back.out(3)' });
  const stops = [[640, 300], [250, 330], [1180, 600], [1000, 128]];
  const tl = gsap.timeline({ repeat: -1, delay: start, repeatDelay: 1.2 });
  stops.forEach(([x, y]) => {
    tl.to(gustavo, { x, y, duration: 1.7, ease: 'power2.inOut' })
      .add(click)
      .to({}, { duration: 1.6 });
  });

  // Não distrai quem está arrastando uma janela.
  board.addEventListener('pointerdown', () => tl.pause());
  board.addEventListener('pointerup', () => tl.resume());
})();
