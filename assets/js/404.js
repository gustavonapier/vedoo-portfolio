/*
  Página de erro (404.html).
  - Mostra o endereço que a pessoa tentou abrir.
  - A conversa: cada resposta ganha uma réplica e um botão de destino; o botão redondo recomeça.
  Pra mudar as respostas, edite a lista REPLIES.
*/
(() => {
  const page = document.querySelector('.e404');
  if (!page) return;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const wait = ms => new Promise(r => setTimeout(r, reduce ? 0 : ms));

  // o endereço digitado (encurtado, e sempre como texto)
  let path = '/essa-pagina';
  try { path = decodeURIComponent(location.pathname); } catch (e) { path = location.pathname; }
  if (path === '/404.html' || path === '/404') path = '/essa-pagina';
  if (path.length > 34) path = `${path.slice(0, 32)}…`;
  page.querySelectorAll('[data-path]').forEach(el => { el.textContent = path; });

  /* ---------- A conversa ---------- */
  const chat = page.querySelector('[data-chat]');
  if (chat) {
    const body = chat.querySelector('[data-chat-body]');
    const opts = chat.querySelector('[data-chat-opts]');
    const first = { body: body.innerHTML, opts: opts.innerHTML };
    const REPLIES = {
      perdi: { eu: 'Me perdi', ele: ['Acontece com todo mundo.', 'Vem, eu te levo de volta.'], ir: ['Voltar para o início', '/'] },
      fucando: { eu: 'Tava fuçando', ele: ['Gosto de gente curiosa.', 'Então fuça os projetos, que lá tem mais coisa pra ver.'], ir: ['Ver projetos', '/projetos'] },
      teste: { eu: 'Queria ver se você fez a página de erro', ele: ['Fiz. E caprichei.', 'Imagina o que eu faço no seu site.'], ir: ['Falar comigo', '/contato'] },
    };
    const bubble = (text, cls = '') => {
      const p = document.createElement('p');
      p.className = `e404__msg${cls}`;
      p.textContent = text;
      body.appendChild(p);
      return p;
    };
    const typing = async ms => {
      const d = document.createElement('p');
      d.className = 'e404__msg e404__msg--dots';
      d.setAttribute('aria-hidden', 'true');
      d.innerHTML = '<i></i><i></i><i></i>';
      body.appendChild(d);
      await wait(ms);
      d.remove();
    };
    opts.addEventListener('click', async e => {
      const again = e.target.closest('[data-again]');
      if (again) { body.innerHTML = first.body; opts.innerHTML = first.opts; return; }
      const btn = e.target.closest('button[data-a]');
      const r = btn && REPLIES[btn.dataset.a];
      if (!r) return;
      opts.innerHTML = '';
      bubble(r.eu, ' e404__msg--me');
      for (const line of r.ele) { await typing(800); bubble(line); }
      await wait(200);
      const a = document.createElement('a');
      a.href = r.ir[1];
      a.textContent = r.ir[0];
      const back = document.createElement('button');
      back.type = 'button';
      back.className = 'e404__again';
      back.dataset.again = '';
      back.setAttribute('aria-label', 'Recomeçar a conversa');
      back.title = 'Recomeçar';
      back.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 12a8 8 0 1 1-2.6-5.9"/><path d="M20 4v5h-5"/></svg>';
      opts.append(a, back);
    });
  }
})();
