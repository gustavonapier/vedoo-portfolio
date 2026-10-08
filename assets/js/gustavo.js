/*
  Páginas claras: Início (index.html) e Sobre (gustavo.html). Cada bloco só roda se o elemento existir na página.
  1) Capa (Início): o personagem troca de expressão (sorriso, piscada, surpreso) e inclina de leve seguindo o mouse.
  2) Projetos em destaque (Início): cards com a capa de cada site, a partir do projects.js.
  3) Currículo (Sobre): botão de imprimir/salvar em PDF e crachá que cai e fica pendurado.
  4) "Com o que eu construo" (Início): faixa preta de tecnologias (ícone + nome) que andam sozinhas, aceleram com a rolagem e podem ser arrastadas.
*/
(() => {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Personagem ---------- */
  const face = document.querySelector('.g-face');
  if (face) {
    const imgs = [...face.querySelectorAll('img[data-face]')];
    const tilt = face.querySelector('.g-face__tilt');
    let hold = null;       // expressão "travada" por um tempo (clique ou piscada automática)
    let hovering = false;

    // O sorriso é a base e nunca some; as outras expressões entram por cima dele.
    const show = name => imgs.forEach(img => img.classList.toggle('is-on', img.dataset.face === name));
    imgs.forEach(img => { if (img.decode) img.decode().catch(() => {}); }); // já deixa decodificadas, pra troca ser instantânea
    const rest = () => show(hovering ? 'piscada' : 'sorriso');
    const flash = (name, ms) => {
      clearTimeout(hold);
      show(name);
      hold = setTimeout(() => { hold = null; rest(); }, ms);
    };

    face.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse') { hovering = true; if (!hold) rest(); } });
    face.addEventListener('pointerleave', () => { hovering = false; if (!hold) rest(); });
    face.addEventListener('click', () => flash('surpreso', 900));

    if (!reduce) {
      // Pisca sozinho de vez em quando, pra pessoa perceber que ele reage.
      const heroEl = document.querySelector('.g-hero');
      let away = false;
      setInterval(() => { if (!hold && !hovering && !away && !document.hidden) flash('piscada', 420); }, 5200);

      // Com a capa fora da tela, as animações dela (o "Design" sendo redimensionado) ficam pausadas.
      if ('IntersectionObserver' in window) {
        new IntersectionObserver(([e]) => { away = !e.isIntersecting; heroEl.classList.toggle('is-away', away); }).observe(heroEl);
      }

      // Inclina de leve na direção do mouse (só em telas com mouse).
      if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
        const hero = document.querySelector('.g-hero');
        let raf = 0;
        hero.addEventListener('pointermove', e => {
          cancelAnimationFrame(raf);
          raf = requestAnimationFrame(() => {
            const r = face.getBoundingClientRect();
            const dx = (e.clientX - (r.left + r.width / 2)) / window.innerWidth;
            const dy = (e.clientY - (r.top + r.height / 2)) / window.innerHeight;
            tilt.style.setProperty('--rz', `${(dx * 9).toFixed(2)}deg`);
            tilt.style.setProperty('--tx', `${(dx * 16).toFixed(1)}px`);
            tilt.style.setProperty('--ty', `${(dy * 12).toFixed(1)}px`);
          });
        });
        hero.addEventListener('pointerleave', () => ['--rz', '--tx', '--ty'].forEach(p => tilt.style.removeProperty(p)));
      }
    }
  }

  /* ---------- Projetos em destaque ---------- */
  const cards = document.querySelector('#g-cards');
  if (cards) {
    const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
    const all = window.VEDOO_PROJECTS || [];
    // data-so="destaque" no <ul>: entram só os projetos marcados com "destaque: true" no projects.js.
    const projects = cards.dataset.so === 'destaque' ? all.filter(p => p.destaque) : all;

    // Cada card é a capa do site (imagem). O clique leva pra mesa (página Projetos), onde os sites abrem.
    // O nome e o tipo aparecem numa faixa por cima da capa (ao passar o mouse; no celular, sempre).
    // Projeto ainda sem imagem aparece com o nome escrito no lugar da capa.
    projects.forEach(p => {
      const li = document.createElement('li');
      li.className = 'g-card reveal';
      li.innerHTML = p.imagem ? `
        <a class="g-card__thumb" href="projetos.html" aria-label="${esc(p.nome)}, ${esc(p.tipo)}. Ver na página Projetos">
          <img src="${esc(p.imagem)}" alt="" loading="lazy">
          <span class="g-card__cap"><b>${esc(p.nome)}</b><small>${esc(p.tipo)}</small></span>
        </a>` : `
        <div class="g-card__thumb g-card__thumb--empty">
          <p><b>${esc(p.nome)}</b><small>${esc(p.tipo)}</small></p>
        </div>`;
      cards.appendChild(li);
    });
  }

  // As ondas da seção escura só andam enquanto ela está na tela.
  const work = document.querySelector('.g-work, .g-me');
  if (work && 'IntersectionObserver' in window) {
    new IntersectionObserver(([e]) => work.classList.toggle('is-away', !e.isIntersecting), { rootMargin: '100px 0px' }).observe(work);
  }

  /* ---------- Sobre: luz que segue o mouse na abertura escura ---------- */
  const spot = document.querySelector('[data-spot]');
  if (spot && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    let sx = 0, sy = 0, wait = false;
    spot.addEventListener('pointermove', e => {
      sx = e.clientX; sy = e.clientY;
      if (wait) return;
      wait = true;
      requestAnimationFrame(() => {
        const r = spot.getBoundingClientRect();
        spot.style.setProperty('--mx', (sx - r.left) + 'px');
        spot.style.setProperty('--my', (sy - r.top) + 'px');
        wait = false;
      });
    });
  }

  /* ---------- Sobre: varal de fotos (anda sozinho devagar; arrasta com o mouse ou o dedo) ---------- */
  const varal = document.querySelector('[data-varal]');
  if (varal) {
    const sec = varal.closest('.g-fotos');
    const calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let dir = 1, pos = 0, seen = false, hold = 0, grab = null, moved = false;
    const max = () => varal.scrollWidth - varal.clientWidth;
    const pause = (ms = 2600) => { hold = performance.now() + ms; };

    // arrastar com o mouse (no toque, a rolagem do próprio navegador já resolve)
    varal.addEventListener('pointerdown', e => {
      pause(60000);
      if (e.pointerType === 'touch' || e.button) return;
      grab = { x: e.clientX, left: varal.scrollLeft }; moved = false;
    });
    window.addEventListener('pointermove', e => {
      if (!grab) return;
      const dx = e.clientX - grab.x;
      if (!moved && Math.abs(dx) > 4) { moved = true; varal.classList.add('is-drag'); }
      if (moved) varal.scrollLeft = grab.left - dx;
    });
    const drop = () => { if (grab) { grab = null; varal.classList.remove('is-drag'); } pause(); };
    window.addEventListener('pointerup', drop);
    window.addEventListener('pointercancel', drop);
    ['wheel', 'touchstart', 'keydown'].forEach(ev => varal.addEventListener(ev, () => pause(), { passive: true }));
    varal.addEventListener('mouseenter', () => pause(60000));
    varal.addEventListener('mouseleave', () => { if (!grab) pause(900); });

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(([e]) => { seen = e.isIntersecting; if (sec) sec.classList.toggle('is-away', !seen); }, { rootMargin: '80px 0px' }).observe(varal);
    } else seen = true;

    if (!calm) {
      let last = performance.now();
      const tick = now => {
        const dt = Math.min(50, now - last); last = now;
        if (seen && now > hold && !grab && max() > 0) {
          // retoma de onde a pessoa deixou
          if (Math.abs(pos - varal.scrollLeft) > 2) pos = varal.scrollLeft;
          pos += dir * dt * 0.028;
          if (pos >= max()) { pos = max(); dir = -1; pause(1400); }
          if (pos <= 0) { pos = 0; dir = 1; pause(1400); }
          varal.scrollLeft = pos;
        }
        requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }
  }

  /* ---------- Sobre: duas metades (barra que arrasta) ---------- */
  const duo = document.querySelector('[data-duo]');
  if (duo) {
    const range = duo.querySelector('.g-duo__range');
    let raf = 0, used = false, down = false;
    const set = v => {
      v = Math.max(0, Math.min(100, v));
      duo.style.setProperty('--pos', v + '%');
      duo.style.setProperty('--p', v.toFixed(2));
      range.value = Math.round(v);
    };
    const fromX = x => { const r = duo.getBoundingClientRect(); set((x - r.left) / r.width * 100); };
    const mine = () => { used = true; cancelAnimationFrame(raf); };
    // largura do quadro, pra bolinha da barra não sair pela borda
    const size = () => duo.style.setProperty('--w', duo.clientWidth + 'px');
    size(); window.addEventListener('resize', size);
    // perto da ponta, a barra termina de ir sozinha: assim dá pra ver cada lado inteiro
    const glide = to => {
      const from = +range.value, t0 = performance.now();
      const step = now => {
        const t = Math.min(1, (now - t0) / 320);
        set(from + (to - from) * (1 - Math.pow(1 - t, 3)));
        if (t < 1) raf = requestAnimationFrame(step);
      };
      cancelAnimationFrame(raf); raf = requestAnimationFrame(step);
    };

    duo.addEventListener('pointerdown', e => {
      if (e.button) return;
      mine(); down = true; duo.classList.add('is-drag');
      try { duo.setPointerCapture(e.pointerId); } catch (_) {}
      // no toque, espera o dedo andar de lado (assim rolar a página não mexe na barra)
      if (e.pointerType !== 'touch') fromX(e.clientX);
    });
    duo.addEventListener('pointermove', e => { if (down) fromX(e.clientX); });
    const up = () => {
      if (!down) return;
      down = false; duo.classList.remove('is-drag');
      const v = +range.value;
      if (v > 86 && v < 100) glide(100); else if (v < 14 && v > 0) glide(0);
    };
    duo.addEventListener('pointerup', up);
    duo.addEventListener('pointercancel', up);
    range.addEventListener('input', () => { mine(); set(+range.value); });

    // Quando entra na tela, a barra vai e volta uma vez, pra mostrar que dá pra arrastar.
    const calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!calm && 'IntersectionObserver' in window) {
      const io = new IntersectionObserver(([e]) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        if (used) return;
        const keys = [50, 38, 62, 50], dur = 2200, t0 = performance.now() + 500;
        const ease = t => t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
        const step = now => {
          if (used) return;
          const t = Math.max(0, Math.min(1, (now - t0) / dur)) * (keys.length - 1);
          const i = Math.min(keys.length - 2, Math.floor(t));
          set(keys[i] + (keys[i + 1] - keys[i]) * ease(t - i));
          if (t < keys.length - 1) raf = requestAnimationFrame(step);
        };
        raf = requestAnimationFrame(step);
      }, { threshold: .5 });
      io.observe(duo);
    }
  }

  /* ---------- Currículo: crachá que balança ---------- */
  const desk = document.querySelector('.g-desk');
  const badge = desk && desk.querySelector('.g-badge');
  if (badge && !reduce) {
    // O crachá cai quando a seção aparece e fica pendurado de verdade: dá um quique curto no cordão, balança
    // um pouco e assenta em uns dois segundos. É um pêndulo com atrito leve,
    // calculado em passos fixos de tempo (igual em qualquer tela, 60 Hz ou 144 Hz).
    const W = 5.2, ATRITO = 4.4;      // balanço: velocidade do vaivém e quanto perde a cada segundo
    const K = 90, AMORT = 12;         // cordão: força da mola e amortecimento do quique
    const STEP = 1 / 120;
    let y = 0, vy = 0, ang = 0, va = 0, raf = 0, last = 0, acc = 0, on = false;
    const set = () => {
      badge.style.setProperty('--drop', `${y.toFixed(1)}px`);
      badge.style.setProperty('--swing', `${(ang * 57.2958).toFixed(2)}deg`);
    };
    const frame = now => {
      acc += Math.min(0.05, (now - last) / 1000); last = now;
      while (acc >= STEP) {
        vy += (-K * y - AMORT * vy) * STEP; y += vy * STEP;
        va += (-W * W * Math.sin(ang) - ATRITO * va) * STEP; ang += va * STEP;
        acc -= STEP;
      }
      set();
      if (Math.abs(y) > 0.2 || Math.abs(vy) > 2 || Math.abs(ang) > 0.004 || Math.abs(va) > 0.02) raf = requestAnimationFrame(frame);
      else { on = false; y = vy = ang = va = 0; badge.style.removeProperty('--drop'); badge.style.removeProperty('--swing'); }
    };
    const run = () => { if (on) return; on = true; last = performance.now(); acc = 0; raf = requestAnimationFrame(frame); };
    // no computador o crachá fica ao lado da folha e pode balançar largo; no celular fica em cima dela, então balança menos
    const largo = () => window.matchMedia('(min-width: 901px)').matches;
    const hide = () => { y = -(badge.offsetHeight + 80); vy = 0; ang = largo() ? -0.26 : -0.16; va = 0; set(); };

    // começa escondido acima da mesa (a seção fica bem abaixo da capa, então ninguém vê essa troca)
    hide();
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      hide();
      setTimeout(run, 250);
    }, { threshold: 0.3 });
    io.observe(desk);

    // passar o mouse dá um empurrãozinho, para o lado em que o mouse vinha
    if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
      let px = 0;
      desk.addEventListener('pointermove', e => { px = e.clientX; }, { passive: true });
      badge.addEventListener('pointerenter', e => {
        const dir = e.clientX >= px ? -1 : 1;
        va += dir * 0.9; run();
      });
    }
  }

  /* ---------- Quadro de conversa do Início: entrada "digitada" ---------- */
  // Uma vez só, quando o quadro aparece: pontinhos -> fala, pontinhos -> fala, depois as respostas uma a uma.
  // Sem isto (ou com "reduzir movimento") o quadro já aparece completo.
  const chat = document.querySelector('.g-chat');
  if (chat && !reduce && 'IntersectionObserver' in window) {
    const msgs = [...chat.querySelectorAll('.g-chat__msg')];
    const rest = [...chat.querySelectorAll('.g-chat__opts > *, .g-chat__free')];
    const wait = ms => new Promise(r => setTimeout(r, ms));
    chat.classList.add('is-live'); // a partir daqui o CSS esconde falas e respostas até a vez de cada uma
    const type = async (p, ms) => {
      const dots = document.createElement('i');
      dots.className = 'g-chat__dots';
      dots.innerHTML = '<i></i><i></i><i></i>';
      p.appendChild(dots);
      p.classList.add('is-typing');
      await wait(ms);
      dots.remove();
      p.classList.remove('is-typing');
      p.classList.add('is-in');
    };
    const run = async () => {
      await wait(400);
      for (const [i, p] of msgs.entries()) await type(p, i === 0 ? 800 : 1100);
      await wait(200);
      rest.forEach((el, i) => setTimeout(() => el.classList.add('is-in'), i * 120));
    };
    const io = new IntersectionObserver(entries => {
      if (entries.some(en => en.isIntersecting)) { io.disconnect(); run(); }
    }, { threshold: 0.35 });
    io.observe(chat);
  }

  /* ---------- Faixas de tecnologias ---------- */
  const stack = document.querySelector('.g-stack');
  const list = stack && stack.querySelector('.g-band > ul');
  if (list && !reduce) {
    const names = [...list.children].map(li => li.innerHTML); // ícone + nome, como está no HTML
    const ROWS = 2;
    const perRow = Math.ceil(names.length / ROWS);

    const belts = document.createElement('div');
    belts.className = 'g-belts';
    belts.setAttribute('aria-hidden', 'true'); // a lista original continua lá para leitores de tela
    const rows = [];
    for (let r = 0; r < ROWS; r++) {
      const items = names.slice(r * perRow, (r + 1) * perRow);
      if (!items.length) continue;
      const set = items.map(n => `<span class="g-chip">${n}</span>`).join('');
      const belt = document.createElement('div');
      belt.className = 'g-belt';
      // quatro cópias: sempre sobra faixa pra girar sem emenda, mesmo em telas bem largas
      belt.innerHTML = `<div class="g-belt__set">${set}</div>`.repeat(4);
      belts.appendChild(belt);
      rows.push({ el: belt, dir: r % 2 ? 1 : -1, speed: [1, 0.75, 1.3][r % 3], x: r * 180, w: 0 });
    }
    list.after(belts);
    stack.classList.add('is-live');
    const hint = document.createElement('span');
    hint.className = 'g-stack__hint';
    hint.textContent = window.matchMedia('(max-width: 760px)').matches ? 'arraste ↔' : 'role a página ou arraste ↔';
    stack.querySelector('.label').appendChild(hint);

    const measure = () => rows.forEach(row => { row.w = row.el.children[1].offsetLeft - row.el.children[0].offsetLeft; }); // largura de um conjunto + o espaço entre eles
    measure();
    window.addEventListener('resize', measure);
    if (document.fonts) document.fonts.ready.then(measure);

    let visible = false, lastY = window.scrollY, push = 0, fling = 0, dragX = null, raf = 0, lastT = 0;
    const tick = t => {
      raf = requestAnimationFrame(tick);
      const dt = Math.min(50, t - (lastT || t)) / 16.7; lastT = t;
      const y = window.scrollY;
      push += (y - lastY) * 0.35; lastY = y;   // a rolagem empurra as faixas (pra cima inverte o sentido)
      push *= Math.pow(0.9, dt);                // e o empurrão vai morrendo
      fling *= Math.pow(0.93, dt);              // impulso de quando solta o arrasto
      rows.forEach(row => {
        if (!row.w) return;
        if (dragX === null) row.x += row.dir * row.speed * (0.6 * dt + push * dt * 0.12) + fling * dt;
        row.x = ((row.x % row.w) + row.w) % row.w;
        row.el.style.transform = `translate3d(${row.x - row.w}px,0,0)`;
      });
    };
    new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      cancelAnimationFrame(raf);
      if (visible) { lastY = window.scrollY; lastT = 0; raf = requestAnimationFrame(tick); }
    }, { rootMargin: '100px 0px' }).observe(belts);

    // Arrastar: as faixas seguem o dedo/mouse, com um restinho de impulso ao soltar.
    belts.addEventListener('pointerdown', e => { if (e.pointerType === 'mouse' && e.button !== 0) return; dragX = e.clientX; belts.classList.add('is-dragging'); });
    window.addEventListener('pointermove', e => {
      if (dragX === null) return;
      const dx = e.clientX - dragX; dragX = e.clientX;
      rows.forEach(row => { row.x += dx; });
      fling = dx;
    });
    const drop = () => { dragX = null; belts.classList.remove('is-dragging'); };
    window.addEventListener('pointerup', drop);
    window.addEventListener('pointercancel', drop);
  }
})();
