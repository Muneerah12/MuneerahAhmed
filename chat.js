/* Mini chatbot about Muneerah.
   Runs fully in the browser (works on GitHub Pages): it matches keywords in
   English or Arabic to answers written from the facts on this page. */
(() => {
  const $ = (s) => document.querySelector(s);
  const lang = () => (window.I18N ? window.I18N.lang : 'en');
  const t = (k) => (window.I18N ? window.I18N.t(k) : k);

  const RASED_SITE = 'https://reemalosaimii.github.io/Rased/';
  const LINKEDIN = 'https://www.linkedin.com/in/muneerah-alahaideeb-b99896231/';

  // Each topic: chip label, keywords (lowercase; Arabic written without hamza/taa marbuta forms), answer.
  const TOPICS = [
    {
      id: 'about', chip: ['Who is she?', 'من هي منيرة؟'],
      keys: ['who is', 'who\'s', 'whois', 'introduce', 'yourself', 'summary', 'background', 'من هي', 'من انت', 'عرفني', 'نبذه', 'تعريف'],
      en: 'Muneerah Alahaideeb is a cybersecurity specialist in Riyadh, growing into offensive security. She is <b>CompTIA Security+</b> certified, did SOC and vulnerability management work at <b>Zain KSA</b>, won <b>2nd place</b> at the Riyadh Expo 2030 Challenge with RASED, and her team <b>qualified for the Black Hat MEA CTF</b> (December 2026).',
      ar: 'منيرة الاحيدب متخصصة في الأمن السيبراني من الرياض، تتجه نحو الأمن الهجومي. حاصلة على <b>CompTIA Security+</b>، وعملت في مركز العمليات الأمنية وإدارة الثغرات لدى <b>زين السعودية</b>، وحصلت مع فريقها على <b>المركز الثاني</b> في تحدي إكسبو الرياض 2030 بمشروع راصد، و<b>تأهل فريقها لمسابقة Black Hat MEA CTF</b> (ديسمبر 2026).',
    },
    {
      id: 'rased', chip: ['RASED', 'راصد'],
      keys: ['rased', 'expo', 'crowd', 'award', 'prize', 'win', 'won', 'second', '2nd', 'راصد', 'اكسبو', 'حشود', 'جايزه', 'جائزه', 'فوز', 'المركز', 'الثاني'],
      en: `RASED is an AI crowd safety and response platform built by a team of five. It detects crowding, falls, weapons, gunshots and fire from cameras, audio and sensors, alerts the right team with a snapshot, and drafts the incident report. It won <b>2nd place at the Riyadh Expo 2030 Challenge</b> (Oct 2026). Muneerah owned the IoT/OT layer and secured it against fake or tampered sensor data. <a href="#rasedTitle">Read more</a> · <a href="${RASED_SITE}" target="_blank" rel="noopener">Visit the RASED site ↗</a>`,
      ar: `راصد منصة ذكية لسلامة الحشود والاستجابة بناها فريق من خمس عقول. تكتشف الازدحام والسقوط والأسلحة والطلقات والحريق عبر الكاميرات والصوت والحساسات، وتنبّه الفريق المختص مع صورة اللقطة، وتُعدّ مسودة تقرير الحادثة. حصلت على <b>المركز الثاني في تحدي إكسبو الرياض 2030</b> (أكتوبر 2026). تولّت منيرة طبقة IoT/OT وأمّنتها ضد بيانات الحساسات المزيفة أو المعدّلة. <a href="#rasedTitle">اقرأ المزيد</a> · <a href="${RASED_SITE}" target="_blank" rel="noopener">زوروا موقع راصد ↗</a>`,
    },
    {
      id: 'ctf', chip: ['CTFs', 'مسابقات CTF'],
      keys: ['ctf', 'black hat', 'blackhat', 'flag', 'flagyard', 'competition', 'tuwaiq challenge', 'mea', 'مسابق', 'بلاك هات', 'اعلام', 'تحدي طويق'],
      en: 'Her team played the <b>Black Hat MEA CTF</b> qualifier on FlagYard, captured <b>three flags</b> and qualified to compete at Black Hat MEA in <b>December 2026</b>. She also competed in the <b>Tuwaiq Cyber Challenge</b>. <a href="#ctf">See the details</a>',
      ar: 'شارك فريقها في تصفيات <b>Black Hat MEA CTF</b> على منصة FlagYard، والتقط <b>ثلاثة أعلام</b> وتأهل للمنافسة في Black Hat MEA في <b>ديسمبر 2026</b>. كما شاركت في <b>تحدي طويق السيبراني</b>. <a href="#ctf">التفاصيل</a>',
    },
    {
      id: 'exp', chip: ['Experience', 'الخبرات'],
      keys: ['experience', 'zain', 'intern', 'internship', 'job', 'worked', 'soc', 'siem', 'خبره', 'خبرات', 'زين', 'تدريب', 'تدربت', 'وظيفه', 'عملت', 'مركز العمليات'],
      en: 'Cybersecurity Specialist Intern at <b>Zain KSA</b> (Sep 2024 – Mar 2025, cooperative training): monitored logs and ran advanced searches in Elastic SIEM, managed SOC tickets, ran vulnerability assessments, was Auditing Champion for internal audits against NCA ECC and CCC, and secured Alibaba Cloud environments. <a href="#experience">See experience</a>',
      ar: 'أخصائية أمن سيبراني متدربة في <b>زين السعودية</b> (سبتمبر 2024 – مارس 2025، تدريب تعاوني): راقبت السجلات وأجرت عمليات بحث متقدمة في Elastic SIEM، وأدارت تذاكر SOC، وأجرت تقييمات للثغرات، وكانت Auditing Champion في التدقيق الداخلي وفق ضوابط NCA ECC وCCC، وأمّنت بيئات Alibaba Cloud. <a href="#experience">عرض الخبرات</a>',
    },
    {
      id: 'skills', chip: ['Skills', 'المهارات'],
      keys: ['skill', 'tool', 'burp', 'nmap', 'wireshark', 'metasploit', 'python', 'tech', 'stack', 'know', 'مهار', 'ادوات', 'اداه', 'تقنيات', 'تعرف', 'برمج'],
      en: '<b>Offensive:</b> OWASP Top 10, IDOR and access control, authentication testing, Android static and dynamic analysis, network recon. <b>Tools:</b> Burp Suite, Nmap, Wireshark, Metasploit, ADB, JADX. <b>Defensive:</b> Elastic SIEM, log analysis, MITRE ATT&amp;CK, NCA ECC. <b>Building:</b> Python, FastAPI, ESP32. <a href="#skills">All skills</a>',
      ar: '<b>هجومي:</b> OWASP Top 10، ثغرات IDOR والتحكم في الوصول، اختبار المصادقة، تحليل تطبيقات أندرويد، استطلاع الشبكات. <b>الأدوات:</b> Burp Suite وNmap وWireshark وMetasploit وADB وJADX. <b>دفاعي:</b> Elastic SIEM، تحليل السجلات، MITRE ATT&amp;CK، NCA ECC. <b>البناء:</b> Python وFastAPI وESP32. <a href="#skills">كل المهارات</a>',
    },
    {
      id: 'labs', chip: ['Projects & labs', 'المشاريع والمختبرات'],
      keys: ['project', 'lab', 'labs', 'portfolio', 'banking app', 'android', 'portswigger', 'juice', 'idor', 'pentest', 'penetration', 'hack', 'مشروع', 'مشاريع', 'مختبر', 'اختراق', 'اندرويد', 'ثغر'],
      en: 'Hands-on labs in authorised, intentionally vulnerable environments: an <b>Android banking app assessment</b> (found four issues), <b>PortSwigger Web Security Academy</b> (access control and authentication), <b>OWASP Juice Shop</b>, and <b>network attacks</b> with Nmap and Wireshark. She also builds: RASED and Bank Shield (in development). <a href="#work">See the work</a>',
      ar: 'مختبرات تطبيقية في بيئات مصرّح بها ومعرّضة للثغرات عمدًا: <b>تقييم تطبيق بنكي على أندرويد</b> (اكتشفت أربع ثغرات)، و<b>PortSwigger Web Security Academy</b> (التحكم في الوصول والمصادقة)، و<b>OWASP Juice Shop</b>، و<b>الهجمات الشبكية</b> باستخدام Nmap وWireshark. وتبني أيضًا: راصد وBank Shield (قيد التطوير). <a href="#work">عرض الأعمال</a>',
    },
    {
      id: 'certs', chip: ['Certifications', 'الشهادات'],
      keys: ['cert', 'security+', 'security plus', 'comptia', 'ejpt', 'tryhackme', 'course', 'bootcamp', 'kaspersky', 'training', 'شهاد', 'دوره', 'دورات', 'معسكر', 'كاسبرسكي', 'سكيورتي'],
      en: '<b>CompTIA Security+</b> (Nov 2024). Bootcamps: Kaspersky × Tuwaiq Cybersecurity Solutions &amp; Analytics (Oct 2026) and Tuwaiq Cybercrime &amp; Network Forensics (Jul 2025). In progress: TryHackMe Jr Penetration Tester path, and preparing for eJPT. <a href="#credentials">See credentials</a>',
      ar: '<b>CompTIA Security+</b> (نوفمبر 2024). المعسكرات: حلول وتحليلات الأمن السيبراني من كاسبرسكي × طويق (أكتوبر 2026)، والجرائم السيبرانية والتحليل الجنائي للشبكات من طويق (يوليو 2025). قيد التقدم: مسار TryHackMe Jr Penetration Tester، والاستعداد لشهادة eJPT. <a href="#credentials">عرض الشهادات</a>',
    },
    {
      id: 'edu', chip: ['Education', 'التعليم'],
      keys: ['education', 'degree', 'university', 'study', 'studied', 'graduate', 'psu', 'prince sultan', 'major', 'تعليم', 'جامعه', 'دراسه', 'درست', 'تخصص', 'بكالوريوس', 'خريجه', 'الامير سلطان'],
      en: '<b>B.S. in Information Systems, Cybersecurity track</b>, Prince Sultan University, Riyadh (2025), with coursework in penetration testing and ethical hacking, and cyber-physical system security.',
      ar: '<b>بكالوريوس نظم المعلومات، مسار الأمن السيبراني</b>، جامعة الأمير سلطان، الرياض (2025)، مع مقررات في اختبار الاختراق والاختراق الأخلاقي وأمن الأنظمة السيبرانية الفيزيائية.',
    },
    {
      id: 'roles', chip: ['What role is she looking for?', 'ما الفرص التي تبحث عنها؟'],
      keys: ['role', 'looking', 'open to', 'available', 'position', 'hiring', 'opportunit', 'red team', 'purple', 'فرص', 'فرصه', 'تبحث', 'متاحه', 'وظيفه', 'فريق احمر', 'بنفسجي'],
      en: 'She is open to <b>red team and purple team</b> roles in Riyadh, where her hands-on offensive labs and her SOC experience both count. <a href="#contact">Get in touch</a>',
      ar: 'تبحث عن فرص في <b>الفريق الأحمر والفريق البنفسجي</b> في الرياض، حيث تفيد مختبراتها الهجومية وخبرتها في مركز العمليات الأمنية معًا. <a href="#contact">تواصل معها</a>',
    },
    {
      id: 'contact', chip: ['Contact', 'التواصل'],
      keys: ['contact', 'email', 'mail', 'phone', 'number', 'reach', 'linkedin', 'call', 'hire', 'تواصل', 'ايميل', 'بريد', 'رقم', 'جوال', 'هاتف', 'لينكد', 'اتصل'],
      en: `Email: <a href="mailto:AmuneerahA@gmail.com">AmuneerahA@gmail.com</a> (fastest)<br>LinkedIn: <a href="${LINKEDIN}" target="_blank" rel="noopener">Muneerah Alahaideeb ↗</a><br>Phone: <a href="tel:+966551474957" dir="ltr">+966 55 147 4957</a>`,
      ar: `البريد: <a href="mailto:AmuneerahA@gmail.com">AmuneerahA@gmail.com</a> (الأسرع)<br>لينكدإن: <a href="${LINKEDIN}" target="_blank" rel="noopener">منيرة الاحيدب ↗</a><br>الجوال: <a href="tel:+966551474957" dir="ltr">+966 55 147 4957</a>`,
    },
    {
      id: 'resume', chip: ['Resume', 'السيرة الذاتية'],
      keys: ['resume', 'cv', 'pdf', 'سيره', 'السيره', 'سي في'],
      en: 'Here is her resume: <a href="Muneerah_Alahaideeb_Resume.pdf" target="_blank" rel="noopener">open the PDF ↗</a>',
      ar: 'هذه سيرتها الذاتية: <a href="Muneerah_Alahaideeb_Resume.pdf" target="_blank" rel="noopener">افتح ملف PDF ↗</a>',
    },
    {
      id: 'bank', chip: null,
      keys: ['bank shield', 'fraud', 'sim swap', 'sim-swap', 'account takeover', 'ato', 'احتيال', 'شريحه', 'بنك شيلد'],
      en: '<b>Bank Shield</b> (in development since May 2026) is AI pre-login fraud and SIM-swap detection: it scores behaviour and context before a user signs in, and only steps in when the risk looks like account takeover.',
      ar: '<b>Bank Shield</b> (قيد التطوير منذ مايو 2026) نظام ذكي لكشف الاحتيال وتبديل الشريحة قبل تسجيل الدخول: يقيّم السلوك والسياق قبل دخول المستخدم، ولا يتدخل إلا عندما يبدو الخطر استيلاءً على الحساب.',
    },
    {
      id: 'where', chip: null,
      keys: ['where', 'location', 'based', 'live', 'riyadh', 'city', 'وين', 'مكان', 'تسكن', 'الرياض', 'مدينه'],
      en: 'She is based in <b>Riyadh, Saudi Arabia</b>.',
      ar: 'تقيم في <b>الرياض، المملكة العربية السعودية</b>.',
    },
    {
      id: 'hi', chip: null,
      keys: ['hi', 'hello', 'hey', 'salam', 'مرحبا', 'السلام', 'هلا', 'اهلا', 'هاي'],
      en: 'Hi! 👋 Ask me anything about Muneerah, or pick a topic below.',
      ar: 'أهلًا! 👋 اسألني أي شيء عن منيرة، أو اختر موضوعًا من الأسفل.',
    },
    {
      id: 'thanks', chip: null,
      keys: ['thank', 'thx', 'great', 'cool', 'شكرا', 'يعطيك', 'مشكور', 'تسلم'],
      en: 'You’re welcome! If you’d like to talk to Muneerah directly, email <a href="mailto:AmuneerahA@gmail.com">AmuneerahA@gmail.com</a>.',
      ar: 'العفو! إذا أردت التواصل مع منيرة مباشرة، راسلها على <a href="mailto:AmuneerahA@gmail.com">AmuneerahA@gmail.com</a>.',
    },
  ];

  const UI = {
    hello: [
      'Hi! I’m a small bot that answers questions about Muneerah using what’s on this page. Pick a topic or type a question.',
      'أهلًا! أنا مساعد صغير يجيب عن أسئلتك حول منيرة من محتوى هذه الصفحة. اختر موضوعًا أو اكتب سؤالك.',
    ],
    fallback: [
      'I’m a simple bot, so I may have missed that. Try one of the topics below, or email Muneerah at <a href="mailto:AmuneerahA@gmail.com">AmuneerahA@gmail.com</a>.',
      'أنا مساعد بسيط وربما لم أفهم سؤالك. جرّب أحد المواضيع في الأسفل، أو راسل منيرة على <a href="mailto:AmuneerahA@gmail.com">AmuneerahA@gmail.com</a>.',
    ],
  };

  const norm = (s) => s.toLowerCase()
    .replace(/[ً-ْـ]/g, '')
    .replace(/[أإآ]/g, 'ا').replace(/ة/g, 'ه').replace(/ى/g, 'ي')
    .replace(/\s+/g, ' ').trim();
  const ascii = /^[a-z0-9 +\-]+$/;

  function match(q) {
    const s = ' ' + norm(q).replace(/[?!.,؟،]/g, ' ') + ' ';
    let best = null, score = 0;
    for (const tp of TOPICS) {
      let sc = 0;
      for (const k of tp.keys) {
        const kk = norm(k);
        // short English words must match as whole words; everything else as a substring
        const hit = ascii.test(kk) && kk.length <= 3 ? s.includes(' ' + kk + ' ') : s.includes(kk);
        if (hit) sc += kk.length > 4 ? 2 : 1;
      }
      if (sc > score) { score = sc; best = tp; }
    }
    // Just her name, or "tell me about her" → the introduction.
    if (!best && /muneerah|munirah|منيره|عنها|عنك|tell me|about/.test(s)) best = TOPICS[0];
    return best;
  }

  /* ---------- UI ---------- */
  const fab = $('#chatFab'), panel = $('#chatPanel'), log = $('#chatLog'), chipsBox = $('#chatChips');
  const form = $('#chatForm'), input = $('#chatInput'), closeBtn = $('#chatClose');
  if (!fab) return;
  const L = () => (lang() === 'ar' ? 1 : 0);

  function add(who, html, isText) {
    const b = document.createElement('div');
    b.className = 'msg ' + who;
    if (isText) b.textContent = html; else b.innerHTML = html;
    log.appendChild(b);
    log.scrollTop = log.scrollHeight;
    return b;
  }

  function reply(html) {
    const typing = add('bot typing', '<span></span><span></span><span></span>');
    setTimeout(() => { typing.remove(); add('bot', html); }, 450);
  }

  function renderChips() {
    chipsBox.innerHTML = '';
    TOPICS.filter(tp => tp.chip).forEach(tp => {
      const c = document.createElement('button');
      c.type = 'button'; c.className = 'chat-chip'; c.textContent = tp.chip[L()];
      c.addEventListener('click', () => { add('me', tp.chip[L()], true); reply(L() ? tp.ar : tp.en); });
      chipsBox.appendChild(c);
    });
  }

  function syncLabels() {
    input.placeholder = t('chatPlaceholder');
    input.setAttribute('aria-label', t('chatInput'));
    closeBtn.setAttribute('aria-label', t('chatClose'));
  }

  function resetChat() {
    log.innerHTML = '';
    add('bot', UI.hello[L()]);
    renderChips();
    syncLabels();
  }

  function setOpen(open) {
    panel.hidden = !open;
    fab.setAttribute('aria-expanded', open);
    fab.classList.toggle('is-open', open);
    if (open) { input.focus(); log.scrollTop = log.scrollHeight; }
  }

  fab.addEventListener('click', () => setOpen(panel.hidden));
  closeBtn.addEventListener('click', () => { setOpen(false); fab.focus(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !panel.hidden) { setOpen(false); fab.focus(); } });

  form.addEventListener('submit', e => {
    e.preventDefault();
    const q = input.value.trim();
    if (!q) return;
    add('me', q, true);
    input.value = '';
    const tp = match(q);
    reply(tp ? (L() ? tp.ar : tp.en) : UI.fallback[L()]);
  });

  // Links inside answers that jump to a section close the chat on small screens.
  log.addEventListener('click', e => {
    const a = e.target.closest('a[href^="#"]');
    if (a && innerWidth < 600) setOpen(false);
  });

  document.addEventListener('langchange', resetChat);
  resetChat();
})();
