/* Interactive background.
   Dark: twinkling stars, a crescent moon, constellation lines to the cursor, shooting stars.
   Light: sky, a shining sun with turning rays, drifting clouds, sparkles on click. */
(() => {
  const cv = document.getElementById('sky');
  if (!cv || !cv.getContext) return;
  const ctx = cv.getContext('2d');
  const root = document.documentElement;
  const reduceMQ = matchMedia('(prefers-reduced-motion: reduce)');
  const darkMQ = matchMedia('(prefers-color-scheme: dark)');
  const isDark = () => root.dataset.theme ? root.dataset.theme === 'dark' : darkMQ.matches;

  const rand = (a, b) => a + Math.random() * (b - a);
  const TAU = Math.PI * 2;

  let W = 0, H = 0, dpr = 1;
  let stars = [], clouds = [], shooters = [], sparks = [];
  let mix = isDark() ? 1 : 0;           // 1 = night, 0 = day; eased for a cross-fade
  let hover = 0;                         // eased glow when the cursor is on the sun / moon
  let moonImg = null;
  let nextShooter = performance.now() + rand(2500, 6000);
  const mouse = { x: -9999, y: -9999, px: 0, py: 0 };

  /* ---------- Setup ---------- */
  const orb = () => {
    const small = W < 780;
    const r = small ? 26 : 38;
    const x = W - (small ? 56 : Math.min(170, W * 0.13));
    const y = (small ? 96 : 120) - Math.min(scrollY * 0.05, 60);
    return { x: x - mouse.px * 10, y: y - mouse.py * 8, r };
  };

  function makeMoon(r) {
    const s = Math.ceil(r * 2 + 4);
    const c = document.createElement('canvas');
    c.width = c.height = Math.ceil(s * dpr);
    const g = c.getContext('2d');
    g.scale(dpr, dpr);
    const m = s / 2;
    const body = g.createRadialGradient(m - r * .3, m - r * .3, r * .1, m, m, r);
    body.addColorStop(0, '#FFFBEA'); body.addColorStop(1, '#E9E0C2');
    g.fillStyle = body; g.beginPath(); g.arc(m, m, r, 0, TAU); g.fill();
    g.fillStyle = 'rgba(120, 110, 80, .12)';
    [[.35, .2, .16], [.15, .55, .1], [.55, .6, .08]].forEach(([dx, dy, cr]) => {
      g.beginPath(); g.arc(m + r * dx, m + r * dy, r * cr, 0, TAU); g.fill();
    });
    g.globalCompositeOperation = 'destination-out';
    g.beginPath(); g.arc(m - r * .5, m - r * .25, r * .9, 0, TAU); g.fill();
    return { c, s };
  }

  function makeCloud() {
    const s = rand(.6, 1.35);
    const puffs = [];
    const n = 5 + Math.floor(Math.random() * 3);
    for (let i = 0; i < n; i++) {
      const t = i / (n - 1);
      puffs.push({ x: (t - .5) * 150 * s, y: -Math.sin(t * Math.PI) * rand(16, 30) * s, r: rand(22, 36) * s * (0.75 + Math.sin(t * Math.PI) * .45) });
    }
    return { x: rand(-100, W + 100), y: rand(H * .06, H * .72), d: rand(.4, 1), v: rand(5, 16), s, puffs, w: 190 * s, push: 0, a: rand(.7, .95) };
  }

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = innerWidth; H = innerHeight;
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const n = Math.min(520, Math.round(W * H / 2600));
    stars = Array.from({ length: n }, () => ({
      x: Math.random() * W, y: Math.random() * H, r: Math.random() < .08 ? rand(1.2, 1.9) : rand(.35, 1.1),
      a: rand(.35, 1), tw: rand(.6, 2.2), ph: rand(0, TAU), d: rand(.2, 1),
    }));
    clouds = Array.from({ length: Math.round(W / 280) + 2 }, makeCloud);
    moonImg = makeMoon(orb().r);
    if (reduceMQ.matches) draw(performance.now(), 0);
  }

  /* ---------- Drawing ---------- */
  function skyGradient(night, alpha) {
    const g = ctx.createLinearGradient(0, 0, 0, H);
    if (night) { g.addColorStop(0, '#04070F'); g.addColorStop(.6, '#0B1220'); g.addColorStop(1, '#0F1622'); }
    else { g.addColorStop(0, '#A8D5F6'); g.addColorStop(.5, '#D9ECFA'); g.addColorStop(1, '#F4F6F9'); }
    ctx.globalAlpha = alpha; ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  }

  function drawNight(now, alpha) {
    skyGradient(true, alpha);
    const t = now / 1000;
    // soft nebula
    const neb = ctx.createRadialGradient(W * .2, H * .25, 0, W * .2, H * .25, Math.max(W, H) * .5);
    neb.addColorStop(0, 'rgba(110, 90, 190, .10)'); neb.addColorStop(1, 'rgba(110, 90, 190, 0)');
    ctx.fillStyle = neb; ctx.fillRect(0, 0, W, H);

    // stars + constellation to the cursor
    const near = [];
    for (const s of stars) {
      const x = s.x - mouse.px * s.d * 22, y = s.y - mouse.py * s.d * 14;
      const dx = x - mouse.x, dy = y - mouse.y, dist = Math.hypot(dx, dy);
      const boost = dist < 150 ? 1 - dist / 150 : 0;
      const tw = .55 + .45 * Math.sin(t * s.tw + s.ph);
      ctx.globalAlpha = alpha * Math.min(1, s.a * tw + boost * .8);
      ctx.fillStyle = s.r > 1.2 ? '#FFF6DA' : '#E6EEFF';
      ctx.beginPath(); ctx.arc(x, y, s.r + boost * 1.2, 0, TAU); ctx.fill();
      if (boost > 0) near.push({ x, y, dist });
    }
    if (near.length) {
      near.sort((a, b) => a.dist - b.dist);
      const pts = near.slice(0, 7);
      ctx.lineWidth = .8;
      pts.forEach((p, i) => {
        ctx.globalAlpha = alpha * (1 - p.dist / 150) * .55;
        ctx.strokeStyle = '#BFD3FF';
        ctx.beginPath(); ctx.moveTo(mouse.x, mouse.y); ctx.lineTo(p.x, p.y); ctx.stroke();
        const q = pts[i + 1];
        if (q) { ctx.globalAlpha *= .6; ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke(); }
      });
    }

    // moon
    const o = orb();
    const glowR = o.r * (3.2 + hover * 1.4);
    const glow = ctx.createRadialGradient(o.x, o.y, o.r * .6, o.x, o.y, glowR);
    glow.addColorStop(0, `rgba(255, 244, 210, ${.22 + hover * .18})`); glow.addColorStop(1, 'rgba(255, 244, 210, 0)');
    ctx.globalAlpha = alpha; ctx.fillStyle = glow;
    ctx.beginPath(); ctx.arc(o.x, o.y, glowR, 0, TAU); ctx.fill();
    if (moonImg) ctx.drawImage(moonImg.c, o.x - moonImg.s / 2, o.y - moonImg.s / 2, moonImg.s, moonImg.s);

    // shooting stars
    for (const s of shooters) {
      const k = s.life / s.max, fade = Math.sin(Math.PI * Math.min(1, k));
      const tx = s.x - s.vx * .09, ty = s.y - s.vy * .09;
      const g = ctx.createLinearGradient(s.x, s.y, tx, ty);
      g.addColorStop(0, 'rgba(255, 255, 255, .95)'); g.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.globalAlpha = alpha * fade; ctx.strokeStyle = g; ctx.lineWidth = 1.6;
      ctx.beginPath(); ctx.moveTo(s.x, s.y); ctx.lineTo(tx, ty); ctx.stroke();
    }
  }

  function drawCloud(c, alpha) {
    const x = c.x - mouse.px * c.d * 30 + c.push, y = c.y - mouse.py * c.d * 12;
    ctx.globalAlpha = alpha * c.a * .55; ctx.fillStyle = '#C9DDF0';
    for (const p of c.puffs) { ctx.beginPath(); ctx.arc(x + p.x, y + p.y + 6 * c.s, p.r, 0, TAU); ctx.fill(); }
    ctx.globalAlpha = alpha * c.a; ctx.fillStyle = '#FFFFFF';
    for (const p of c.puffs) { ctx.beginPath(); ctx.arc(x + p.x, y + p.y, p.r, 0, TAU); ctx.fill(); }
  }

  function drawDay(now, alpha) {
    skyGradient(false, alpha);
    const t = now / 1000, o = orb();

    // sun glow + rays
    const glowR = o.r * (4 + hover * 1.6);
    const glow = ctx.createRadialGradient(o.x, o.y, o.r * .5, o.x, o.y, glowR);
    glow.addColorStop(0, `rgba(255, 214, 102, ${.55 + hover * .25})`); glow.addColorStop(1, 'rgba(255, 214, 102, 0)');
    ctx.globalAlpha = alpha; ctx.fillStyle = glow;
    ctx.beginPath(); ctx.arc(o.x, o.y, glowR, 0, TAU); ctx.fill();

    ctx.save(); ctx.translate(o.x, o.y); ctx.rotate(t * .12);
    const rays = 12, len = o.r * (1.9 + hover * .7 + Math.sin(t * 1.6) * .08);
    ctx.fillStyle = 'rgba(255, 200, 70, .38)';
    for (let i = 0; i < rays; i++) {
      ctx.rotate(TAU / rays);
      ctx.beginPath(); ctx.moveTo(o.r * 1.12, -o.r * .12); ctx.lineTo(len, 0); ctx.lineTo(o.r * 1.12, o.r * .12); ctx.fill();
    }
    ctx.restore();

    const core = ctx.createRadialGradient(o.x - o.r * .3, o.y - o.r * .3, o.r * .1, o.x, o.y, o.r);
    core.addColorStop(0, '#FFF7CF'); core.addColorStop(.6, '#FFD65A'); core.addColorStop(1, '#FFB937');
    ctx.globalAlpha = alpha; ctx.fillStyle = core;
    ctx.beginPath(); ctx.arc(o.x, o.y, o.r, 0, TAU); ctx.fill();

    for (const c of clouds) drawCloud(c, alpha);
  }

  function drawSparks(alpha) {
    for (const p of sparks) {
      const k = 1 - p.life / p.max;
      if (k <= 0) continue;
      ctx.globalAlpha = alpha * k;
      ctx.fillStyle = p.c;
      const r = p.r * (0.6 + k * .6);
      ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot);
      ctx.beginPath();
      for (let i = 0; i < 4; i++) {
        ctx.rotate(Math.PI / 2);
        ctx.lineTo(0, -r); ctx.lineTo(r * .22, -r * .22);
      }
      ctx.closePath(); ctx.fill(); ctx.restore();
    }
  }

  function draw(now, dt) {
    ctx.globalAlpha = 1;
    ctx.clearRect(0, 0, W, H);
    if (mix < 1) drawDay(now, 1);
    if (mix > 0) drawNight(now, mix);
    drawSparks(1);
    ctx.globalAlpha = 1;
  }

  /* ---------- Update ---------- */
  function spawnShooter(x, y) {
    const ang = rand(Math.PI * .72, Math.PI * .85); // heading down-left
    const sp = rand(650, 950);
    shooters.push({ x: x ?? rand(W * .3, W * 1.05), y: y ?? rand(-20, H * .35), vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp, life: 0, max: rand(.7, 1.1) });
  }

  function burst(x, y, n, colors) {
    for (let i = 0; i < n; i++) {
      const a = rand(0, TAU), sp = rand(60, 220);
      sparks.push({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 40, r: rand(4, 9), rot: rand(0, TAU), c: colors[i % colors.length], life: 0, max: rand(.7, 1.2) });
    }
  }

  function update(now, dt) {
    const target = isDark() ? 1 : 0;
    mix += (target - mix) * Math.min(1, dt * 4);
    if (Math.abs(target - mix) < .002) mix = target;

    mouse.px += ((mouse.x < 0 ? 0 : mouse.x / W - .5) - mouse.px) * Math.min(1, dt * 3);
    mouse.py += ((mouse.y < 0 ? 0 : mouse.y / H - .5) - mouse.py) * Math.min(1, dt * 3);

    const o = orb();
    const onOrb = Math.hypot(mouse.x - o.x, mouse.y - o.y) < o.r * 2.2 ? 1 : 0;
    hover += (onOrb - hover) * Math.min(1, dt * 5);

    for (const c of clouds) {
      c.x += c.v * dt;
      const cx = c.x + c.push, dx = cx - mouse.x, dy = c.y - mouse.y;
      const d = Math.hypot(dx, dy);
      const want = d < 170 ? Math.sign(dx || 1) * (170 - d) * .5 : 0;
      c.push += (want - c.push) * Math.min(1, dt * 2);
      if (c.x - c.w > W + 40) { c.x = -c.w - rand(0, 200); c.y = rand(H * .06, H * .72); }
    }

    if (mix > .5 && now > nextShooter) { spawnShooter(); nextShooter = now + rand(3500, 8000); }
    shooters = shooters.filter(s => { s.x += s.vx * dt; s.y += s.vy * dt; s.life += dt; return s.life < s.max; });
    sparks = sparks.filter(p => { p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 120 * dt; p.vx *= .98; p.rot += dt * 2; p.life += dt; return p.life < p.max; });
  }

  let last = performance.now(), running = false;
  function frame(now) {
    const dt = Math.min(.05, (now - last) / 1000); last = now;
    update(now, dt); draw(now, dt);
    if (running) requestAnimationFrame(frame);
  }
  function start() {
    if (reduceMQ.matches) { running = false; mix = isDark() ? 1 : 0; draw(performance.now(), 0); return; }
    if (!running) { running = true; last = performance.now(); requestAnimationFrame(frame); }
  }

  /* ---------- Events ---------- */
  addEventListener('resize', resize);
  addEventListener('pointermove', e => { mouse.x = e.clientX; mouse.y = e.clientY; }, { passive: true });
  document.addEventListener('pointerleave', () => { mouse.x = mouse.y = -9999; });
  addEventListener('scroll', () => { if (!running) draw(performance.now(), 0); }, { passive: true });

  // Click on empty background: a shooting star at night, sparkles by day.
  document.addEventListener('click', e => {
    if (reduceMQ.matches) return;
    if (e.target.closest('a, button, input, textarea, select, summary, label, .lab, .project, .chat, .feature, .topbar, .nav')) return;
    if (getSelection && String(getSelection()).length) return;
    const o = orb(), onOrb = Math.hypot(e.clientX - o.x, e.clientY - o.y) < o.r * 2.2;
    if (isDark()) {
      if (onOrb) { for (let i = 0; i < 4; i++) setTimeout(() => spawnShooter(), i * 160); }
      else spawnShooter(e.clientX + 60, e.clientY - 40);
      burst(e.clientX, e.clientY, 6, ['#FFF6DA', '#CFE0FF']);
    } else {
      burst(e.clientX, e.clientY, onOrb ? 26 : 14, ['#FFD65A', '#FFB937', '#FFF1A8']);
    }
  });

  // Hidden CTF solved (chat.js): celebrate.
  document.addEventListener('flagcaptured', () => {
    if (reduceMQ.matches) return;
    const o = orb();
    if (isDark()) {
      for (let i = 0; i < 12; i++) setTimeout(() => spawnShooter(), i * 120);
      burst(o.x, o.y, 30, ['#FFF6DA', '#CFE0FF', '#E86F83']);
    } else {
      burst(o.x, o.y, 40, ['#FFD65A', '#FFB937', '#FFF1A8']);
      setTimeout(() => burst(W / 2, H / 3, 40, ['#FFD65A', '#E86F83', '#FFF1A8']), 250);
    }
  });

  new MutationObserver(() => { if (!running) { mix = isDark() ? 1 : 0; draw(performance.now(), 0); } })
    .observe(root, { attributes: true, attributeFilter: ['data-theme'] });
  darkMQ.addEventListener?.('change', () => { if (!running) { mix = isDark() ? 1 : 0; draw(performance.now(), 0); } });
  reduceMQ.addEventListener?.('change', start);

  resize();
  start();
})();
