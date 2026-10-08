/**
 * HERO DENTISTA - LUXURY CLINIC INTERACTION LOGIC
 */

document.addEventListener('DOMContentLoaded', () => {
  const heroSection = document.querySelector('.hero-section');
  const glowContainer = document.querySelector('.glow-container');
  const lightboxModal = document.getElementById('lightboxModal');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxTitle = document.getElementById('lightboxTitle');
  const lightboxClose = document.getElementById('lightboxClose');
  const caseCards = document.querySelectorAll('.case-card');

  // 1. Mouse Parallax Effect on Blue Glow & Atmosphere
  if (heroSection && glowContainer) {
    heroSection.addEventListener('mousemove', (e) => {
      const { clientX, clientY } = e;
      const { innerWidth, innerHeight } = window;
      
      const xPercent = (clientX / innerWidth - 0.5) * 2; // -1 to 1
      const yPercent = (clientY / innerHeight - 0.5) * 2; // -1 to 1

      // Movimento dinâmico suave sem afetar o posicionamento global
      glowContainer.style.transform = `translate(${xPercent * 22}px, ${yPercent * 16}px)`;
    });

    heroSection.addEventListener('mouseleave', () => {
      glowContainer.style.transform = 'translate(0px, 0px)';
    });
  }

  // 2. Lightbox Interaction for Transformation Cards
  const caseData = {
    'm1': { title: 'Lentes de Contato em Porcelana', desc: 'Harmonização do sorriso com alinhamento e tom ultra-natural.' },
    'm2': { title: 'Facetas em Resina Composta', desc: 'Fechamento de diastemas e remodelação estética com perfeição.' },
    'm3': { title: 'Reabilitação Oral & Estética', desc: 'Recuperação funcional com alta durabilidade e brilho radiante.' },
    'm4': { title: 'Harmonização do Sorriso VIP', desc: 'Proporção áurea dentária e contorno gengival refinado.' },
    'm5': { title: 'Clareamento & Lentes Cerâmicas', desc: 'Transformação completa com máxima preservação da estrutura dental.' }
  };

  caseCards.forEach((card) => {
    card.addEventListener('click', () => {
      const img = card.querySelector('img');
      const caseKey = card.getAttribute('data-case');
      if (img && lightboxModal) {
        lightboxImg.src = img.src;
        if (caseData[caseKey]) {
          lightboxTitle.textContent = caseData[caseKey].title;
          document.getElementById('lightboxDesc').textContent = caseData[caseKey].desc;
        } else {
          lightboxTitle.textContent = 'Transformação do Sorriso';
          document.getElementById('lightboxDesc').textContent = 'Resultado exclusivo de estética odontológica.';
        }
        lightboxModal.classList.add('active');
      }
    });
  });

  if (lightboxClose) {
    lightboxClose.addEventListener('click', () => {
      lightboxModal.classList.remove('active');
    });
  }

  if (lightboxModal) {
    lightboxModal.addEventListener('click', (e) => {
      if (e.target === lightboxModal) {
        lightboxModal.classList.remove('active');
      }
    });
  }

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && lightboxModal && lightboxModal.classList.contains('active')) {
      lightboxModal.classList.remove('active');
    }
  });

  // 3. Header background on scroll
  const headerNav = document.querySelector('.header-nav');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 30) {
      headerNav.classList.add('scrolled');
    } else {
      headerNav.classList.remove('scrolled');
    }
  });

  // 4. Smooth click handler for CTA buttons
  const ctaButtons = document.querySelectorAll('.cta-button-ref, .nav-cta');
  ctaButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      // Animate ripple effect
      const rect = btn.getBoundingClientRect();
      const circle = document.createElement('span');
      circle.style.position = 'absolute';
      circle.style.borderRadius = '50%';
      circle.style.transform = 'scale(0)';
      circle.style.animation = 'rippleEffect 0.6s linear';
      circle.style.background = 'rgba(0, 180, 255, 0.4)';
      circle.style.pointerEvents = 'none';
      circle.style.width = circle.style.height = `${Math.max(rect.width, rect.height) * 2}px`;
      circle.style.left = `${e.clientX - rect.left - rect.width}px`;
      circle.style.top = `${e.clientY - rect.top - rect.height}px`;
      btn.style.position = 'relative';
      btn.style.overflow = 'hidden';
      btn.appendChild(circle);

      setTimeout(() => {
        circle.remove();
        alert('Redirecionando para o WhatsApp / Agendamento...');
      }, 350);
    });
  });
});
