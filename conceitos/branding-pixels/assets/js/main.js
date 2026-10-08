/**
 * TECH PIXEL - Pixel Emergence & Particle Engine
 * Inspired by modern cybernetic branding & voxel/pixel dispersion aesthetics.
 */

(function () {
  'use strict';

  // DOM Elements
  const canvas = document.getElementById('pixelCanvas');
  const ctx = canvas.getContext('2d', { willReadFrequently: false });
  const expertImg = document.getElementById('expertImg');
  const replayBtn = document.getElementById('replayPixelBtn');
  const container = document.querySelector('.expert-canvas-container');

  // Config & State
  const BASE_WIDTH = 1672;
  const BASE_HEIGHT = 941;
  const STEP = 8; // Pixel block size matching the pre-calculated grid

  let particles = [];
  let ambientSparks = [];
  let isAnimating = false;
  let animationStartTime = 0;
  const ANIMATION_DURATION = 850; // ms (montagem rápida e ágil)

  let canvasWidth = 0;
  let canvasHeight = 0;
  let scale = 1;
  let offsetX = 0;
  let offsetY = 0;
  let dpr = 1;

  // Mouse interaction
  const mouse = {
    x: -9999,
    y: -9999,
    radius: 90,
    force: 35
  };

  /**
   * Easing function: Cubic ease out with slight punch
   */
  function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  function easeOutBack(t, s = 1.3) {
    return (t = t - 1) * t * ((s + 1) * t + s) + 1;
  }

  /**
   * Initialize and resize canvas
   */
  function resizeCanvas() {
    const rect = container.getBoundingClientRect();
    canvasWidth = rect.width;
    canvasHeight = rect.height;

    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = canvasWidth * dpr;
    canvas.height = canvasHeight * dpr;

    ctx.scale(dpr, dpr);

    // Compute cover scale and offsets to align perfectly with object-fit: cover on expertImg
    const scaleX = canvasWidth / BASE_WIDTH;
    const scaleY = canvasHeight / BASE_HEIGHT;
    scale = Math.max(scaleX, scaleY);

    // Compute cover scale and responsive focal alignment
    const isMobile = canvasWidth <= 768;
    const focusRatioX = isMobile ? 0.38 : 0.5;
    const focusRatioY = isMobile ? 0.20 : 0.5;

    offsetX = (canvasWidth - BASE_WIDTH * scale) * focusRatioX;
    offsetY = (canvasHeight - BASE_HEIGHT * scale) * focusRatioY;

    // Recalculate target positions for particles
    updateParticleTargets();
  }

  /**
   * Parse particles from pre-calculated data or canvas fallback
   */
  function initParticles() {
    particles = [];

    if (window.EXPERT_PIXELS_CONFIG && window.EXPERT_PIXELS_CONFIG.data) {
      const data = window.EXPERT_PIXELS_CONFIG.data;
      const total = data.length;

      for (let i = 0; i < total; i += 5) {
        const origX = data[i];
        const origY = data[i + 1];
        const r = data[i + 2];
        const g = data[i + 3];
        const b = data[i + 4];

        // Stagger delay based on spatial position + random jitter
        // Emerging in a wave from right/edges towards center (like Ref 2)
        const normX = origX / BASE_WIDTH;
        const normY = origY / BASE_HEIGHT;
        const delayRatio = (1 - normX) * 0.45 + (normY) * 0.2 + Math.random() * 0.35;

        // Dispersed start position (pixels flying in from scatter cloud with bottom-to-top trajectory)
        const angle = Math.random() * Math.PI * 2;
        const dist = 60 + Math.random() * 200;
        const startRelX = Math.cos(angle) * dist + (Math.random() > 0.5 ? 50 : -35);
        // Positive Y offset so pixels rise upward from bottom into target position
        const startRelY = Math.abs(Math.sin(angle) * dist * 0.5) + 50 + Math.random() * 90;

        particles.push({
          origX,
          origY,
          r,
          g,
          b,
          targetX: 0,
          targetY: 0,
          currentX: 0,
          currentY: 0,
          startRelX,
          startRelY,
          delay: delayRatio,
          color: `rgb(${r},${g},${b})`,
          alpha: 0,
          scale: 0.1,
          size: STEP,
          // Interactive displacement
          vx: 0,
          vy: 0,
          dispX: 0,
          dispY: 0
        });
      }
    }

    // Generate ambient digital sparks / floating voxels (like in image 2)
    initAmbientSparks();

    updateParticleTargets();
    startEmergenceAnimation();
  }

  /**
   * Update particle positions based on container scale
   */
  function updateParticleTargets() {
    const pSize = Math.max(1.5, Math.ceil(STEP * scale));

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      p.targetX = offsetX + p.origX * scale;
      p.targetY = offsetY + p.origY * scale;
      p.size = pSize;
    }
  }

  /**
   * Ambient glowing square voxels drifting in the aura
   */
  function initAmbientSparks() {
    ambientSparks = [];
    const sparkCount = 65;

    for (let i = 0; i < sparkCount; i++) {
      ambientSparks.push({
        x: offsetX + (BASE_WIDTH * 0.2 + Math.random() * BASE_WIDTH * 0.65) * scale,
        y: offsetY + (BASE_HEIGHT * 0.1 + Math.random() * BASE_HEIGHT * 0.8) * scale,
        size: 3 + Math.random() * 5,
        baseAlpha: 0.2 + Math.random() * 0.6,
        alpha: 0,
        vx: (Math.random() - 0.3) * 0.8,
        vy: -0.4 - Math.random() * 0.8,
        hue: Math.random() > 0.4 ? 'rgba(255, 60, 40,' : 'rgba(255, 160, 60,',
        pulseSpeed: 0.02 + Math.random() * 0.04,
        pulseVal: Math.random() * Math.PI
      });
    }
  }

  /**
   * Start or Replay the Emergence Animation
   */
  function startEmergenceAnimation() {
    if (isAnimating) return;

    if (window.location.search.includes('assembled=1')) {
      container.classList.add('rise-active');
      expertImg.classList.add('visible');
      isAnimating = false;
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.currentX = p.targetX;
        p.currentY = p.targetY;
        p.alpha = 1;
        p.scale = 1;
      }
      requestAnimationFrame(renderLoop);
      return;
    }

    isAnimating = true;
    animationStartTime = performance.now();

    // Trigger bottom-to-top rising animation on the container
    container.classList.remove('rise-active');
    void container.offsetWidth; // Force CSS reflow to re-trigger transition
    container.classList.add('rise-active');

    // Hide full expert image during assembly
    expertImg.classList.remove('visible');

    // Reset particles to dispersed start
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      p.currentX = p.targetX + p.startRelX * scale;
      p.currentY = p.targetY + p.startRelY * scale;
      p.alpha = 0.85;
      p.scale = 0.9;
      p.dispX = 0;
      p.dispY = 0;
      p.vx = 0;
      p.vy = 0;
    }

    // Play subtle synthetic cyber cue
    playCyberChime();

    requestAnimationFrame(renderLoop);
  }

  /**
   * Main render loop
   */
  function renderLoop(now) {
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    const elapsed = now - animationStartTime;
    const progress = Math.min(elapsed / ANIMATION_DURATION, 1);

    // Pre-emptively reveal the HD image while pixels lock into place (zero blink/gap)
    if (progress >= 0.65 && !expertImg.classList.contains('visible')) {
      expertImg.classList.add('visible');
    }

    if (progress >= 1 && isAnimating) {
      isAnimating = false;
    }

    // Render Ambient Floating Sparks
    renderAmbientSparks();

    // Assembly phase or interactive hover phase
    if (progress < 1) {
      // Pixels dissolving smoothly into the emerging photo
      const dissolveFade = progress < 0.7 ? 1 : Math.max(0, 1 - (progress - 0.7) / 0.3);

      const particleCount = particles.length;
      for (let i = 0; i < particleCount; i++) {
        const p = particles[i];

        const pElapsed = elapsed - p.delay * (ANIMATION_DURATION * 0.15);
        const pProg = Math.max(0, Math.min(pElapsed / (ANIMATION_DURATION * 0.85), 1));

        const startX = p.targetX + p.startRelX * scale;
        const startY = p.targetY + p.startRelY * scale;

        if (pProg > 0) {
          // Pure cubic deceleration: zero bounce, zero jerk
          const eased = 1 - Math.pow(1 - pProg, 3);
          p.currentX = startX + (p.targetX - startX) * eased;
          p.currentY = startY + (p.targetY - startY) * eased;
          p.alpha = dissolveFade;
        } else {
          p.currentX = startX;
          p.currentY = startY;
          p.alpha = 0.85;
        }

        if (p.alpha > 0.02) {
          ctx.fillStyle = p.color;
          ctx.globalAlpha = p.alpha;
          const renderSize = p.size + 0.6;
          ctx.fillRect(p.currentX, p.currentY, renderSize, renderSize);
        }
      }
    } else if (mouse.x > -1000) {
      // Assembled phase: only calculate & render particles near mouse cursor for max performance
      const particleCount = particles.length;
      for (let i = 0; i < particleCount; i++) {
        const p = particles[i];
        const dx = p.currentX - mouse.x;
        const dy = p.currentY - mouse.y;
        const dist = Math.hypot(dx, dy);

        if (dist < mouse.radius && dist > 0) {
          const force = (1 - dist / mouse.radius) * mouse.force;
          p.dispX += (dx / dist) * force;
          p.dispY += (dy / dist) * force;
        }

        // Fast spring recovery
        p.dispX += (0 - p.dispX) * 0.18;
        p.dispY += (0 - p.dispY) * 0.18;

        const dispMag = Math.hypot(p.dispX, p.dispY);
        if (dispMag > 0.6) {
          p.currentX = p.targetX + p.dispX;
          p.currentY = p.targetY + p.dispY;
          ctx.fillStyle = p.color;
          ctx.globalAlpha = Math.min(1, dispMag / 10);
          ctx.fillRect(p.currentX, p.currentY, p.size + 0.6, p.size + 0.6);
        } else {
          p.dispX = 0;
          p.dispY = 0;
          p.currentX = p.targetX;
          p.currentY = p.targetY;
        }
      }
    }

    ctx.globalAlpha = 1;
    requestAnimationFrame(renderLoop);
  }

  /**
   * Render ambient floating voxels around the silhouette
   */
  function renderAmbientSparks() {
    for (let i = 0; i < ambientSparks.length; i++) {
      const s = ambientSparks[i];
      s.y += s.vy;
      s.x += s.vx;
      s.pulseVal += s.pulseSpeed;

      // Wrap around
      if (s.y < offsetY - 50) {
        s.y = offsetY + BASE_HEIGHT * scale + 20;
        s.x = offsetX + (BASE_WIDTH * 0.3 + Math.random() * BASE_WIDTH * 0.5) * scale;
      }

      const pulseAlpha = s.baseAlpha * (0.6 + 0.4 * Math.sin(s.pulseVal));
      ctx.fillStyle = s.hue + pulseAlpha + ')';
      ctx.fillRect(s.x, s.y, s.size, s.size);
    }
  }

  /**
   * Synthetic futuristic chime via Web Audio API (zero audio files needed)
   */
  function playCyberChime() {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;

      const actx = new AudioContext();
      if (actx.state === 'suspended') {
        actx.resume();
      }

      const osc = actx.createOscillator();
      const gain = actx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(320, actx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, actx.currentTime + 0.35);
      osc.frequency.exponentialRampToValueAtTime(1400, actx.currentTime + 0.7);

      gain.gain.setValueAtTime(0.001, actx.currentTime);
      gain.gain.linearRampToValueAtTime(0.04, actx.currentTime + 0.1);
      gain.gain.exponentialRampToValueAtTime(0.0001, actx.currentTime + 0.9);

      osc.connect(gain);
      gain.connect(actx.destination);

      osc.start();
      osc.stop(actx.currentTime + 0.95);
    } catch (e) {
      // Audio autoplay policy or unavailable - silent fallback
    }
  }

  /**
   * Event Listeners
   */
  window.addEventListener('resize', () => {
    resizeCanvas();
  });

  // Track mouse over canvas
  container.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
  });

  container.addEventListener('mouseleave', () => {
    mouse.x = -9999;
    mouse.y = -9999;
  });

  // Replay Button Click
  if (replayBtn) {
    replayBtn.addEventListener('click', (e) => {
      e.preventDefault();
      startEmergenceAnimation();
    });
  }

  // Also click on the expert area to trigger replay if desired
  container.addEventListener('click', () => {
    if (!isAnimating) {
      startEmergenceAnimation();
    }
  });

  // Initialize once DOM and pixel data are ready
  window.addEventListener('DOMContentLoaded', () => {
    resizeCanvas();
    initParticles();
  });

})();
