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

/* ---------- Menu (celular) ---------- */
const menu = document.querySelector('#menu');
const trigger = document.querySelector('.menu-toggle');
trigger.addEventListener('click', () => {
  menu.showModal();
  trigger.setAttribute('aria-expanded', 'true');
});
menu.querySelector('.menu__close').addEventListener('click', () => menu.close());
menu.addEventListener('close', () => {
  trigger.setAttribute('aria-expanded', 'false');
  trigger.focus({ preventScroll: true });
});

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
