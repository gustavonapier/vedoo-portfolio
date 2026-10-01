/*
  Preview de projeto.
  Qualquer elemento com data-preview abre o site dentro de uma janela, sem sair da Vedoo.
  O site roda de verdade (com as animações dele), mas os links internos não levam pra fora.

  Atributos: data-preview (endereço do site), data-title, data-tipo, data-url (texto da barra), data-poster (print pra mostrar enquanto carrega).
*/
(() => {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  // Largura da tela "virtual" no modo computador. O site é desenhado nessa largura e reduzido pra caber
  // na janela, igual a ver num monitor grande. Quanto maior o número, menor o site aparece.
  const DESKTOP_WIDTH = 1600;
  const ease = 'cubic-bezier(.22, .8, .2, 1)';
  let dlg, frame, body, iframe, poster, title, tipo, url, origin = null, closing = false;

  const build = () => {
    dlg = document.createElement('dialog');
    dlg.className = 'preview';
    dlg.setAttribute('aria-labelledby', 'preview-title');
    dlg.setAttribute('data-lenis-prevent', '');
    dlg.innerHTML = `
      <div class="preview__top">
        <div class="preview__name">
          <h2 id="preview-title" class="preview__title"></h2>
          <p class="preview__tipo"></p>
        </div>
        <div class="preview__tools">
          <div class="preview__devices" role="group" aria-label="Tamanho da tela">
            <button type="button" data-device="desktop" aria-pressed="true">Computador</button>
            <button type="button" data-device="mobile" aria-pressed="false">Celular</button>
          </div>
          <button type="button" class="preview__close">Fechar <span aria-hidden="true">×</span></button>
        </div>
      </div>
      <div class="preview__frame">
        <div class="win__bar" aria-hidden="true"><i class="is-red"></i><i></i><i></i><span class="preview__url"></span></div>
        <div class="preview__body">
          <img class="preview__poster" alt="">
          <iframe class="preview__site" title="Preview do projeto" sandbox="allow-scripts allow-same-origin"></iframe>
        </div>
      </div>
      <div class="preview__bottom">
        <p class="preview__hint"><span aria-hidden="true">↕</span> Role dentro da página para explorar</p>
        <a class="btn" href="contato.html">Quero um site assim <span aria-hidden="true">→</span></a>
      </div>`;
    document.body.appendChild(dlg);
    frame = dlg.querySelector('.preview__frame');
    body = dlg.querySelector('.preview__body');
    iframe = dlg.querySelector('.preview__site');
    poster = dlg.querySelector('.preview__poster');
    title = dlg.querySelector('.preview__title');
    tipo = dlg.querySelector('.preview__tipo');
    url = dlg.querySelector('.preview__url');

    iframe.addEventListener('load', () => {
      const src = iframe.getAttribute('src');
      if (!src || src === 'about:blank') return;
      iframe.classList.add('is-loaded');
      poster.hidden = true;
      // É só um preview: links pra fora (WhatsApp, Instagram...) não saem daqui.
      try {
        iframe.contentDocument.addEventListener('click', e => {
          const a = e.target.closest && e.target.closest('a[href]');
          if (a && a.origin !== window.location.origin) e.preventDefault();
        }, true);
      } catch (err) { /* outro domínio: o sandbox já segura */ }
    });
    dlg.querySelector('.preview__close').addEventListener('click', close);
    dlg.addEventListener('cancel', e => { e.preventDefault(); close(); });
    dlg.addEventListener('click', e => { if (e.target === dlg) close(); });
    dlg.querySelectorAll('[data-device]').forEach(btn => btn.addEventListener('click', () => {
      const mobile = btn.dataset.device === 'mobile';
      dlg.classList.toggle('preview--mobile', mobile);
      dlg.querySelectorAll('[data-device]').forEach(b => b.setAttribute('aria-pressed', String(b === btn)));
      fit();
    }));
    new ResizeObserver(fit).observe(body);
  };

  // Modo computador: tela virtual de DESKTOP_WIDTH reduzida pra caber. Celular e telas pequenas: tamanho real.
  const fit = () => {
    const desktop = !dlg.classList.contains('preview--mobile') && window.innerWidth > 760;
    const w = body.clientWidth, h = body.clientHeight;
    const k = desktop && w ? Math.min(1, w / DESKTOP_WIDTH) : 1;
    iframe.classList.toggle('is-desktop', desktop);
    iframe.style.setProperty('--pv-k', k);
    iframe.style.setProperty('--pv-w', `${w / k}px`);
    iframe.style.setProperty('--pv-h', `${h / k}px`);
  };

  // Palavras do título sobem, igual aos títulos do site.
  const setTitle = text => {
    title.textContent = '';
    text.split(' ').forEach((word, i) => {
      const w = document.createElement('span');
      w.className = 'w';
      const inner = document.createElement('span');
      inner.className = 'wi';
      inner.textContent = word;
      w.appendChild(inner);
      title.appendChild(w);
      title.appendChild(document.createTextNode(' '));
      if (!reduce) inner.animate([{ transform: 'translateY(115%)' }, { transform: 'none' }], { duration: 900, delay: 250 + i * 70, easing: ease, fill: 'both' });
    });
  };

  // Transforma o retângulo de "de onde veio" no retângulo final (efeito de a janela crescer).
  const flip = (el, invert) => {
    const to = frame.getBoundingClientRect();
    const from = el.getBoundingClientRect();
    const r = parseFloat(getComputedStyle(el).getPropertyValue('--r')) || 0;
    const dx = from.left + from.width / 2 - (to.left + to.width / 2);
    const dy = from.top + from.height / 2 - (to.top + to.height / 2);
    const s = Math.min(from.width / to.width, from.height / to.height);
    const start = `translate(${dx}px, ${dy}px) scale(${s}) rotate(${r}deg)`;
    const frames = invert ? [{ transform: 'none', opacity: 1 }, { transform: start, opacity: 0.6 }] : [{ transform: start, opacity: 0.6 }, { transform: 'none', opacity: 1 }];
    return frame.animate(frames, { duration: invert ? 520 : 760, easing: invert ? 'cubic-bezier(.6, 0, .4, 1)' : ease });
  };

  function open(el) {
    if (!dlg) build();
    dlg.getAnimations({ subtree: true }).forEach(a => a.cancel());
    closing = false;
    origin = el;
    const d = el.dataset;
    setTitle(d.title || '');
    tipo.textContent = d.tipo || '';
    url.textContent = d.url || '';
    iframe.title = `Preview do site ${d.title || ''}`.trim();
    iframe.classList.remove('is-loaded');
    if (d.poster) { poster.src = d.poster; poster.hidden = false; } else { poster.hidden = true; }
    dlg.classList.remove('preview--mobile');
    dlg.querySelectorAll('[data-device]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.device === 'desktop')));
    document.documentElement.classList.add('has-preview');
    dlg.showModal();
    fit();
    iframe.src = d.preview;
    if (!reduce) {
      const visible = el.getBoundingClientRect().width > 0;
      if (visible) flip(el, false);
      dlg.querySelectorAll('.preview__top, .preview__bottom').forEach((n, i) =>
        n.animate([{ opacity: 0, transform: `translateY(${i ? 12 : -12}px)` }, { opacity: 1, transform: 'none' }], { duration: 600, delay: 280, easing: ease, fill: 'both' }));
    }
    dlg.querySelector('.preview__close').focus({ preventScroll: true });
  }

  function close() {
    if (!dlg || !dlg.open || closing) return;
    closing = true;
    const done = () => {
      dlg.close();
      iframe.src = 'about:blank';
      iframe.classList.remove('is-loaded');
      document.documentElement.classList.remove('has-preview');
      if (origin) origin.focus({ preventScroll: true });
      closing = false;
    };
    const visible = origin && origin.getBoundingClientRect().width > 0;
    if (reduce || !visible) return done();
    dlg.querySelectorAll('.preview__top, .preview__bottom').forEach(n => n.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 200, fill: 'forwards' }));
    flip(origin, true).finished.then(done, done);
  }

  document.addEventListener('click', e => {
    const el = e.target.closest('[data-preview]');
    if (!el || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey) return;
    e.preventDefault();
    open(el);
  });

  window.VedooPreview = { open, close };
})();
