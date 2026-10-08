document.documentElement.classList.add("is-ready");

const hero = document.querySelector(".hero");
const revealTargets = hero ? [...hero.querySelectorAll(".hero__title")] : [];

if (hero && revealTargets.length) {
  const scrollTargets = revealTargets.map((target) => {
    const clone = target.cloneNode(true);
    clone.removeAttribute("id");
    clone.setAttribute("aria-hidden", "true");
    clone.classList.add("hero__reveal-scroll");
    if (target.classList.contains("hero__title")) clone.classList.add("hero__title--scroll");
    target.after(clone);
    return clone;
  });

  const masks = revealTargets.map(() => document.createElement("canvas"));
  const contexts = masks.map((mask) => mask.getContext("2d"));
  const targetCursor = { x: 0, y: 0 };
  const cursor = { x: 0, y: 0 };
  let frameId = 0;
  let hovering = false;
  let scrollProgress = 0;
  let lastTouchY = null;
  const finePointer = window.matchMedia("(pointer: fine)").matches;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const resizeMasks = () => revealTargets.forEach((target, index) => {
    const bounds = target.getBoundingClientRect();
    masks[index].width = Math.ceil(bounds.width);
    masks[index].height = Math.ceil(bounds.height);
  });

  const setMask = (target, mask) => {
    const image = `url("${mask.toDataURL("image/png")}")`;
    target.style.webkitMaskImage = image;
    target.style.maskImage = image;
    target.style.webkitMaskSize = "100% 100%";
    target.style.maskSize = "100% 100%";
  };

  const clearReveal = () => {
    hovering = false;
    cancelAnimationFrame(frameId);
    frameId = 0;
    revealTargets.forEach((target, index) => {
      contexts[index].clearRect(0, 0, masks[index].width, masks[index].height);
      setMask(target, masks[index]);
    });
  };

  const drawReveal = () => revealTargets.forEach((target, index) => {
    const bounds = target.getBoundingClientRect();
    const x = cursor.x - bounds.left;
    const y = cursor.y - bounds.top;
    const radius = Math.max(190, Math.min(260, bounds.width * 0.25));
    const context = contexts[index];
    const mask = masks[index];
    const gradient = context.createRadialGradient(x, y, 0, x, y, radius);
    gradient.addColorStop(0, "rgba(255, 255, 255, 1)");
    gradient.addColorStop(0.4, "rgba(255, 255, 255, 1)");
    gradient.addColorStop(0.6, "rgba(255, 255, 255, 0.75)");
    gradient.addColorStop(0.75, "rgba(255, 255, 255, 0.4)");
    gradient.addColorStop(0.88, "rgba(255, 255, 255, 0.12)");
    gradient.addColorStop(1, "rgba(255, 255, 255, 0)");
    context.clearRect(0, 0, mask.width, mask.height);
    context.fillStyle = gradient;
    context.beginPath();
    context.arc(x, y, radius, 0, Math.PI * 2);
    context.fill();
    setMask(target, mask);
  });

  const animate = () => {
    if (!hovering) return;
    const easing = reducedMotion ? 1 : 0.18;
    cursor.x += (targetCursor.x - cursor.x) * easing;
    cursor.y += (targetCursor.y - cursor.y) * easing;
    drawReveal();
    frameId = Math.hypot(targetCursor.x - cursor.x, targetCursor.y - cursor.y) > 0.5 ? requestAnimationFrame(animate) : 0;
  };

  const updatePointer = (event) => {
    if (scrollProgress > 0 || !finePointer || event.pointerType !== "mouse") return;
    targetCursor.x = event.clientX;
    targetCursor.y = event.clientY;
    if (!hovering) { cursor.x = targetCursor.x; cursor.y = targetCursor.y; hovering = true; }
    if (!frameId) frameId = requestAnimationFrame(animate);
  };

  const setScrollReveal = (visible) => {
    const nextProgress = visible ? 1 : 0;
    if (nextProgress === scrollProgress) return;
    if (visible) clearReveal();
    scrollProgress = nextProgress;
    scrollTargets.forEach((target) => { target.style.opacity = String(scrollProgress); });
  };

  resizeMasks();
  clearReveal();

  hero.addEventListener("pointerenter", updatePointer);
  hero.addEventListener("pointermove", updatePointer, { passive: true });
  hero.addEventListener("pointerleave", clearReveal);

  window.addEventListener("wheel", (event) => {
    if (event.deltaY > 0 && scrollProgress < 1) {
      setScrollReveal(true);
    } else if (event.deltaY < 0 && scrollProgress > 0) {
      setScrollReveal(false);
    }
  }, { passive: true });

  window.addEventListener("touchstart", (event) => {
    lastTouchY = event.touches[0]?.clientY ?? null;
  }, { passive: true });

  window.addEventListener("touchmove", (event) => {
    const currentY = event.touches[0]?.clientY;
    if (lastTouchY === null || currentY === undefined) return;
    const delta = lastTouchY - currentY;
    if (delta > 10 && scrollProgress < 1) {
      setScrollReveal(true);
    } else if (delta < -10 && scrollProgress > 0) {
      setScrollReveal(false);
    }
    lastTouchY = currentY;
  }, { passive: true });

  window.addEventListener("touchend", () => { lastTouchY = null; }, { passive: true });

  window.addEventListener("keydown", (event) => {
    if (["ArrowDown", "PageDown", " "].includes(event.key) && scrollProgress < 1) {
      setScrollReveal(true);
    } else if (["ArrowUp", "PageUp"].includes(event.key) && scrollProgress > 0) {
      setScrollReveal(false);
    }
  });

  window.addEventListener("resize", () => { resizeMasks(); if (!hovering) clearReveal(); }, { passive: true });
  window.addEventListener("pagehide", () => cancelAnimationFrame(frameId));
}
