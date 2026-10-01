const root = document.documentElement;
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
root.classList.add('motion');

// A abertura sempre começa do topo.
if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
if (!location.hash) window.scrollTo(0, 0);

/* ---------- Abertura (só na página inicial) ---------- */
// A sequência roda em CSS toda vez que a página inicial carrega. Aqui só marcamos o fim.
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

/* ---------- Página de projetos ---------- */
const grid = document.querySelector('#work-grid');
if (grid) {
  const projects = window.VEDOO_PROJECTS || [];
  const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  projects.forEach(p => {
    const live = p.status === 'no-ar' && p.link;
    const tag = live ? 'a' : 'div';
    const media = p.imagem
      ? `<img src="${esc(p.imagem)}" alt="" loading="lazy">`
      : `<img src="assets/marca/vedoo-simbolo-claro.svg" alt=""><span>Em breve</span>`;
    const li = document.createElement('li');
    li.className = 'work__item reveal';
    li.innerHTML = `
      <${tag} class="work__card"${live ? ` href="${esc(p.link)}" data-preview="${esc(p.link)}" data-title="${esc(p.nome)}" data-tipo="${esc(p.tipo)}" data-url="vedoo.studio/${esc(p.link.replace(/\/$/, ''))}" data-poster="${esc(p.preview || p.imagem || '')}"` : ''}>
        <div class="work__media${p.imagem ? '' : ' work__media--empty'}">${media}</div>
        <div class="work__meta">
          <h2 class="work__name">${esc(p.nome)}</h2>
          <p class="work__info">${esc(p.tipo)}<br>${live ? esc(p.ano) : 'Em breve'}</p>
        </div>
      </${tag}>`;
    grid.appendChild(li);
  });

  const next = document.createElement('li');
  next.className = 'work__item work__item--next reveal';
  next.innerHTML = `
    <a class="work__card" href="contato.html">
      <div class="work__media"><p>Seu projeto<br><em>pode ser o próximo.</em><span>Vamos conversar →</span></p></div>
    </a>`;
  grid.appendChild(next);
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
document.querySelector('#year').textContent = new Date().getFullYear();
