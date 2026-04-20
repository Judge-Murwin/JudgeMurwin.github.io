'use strict';

/* ==========================================
   Network Canvas Animation
   ========================================== */
class NetworkCanvas {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.nodes = [];
    this.mouse = { x: null, y: null };
    this._resize();
    this._initNodes();
    this._bindEvents();
    this._loop();
  }

  _resize() {
    this.canvas.width  = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  _initNodes() {
    const area  = this.canvas.width * this.canvas.height;
    const count = Math.min(Math.floor(area / 13000), 90);
    this.nodes  = [];
    for (let i = 0; i < count; i++) {
      this.nodes.push({
        x:  Math.random() * this.canvas.width,
        y:  Math.random() * this.canvas.height,
        vx: (Math.random() - 0.5) * 0.22,
        vy: (Math.random() - 0.5) * 0.22,
        r:  Math.random() * 1.4 + 0.4,
      });
    }
  }

  _bindEvents() {
    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => { this._resize(); this._initNodes(); }, 200);
    });
    this.canvas.addEventListener('mousemove', e => {
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;
    });
    this.canvas.addEventListener('mouseleave', () => {
      this.mouse.x = null;
      this.mouse.y = null;
    });
  }

  _loop() {
    const ctx   = this.ctx;
    const W     = this.canvas.width;
    const H     = this.canvas.height;
    const nodes = this.nodes;
    const mouse = this.mouse;
    const EDGE  = 140;
    const MEDGE = 130;

    ctx.clearRect(0, 0, W, H);

    for (let i = 0; i < nodes.length; i++) {
      const n = nodes[i];
      n.x += n.vx;
      n.y += n.vy;
      if (n.x <= 0 || n.x >= W) n.vx *= -1;
      if (n.y <= 0 || n.y >= H) n.vy *= -1;

      for (let j = i + 1; j < nodes.length; j++) {
        const m    = nodes[j];
        const dx   = n.x - m.x;
        const dy   = n.y - m.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < EDGE) {
          ctx.beginPath();
          ctx.moveTo(n.x, n.y);
          ctx.lineTo(m.x, m.y);
          ctx.strokeStyle = `rgba(0,212,170,${0.11 * (1 - dist / EDGE)})`;
          ctx.lineWidth   = 0.7;
          ctx.stroke();
        }
      }

      if (mouse.x !== null) {
        const dx   = n.x - mouse.x;
        const dy   = n.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < MEDGE) {
          ctx.beginPath();
          ctx.moveTo(n.x, n.y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.strokeStyle = `rgba(0,212,170,${0.22 * (1 - dist / MEDGE)})`;
          ctx.lineWidth   = 0.7;
          ctx.stroke();
        }
      }

      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0,212,170,0.3)';
      ctx.fill();
    }

    requestAnimationFrame(() => this._loop());
  }
}

/* ==========================================
   Typewriter
   ========================================== */
class Typewriter {
  constructor(el, texts, { typeSpeed = 72, deleteSpeed = 34, holdTime = 2400 } = {}) {
    this.el          = el;
    this.texts       = texts;
    this.typeSpeed   = typeSpeed;
    this.deleteSpeed = deleteSpeed;
    this.holdTime    = holdTime;
    this.idx         = 0;
    this.char        = 0;
    this.deleting    = false;
    this._tick();
  }

  _tick() {
    const text = this.texts[this.idx];
    if (this.deleting) {
      this.el.textContent = text.slice(0, --this.char);
      if (this.char === 0) {
        this.deleting = false;
        this.idx      = (this.idx + 1) % this.texts.length;
        setTimeout(() => this._tick(), 380);
        return;
      }
      setTimeout(() => this._tick(), this.deleteSpeed);
    } else {
      this.el.textContent = text.slice(0, ++this.char);
      if (this.char === text.length) {
        this.deleting = true;
        setTimeout(() => this._tick(), this.holdTime);
        return;
      }
      setTimeout(() => this._tick(), this.typeSpeed);
    }
  }
}

/* ==========================================
   Scroll Reveal
   ========================================== */
function initReveal() {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('revealed'); });
  }, { threshold: 0.07, rootMargin: '0px 0px -36px 0px' });
  document.querySelectorAll('[data-reveal]').forEach(el => obs.observe(el));
}

/* ==========================================
   Navigation
   ========================================== */
function initNav() {
  const nav    = document.querySelector('.nav');
  const toggle = document.querySelector('.nav-toggle');
  const mobile = document.querySelector('.nav-mobile');

  if (nav) {
    window.addEventListener('scroll', () => {
      nav.classList.toggle('scrolled', window.scrollY > 16);
    }, { passive: true });
  }

  if (toggle && mobile) {
    toggle.addEventListener('click', () => {
      toggle.classList.toggle('open');
      mobile.classList.toggle('open');
    });
    mobile.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        toggle.classList.remove('open');
        mobile.classList.remove('open');
      });
    });
  }
}

/* ==========================================
   Project Modal
   ========================================== */
function initModal() {
  const overlay = document.querySelector('.modal-overlay');
  if (!overlay) return;

  const closeBtn = overlay.querySelector('.modal-close');

  document.querySelectorAll('.project-card[data-modal]').forEach(card => {
    card.addEventListener('click', () => {
      const data = typeof projectData !== 'undefined' ? projectData[card.dataset.modal] : null;
      if (!data) return;
      _fillModal(data);
      overlay.classList.add('open');
      document.body.style.overflow = 'hidden';
    });
  });

  function close() {
    overlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  closeBtn && closeBtn.addEventListener('click', close);
  overlay.addEventListener('click', e => { if (e.target === overlay) close(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
}

function _fillModal(p) {
  const modal = document.querySelector('.modal');

  const banner = modal.querySelector('.modal-banner');
  banner.className = `modal-banner ${p.grad || 'g1'}`;
  banner.querySelector('.modal-banner-text').textContent = p.bannerText || '';
  modal.querySelector('.modal-icon').textContent = p.abbr || '??';

  modal.querySelector('.modal-title').textContent = p.title;
  modal.querySelector('.modal-desc').textContent  = p.description;

  modal.querySelector('.modal-tags').innerHTML =
    p.tags.map(t => `<span class="tag tag-${t.color}">${t.label}</span>`).join('');

  modal.querySelector('.modal-tools').innerHTML =
    p.tools.map(t => `<span class="modal-tool">${t}</span>`).join('');

  const hl = modal.querySelector('.modal-highlights');
  if (hl && p.highlights) {
    hl.innerHTML = p.highlights.map(h => `<li>${h}</li>`).join('');
  }

  const link = modal.querySelector('.modal-github-link');
  if (link) link.href = p.github;
}

/* ==========================================
   Terminal Easter Egg
   ========================================== */
function initTerminal() {
  const btn = document.querySelector('.terminal-btn');
  const win = document.querySelector('.terminal-window');
  if (!btn || !win) return;

  const output = win.querySelector('.t-out');
  const input  = win.querySelector('.t-input');
  const body   = win.querySelector('.terminal-body');

  const cmds = {
    help: () => [
      { t: 'hi',  text: 'Available commands:' },
      { t: 'dim', text: '  whoami   — about me' },
      { t: 'dim', text: '  skills   — technical skills' },
      { t: 'dim', text: '  projects — list projects' },
      { t: 'dim', text: '  contact  — contact info' },
      { t: 'dim', text: '  clear    — clear output' },
      { t: 'dim', text: '  exit     — close terminal' },
    ],
    whoami: () => [
      { t: 'hi', text: 'judge-murwin' },
      { t: '',   text: 'Information Security Analyst' },
      { t: '',   text: 'University of Pittsburgh — Info Science / Cybersecurity' },
      { t: '',   text: 'Philadelphia, PA' },
    ],
    skills: () => [
      { t: 'hi',  text: 'Penetration Testing' },
      { t: 'dim', text: '  nmap  nessus  metasploit  burp-suite' },
      { t: 'hi',  text: 'Network Security' },
      { t: 'dim', text: '  cisco-ios  vlans  ospf  bgp  snort' },
      { t: 'hi',  text: 'Digital Forensics' },
      { t: 'dim', text: '  ftk-imager  autopsy  wireshark' },
      { t: 'hi',  text: 'Systems' },
      { t: 'dim', text: '  windows-server  linux  active-directory' },
    ],
    projects: () => [
      { t: '',    text: '[1] PenetrationTesting-MS08-067-Exploit' },
      { t: '',    text: '[2] Wireless-Network-Exploitation' },
      { t: '',    text: '[3] ZeroLogonExploit' },
      { t: 'dim', text: 'Type "open <n>" to view on GitHub.' },
    ],
    'open 1': () => {
      window.open('https://github.com/Judge-Murwin/PenetrationTesting-MS08-067-Exploit', '_blank');
      return [{ t: 'hi', text: 'Opening repository...' }];
    },
    'open 2': () => {
      window.open('https://github.com/Judge-Murwin/Wireless-Network-Exploitation', '_blank');
      return [{ t: 'hi', text: 'Opening repository...' }];
    },
    'open 3': () => {
      window.open('https://github.com/Judge-Murwin/ZeroLogonExploit', '_blank');
      return [{ t: 'hi', text: 'Opening repository...' }];
    },
    contact: () => [
      { t: '', text: 'Email:    j.murwin7@gmail.com' },
      { t: '', text: 'LinkedIn: linkedin.com/in/judge-murwin' },
      { t: '', text: 'GitHub:   github.com/Judge-Murwin' },
      { t: '', text: 'Location: Philadelphia, PA' },
    ],
    clear: () => { output.innerHTML = ''; return null; },
    exit:  () => { win.classList.remove('open'); return null; },
  };

  function printLines(lines) {
    if (!lines) return;
    lines.forEach(({ t, text }) => {
      const el = document.createElement('div');
      el.className = `t-line ${t}`;
      el.textContent = text;
      output.appendChild(el);
    });
    body.scrollTop = body.scrollHeight;
  }

  printLines([
    { t: 'hi',  text: 'judge-murwin v1.0.0' },
    { t: 'dim', text: 'Type "help" for available commands.' },
    { t: 'dim', text: '' },
  ]);

  btn.addEventListener('click', () => {
    win.classList.toggle('open');
    if (win.classList.contains('open')) input.focus();
  });

  input.addEventListener('keydown', e => {
    if (e.key !== 'Enter') return;
    const cmd = input.value.trim().toLowerCase();
    input.value = '';
    if (!cmd) return;

    const echo = document.createElement('div');
    echo.className = 't-line';
    echo.innerHTML = `<span style="color:var(--accent)">~/judge $</span> ${_esc(cmd)}`;
    output.appendChild(echo);

    const handler = cmds[cmd];
    if (handler) {
      printLines(handler());
    } else {
      printLines([{ t: 'err', text: `command not found: ${_esc(cmd)}` }]);
    }
  });
}

function _esc(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/* ==========================================
   Init
   ========================================== */
document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('hero-canvas');
  if (canvas) new NetworkCanvas(canvas);

  const tw = document.querySelector('.typewriter');
  if (tw) new Typewriter(tw, [
    'Information Security Analyst',
    'Penetration Tester',
    'Network Defender',
  ]);

  initReveal();
  initNav();
  initModal();
  initTerminal();
});
