/*
  Vedoo — Hero da home (<section class="vh">). Só roda se a .vh existir.
  1) Entrada dos elementos.
  2) Personagem: igual à capa antiga. Mouse em cima = piscadinha, clique = boca aberta,
     pisca sozinho de vez em quando e inclina de leve na direção do mouse.
  3) "Como funciona": o destaque passa sozinho pelos passos (e segue o mouse).
     No passo 3, o "show" do foguete (rocketShow, no fim do arquivo).
  4) Formas cromadas sobem/descem ao rolar.
  5) "Para quem eu faço": as capas começam juntas no meio e se espalham ao rolar.
*/
(() => {
  if (!document.querySelector(".vh")) return;
  const root = document.documentElement;
  const REDUCED = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const FINE = matchMedia("(hover: hover) and (pointer: fine)").matches;

  /* entrada: espera as fontes (no máximo 1,2s) para o título não "pular" */
  const start = () => root.classList.add("vh-ready");
  const fontsReady = document.fonts ? document.fonts.ready : Promise.resolve();
  Promise.race([fontsReady, new Promise((r) => setTimeout(r, 1200))]).then(start);

  document.addEventListener("DOMContentLoaded", () => {
    const hero = document.querySelector(".vh");

    /* ---------- Personagem ---------- */
    const face = hero.querySelector(".vh-face");
    if (face) {
      const imgs = [...face.querySelectorAll("img[data-face]")];
      const tilt = face.querySelector(".vh-avatar__tilt");
      const chipText = hero.querySelector(".vh-avatar__chip-text");
      const chip = hero.querySelector(".vh-avatar__chip");
      const chips = { sorriso: "Oi!", piscada: "Fechou!", surpreso: "Uau!" };
      let hold = null;       // expressão "travada" por um tempo (clique ou piscada automática)
      let hovering = false;
      // troca a expressão; o balãozinho acompanha (menos na piscada automática)
      const show = (name, withChip = true) => {
        imgs.forEach((img) => img.classList.toggle("is-on", img.dataset.face === name));
        if (withChip && chipText && chipText.textContent !== chips[name]) {
          chipText.textContent = chips[name];
          chip.classList.remove("is-pop"); void chip.offsetWidth; chip.classList.add("is-pop");
        }
      };
      imgs.forEach((img) => { if (img.decode) img.decode().catch(() => {}); }); // troca instantânea
      const rest = () => show(hovering ? "piscada" : "sorriso");
      const flash = (name, ms) => {
        clearTimeout(hold);
        show(name);
        hold = setTimeout(() => { hold = null; rest(); }, ms);
      };

      face.addEventListener("pointerenter", (e) => { if (e.pointerType === "mouse") { hovering = true; if (!hold) rest(); } });
      face.addEventListener("pointerleave", () => { hovering = false; if (!hold) rest(); });
      face.addEventListener("click", () => flash("surpreso", 900));

      if (!REDUCED) {
        // Pisca sozinho de vez em quando (sem trocar o balãozinho).
        let away = false;
        setInterval(() => {
          if (hold || hovering || away || document.hidden) return;
          show("piscada", false);
          hold = setTimeout(() => { hold = null; rest(); }, 420);
        }, 5200);
        if ("IntersectionObserver" in window) {
          new IntersectionObserver(([e]) => { away = !e.isIntersecting; }).observe(face);
        }

        // Inclina de leve na direção do mouse.
        if (FINE && tilt) {
          let raf = 0;
          hero.addEventListener("pointermove", (e) => {
            cancelAnimationFrame(raf);
            raf = requestAnimationFrame(() => {
              const r = face.getBoundingClientRect();
              const dx = (e.clientX - (r.left + r.width / 2)) / innerWidth;
              const dy = (e.clientY - (r.top + r.height / 2)) / innerHeight;
              tilt.style.setProperty("--rz", `${(dx * 9).toFixed(2)}deg`);
              tilt.style.setProperty("--tx", `${(dx * 16).toFixed(1)}px`);
              tilt.style.setProperty("--ty", `${(dy * 12).toFixed(1)}px`);
            });
          });
          hero.addEventListener("pointerleave", () => ["--rz", "--tx", "--ty"].forEach((p) => tilt.style.removeProperty(p)));
        }
      }
    }

    /* ---------- Como funciona ---------- */
    const steps = [...hero.querySelectorAll(".vh-card")];
    if (steps.length) {
      let i = 0, paused = false, showing = false;
      const set = (n) => { i = n; steps.forEach((s, k) => s.classList.toggle("is-active", k === n)); };
      const launchCard = steps[2];
      let seen = false, lastShow = 0;

      // O "show" do foguete: roda sozinho na primeira vez que o passo 3 aparece na tela
      // e depois sempre que a pessoa passa o mouse/toca no card 3 (com um intervalo mínimo).
      const tryShow = (force) => {
        if (REDUCED || showing || !launchCard) return;
        if (!force && seen) return;
        if (Date.now() - lastShow < 5000) return;
        const r = launchCard.getBoundingClientRect();
        if (r.bottom < 0 || r.top > innerHeight) return;
        seen = true; showing = true; paused = true; lastShow = Date.now();
        set(2);
        rocketShow(launchCard).then(() => { showing = false; paused = false; });
      };

      steps.forEach((s, k) => {
        s.addEventListener("pointerenter", () => { paused = true; set(k); if (k === 2) tryShow(true); });
        s.addEventListener("pointerleave", () => { if (!showing) paused = false; });
      });
      if (launchCard) launchCard.addEventListener("click", () => tryShow(true));
      if (!REDUCED) setInterval(() => {
        if (paused || document.hidden) return;
        set((i + 1) % steps.length);
        if (i === 2) tryShow(false);
      }, 3200);
    }

    /* ---------- Para quem eu faço (nichos): capas que se espalham ao rolar ---------- */
    const vn = document.querySelector(".vn");
    if (vn) {
      // Coonsulta só entra se a imagem existir (assets/projetos/coonsulta.webp); senão fica a Dra. Sofia.
      const coon = vn.querySelector('[data-swap="coonsulta"]'), sofia = vn.querySelector("[data-swap-fallback]");
      if (coon && sofia) {
        coon.hidden = true;
        const probe = new Image();
        probe.onload = () => { coon.hidden = false; sofia.remove(); measure(); update(); };
        probe.onerror = () => coon.remove();
        probe.src = coon.querySelector("img").getAttribute("src");
      }

      const panel = vn.querySelector(".vn-panel");
      const desk = matchMedia("(min-width: 1101px) and (min-height: 621px)");
      let cards = [], ticking = false;
      const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
      const ease = (t) => (t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
      function measure() {
        cards = [...vn.querySelectorAll(".vn-card:not([hidden])")].map((c) => {
          c.style.removeProperty("--dx"); c.style.removeProperty("--dy"); c.style.removeProperty("--sc");
          const cx = c.offsetLeft + c.offsetWidth / 2, cy = c.offsetTop + c.offsetHeight / 2;
          return { c, dx: (panel.clientWidth / 2 - cx) * .8, dy: (panel.clientHeight / 2 - cy) * .8 };
        });
      }
      function update() {
        ticking = false;
        if (!desk.matches || REDUCED) {
          cards.forEach(({ c }) => ["--dx", "--dy", "--sc"].forEach((p) => c.style.removeProperty(p)));
          ["--vn-to", "--vn-ts", "--vn-co"].forEach((p) => panel.style.removeProperty(p));
          return;
        }
        const r = vn.getBoundingClientRect(), cs = getComputedStyle(vn);
        const padT = parseFloat(cs.paddingTop) || 0, padB = parseFloat(cs.paddingBottom) || 0; // a versão escura tem respiro em cima/embaixo
        const p = clamp((-r.top - padT) / Math.max(1, r.height - padT - padB - innerHeight), 0, 1);
        const e = ease(clamp((p - .04) / .62, 0, 1));
        cards.forEach(({ c, dx, dy }) => {
          c.style.setProperty("--dx", `${(dx * (1 - e)).toFixed(1)}px`);
          c.style.setProperty("--dy", `${(dy * (1 - e)).toFixed(1)}px`);
          c.style.setProperty("--sc", (.6 + .4 * e).toFixed(3));
        });
        panel.style.setProperty("--vn-to", (.2 + .8 * e).toFixed(3));
        panel.style.setProperty("--vn-ts", (.9 + .1 * e).toFixed(3));
        panel.style.setProperty("--vn-co", clamp((e - .78) / .22, 0, 1).toFixed(3));
      }
      // Fundo da página escurece conforme rola: vai ficando "sombrio" antes da seção, fica escuro com as capas
      // e clareia de volta quando chega em "O que eu faço". (Sem JS ou com "reduzir movimento", fica o degradê fixo do CSS.)
      const main = document.querySelector("main.g");
      const shadeOn = vn.classList.contains("vn--dark") && main && !REDUCED;
      if (shadeOn) vn.classList.add("vn--scroll");
      const clean = vn.classList.contains("vn--clean"); // variante "preto limpo": preto neutro e transição mais curta
      const PAPER = [239, 237, 232], DARK = clean ? [12, 12, 12] : [11, 17, 20];
      function shade() {
        if (!shadeOn) return;
        const r = vn.getBoundingClientRect(), cs = getComputedStyle(vn), vh = innerHeight;
        const padT = parseFloat(cs.paddingTop) || 0, padB = parseFloat(cs.paddingBottom) || 0;
        const startIn = clean ? vh * .55 : vh, endOut = clean ? vh * .78 : vh * .55;
        const into = clamp((startIn - r.top) / (startIn + padT), 0, 1);                  // entrando: 0 → 1 até o painel chegar no topo
        const out = clean
          ? clamp((r.bottom - vh * .7) / (vh * .5), 0, 1)                               // claro quando "O que eu faço" chega a 70% da tela
          : clamp((r.bottom - endOut) / (padB + vh - endOut), 0, 1);                    // saindo: 1 → 0 até "O que eu faço" aparecer
        const d = Math.min(ease(into), ease(out));
        const c = PAPER.map((v, k) => Math.round(v + (DARK[k] - v) * d));
        main.style.backgroundColor = `rgb(${c[0]}, ${c[1]}, ${c[2]})`;
        vn.style.setProperty("--vn-dark", d.toFixed(3));
      }
      const onScroll = () => { update(); shade(); };
      measure(); onScroll();
      addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
      addEventListener("resize", () => { measure(); onScroll(); });
      if (desk.addEventListener) desk.addEventListener("change", () => { measure(); update(); });
    }

    /* ---------- Formas cromadas sobem/descem ao rolar (em sentidos opostos) ---------- */
    const shapes = [[hero.querySelector(".vh-chrome--squiggle"), 1], [hero.querySelector(".vh-chrome--torus"), -1]];
    if (!REDUCED) {
      let ticking = false;
      const update = () => {
        ticking = false;
        const p = Math.max(-1, Math.min(1, window.scrollY / 500));
        shapes.forEach(([el, dir]) => el && el.style.setProperty("--py", `${p * 38 * dir}px`));
      };
      addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
      update();
    }
  });
  /* ==========================================================================
     Show do foguete (passo 3): o foguetinho laranja decola da caixinha, voa deixando
     fumaça, estoura num "PUFF!" e um foguete novo desce e pousa no lugar.
     Tudo numa camada por cima da página (.vh-fx), só com transform/opacity.
     ========================================================================== */
  // O mesmo foguetinho de traço da caixinha do passo 3, em laranja (desenhado de pé; o JS gira na direção do voo).
  const ROCKET_SVG = `<svg viewBox="0 0 24 24" width="150" height="150" shape-rendering="geometricPrecision" aria-hidden="true">
    <defs><linearGradient id="vhRocketGrad" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ff7f00"/><stop offset="1" stop-color="#e5383b"/></linearGradient></defs>
    <g transform="rotate(-45 12 12)">
      <path class="vh-fx-flame" d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" fill="#ffd36b" stroke="#ffb000" stroke-width="1.2" stroke-linejoin="round"/>
      <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" fill="#fff" stroke="url(#vhRocketGrad)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" fill="#fff" stroke="url(#vhRocketGrad)" stroke-width="1.5" stroke-linejoin="round"/>
      <circle cx="16.2" cy="7.8" r="1.7" fill="#fff" stroke="url(#vhRocketGrad)" stroke-width="1.3"/>
    </g>
  </svg>`;
  const EASE = "cubic-bezier(.16, 1, .3, 1)";
  // O foguete é desenhado já no tamanho máximo (150px) e só é DIMINUÍDO no voo: aumentar uma imagem
  // pequena borra, diminuir uma grande fica nítido. ROCKET_K converte a escala antiga (base 92px).
  const ROCKET_K = 92 / 150;
  // Muda o TAMANHO de verdade do foguete a cada quadro (em vez de "scale"): o Safari do iPhone guarda uma
  // foto do elemento no tamanho inicial e só estica, o que pixela. Redimensionando, o SVG é redesenhado nítido.
  const sizeRocket = (el, s) => { const px = Math.max(8, 150 * s * ROCKET_K); el.style.width = el.style.height = `${px.toFixed(1)}px`; el.style.margin = `${(-px / 2).toFixed(1)}px 0 0 ${(-px / 2).toFixed(1)}px`; };
  const rnd = (a, b) => a + Math.random() * (b - a);
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const center = (el) => { const r = el.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; };
  const bez = (p0, p1, p2, p3, t) => {
    const u = 1 - t;
    return {
      x: u * u * u * p0.x + 3 * u * u * t * p1.x + 3 * u * t * t * p2.x + t * t * t * p3.x,
      y: u * u * u * p0.y + 3 * u * u * t * p1.y + 3 * u * t * t * p2.y + t * t * t * p3.y,
    };
  };

  function el(layer, cls, html) {
    const d = document.createElement("div");
    d.className = cls;
    if (html) d.innerHTML = html;
    layer.appendChild(d);
    return d;
  }
  const at = (x, y, extra = "") => `translate(${x}px, ${y}px) ${extra}`;

  function puff(layer, x, y, { size = 22, life = 750, drift = 18, cls = "vh-fx-puff" } = {}) {
    const p = el(layer, cls);
    p.style.width = p.style.height = `${size}px`;
    p.style.margin = `${-size / 2}px 0 0 ${-size / 2}px`;
    const dx = rnd(-drift, drift), dy = rnd(-drift, drift * .4);
    p.animate([
      { transform: at(x, y, "scale(.35)"), opacity: .95 },
      { transform: at(x + dx, y + dy, "scale(1.25)"), opacity: .75, offset: .45 },
      { transform: at(x + dx * 1.6, y + dy * 1.6 - 10, "scale(1.6)"), opacity: 0 },
    ], { duration: life, easing: "ease-out" }).finished.then(() => p.remove());
  }

  function explode(layer, x, y) {
    // clarão
    const f = el(layer, "vh-fx-flash");
    f.animate([
      { transform: at(x, y, "scale(.1)"), opacity: 1 },
      { transform: at(x, y, "scale(1.6)"), opacity: 0 },
    ], { duration: 420, easing: "ease-out" }).finished.then(() => f.remove());

    // tracinhos de impacto (bem cartoon)
    for (let k = 0; k < 12; k++) {
      const a = (k / 12) * 360 + rnd(-8, 8);
      const s = el(layer, "vh-fx-spark");
      const r0 = 26, r1 = rnd(78, 110);
      s.animate([
        { transform: at(x, y, `rotate(${a}deg) translateY(${-r0}px) scaleY(.2)`), opacity: 1 },
        { transform: at(x, y, `rotate(${a}deg) translateY(${-r1 * .7}px) scaleY(1)`), opacity: 1, offset: .45 },
        { transform: at(x, y, `rotate(${a}deg) translateY(${-r1}px) scaleY(.1)`), opacity: 0 },
      ], { duration: 520, easing: "cubic-bezier(.2, .8, .3, 1)" }).finished.then(() => s.remove());
    }

    // nuvem de fumaça (bolotas com contorno)
    const blobs = [[0, 0, 74], [-42, 8, 52], [42, 6, 56], [-22, -30, 50], [24, -30, 48], [-50, -18, 36], [52, -16, 38], [0, 30, 46]];
    blobs.forEach(([dx, dy, sz], k) => {
      const c = el(layer, "vh-fx-cloud");
      c.style.width = c.style.height = `${sz}px`;
      c.style.margin = `${-sz / 2}px 0 0 ${-sz / 2}px`;
      c.animate([
        { transform: at(x, y, "scale(0)"), opacity: 1 },
        { transform: at(x + dx, y + dy, "scale(1.12)"), opacity: 1, offset: .22 },
        { transform: at(x + dx * 1.08, y + dy - 6, "scale(1)"), opacity: 1, offset: .6 },
        { transform: at(x + dx * 1.3, y + dy - 34, "scale(.55)"), opacity: 0 },
      ], { duration: 2300 + k * 60, easing: "ease-out", delay: k * 18, fill: "backwards" }) // backwards: durante o delay já fica no 1º quadro, senão aparece no canto (0,0).finished.then(() => c.remove());
    });

    // confete e estrelinhas com gravidade
    const colors = ["#ff7f00", "#e5383b", "#ffd36b", "#7fd3ff", "#ffffff", "#1a1a1a"];
    for (let k = 0; k < 26; k++) {
      const b = el(layer, k % 3 ? "vh-fx-bit" : "vh-fx-bit vh-fx-bit--star");
      b.style.background = colors[k % colors.length];
      const a = rnd(0, Math.PI * 2), v = rnd(110, 230);
      const vx = Math.cos(a) * v, vy = Math.sin(a) * v - 90, g = 420;
      const frames = [];
      for (let n = 0; n <= 10; n++) {
        const t = n / 10 * 1.15;
        frames.push({ transform: at(x + vx * t, y + vy * t + .5 * g * t * t, `rotate(${n * rnd(40, 70)}deg) scale(${1 - n * .05})`), opacity: n < 7 ? 1 : 1 - (n - 6) / 4 });
      }
      b.animate(frames, { duration: 1150, easing: "linear" }).finished.then(() => b.remove());
    }

    // "PUFF!"
    const t = el(layer, "vh-fx-text", "PUFF!");
    t.animate([
      { transform: at(x, y - 6, "translate(-50%, -50%) rotate(-10deg) scale(.2)"), opacity: 0 },
      { transform: at(x, y - 6, "translate(-50%, -50%) rotate(-6deg) scale(1.15)"), opacity: 1, offset: .2 },
      { transform: at(x, y - 10, "translate(-50%, -50%) rotate(-4deg) scale(1)"), opacity: 1, offset: .65 },
      { transform: at(x, y - 34, "translate(-50%, -50%) rotate(-2deg) scale(.9)"), opacity: 0 },
    ], { duration: 1300, easing: "ease-out", delay: 60, fill: "backwards" }).finished.then(() => t.remove());
  }

  async function rocketShow(card) {
    const icon = card.querySelector(".vh-card__icon-in");
    const box = card.querySelector(".vh-card__icon");
    const layer = document.createElement("div");
    layer.className = "vh-fx";
    document.body.appendChild(layer);
    card.classList.add("is-show");

    // 1) treme na caixinha
    icon.classList.add("is-shaking");
    await wait(420);
    icon.classList.remove("is-shaking");
    card.classList.add("is-away"); // some o foguetinho do ícone

    // 2) voo até o meio da tela
    const p0 = center(icon);
    // destino: a área vazia do lado esquerdo do avatar (no celular, o alto da tela), pra não estourar em cima do rosto
    const av = document.querySelector(".vh-avatar"), panel = document.querySelector(".vh-intro__panel");
    let p3 = { x: innerWidth / 2, y: Math.max(130, innerHeight * .26) };
    if (av && panel && innerWidth > 1180) {
      const ar = av.getBoundingClientRect(), pr = panel.getBoundingClientRect();
      p3 = { x: (pr.left + ar.left) / 2 + rnd(-20, 20), y: Math.min(Math.max(150, ar.top + ar.height * .2), innerHeight * .5) };
    }
    const side = p0.x < p3.x ? -1 : 1;
    let p1 = { x: p0.x + side * 30, y: p0.y - Math.min(300, innerHeight * .35) };
    let p2 = { x: p3.x + side * Math.min(260, innerWidth * .25), y: p3.y + 160 };
    if (av && innerWidth > 1180) {
      // no computador: sobe e faz um arco por cima da cabeça antes de chegar no destino
      const top = Math.max(40, av.getBoundingClientRect().top - 120);
      p1 = { x: p0.x - 20, y: top };
      p2 = { x: p3.x + Math.min(320, innerWidth * .22), y: top - 40 };
    }
    const rocket = el(layer, "vh-fx-rocket", ROCKET_SVG);
    const dur = 1250;
    await new Promise((resolve) => {
      const t0 = performance.now();
      let lastPuff = 0;
      const frame = (now) => {
        const lin = Math.min(1, (now - t0) / dur);
        const t = lin < .5 ? 2 * lin * lin : 1 - Math.pow(-2 * lin + 2, 2) / 2; // acelera e chega
        const p = bez(p0, p1, p2, p3, t);
        const q = bez(p0, p1, p2, p3, Math.min(1, t + .02));
        const ang = Math.atan2(q.y - p.y, q.x - p.x) * 180 / Math.PI + 90;
        const sc = .32 + Math.sin(Math.min(1, lin * 1.15) * Math.PI / 2) * 1.08;
        sizeRocket(rocket, sc);
        rocket.style.transform = `translate(${p.x}px, ${p.y}px) rotate(${ang}deg)`;
        if (now - lastPuff > 34) { // rastro de fumaça saindo da cauda
          lastPuff = now;
          const rad = (ang + 90) * Math.PI / 180;
          puff(layer, p.x + Math.cos(rad) * 36 * sc, p.y + Math.sin(rad) * 36 * sc, { size: 10 + 22 * sc, life: 1000, drift: 10 });
        }
        if (lin < 1) requestAnimationFrame(frame); else resolve();
      };
      requestAnimationFrame(frame);
    });

    // 3) PUFF!
    rocket.remove();
    explode(layer, p3.x, p3.y);
    await wait(950);

    // 4) foguete novo desce do topo e pousa na caixinha
    const target = center(icon);
    const lander = el(layer, "vh-fx-rocket is-landing", ROCKET_SVG);
    const startY = -90;
    const land = 1500;
    await new Promise((resolve) => {
      const t0 = performance.now();
      let lastPuff = 0;
      const frame = (now) => {
        const lin = Math.min(1, (now - t0) / land);
        const t = 1 - Math.pow(1 - lin, 3); // freando
        const y = startY + (target.y - startY) * t;
        const wob = Math.sin(lin * Math.PI * 5) * 5 * (1 - lin);
        const sc = 1 - .7 * Math.pow(lin, 1.6);
        const ang = lin > .82 ? 45 * ((lin - .82) / .18) : wob; // no finalzinho inclina igual ao ícone
        sizeRocket(lander, sc);
        lander.style.transform = `translate(${target.x + wob * .6}px, ${y}px) rotate(${ang}deg)`;
        if (lin > .15 && now - lastPuff > 60 && lin < .9) {
          lastPuff = now;
          puff(layer, target.x + rnd(-6, 6), y + 38 * sc, { size: 12 * sc + 8, life: 650, drift: 14 });
        }
        if (lin < 1) requestAnimationFrame(frame); else resolve();
      };
      requestAnimationFrame(frame);
    });
    lander.remove();

    // 5) pousou: volta o ícone com um "pulinho" e levanta poeira
    card.classList.remove("is-away");
    icon.classList.add("is-landed");
    const b = center(box);
    for (let k = 0; k < 6; k++) puff(layer, b.x + (k < 3 ? -1 : 1) * rnd(18, 34), b.y + rnd(14, 24), { size: rnd(12, 20), life: 700, drift: 22 });
    await wait(800);
    icon.classList.remove("is-landed");
    card.classList.remove("is-show");
    layer.remove();
  }
})();
