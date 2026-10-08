(() => {
  'use strict';

  // Personalize os títulos e o caminho de cada imagem aqui.
  const items = [
    { title: 'Fluxo Prismático', image: 'assets/images/card-1.jpeg' },
    { title: 'Fumaça Dourada', image: 'assets/images/card-2.jpeg' },
    { title: 'Flor de Tinta', image: 'assets/images/card-3.jpeg' },
    { title: 'Tempestade de Jade', image: 'assets/images/card-4.jpeg' },
    { title: 'Deriva Incandescente', image: 'assets/images/card-1.jpeg' },
    { title: 'Maré Solar', image: 'assets/images/card-2.jpeg' },
    { title: 'Veio de Cobre', image: 'assets/images/card-3.jpeg' },
    { title: 'Flor da Meia-Noite', image: 'assets/images/card-4.jpeg' },
  ];
  const stage = document.querySelector('.stage');
  const orbit = document.querySelector('#orbit');
  const pagination = document.querySelector('.pagination');
  const playback = document.querySelector('.playback');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const wrap = (value, length) => ((value % length) + length) % length;
  let position = 3;
  let target = null;
  let active = -1;
  let spacing = 190;
  let paused = reducedMotion.matches;
  let dragging = false;
  let hovering = false;
  let focused = false;
  let lastX = 0;
  let resumeAt = 0;
  let previousTime = 0;

  let cards = [];

  function createCard(index) {
    const item = items[wrap(index, items.length)];
    const card = document.createElement('article');
    card.className = 'card';
    card.setAttribute('aria-roledescription', 'slide');
    card.setAttribute('aria-label', `${index + 1} de ${items.length}: ${item.title}`);
    const label = document.createElement('h3');
    label.className = 'card-label';
    label.textContent = item.title;
    const img = document.createElement('img');
    img.className = 'card-image';
    img.src = item.image;
    img.alt = item.title;
    img.draggable = false;
    const reflection = document.createElement('div');
    reflection.className = 'reflection';
    reflection.setAttribute('aria-hidden', 'true');
    const reflectedImage = img.cloneNode();
    reflectedImage.alt = '';
    reflection.append(reflectedImage);
    card.append(label, img, reflection);
    orbit.append(card);
    return card;
  }

  const dots = items.map((item, index) => {
    const dot = document.createElement('button');
    dot.className = 'dot';
    dot.type = 'button';
    dot.setAttribute('aria-label', `Ver imagem ${index + 1}: ${item.title}`);
    dot.addEventListener('click', () => {
      const delta = wrap(index - position + items.length / 2, items.length) - items.length / 2;
      goTo(position + delta);
    });
    pagination.append(dot);
    return dot;
  });

  function resize() {
    const width = Math.min(168, Math.max(135, stage.clientWidth * .122));
    spacing = width + Math.min(40, stage.clientWidth * .027);
    orbit.style.setProperty('--card-width', `${width}px`);
    orbit.style.setProperty('--card-height', `${width * 1.57}px`);
    // Cópias extras cobrem a tela e uma margem em cada lado, inclusive em telas largas.
    const poolSize = (Math.ceil(stage.clientWidth / (2 * spacing)) + 3) * 2 + 1;
    if (cards.length !== poolSize) {
      orbit.replaceChildren();
      cards = Array.from({ length: poolSize }, (_, index) => createCard(index));
    }
    render();
  }

  function render() {
    const center = Math.round(position);
    const radius = Math.floor(cards.length / 2);
    cards.forEach((card, index) => {
      // Recicla somente cópias que já estão fora da tela. A sequência segue sem reiniciar.
      const slot = center + wrap(index - center + radius, cards.length) - radius;
      const itemIndex = wrap(slot, items.length);
      if (card.dataset.slot !== String(slot)) {
        const item = items[itemIndex];
        card.dataset.slot = String(slot);
        card.querySelector('.card-label').textContent = item.title;
        card.setAttribute('aria-label', `${itemIndex + 1} de ${items.length}: ${item.title}`);
        const img = card.querySelector('.card-image');
        img.alt = item.title;
        card.querySelectorAll('img').forEach(image => {
          if (image.getAttribute('src') !== item.image) image.src = item.image;
        });
      }
      card.setAttribute('aria-hidden', String(slot !== center));
      const offset = slot - position;
      const x = offset * spacing;
      const outside = Math.abs(x) > stage.clientWidth / 2 + spacing;
      card.style.visibility = outside ? 'hidden' : 'visible';
      if (outside) return;
      const curve = x / Math.max(stage.clientWidth / 2, 500);
      // As extremidades avançam no eixo Z, formando um arco contínuo em 3D.
      const depth = curve * curve * 125;
      card.style.transform = `translateX(-50%) translate3d(${x}px, ${-curve * curve * 19}px, ${depth}px) rotateY(${-curve * 17}deg) rotateZ(${curve * 2.2}deg)`;
    });
    const nextActive = wrap(Math.round(position), items.length);
    if (active !== nextActive) {
      active = nextActive;
      document.querySelector('#current-title').textContent = items[active].title;
      document.querySelector('#current-number').textContent = String(active + 1).padStart(2, '0');
      dots.forEach((dot, index) => dot.setAttribute('aria-current', String(index === active)));
    }
  }

  function goTo(value) {
    target = value;
    resumeAt = performance.now() + 4500;
    const index = wrap(Math.round(value), items.length);
    document.querySelector('#announcement').textContent = `${index + 1} de ${items.length}: ${items[index].title}`;
    if (reducedMotion.matches) { position = target; target = null; render(); }
  }

  document.querySelector('.previous').addEventListener('click', () => goTo(Math.round(target ?? position) - 1));
  document.querySelector('.next').addEventListener('click', () => goTo(Math.round(target ?? position) + 1));
  stage.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      goTo(Math.round(target ?? position) + (event.key === 'ArrowRight' ? 1 : -1));
    }
  });
  stage.addEventListener('pointerdown', event => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    dragging = true;
    target = null;
    lastX = event.clientX;
    stage.classList.add('is-dragging');
    stage.setPointerCapture(event.pointerId);
  });
  stage.addEventListener('pointermove', event => {
    if (!dragging) return;
    position -= (event.clientX - lastX) / spacing;
    lastX = event.clientX;
    render();
  });
  function endDrag() {
    if (!dragging) return;
    dragging = false;
    stage.classList.remove('is-dragging');
    goTo(Math.round(position));
  }
  stage.addEventListener('pointerup', endDrag);
  stage.addEventListener('pointercancel', endDrag);
  stage.addEventListener('lostpointercapture', endDrag);
  stage.addEventListener('pointerenter', event => { if (event.pointerType === 'mouse') hovering = true; });
  stage.addEventListener('pointerleave', () => { hovering = false; });
  document.querySelector('.gallery').addEventListener('focusin', () => { focused = true; });
  document.querySelector('.gallery').addEventListener('focusout', event => { focused = document.querySelector('.gallery').contains(event.relatedTarget); });
  function updatePlayback() {
    playback.innerHTML = paused ? 'REPRODUZIR <span aria-hidden="true">▷</span>' : 'PAUSAR <span aria-hidden="true">Ⅱ</span>';
    playback.setAttribute('aria-label', paused ? 'Iniciar movimento automático' : 'Pausar movimento automático');
  }
  playback.addEventListener('click', () => { paused = !paused; updatePlayback(); });
  reducedMotion.addEventListener('change', () => { paused = reducedMotion.matches; updatePlayback(); });

  // Pontos discretos, estáticos, para reproduzir a atmosfera da referência.
  const stars = document.querySelector('.stars');
  let seed = 47;
  const random = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
  for (let i = 0; i < 95; i++) {
    const star = document.createElement('i');
    star.className = 'star';
    star.style.left = `${random() * 100}%`;
    star.style.top = `${random() * 87}%`;
    star.style.opacity = random();
    stars.append(star);
  }
  function tick(time) {
    const elapsed = Math.min(time - previousTime, 50);
    previousTime = time;
    if (!document.hidden) {
      if (target !== null && !dragging) {
        position += (target - position) * (1 - Math.exp(-elapsed / 145));
        if (Math.abs(target - position) < .0005) { position = target; target = null; }
        render();
      } else if (!paused && !dragging && !hovering && !focused && time > resumeAt) {
        position += elapsed * .000105;
        render();
      }
    }
    requestAnimationFrame(tick);
  }
  new ResizeObserver(resize).observe(stage);
  updatePlayback();
  resize();
  requestAnimationFrame(tick);
})();
