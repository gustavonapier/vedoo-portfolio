/*
  Página de contato em formato de conversa.
  Uma pergunta por vez; no final, a mensagem abre pronta no WhatsApp.
  Pra mudar as perguntas, edite a lista STEPS abaixo.
*/
(() => {
  const msgs = document.getElementById('chat-msgs');
  const form = document.getElementById('chat-form');
  const input = document.getElementById('chat-input');
  if (!msgs || !form) return;

  const contact = window.VEDOO_CONTACT || { whatsapp: '5521974127756', email: 'developing.gu@gmail.com' };
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const stepLabel = document.getElementById('conversa-step');
  const bars = document.querySelectorAll('.conversa__progress i');
  const answers = {};
  // Quem vem do quadro do Início chega com o assunto já escolhido (contato.html?assunto=novo).
  const ASSUNTOS = { novo: 'Quero um site novo', reforma: 'Quero reformar o meu site', loja: 'Preciso de uma loja virtual', duvida: 'Só quero tirar uma dúvida' };
  const assunto = ASSUNTOS[new URLSearchParams(location.search).get('assunto')] || '';
  let step = -1;
  let waiting = false;

  // Cada passo: o que eu pergunto, onde guardo a resposta, respostas rápidas e se dá pra pular.
  const STEPS = [
    { key: 'nome', ask: () => ['Oi! Aqui é o Gustavo.', ...(assunto ? [`Vi que você escolheu “${esc(assunto)}”. Boa!`] : []), 'Como posso te chamar?'], placeholder: 'Seu nome' },
    { key: 'negocio', ask: a => [`Prazer, ${esc(a.nome)}! Qual é o seu negócio?`], placeholder: 'Nome da empresa ou do projeto', quick: ['Ainda não tem nome'] },
    { key: 'tipo', ask: () => ['Que tipo de site você está pensando?'], quick: ['Landing page', 'Site institucional', 'E-commerce', 'Ainda não sei'], placeholder: 'Ou escreva…' },
    { key: 'prazo', ask: () => ['Boa. Tem algum prazo ou data importante?'], quick: ['Sem pressa', 'Em até 1 mês', 'O quanto antes'], placeholder: 'Ou escreva a data…' },
    { key: 'sobre', ask: () => ['Pra fechar: me conta em poucas palavras o que o site precisa fazer.'], quick: ['Prefiro explicar no WhatsApp'], placeholder: 'Ex.: receber pedidos, mostrar o cardápio…' },
  ];

  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const wait = ms => new Promise(r => setTimeout(r, reduce ? 0 : ms));
  const scroll = () => msgs.scrollTo({ top: msgs.scrollHeight, behavior: reduce ? 'auto' : 'smooth' });

  const bubble = (html, who = 'me', extra = '') => {
    const p = document.createElement('p');
    p.className = `chat__b chat__b--${who}${extra}`;
    p.innerHTML = html;
    msgs.appendChild(p);
    scroll();
    return p;
  };

  const typing = async ms => {
    const t = document.createElement('div');
    t.className = 'chat__typing';
    t.setAttribute('aria-hidden', 'true');
    t.innerHTML = '<i></i><i></i><i></i>';
    msgs.appendChild(t);
    scroll();
    await wait(ms);
    t.remove();
  };

  const clearQuick = () => msgs.querySelectorAll('.chat__quick').forEach(q => q.remove());

  const progress = i => {
    if (stepLabel) stepLabel.textContent = `${Math.min(i + 1, STEPS.length)} de ${STEPS.length}`;
    bars.forEach((b, n) => b.classList.toggle('is-on', n <= i));
  };

  const message = () => {
    const lines = [`Olá, Gustavo! Meu nome é ${answers.nome}.`];
    if (assunto) lines.push(`Assunto: ${assunto}`);
    if (answers.negocio && answers.negocio !== 'Ainda não tem nome') lines.push(`Negócio: ${answers.negocio}`);
    if (answers.tipo) lines.push(`Preciso de: ${answers.tipo}`);
    if (answers.prazo) lines.push(`Prazo: ${answers.prazo}`);
    if (answers.sobre && answers.sobre !== 'Prefiro explicar no WhatsApp') lines.push('', answers.sobre);
    return lines.join('\n');
  };

  async function ask(i) {
    step = i;
    waiting = true;
    progress(i);
    form.classList.add('is-busy');
    const s = STEPS[i];
    const parts = s.ask(answers);
    for (const [n, text] of parts.entries()) {
      await typing(n === 0 && i === 0 ? 500 : 700);
      bubble(text, 'him', s.big ? ' chat__b--big' : '');
    }
    if (s.quick) {
      const q = document.createElement('div');
      q.className = 'chat__quick';
      s.quick.forEach(label => {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'chat__chip';
        b.textContent = label;
        b.addEventListener('click', () => answer(label));
        q.appendChild(b);
      });
      msgs.appendChild(q);
      scroll();
    }
    input.placeholder = s.placeholder || 'Escreva sua resposta…';
    form.classList.remove('is-busy');
    waiting = false;
    if (window.matchMedia('(hover: hover)').matches) input.focus({ preventScroll: true });
  }

  async function answer(text) {
    const value = text.trim();
    if (!value || waiting || step < 0 || step >= STEPS.length) return;
    clearQuick();
    answers[STEPS[step].key] = value;
    bubble(esc(value), 'me');
    input.value = '';
    if (step + 1 < STEPS.length) return ask(step + 1);
    finish();
  }

  async function finish() {
    waiting = true;
    step = STEPS.length;
    progress(STEPS.length - 1);
    form.classList.add('is-done');
    await typing(800);
    bubble(`Perfeito, ${esc(answers.nome)}. Já deixei tudo escrito, é só enviar.`, 'him');
    await wait(250);
    const text = message();
    const card = document.createElement('div');
    card.className = 'chat__summary';
    card.innerHTML = `
      <p class="chat__summary-k">Sua mensagem</p>
      <pre>${esc(text)}</pre>
      <div class="chat__summary-actions">
        <a class="btn btn--red" href="https://wa.me/${contact.whatsapp}?text=${encodeURIComponent(text)}" target="_blank" rel="noopener">Enviar no WhatsApp <span aria-hidden="true">→</span></a>
        <a class="chat__alt" href="mailto:${contact.email}?subject=${encodeURIComponent('Projeto de site')}&body=${encodeURIComponent(text)}">Prefiro e-mail</a>
        <button type="button" class="chat__alt" data-restart>Recomeçar</button>
      </div>`;
    card.querySelector('[data-restart]').addEventListener('click', restart);
    msgs.appendChild(card);
    scroll();
  }

  function restart() {
    Object.keys(answers).forEach(k => delete answers[k]);
    msgs.querySelectorAll('.chat__b, .chat__quick, .chat__summary, .chat__typing').forEach(n => n.remove());
    form.classList.remove('is-done');
    ask(0);
  }

  form.addEventListener('submit', e => {
    e.preventDefault();
    answer(input.value);
  });

  // Começa quando a conversa aparece na tela.
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(entries => {
      if (entries.some(en => en.isIntersecting)) { io.disconnect(); ask(0); }
    }, { threshold: 0.3 });
    io.observe(form.closest('.chat'));
  } else {
    ask(0);
  }
})();
