(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const root = document.documentElement;
  const t = (k) => window.I18N.t(k);

  /* ---------- Theme ---------- */
  const themeBtn = $('#themeToggle');
  const isDark = () => root.dataset.theme
    ? root.dataset.theme === 'dark'
    : matchMedia('(prefers-color-scheme: dark)').matches;
  const syncThemeLabel = () => themeBtn.setAttribute('aria-label', isDark() ? t('themeToLight') : t('themeToDark'));
  syncThemeLabel();
  themeBtn.addEventListener('click', () => {
    root.dataset.theme = isDark() ? 'light' : 'dark';
    try { localStorage.setItem('theme', root.dataset.theme); } catch (e) {}
    syncThemeLabel();
  });

  /* ---------- Mobile menu ---------- */
  const nav = $('#nav'), menuBtn = $('#menuBtn');
  const setMenu = (open) => { nav.classList.toggle('open', open); menuBtn.setAttribute('aria-expanded', open); menuBtn.setAttribute('aria-label', open ? t('menuClose') : t('menuOpen')); };
  menuBtn.addEventListener('click', () => setMenu(!nav.classList.contains('open')));
  $$('a', nav).forEach(a => a.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false); });

  /* ---------- Top bar border + scroll spy ---------- */
  const topbar = $('.topbar');
  const onScroll = () => topbar.classList.toggle('scrolled', scrollY > 8);
  addEventListener('scroll', onScroll, { passive: true }); onScroll();

  const links = new Map($$('a', nav).map(a => [a.getAttribute('href').slice(1), a]));
  if ('IntersectionObserver' in window) {
    const spy = new IntersectionObserver(entries => {
      entries.forEach(en => {
        if (en.isIntersecting) {
          links.forEach(a => a.classList.remove('active'));
          const a = links.get(en.target.id); if (a) a.classList.add('active');
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    links.forEach((_, id) => { const el = document.getElementById(id); if (el) spy.observe(el); });
  }

  /* ---------- Project filters ---------- */
  const chips = $$('.chip'), projects = $$('.project'), empty = $('#emptyMsg');
  chips.forEach(chip => chip.addEventListener('click', () => {
    const f = chip.dataset.filter;
    chips.forEach(c => { const on = c === chip; c.classList.toggle('is-on', on); c.setAttribute('aria-pressed', on); });
    let shown = 0;
    projects.forEach(p => {
      const match = f === 'all' || p.dataset.cat.split(' ').includes(f);
      p.hidden = !match;
      p.classList.remove('enter');
      if (match) { void p.offsetWidth; p.classList.add('enter'); shown++; }
    });
    empty.hidden = shown > 0;
  }));

  /* ---------- IDOR demo ---------- */
  const OWN = 1043;
  const people = {
    1041: ['Sara A.', '5,210.00'], 1042: ['Faisal K.', '18,940.50'], 1043: ['You', '2,375.25'],
    1044: ['Noura M.', '41,002.10'], 1045: ['Omar S.', '760.00'], 1046: ['Lama H.', '12,480.75'],
  };
  let id = OWN, fixed = false;
  const idOut = $('#acctId'), res = $('#response'), verdict = $('#verdict'), hint = $('#labHint');
  const setId = (n) => { id = Math.max(1001, Math.min(1099, n)); idOut.textContent = id; idOut.classList.toggle('changed', id !== OWN); };
  $('#idUp').addEventListener('click', () => setId(id + 1));
  $('#idDown').addEventListener('click', () => setId(id - 1));

  const esc = s => String(s).replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
  $('#sendReq').addEventListener('click', () => {
    const p = people[id] || ['(record)', '—'];
    let html, v = '', safe = false;
    if (id === OWN) {
      html = `<span class="st-ok">HTTP/1.1 200 OK</span>\n{ <span class="k">"id"</span>: ${id}, <span class="k">"owner"</span>: "${esc(p[0])}", <span class="k">"balance"</span>: "${p[1]} SAR" }`;
      v = t('labOwn'); safe = true;
    } else if (!fixed) {
      html = `<span class="st-bad">HTTP/1.1 200 OK</span>\n{ <span class="k">"id"</span>: ${id}, <span class="k">"owner"</span>: "${esc(p[0])}", <span class="k">"balance"</span>: "${p[1]} SAR" }`;
      v = t('labIdor');
      fixed = true;
    } else {
      html = `<span class="st-ok">HTTP/1.1 403 Forbidden</span>\n{ <span class="k">"error"</span>: "account ${id} does not belong to this session" }`;
      v = t('labFixed'); safe = true;
    }
    res.innerHTML = html;
    res.classList.remove('flash'); void res.offsetWidth; res.classList.add('flash');
    verdict.textContent = v; verdict.hidden = false; verdict.classList.toggle('safe', safe);
    if (fixed && id !== OWN) hint.textContent = t('labPatched');
  });
  const resetDemo = () => {
    setId(OWN); fixed = false;
    res.innerHTML = `<span class="muted">${t('labWaiting')}</span>`;
    verdict.hidden = true;
    hint.innerHTML = t('labHint');
  };
  $('#resetReq').addEventListener('click', resetDemo);
  resetDemo();

  /* ---------- Copy email ---------- */
  const toast = $('#toast');
  $('#copyEmail').addEventListener('click', async (e) => {
    const email = e.currentTarget.dataset.email;
    try { await navigator.clipboard.writeText(email); toast.textContent = t('copied') + email; }
    catch (err) { toast.textContent = t('copyBlocked') + email; }
    setTimeout(() => { toast.textContent = ''; }, 3500);
  });

  /* ---------- Language change ---------- */
  document.addEventListener('langchange', () => {
    syncThemeLabel();
    setMenu(nav.classList.contains('open'));
    resetDemo();
  });
})();
