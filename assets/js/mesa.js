/*
  Mesa da página Projetos.
  - A prancha de 1440 × 900 escala pra caber na tela.
  - As janelas são os projetos do projects.js, quatro por vez (os lugares estão em SLOTS).
    As setas em cima do botão de contato trocam as janelas da mesa; no celular todas viram um carrossel só.
  - Dá pra arrastar as janelas; um clique sem arrastar abre o projeto (preview, ou nova aba se for site externo).
  - O cursor "Gustavo" passeia pelas janelas como alguém trabalhando ao vivo e, enquanto a pessoa
    não mexe em nada, ele mesmo clica na seta "próximas" no fim de cada volta.
*/
(() => {
  const board = document.getElementById('mesa-board');
  if (!board) return;
  const section = board.closest('.mesa');
  const deck = document.getElementById('mesa-deck');
  const mobile = window.matchMedia('(max-width: 760px)');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const W = 1440, H = 900;

  // Lugares das janelas de projeto na prancha: posição (x, y), tamanho (w, h), inclinação (r), camada (z),
  // ordem de entrada (i) e "lt" pra barra clara. O primeiro é a janela grande do meio.
  const SLOTS = [
    { x: 430, y: 150, w: 600, h: 375, r: -2, z: 10, i: 0 },
    { x: 58, y: 104, w: 350, h: 219, r: -6, z: 2, i: 1, lt: true },
    { x: 1045, y: 428, w: 370, h: 231, r: -4, z: 4, i: 3 },
    { x: 96, y: 384, w: 336, h: 210, r: 4, z: 5, i: 4, lt: true },
  ];

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

  /* ---------- Arrastar ---------- */
  let front = 20;
  const bind = win => {
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
  };
  board.querySelectorAll('[data-win]').forEach(bind);

  /* ---------- Janelas de projeto ---------- */
  const esc = t => String(t ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const projects = (window.VEDOO_PROJECTS || []).filter(p => p.status === 'no-ar' && p.link && (p.preview || p.imagem));
  const PER = SLOTS.length;
  const pages = Math.max(1, Math.ceil(projects.length / PER));
  const empty = deck.querySelector('.win--empty');
  let page = 0, mode = null;

  const make = (p, slot, i) => {
    const a = document.createElement('a');
    const shot = p.preview || p.imagem;
    // texto da barra de endereço: o domínio do cliente, ou vedoo.com.br/<pasta do projeto>
    const url = p.externo ? p.link.replace(/^https?:\/\//, '').replace(/\/$/, '') : `vedoo.com.br/${p.link.replace(/\/$/, '').split('/').pop()}`;
    a.className = `win${slot.lt ? ' win--lt' : ''}`;
    a.href = p.link;
    a.draggable = false;
    a.dataset.win = '';
    a.dataset.project = '';
    if (p.externo) {
      a.target = '_blank'; a.rel = 'noopener';
      a.setAttribute('aria-label', `${p.nome}, ${p.tipo}. Abrir o site em nova aba`);
    } else {
      a.dataset.preview = p.link; a.dataset.title = p.nome; a.dataset.tipo = p.tipo; a.dataset.url = url; a.dataset.poster = shot;
      a.setAttribute('aria-label', `${p.nome}, ${p.tipo}. Ver preview`);
    }
    a.style.cssText = `--x:${slot.x}px;--y:${slot.y}px;--w:${slot.w}px;--h:${slot.h}px;--r:${slot.r}deg;--z:${slot.z};--i:${i}`;
    a.innerHTML = `
      <span class="win__bar" aria-hidden="true"><i${slot.z >= 10 ? ' class="is-red"' : ''}></i><i></i><i></i><span>${esc(url)}</span></span>
      <span class="win__body"><img src="${esc(shot)}" alt="" width="${slot.w}" draggable="false"></span>`;
    bind(a);
    return a;
  };

  const pager = document.getElementById('mesa-pager');
  const pageEl = document.getElementById('mesa-page');
  const two = n => String(n).padStart(2, '0');
  const label = () => { if (pageEl) pageEl.textContent = two(page + 1); };

  // Monta as janelas. No computador: só as da "página" atual. No celular: todas, em carrossel.
  const render = first => {
    mode = mobile.matches ? 'mobile' : 'desktop';
    const old = [...deck.querySelectorAll('[data-project]')];
    const list = mode === 'mobile' ? projects : projects.slice(page * PER, page * PER + PER);
    const wins = list.map((p, i) => make(p, SLOTS[i % PER], mode === 'mobile' ? 0 : SLOTS[i % PER].i));
    const put = () => {
      old.forEach(w => w.remove());
      if (!first) section.style.setProperty('--d0', '0s'); // sem a espera da entrada da página
      wins.forEach(w => deck.insertBefore(w, empty));
      if (mode === 'mobile') deck.scrollLeft = 0;
    };
    if (first || reduce || mode === 'mobile' || !old.length) return put();
    old.forEach((w, i) => { w.style.setProperty('--o', i); w.classList.add('is-leaving'); });
    setTimeout(put, 470);
  };

  let busy = false;
  const go = dir => {
    if (busy || pages < 2) return;
    busy = true;
    page = (page + dir + pages) % pages;
    label();
    render(false);
    setTimeout(() => { busy = false; }, 700);
    // já deixa os prints da próxima leva no cache
    projects.slice(((page + 1) % pages) * PER, ((page + 1) % pages) * PER + PER).forEach(p => { new Image().src = p.preview || p.imagem; });
  };

  render(true);
  if (pager && pages > 1) {
    pager.hidden = false;
    document.getElementById('mesa-pages').textContent = two(pages);
    label();
    pager.addEventListener('click', e => {
      const btn = e.target.closest('button[data-dir]');
      if (btn) go(Number(btn.dataset.dir));
    });
    setTimeout(() => projects.slice(PER, PER * 2).forEach(p => { new Image().src = p.preview || p.imagem; }), 2500);
  }
  mobile.addEventListener('change', () => { fit(); render(true); });

  /* ---------- Cursores ---------- */
  const gsap = window.gsap;
  if (reduce || !gsap || mobile.matches) return;
  const gustavo = document.getElementById('cur-gustavo');
  const voce = board.querySelector('.cur--voce');
  const start = 1.3;

  gsap.set(gustavo, { x: 1000, y: 128 });
  gsap.set(voce, { x: 1180, y: 382 });

  // "Você" balança de leve perto da janela vazia.
  gsap.to(voce, { x: '+=10', y: '+=7', duration: 2.6, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: start });

  // "Gustavo" passeia pelas quatro janelas e termina na seta "próximas".
  const arrow = gustavo.querySelector('svg');
  const click = () => gsap.timeline()
    .to(arrow, { scale: 0.8, duration: 0.12, transformOrigin: '2px 2px', ease: 'power2.out' })
    .to(arrow, { scale: 1, duration: 0.25, ease: 'back.out(3)' });

  // Enquanto ninguém mexe na mesa, o Gustavo troca os projetos sozinho. Depois do primeiro toque, para de trocar
  // (pra não bagunçar o que a pessoa arrumou) e só passeia.
  let hands = false, tl = null, held = false, onScreen = true;
  const more = pager && !pager.hidden ? pager.querySelector('.mesa__more') : null;
  // posição da seta "próximas" na prancha
  const morePos = () => {
    const cta = more.closest('.mesa__cta');
    return [cta.offsetLeft + pager.offsetLeft + more.offsetLeft + more.offsetWidth * 0.5, cta.offsetTop + pager.offsetTop + more.offsetTop + more.offsetHeight * 0.5];
  };
  const stops = SLOTS.map(sl => [sl.x + sl.w * 0.42, sl.y + sl.h * 0.55]);

  const tour = delay => {
    tl = gsap.timeline({ delay, onComplete: () => tour(0.6) });
    stops.forEach(([x, y]) => {
      tl.to(gustavo, { x, y, duration: 1.7, ease: 'power2.inOut' })
        .add(click())
        .to({}, { duration: 1.6 });
    });
    if (more && !hands) {
      const [x, y] = morePos();
      tl.to(gustavo, { x, y, duration: 1.5, ease: 'power2.inOut' })
        .add(click())
        .call(() => {
          if (hands) return;
          more.classList.add('is-pressed');
          setTimeout(() => more.classList.remove('is-pressed'), 280);
          go(1);
        })
        .to({}, { duration: 1.4 });
    } else {
      tl.to(gustavo, { x: 1000, y: 128, duration: 1.7, ease: 'power2.inOut' }).to({}, { duration: 1.6 });
    }
    if (held || !onScreen) tl.pause();
  };
  tour(start);

  // Não distrai quem está arrastando uma janela.
  board.addEventListener('pointerdown', () => { hands = true; held = true; tl.pause(); });
  const release = () => { held = false; if (onScreen) tl.resume(); };
  window.addEventListener('pointerup', release);
  window.addEventListener('pointercancel', release);
  // Com a mesa fora da tela, o passeio para.
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([e]) => {
      onScreen = e.isIntersecting;
      if (onScreen && !held) tl.resume(); else tl.pause();
    }, { threshold: 0.15 }).observe(section);
  }
})();
