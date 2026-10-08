const hero = document.querySelector(".hero");

if (hero) {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const target = { x: 0, y: 0 };
  const position = { x: 0, y: 0 };
  let active = false;
  let frame = 0;
  let previousTime = 0;

  const paint = () => {
    hero.style.setProperty("--mouse-x", `${position.x}px`);
    hero.style.setProperty("--mouse-y", `${position.y}px`);
  };

  const animate = (time) => {
    frame = 0;
    const elapsed = previousTime ? Math.min(time - previousTime, 64) : 16;
    previousTime = time;
    const easing = reducedMotion.matches ? 1 : 1 - Math.exp(-elapsed / 65);
    position.x += (target.x - position.x) * easing;
    position.y += (target.y - position.y) * easing;
    paint();
    if (active && Math.hypot(target.x - position.x, target.y - position.y) > 0.1) {
      frame = requestAnimationFrame(animate);
    } else {
      previousTime = 0;
    }
  };

  const updatePointer = (event) => {
    if (event.pointerType === "touch") return;
    const bounds = hero.getBoundingClientRect();
    target.x = event.clientX - bounds.left;
    target.y = event.clientY - bounds.top;
    if (!active) {
      position.x = target.x;
      position.y = target.y;
      paint();
      active = true;
      hero.classList.add("is-active");
    }
    if (!frame) frame = requestAnimationFrame(animate);
  };

  const clear = () => {
    active = false;
    cancelAnimationFrame(frame);
    frame = 0;
    previousTime = 0;
    hero.classList.remove("is-active");
  };

  hero.addEventListener("pointerenter", updatePointer);
  hero.addEventListener("pointermove", updatePointer);
  hero.addEventListener("pointerleave", clear);
  hero.addEventListener("pointercancel", clear);
  window.addEventListener("blur", clear);
  window.addEventListener("resize", clear);
}
