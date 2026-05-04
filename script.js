/* ═══════════════════════════════════════════════════════════
   NIKHIL KUMAR — CINEMATOGRAPHER PORTFOLIO
   script.js — Particle Canvas, Cursor, Filter, Scroll
═══════════════════════════════════════════════════════════ */

'use strict';

/* ══════════════════════ CUSTOM CURSOR ═══════════════════════ */
(function initCursor() {
  const cursor     = document.createElement('div');
  const cursorRing = document.createElement('div');
  cursor.className     = 'cursor';
  cursorRing.className = 'cursor-ring';
  document.body.appendChild(cursor);
  document.body.appendChild(cursorRing);

  let mx = -100, my = -100;
  let rx = -100, ry = -100;

  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    cursor.style.left = mx + 'px';
    cursor.style.top  = my + 'px';
  });

  function animateRing() {
    rx += (mx - rx) * 0.1;
    ry += (my - ry) * 0.1;
    cursorRing.style.left = rx + 'px';
    cursorRing.style.top  = ry + 'px';
    requestAnimationFrame(animateRing);
  }
  animateRing();
})();

/* ════════════════════ PARTICLE CANVAS ══════════════════════ */
(function initParticles() {
  const canvas = document.getElementById('particleCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let W, H, particles = [], lines = [];
  const NUM_PARTICLES = 55;
  const CONNECT_DIST  = 130;

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resize);
  resize();

  class Particle {
    constructor() { this.reset(true); }
    reset(random) {
      this.x   = random ? Math.random() * W : (Math.random() < 0.5 ? -5 : W + 5);
      this.y   = Math.random() * H;
      this.vx  = (Math.random() - 0.5) * 0.35;
      this.vy  = (Math.random() - 0.5) * 0.25;
      this.r   = Math.random() * 1.6 + 0.4;
      this.a   = Math.random() * 0.45 + 0.08;
      const roll = Math.random();
      if (roll < 0.5)       this.color = `rgba(201,169,110,${this.a})`;
      else if (roll < 0.8)  this.color = `rgba(123,94,167,${this.a})`;
      else                  this.color = `rgba(78,205,196,${this.a * 0.6})`;
    }
    update() {
      this.x += this.vx;
      this.y += this.vy;
      if (this.x < -20 || this.x > W + 20 || this.y < -20 || this.y > H + 20) this.reset(false);
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.fill();
    }
  }

  for (let i = 0; i < NUM_PARTICLES; i++) particles.push(new Particle());

  function drawConnections() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < CONNECT_DIST) {
          const alpha = (1 - dist / CONNECT_DIST) * 0.12;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(201,169,110,${alpha})`;
          ctx.lineWidth   = 0.5;
          ctx.stroke();
        }
      }
    }
  }

  /* Subtle mouse-reactive drift */
  let mouseX = W / 2, mouseY = H / 2;
  document.addEventListener('mousemove', e => { mouseX = e.clientX; mouseY = e.clientY; });

  let frame = 0;
  function loop() {
    ctx.clearRect(0, 0, W, H);

    /* Ambient radial glow that follows mouse */
    const grd = ctx.createRadialGradient(mouseX, mouseY, 0, mouseX, mouseY, 500);
    grd.addColorStop(0, 'rgba(123,94,167,0.04)');
    grd.addColorStop(1, 'transparent');
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, W, H);

    drawConnections();
    particles.forEach(p => { p.update(); p.draw(); });

    frame++;
    requestAnimationFrame(loop);
  }
  loop();
})();

/* ═════════════════════ SCROLL NAVBAR ═══════════════════════ */
(function initNavbar() {
  const nav = document.getElementById('navbar');
  const toggle = document.getElementById('navToggle');
  const links  = document.querySelector('.nav-links');

  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 60);
  }, { passive: true });

  toggle.addEventListener('click', () => {
    links.classList.toggle('open');
    const open = links.classList.contains('open');
    toggle.querySelectorAll('span')[0].style.transform = open ? 'translateY(6px) rotate(45deg)' : '';
    toggle.querySelectorAll('span')[1].style.opacity   = open ? '0' : '1';
    toggle.querySelectorAll('span')[2].style.transform = open ? 'translateY(-6px) rotate(-45deg)' : '';
  });

  /* Close on nav link click */
  links.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      links.classList.remove('open');
      toggle.querySelectorAll('span').forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
    });
  });
})();

/* ════════════════════ SCROLL REVEAL ═════════════════════════ */
(function initReveal() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        const delay = parseInt(entry.target.dataset.delay || 0);
        setTimeout(() => entry.target.classList.add('visible'), delay);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  /* Stagger siblings */
  document.querySelectorAll('.fade-in').forEach((el, i) => {
    const siblings = el.parentElement ? [...el.parentElement.querySelectorAll('.fade-in')] : [];
    const idx = siblings.indexOf(el);
    el.dataset.delay = idx * 70;
    observer.observe(el);
  });
})();

/* ═══════════════════ PORTFOLIO FILTER ═══════════════════════ */
(function initFilter() {
  const buttons = document.querySelectorAll('.filter-btn');
  const cards   = document.querySelectorAll('.portfolio-card');
  const grid    = document.getElementById('portfolioGrid');

  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      buttons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.dataset.filter;

      cards.forEach((card, i) => {
        const cat = card.dataset.category;
        const show = filter === 'all' || cat === filter;

        if (!show) {
          card.classList.add('fade-out');
          card.addEventListener('animationend', () => {
            card.classList.add('hidden');
            card.classList.remove('fade-out');
          }, { once: true });
        } else {
          card.classList.remove('hidden');
          setTimeout(() => {
            card.style.animationDelay = (i * 60) + 'ms';
            card.classList.add('fade-in-card');
            card.addEventListener('animationend', () => {
              card.classList.remove('fade-in-card');
              card.style.animationDelay = '';
            }, { once: true });
          }, 30);
        }
      });
    });
  });
})();

/* ═══════════════════ SMOOTH ACTIVE NAV ══════════════════════ */
(function initActiveNav() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-links a');

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navLinks.forEach(link => link.classList.remove('active'));
        const active = document.querySelector(`.nav-links a[href="#${entry.target.id}"]`);
        if (active) active.classList.add('active');
      }
    });
  }, { threshold: 0.4 });

  sections.forEach(s => observer.observe(s));
})();

/* ═══════════════════ PARALLAX HERO TEXT ═════════════════════ */
(function initParallax() {
  const heroContent = document.querySelector('.hero-content');
  if (!heroContent) return;

  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    if (scrollY < window.innerHeight) {
      heroContent.style.transform = `translateY(${scrollY * 0.2}px)`;
      heroContent.style.opacity   = 1 - scrollY / (window.innerHeight * 0.75);
    }
  }, { passive: true });
})();

/* ════════════════ HORIZONTAL TICKER (optional flair) ════════ */
(function addTicker() {
  /* Creates a subtle marquee line between hero and about */
  const ticker = document.createElement('div');
  ticker.style.cssText = `
    overflow: hidden;
    white-space: nowrap;
    border-top: 1px solid rgba(255,255,255,0.06);
    border-bottom: 1px solid rgba(255,255,255,0.06);
    padding: 14px 0;
    position: relative;
    z-index: 1;
  `;

  const items = ['Cinematography', 'Color Grading', 'Video Editing', 'Storytelling', 'Visual Direction', 'Documentary', 'Brand Films'];
  const text  = items.map(i => `<span style="color:rgba(201,169,110,0.3);margin:0 20px;">·</span> ${i} `).join('').repeat(4);

  const inner = document.createElement('div');
  inner.style.cssText = `
    display: inline-block;
    animation: marquee 28s linear infinite;
    font-family: 'Outfit', sans-serif;
    font-size: 0.7rem;
    letter-spacing: 0.25em;
    text-transform: uppercase;
    color: rgba(240,238,232,0.22);
    font-weight: 300;
  `;
  inner.innerHTML = text;
  ticker.appendChild(inner);

  /* Add marquee keyframes if not already present */
  if (!document.getElementById('marquee-style')) {
    const style = document.createElement('style');
    style.id = 'marquee-style';
    style.textContent = '@keyframes marquee { from { transform: translateX(0) } to { transform: translateX(-50%) } }';
    document.head.appendChild(style);
  }

  const hero  = document.getElementById('hero');
  const about = document.getElementById('about');
  if (hero && about) hero.after(ticker);
})();

/* ══════════════════ CARDS MOUSE TILT ════════════════════════ */
(function initCardTilt() {
  document.querySelectorAll('.portfolio-card, .film-card--featured').forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const cx   = rect.left + rect.width  / 2;
      const cy   = rect.top  + rect.height / 2;
      const dx   = (e.clientX - cx) / (rect.width  / 2);
      const dy   = (e.clientY - cy) / (rect.height / 2);
      card.style.transform = `perspective(1000px) rotateX(${-dy * 4}deg) rotateY(${dx * 4}deg) translateY(-6px)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
      card.style.transition = 'transform 0.5s cubic-bezier(0.25,0.46,0.45,0.94)';
    });
    card.addEventListener('mouseenter', () => {
      card.style.transition = 'transform 0.1s';
    });
  });
})();

/* ═══════════════════════════════════════════════════════════
   GALLERY MODAL — Videos (7–20) + Photos (1–20)
═══════════════════════════════════════════════════════════ */
(function initGallery() {

  const openBtn   = document.getElementById('openGallery');
  const closeBtn  = document.getElementById('closeGallery');
  const modal     = document.getElementById('galleryModal');
  const tabs      = document.querySelectorAll('.gallery-tab');
  const tabPanes  = document.querySelectorAll('.gallery-tab-content');
  const videoGrid = document.getElementById('galleryVideoGrid');
  const photoGrid = document.getElementById('galleryPhotoGrid');

  /* ── Build gallery videos: files 7.mp4 → 20.mp4 ── */
  for (let i = 7; i <= 20; i++) {
    const item = document.createElement('div');
    item.className = 'gallery-item gallery-item--video';
    item.innerHTML = `
      <div class="gallery-item-media">
        <video controls playsinline loop muted preload="none">
          <source src="videos/${i}.mp4" type="video/mp4">
        </video>
      </div>
      <div class="gallery-item-play">▶</div>
      <span class="gallery-item-num">${String(i).padStart(2,'0')}</span>
    `;
    videoGrid.appendChild(item);
  }

  /* ── Build gallery photos: files 1.jpg → 20.jpg ── */
  /* Also supports .png — JS tries jpg first */
  let photoIndex = 0;
  const photoSrcs = [];
  for (let i = 1; i <= 20; i++) {
    const src = `photos/${i}.jpg`;
    photoSrcs.push(src);
    const item = document.createElement('div');
    item.className = 'gallery-item gallery-item--photo';
    item.dataset.photoIndex = i - 1;
    item.innerHTML = `
      <div class="gallery-item-media">
        <img src="${src}" alt="Photo ${i}" loading="lazy"
             onerror="this.src='photos/${i}.png'; this.onerror=null;">
      </div>
      <span class="gallery-item-num">${String(i).padStart(2,'0')}</span>
    `;
    item.addEventListener('click', () => openLightbox(i - 1));
    photoGrid.appendChild(item);
  }

  /* ── Open / Close Modal ── */
  function openModal() {
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function closeModal() {
    modal.classList.remove('open');
    document.body.style.overflow = '';
    /* Pause all gallery videos when closing */
    modal.querySelectorAll('video').forEach(v => v.pause());
  }

  openBtn.addEventListener('click', openModal);
  closeBtn.addEventListener('click', closeModal);
  modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      closeModal();
      closeLightbox();
    }
  });

  /* ── Tab Switching ── */
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tabPanes.forEach(p => p.classList.remove('active'));
      tab.classList.add('active');
      document.getElementById('tab-' + tab.dataset.tab).classList.add('active');
    });
  });

  /* ── Lightbox ── */
  const lightbox     = document.getElementById('lightbox');
  const lightboxImg  = document.getElementById('lightboxImg');
  const lightboxClose= document.getElementById('lightboxClose');
  const lightboxPrev = document.getElementById('lightboxPrev');
  const lightboxNext = document.getElementById('lightboxNext');
  const lightboxCounter = document.getElementById('lightboxCounter');
  let currentPhoto = 0;

  function openLightbox(idx) {
    currentPhoto = idx;
    lightboxImg.src = photoSrcs[idx];
    lightboxCounter.textContent = `${idx + 1} / ${photoSrcs.length}`;
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function closeLightbox() {
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
  }
  function prevPhoto() {
    currentPhoto = (currentPhoto - 1 + photoSrcs.length) % photoSrcs.length;
    lightboxImg.src = photoSrcs[currentPhoto];
    lightboxCounter.textContent = `${currentPhoto + 1} / ${photoSrcs.length}`;
  }
  function nextPhoto() {
    currentPhoto = (currentPhoto + 1) % photoSrcs.length;
    lightboxImg.src = photoSrcs[currentPhoto];
    lightboxCounter.textContent = `${currentPhoto + 1} / ${photoSrcs.length}`;
  }

  lightboxClose.addEventListener('click', closeLightbox);
  lightboxPrev.addEventListener('click', prevPhoto);
  lightboxNext.addEventListener('click', nextPhoto);
  lightbox.addEventListener('click', e => { if (e.target === lightbox) closeLightbox(); });
  document.addEventListener('keydown', e => {
    if (!lightbox.classList.contains('open')) return;
    if (e.key === 'ArrowLeft')  prevPhoto();
    if (e.key === 'ArrowRight') nextPhoto();
  });

})();
