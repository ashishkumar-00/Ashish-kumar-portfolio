/* ══════════════════════════════════════════════
   ASHISH KUMAR — PREMIUM PORTFOLIO
   script.js — Complete JavaScript
══════════════════════════════════════════════ */

'use strict';

/* ═══ 1. LOADER ═══ */
(function initLoader() {
  const bar = document.getElementById('loader-bar');
  const pct = document.getElementById('loader-pct');
  const canvas = document.getElementById('loader-canvas');
  const ctx = canvas.getContext('2d');
  let progress = 0;
  let angle = 0;

  // Draw DNA helix on loader canvas
  function drawDNA() {
    ctx.clearRect(0, 0, 120, 120);
    const cx = 60, cy = 60, r = 28;
    for (let i = 0; i < 40; i++) {
      const t  = (i / 40) * Math.PI * 4 + angle;
      const y  = (i / 40) * 100 + 10;
      const x1 = cx + Math.cos(t) * r;
      const x2 = cx + Math.cos(t + Math.PI) * r;
      const a  = Math.abs(Math.cos(t));
      const c  = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#7c6bff';
      ctx.beginPath();
      ctx.arc(x1, y, 2.5, 0, Math.PI * 2);
      ctx.fillStyle = c;
      ctx.globalAlpha = 0.4 + a * 0.6;
      ctx.fill();
      ctx.beginPath();
      ctx.arc(x2, y, 2.5, 0, Math.PI * 2);
      ctx.fillStyle = c;
      ctx.globalAlpha = 0.4 + (1 - a) * 0.6;
      ctx.fill();
      if (i % 4 === 0) {
        ctx.beginPath();
        ctx.moveTo(x1, y); ctx.lineTo(x2, y);
        ctx.strokeStyle = c;
        ctx.globalAlpha = 0.15;
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    }
    ctx.globalAlpha = 1;
    angle += 0.04;
    requestAnimationFrame(drawDNA);
  }
  drawDNA();

  const iv = setInterval(() => {
    progress += Math.random() * 22 + 6;
    if (progress >= 100) { progress = 100; clearInterval(iv); finishLoader(); }
    bar.style.width = progress + '%';
    pct.textContent = Math.floor(progress) + '%';
  }, 180);

  function finishLoader() {
    setTimeout(() => {
      document.getElementById('loader').classList.add('out');
      setTimeout(() => {
        document.getElementById('loader').style.display = 'none';
        startRevealAnimations();
        animateCounters();
      }, 700);
    }, 400);
  }
})();

/* ═══ 2. CUSTOM CURSOR ═══ */
(function initCursor() {
  const dot  = document.getElementById('cursor-dot');
  const ring = document.getElementById('cursor-ring');
  if (!dot || !ring) return;

  let mx = 0, my = 0, rx = 0, ry = 0;
  document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });

  document.querySelectorAll('a, button, .btn, input, textarea, .badge, .project-card').forEach(el => {
    el.addEventListener('mouseenter', () => ring.classList.add('hover'));
    el.addEventListener('mouseleave', () => ring.classList.remove('hover'));
  });

  function animCursor() {
    dot.style.left  = mx + 'px';
    dot.style.top   = my + 'px';
    rx += (mx - rx) * 0.12;
    ry += (my - ry) * 0.12;
    ring.style.left = rx + 'px';
    ring.style.top  = ry + 'px';
    requestAnimationFrame(animCursor);
  }
  animCursor();
})();

/* ═══ 3. HERO CANVAS — PARTICLE MATRIX ═══ */
(function initHeroCanvas() {
  const canvas = document.getElementById('bg-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  function resize() {
    canvas.width  = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  // Particles
  const NUM = 90;
  const particles = Array.from({ length: NUM }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    vx: (Math.random() - 0.5) * 0.4,
    vy: (Math.random() - 0.5) * 0.4,
    r:  Math.random() * 1.8 + 0.5,
    a:  Math.random() * 0.6 + 0.2,
  }));

  // DNA helices floating
  const helices = Array.from({ length: 3 }, (_, i) => ({
    x: (i + 0.5) * (canvas.width / 3),
    phase: (i / 3) * Math.PI * 2,
    speed: 0.008 + i * 0.003,
    alpha: 0.12 + i * 0.04,
  }));

  let mouse = { x: canvas.width / 2, y: canvas.height / 2 };
  canvas.addEventListener('mousemove', e => {
    const r = canvas.getBoundingClientRect();
    mouse.x = e.clientX - r.left;
    mouse.y = e.clientY - r.top;
  });

  let t = 0;
  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const accent = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#7c6bff';
    const glow   = getComputedStyle(document.documentElement).getPropertyValue('--glow').trim() || 'rgba(124,107,255,0.25)';

    // ── Draw DNA helices ──
    helices.forEach(h => {
      const steps = 60;
      const height = canvas.height * 0.85;
      const r = 38;
      const startY = canvas.height * 0.08;

      for (let i = 0; i < steps; i++) {
        const progress = i / steps;
        const angle1 = progress * Math.PI * 6 + t * h.speed * 100 + h.phase;
        const y = startY + progress * height;
        const x1 = h.x + Math.cos(angle1) * r;
        const x2 = h.x + Math.cos(angle1 + Math.PI) * r;
        const brightness = Math.abs(Math.cos(angle1));

        ctx.beginPath();
        ctx.arc(x1, y, 2, 0, Math.PI * 2);
        ctx.fillStyle = accent;
        ctx.globalAlpha = h.alpha * (0.5 + brightness * 0.5);
        ctx.fill();

        ctx.beginPath();
        ctx.arc(x2, y, 1.5, 0, Math.PI * 2);
        ctx.fillStyle = accent;
        ctx.globalAlpha = h.alpha * 0.5;
        ctx.fill();

        if (i % 5 === 0) {
          ctx.beginPath();
          ctx.moveTo(x1, y); ctx.lineTo(x2, y);
          ctx.strokeStyle = accent;
          ctx.globalAlpha = h.alpha * 0.25;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      }
    });

    ctx.globalAlpha = 1;

    // ── Particles ──
    particles.forEach(p => {
      // Mouse attraction
      const dx = mouse.x - p.x;
      const dy = mouse.y - p.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 180) {
        p.vx += dx / dist * 0.018;
        p.vy += dy / dist * 0.018;
      }
      p.vx *= 0.97; p.vy *= 0.97;
      p.x += p.vx; p.y += p.vy;

      if (p.x < 0) p.x = canvas.width;
      if (p.x > canvas.width) p.x = 0;
      if (p.y < 0) p.y = canvas.height;
      if (p.y > canvas.height) p.y = 0;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = accent;
      ctx.globalAlpha = p.a;
      ctx.fill();
    });

    // ── Connections ──
    ctx.globalAlpha = 1;
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const d  = Math.sqrt(dx * dx + dy * dy);
        if (d < 100) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = accent;
          ctx.globalAlpha = (1 - d / 100) * 0.12;
          ctx.lineWidth = 0.7;
          ctx.stroke();
        }
      }
    }

    ctx.globalAlpha = 1;
    t++;
    requestAnimationFrame(draw);
  }
  draw();
})();

/* ═══ 4. TYPING EFFECT ═══ */
(function initTyping() {
  const el = document.getElementById('typed-text');
  if (!el) return;
  const texts = ['Full Stack Developer', 'React Specialist', 'Node.js Engineer', 'Problem Solver', 'UI/UX Enthusiast'];
  let ti = 0, ci = 0, deleting = false;

  function type() {
    const target = texts[ti];
    el.textContent = deleting ? target.slice(0, ci--) : target.slice(0, ci++);

    if (!deleting && ci > target.length) { deleting = true; setTimeout(type, 2000); return; }
    if (deleting && ci < 0) { deleting = false; ti = (ti + 1) % texts.length; ci = 0; setTimeout(type, 300); return; }
    setTimeout(type, deleting ? 35 : 75);
  }
  setTimeout(type, 1800);
})();

/* ═══ 5. NAVBAR ═══ */
(function initNavbar() {
  const nav = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 60);
  });
  document.querySelectorAll('.nav-link').forEach(a => {
    a.addEventListener('click', e => {
      e.preventDefault();
      const id = a.getAttribute('href').slice(1);
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    });
  });
})();

/* ═══ 6. THEME SWITCHER ═══ */
(function initThemes() {
  document.querySelectorAll('.theme-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const theme = btn.dataset.theme;
      document.documentElement.setAttribute('data-theme', theme);
      document.querySelectorAll('.theme-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });
})();

/* ═══ 7. SCROLL REVEAL ═══ */
function startRevealAnimations() {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); } });
  }, { threshold: 0.12 });
  document.querySelectorAll('.reveal-up, .reveal-left').forEach(el => obs.observe(el));
}

/* ═══ 8. SKILL BAR ANIMATION ═══ */
(function initSkillBars() {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.querySelectorAll('.sb-fill').forEach(bar => {
          bar.style.width = bar.dataset.w + '%';
        });
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.3 });
  document.querySelectorAll('.skill-card').forEach(el => obs.observe(el));
})();

/* ═══ 9. COUNTER ANIMATION ═══ */
function animateCounters() {
  document.querySelectorAll('.stat-n').forEach(el => {
    const target = +el.dataset.count;
    let current = 0;
    const step = target / 40;
    const iv = setInterval(() => {
      current = Math.min(current + step, target);
      el.textContent = Math.floor(current);
      if (current >= target) clearInterval(iv);
    }, 40);
  });
}

/* ═══ 10. CARD TILT EFFECT ═══ */
function applyTilt(cards) {
  cards.forEach(card => {
    card.addEventListener('mousemove', e => {
      const r  = card.getBoundingClientRect();
      const x  = e.clientX - r.left;
      const y  = e.clientY - r.top;
      const cx = r.width  / 2;
      const cy = r.height / 2;
      const rx = (y - cy) / cy * -6;
      const ry = (x - cx) / cx *  6;
      card.style.transform = `translateY(-6px) rotateX(${rx}deg) rotateY(${ry}deg)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
      card.style.transition = 'all 0.5s cubic-bezier(0.34,1.56,0.64,1)';
      setTimeout(() => card.style.transition = '', 500);
    });
  });
}

/* ═══ 11. PROJECTS ═══ */
const defaultProjects = [
  { id:1, title:'E-Commerce Platform', desc:'Full-stack shopping app with cart, JWT auth, Stripe payments & admin dashboard.', tags:['React','Node.js','MongoDB','Stripe'], emoji:'🛒', color:'#7c6bff', github:'https://github.com/ashishkumar', demo:'https://demo.com' },
  { id:2, title:'Real-Time Chat App',  desc:'WebSocket-based chat with rooms, typing indicators, file sharing & online status.', tags:['Socket.io','Express','React','Redis'], emoji:'💬', color:'#00d2ff', github:'https://github.com/ashishkumar', demo:'https://demo.com' },
  { id:3, title:'Portfolio CMS',       desc:'Headless CMS with REST API, JWT auth, image upload via Cloudinary & rich editor.', tags:['Node.js','MongoDB','JWT','Cloudinary'], emoji:'⚡', color:'#f59e0b', github:'https://github.com/ashishkumar', demo:'https://demo.com' },
];

let projects = (() => {
  try { return JSON.parse(localStorage.getItem('ak_projects')) || defaultProjects; } catch { return defaultProjects; }
})();

function saveProjects() { localStorage.setItem('ak_projects', JSON.stringify(projects)); }

function renderProjects() {
  const grid = document.getElementById('projectsGrid');
  if (!grid) return;
  grid.innerHTML = '';
  projects.forEach((p, i) => {
    const card = document.createElement('div');
    card.className = 'project-card reveal-up';
    card.style.transitionDelay = `${i * 0.08}s`;
    card.innerHTML = `
      <div class="project-thumb" style="background:linear-gradient(135deg,${hexToRgba(p.color,0.15)},${hexToRgba(p.color,0.04)})">
        <div class="project-accent" style="background:linear-gradient(90deg,${p.color},transparent)"></div>
        <span style="position:relative;z-index:1">${p.emoji || '💻'}</span>
      </div>
      <div class="project-body">
        <div class="project-tags">${p.tags.map(t=>`<span class="project-tag">${t}</span>`).join('')}</div>
        <h3 class="project-title">${esc(p.title)}</h3>
        <p class="project-desc">${esc(p.desc)}</p>
        <div class="project-links">
          ${p.github ? `<a href="${p.github}" target="_blank" class="project-link">↗ GitHub</a>` : ''}
          ${p.demo   ? `<a href="${p.demo}"   target="_blank" class="project-link">🔗 Live</a>`   : ''}
          <button class="project-del" onclick="deleteProject(${p.id})">✕ Delete</button>
        </div>
      </div>`;
    grid.appendChild(card);
  });
  // Re-observe for reveal
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
  }, { threshold: 0.1 });
  grid.querySelectorAll('.reveal-up').forEach(el => obs.observe(el));
  applyTilt(grid.querySelectorAll('.project-card'));
}

function deleteProject(id) {
  if (!confirm('Delete this project?')) return;
  projects = projects.filter(p => p.id !== id);
  saveProjects();
  renderProjects();
}

window.deleteProject = deleteProject;

/* Modal */
window.openAddModal = function() {
  document.getElementById('addModal').classList.add('open');
};
window.closeAddModal = function() {
  document.getElementById('addModal').classList.remove('open');
};
window.closeModal = function(e) {
  if (e.target === document.getElementById('addModal')) window.closeAddModal();
};

window.saveProject = function() {
  const title  = document.getElementById('pTitle').value.trim();
  const desc   = document.getElementById('pDesc').value.trim();
  const tags   = document.getElementById('pTags').value.split(',').map(t => t.trim()).filter(Boolean);
  const emoji  = document.getElementById('pEmoji').value || '💻';
  const color  = document.getElementById('pColor').value;
  const github = document.getElementById('pGithub').value;
  const demo   = document.getElementById('pDemo').value;

  if (!title || !desc) { alert('Title aur Description zaroor bharo!'); return; }
  projects.push({ id: Date.now(), title, desc, tags, emoji, color, github, demo });
  saveProjects();
  window.closeAddModal();
  renderProjects();
  ['pTitle','pDesc','pTags','pEmoji','pGithub','pDemo'].forEach(id => document.getElementById(id).value = '');
  document.getElementById('pColor').value = '#7c6bff';
};

// Start rendering
renderProjects();

/* ═══ 12. CONTACT FORM ═══ */
(function initContactForm() {
  const form   = document.getElementById('contactForm');
  const status = document.getElementById('form-status');
  const btnTxt = document.getElementById('form-btn-text');
  if (!form) return;

  form.addEventListener('submit', async e => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form));
    if (!data.name || !data.email || !data.message) {
      showStatus('error', '✕ Please fill all required fields.');
      return;
    }
    btnTxt.textContent = 'Sending...';
    form.querySelector('button[type=submit]').disabled = true;

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        showStatus('success', '✓ Message sent! I\'ll reply within 24 hours.');
        form.reset();
      } else throw new Error();
    } catch {
      showStatus('error', '✕ Could not send. Please email directly.');
    } finally {
      btnTxt.textContent = 'Send Message';
      form.querySelector('button[type=submit]').disabled = false;
    }
  });

  function showStatus(type, msg) {
    status.className = type;
    status.textContent = msg;
    setTimeout(() => { status.className = ''; status.textContent = ''; }, 6000);
  }
})();

/* ═══ 13. PHOTO UPLOAD ═══ */
window.handlePhoto = function(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = ev => {
    const img = document.getElementById('profileImg');
    const ini = document.getElementById('photoInitials');
    img.src = ev.target.result;
    img.style.display = 'block';
    if (ini) ini.style.display = 'none';
  };
  reader.readAsDataURL(file);
};

/* ═══ 14. SMOOTH SCROLL FOR HERO LINKS ═══ */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const id = a.getAttribute('href').slice(1);
    const target = document.getElementById(id);
    if (target) { e.preventDefault(); target.scrollIntoView({ behavior: 'smooth' }); }
  });
});

/* ═══ UTILS ═══ */
function esc(str) {
  const d = document.createElement('div');
  d.textContent = str;
  return d.innerHTML;
}
function hexToRgba(hex, alpha) {
  const r = parseInt(hex.slice(1,3),16);
  const g = parseInt(hex.slice(3,5),16);
  const b = parseInt(hex.slice(5,7),16);
  return `rgba(${r},${g},${b},${alpha})`;
}
