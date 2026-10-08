const menuButton = document.querySelector('.menu-button');

menuButton?.addEventListener('click', () => {
  const isOpen = menuButton.getAttribute('aria-expanded') === 'true';
  menuButton.setAttribute('aria-expanded', String(!isOpen));
  document.body.classList.toggle('menu-open', !isOpen);
});

const hero = document.querySelector('.hero');
const backgroundButtons = document.querySelectorAll('[data-background]');

backgroundButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const selectedBackground = button.dataset.background;

    hero.style.backgroundImage = `url("assets/imagens/${selectedBackground}.jpeg")`;

    backgroundButtons.forEach((item) => {
      const isSelected = item === button;
      item.classList.toggle('is-active', isSelected);
      item.setAttribute('aria-pressed', String(isSelected));
    });
  });
});
