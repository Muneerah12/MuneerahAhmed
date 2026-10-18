// Apply the saved theme and language before the page paints.
try {
  const t = localStorage.getItem('theme'); if (t === 'dark' || t === 'light') document.documentElement.dataset.theme = t;
  const l = new URLSearchParams(location.search).get('lang') || localStorage.getItem('lang');
  if (l === 'ar') { document.documentElement.lang = 'ar'; document.documentElement.dir = 'rtl'; }
} catch (e) {}
