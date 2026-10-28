const root = document.documentElement;
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
root.classList.add('motion');

// A abertura sempre começa do topo.
if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
if (!location.hash) window.scrollTo(0, 0);

/* ---------- Abertura (só no portfolio.html) ---------- */
// A sequência roda em CSS toda vez que a página carrega. Aqui só marcamos o fim.
const intro = document.querySelector('.intro');
const goLive = () => root.classList.add('is-live');
if (reduceMotion || !intro || root.classList.contains('no-intro')) {
  goLive();
} else {
  setTimeout(goLive, 3300);
}

/* ---------- Cabeçalho ---------- */
const header = document.querySelector('.header');
const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 40);
onScroll();
window.addEventListener('scroll', onScroll, { passive: true });

/* ---------- Menu (celular) ----------
   Painel que desce do topo (em vez de aparecer de uma vez), links entrando um por um,
   página atual marcada e atalhos de WhatsApp/Instagram. Fecha animado: no X, tocando fora, no Esc ou num link. */
const menu = document.querySelector('#menu');
const trigger = document.querySelector('.menu-toggle');
if (menu && trigger) {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const links = menu.querySelector('.menu__links');

  // monta os extras uma vez só (assim nenhuma página precisa repetir esse HTML)
  if (links && !menu.querySelector('.menu__actions')) {
    const here = (location.pathname.replace(/\/$/, '').split('/').pop() || 'index').replace('.html', '') || 'index';
    [...links.querySelectorAll('a')].forEach((a, i) => {
      const name = (a.getAttribute('href') || '').replace(/^\//, '').replace('.html', '').replace(/\/$/, '') || 'index';
      a.style.setProperty('--i', i);
      a.insertAdjacentHTML('afterbegin', `<small>${String(i + 1).padStart(2, '0')}</small>`);
      a.insertAdjacentHTML('beforeend', '<i aria-hidden="true"><svg viewBox="0 0 24 24" width="18" height="18"><path d="M7 17 17 7M9 7h8v8" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></i>');
      if (name === here) a.setAttribute('aria-current', 'page');
    });
    links.insertAdjacentHTML('afterend', `
      <div class="menu__actions">
        <a class="menu__zap" href="https://wa.me/5521974127756?text=Ol%C3%A1%2C%20Gustavo!%20Vim%20pelo%20site%20da%20Vedoo." target="_blank" rel="noopener">
          <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M12 3.5a8.5 8.5 0 0 0-7.3 12.8L3.5 20.5l4.3-1.1A8.5 8.5 0 1 0 12 3.5Z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M9 8.6c.3-.6.9-.6 1.1 0l.6 1.4c.1.3 0 .6-.2.8l-.5.5c.6 1.2 1.6 2.2 2.8 2.8l.5-.5c.2-.2.5-.3.8-.2l1.4.6c.6.2.6.8 0 1.1-.9.6-2 .7-3 .2a8 8 0 0 1-3.7-3.7c-.5-1-.4-2.1.2-3Z" fill="currentColor"/></svg>
          Chamar no WhatsApp
        </a>
        <a class="menu__insta" href="https://instagram.com/gustavovedoo" target="_blank" rel="noopener" aria-label="Instagram @gustavovedoo">
          <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><rect x="3.5" y="3.5" width="17" height="17" rx="5" fill="none" stroke="currentColor" stroke-width="1.8"/><circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" stroke-width="1.8"/><circle cx="17" cy="7" r="1.1" fill="currentColor"/></svg>
        </a>
      </div>`);
  }

  let closing = null;
  const open = () => {
    clearTimeout(closing); closing = null;
    if (!menu.open) menu.showModal();
    document.documentElement.classList.add('menu-open');
    requestAnimationFrame(() => requestAnimationFrame(() => menu.classList.add('is-open')));
    trigger.setAttribute('aria-expanded', 'true');
  };
  const shut = (after) => {
    if (!menu.open || closing) return;
    menu.classList.remove('is-open');
    menu.classList.add('is-closing');
    closing = setTimeout(() => {
      closing = null;
      menu.classList.remove('is-closing');
      menu.close();
      document.documentElement.classList.remove('menu-open');
      if (after) after();
    }, reduce ? 0 : 380);
  };
  trigger.addEventListener('click', open);
  menu.querySelector('.menu__close').addEventListener('click', () => shut());
  menu.addEventListener('cancel', (e) => { e.preventDefault(); shut(); });                 // Esc
  menu.addEventListener('click', (e) => { if (e.target === menu) shut(); });                // toque fora do painel
  menu.querySelectorAll('.menu__links a').forEach((a) => a.addEventListener('click', (e) => {
    const href = a.getAttribute('href') || '';
    if (href.startsWith('#')) return;                                                       // âncora: deixa rolar
    if (a.target === '_blank' || e.metaKey || e.ctrlKey) return;
    e.preventDefault(); shut(() => { location.href = a.href; });                           // fecha bonito e só então troca de página
  }));
  menu.addEventListener('close', () => {
    menu.classList.remove('is-open', 'is-closing');
    document.documentElement.classList.remove('menu-open');
    trigger.setAttribute('aria-expanded', 'false');
    trigger.focus({ preventScroll: true });
  });
}

/* ---------- Página de contato ---------- */
const brief = document.querySelector('#brief');
if (brief) {
  const contact = window.VEDOO_CONTACT || { whatsapp: '5521974127756', email: 'developing.gu@gmail.com' };
  const nameInput = brief.querySelector('#f-nome');
  const error = brief.querySelector('#brief-error');
  const mail = document.querySelector('#brief-mail');

  const compose = () => {
    const d = new FormData(brief);
    const nome = (d.get('nome') || '').trim();
    const negocio = (d.get('negocio') || '').trim();
    const tipo = d.get('tipo');
    const msg = (d.get('mensagem') || '').trim();
    const lines = [`Olá, Gustavo! Meu nome é ${nome || '...'}.`];
    if (negocio) lines.push(`Negócio: ${negocio}`);
    if (tipo) lines.push(`Preciso de: ${tipo}`);
    if (msg) lines.push('', msg);
    return lines.join('\n');
  };

  const syncMail = () => {
    mail.href = `mailto:${contact.email}?subject=${encodeURIComponent('Projeto de site')}&body=${encodeURIComponent(compose())}`;
  };
  brief.addEventListener('input', () => {
    syncMail();
    if (nameInput.value.trim()) { error.hidden = true; nameInput.removeAttribute('aria-invalid'); }
  });
  syncMail();

  brief.addEventListener('submit', e => {
    e.preventDefault();
    if (!nameInput.value.trim()) {
      error.hidden = false;
      nameInput.setAttribute('aria-invalid', 'true');
      nameInput.focus();
      return;
    }
    window.open(`https://wa.me/${contact.whatsapp}?text=${encodeURIComponent(compose())}`, '_blank', 'noopener');
  });
}

/* ---------- Revelar ao rolar ---------- */
const reveals = document.querySelectorAll('.reveal, .knockout');
if ('IntersectionObserver' in window && !reduceMotion) {
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -10% 0px' });
  reveals.forEach(el => io.observe(el));
} else {
  reveals.forEach(el => el.classList.add('is-in'));
}

/* ---------- Ano no rodapé ---------- */
const year = document.querySelector('#year'); // a página de erro não tem rodapé
if (year) year.textContent = new Date().getFullYear();
