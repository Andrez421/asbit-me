import { EN } from '../data/i18n';
import { panelHtml, PANEL_LINES } from '../lib/panels';

/**
 * Runtime behaviour of the portfolio.
 *
 * Everything that used to be *built* at runtime (project cards, SVG diagrams,
 * kinetic character spans, studies and certifications rows) now ships in the
 * static HTML, so this module only wires interaction: theme, language, reveals,
 * kinetic weights, the per-section code lens, marquees, pointer ring, scroll
 * progress, command palette, clock and clipboard.
 *
 * Logic, constants and order are otherwise unchanged from the previous inline
 * script, so the effects behave exactly as before.
 */
(() => {
  const $ = (s: string, r: ParentNode = document): any => r.querySelector(s);
  const $$ = (s: string, r: ParentNode = document): any[] => [...r.querySelectorAll(s)];
  document.body.classList.remove('nojs');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const store = {
    get(k: string) {
      try {
        return localStorage.getItem(k);
      } catch {
        return null;
      }
    },
    set(k: string, v: string) {
      try {
        localStorage.setItem(k, v);
      } catch {
        /* private mode */
      }
    },
  };
  let lang = store.get('lang') || ((navigator.language || 'es').toLowerCase().startsWith('es') ? 'es' : 'en');
  let theme = store.get('theme') || 'light';
  const T = (esText: string, enText: string) => (lang === 'en' ? enText : esText);

  /* ───────── i18n ───────── */
  $$('[data-i18n]').forEach((el) => (el.dataset.es = el.innerHTML));
  $$('[data-i18n-aria]').forEach((el) => (el.dataset.esAria = el.getAttribute('aria-label')));
  const stmt = $('#stmt');
  let words: any[] = [];
  function buildStmt() {
    stmt.innerHTML = stmt.textContent
      .split(' ')
      .map((w: string) => `<span class="wd">${w}</span>`)
      .join(' ');
    words = [...stmt.children];
    stmtUpdate();
  }
  function applyLang(l: string) {
    $$('[data-i18n]').forEach((el) => {
      el.innerHTML = l === 'en' ? (EN[el.dataset.i18n] ?? el.dataset.es) : el.dataset.es;
    });
    $$('[data-i18n-aria]').forEach((el) => {
      el.setAttribute('aria-label', l === 'en' ? (EN[el.dataset.i18nAria] ?? el.dataset.esAria) : el.dataset.esAria);
    });
    document.documentElement.lang = l;
    $('#lang').textContent = l === 'en' ? 'ES' : 'EN';
    buildStmt();
  }
  function applyTheme(t: string) {
    document.documentElement.dataset.theme = t;
    $('meta[name=theme-color]').content = t === 'dark' ? '#0B0C0E' : '#ECEDEF';
  }
  $('#lang').addEventListener('click', () => {
    lang = lang === 'en' ? 'es' : 'en';
    store.set('lang', lang);
    applyLang(lang);
  });
  function toggleTheme() {
    const next = theme === 'dark' ? 'light' : 'dark';
    const run = () => {
      theme = next;
      store.set('theme', theme);
      applyTheme(theme);
    };
    if (!document.startViewTransition || reduce) {
      run();
      return;
    }
    const r = $('#theme').getBoundingClientRect();
    const root = document.documentElement;
    root.style.setProperty('--vx', r.left + r.width / 2 + 'px');
    root.style.setProperty('--vy', r.top + r.height / 2 + 'px');
    root.classList.add('no-tr');
    document.startViewTransition(run).finished.finally(() => root.classList.remove('no-tr'));
  }
  $('#theme').addEventListener('click', toggleTheme);
  const burger = $('#burger');
  const menu = $('#menu');
  burger.addEventListener('click', () => {
    const o = menu.classList.toggle('open');
    burger.setAttribute('aria-expanded', o);
  });
  menu.addEventListener('click', (e: any) => {
    if (e.target.closest('a')) {
      menu.classList.remove('open');
      burger.setAttribute('aria-expanded', 'false');
    }
  });

  /* ───────── paneles de código: el contenido llega pre-renderizado ───────── */
  const CS = $$('.hero,section').map((sec, i) => ({
    sec,
    i,
    hero: sec.classList.contains('hero'),
    dim: sec.querySelector('.code.dim'),
    hot: sec.querySelector('.code.hot'),
    lx: 0,
    ly: 0,
    ready: false,
  })) as any[];
  // The old code set this when it created the panels; keeping it makes the rest
  // state (inline mask position) identical to the previous version.
  CS.forEach((c: any) => c.hot && lensPos(c, -9999, -9999));
  function lensPos(c: any, x: number, y: number) {
    const h = c.hero ? 230 : 170;
    const v = (x - h).toFixed(0) + 'px ' + (y - h).toFixed(0) + 'px';
    c.hot.style.maskPosition = v;
    c.hot.style.webkitMaskPosition = v;
  }
  function buildCode() {
    CS.forEach((c: any) => {
      const need = Math.ceil((c.sec.offsetHeight + 800) / 22.5) + 4;
      // Only when a section is taller than its build-time budget — no designed
      // viewport is — regenerate that panel, exactly as the previous version
      // always did. This keeps a short budget from truncating the texture.
      if (need > (PANEL_LINES[c.i] ?? 0)) c.dim.innerHTML = panelHtml(c.i, need);
      // The hot layer holds the same content: clone the nodes instead of parsing
      // the same string a second time, which is what the old code did.
      c.hot.replaceChildren(...[...c.dim.children].map((n: any) => n.cloneNode(true)));
      if (reduce) lensPos(c, c.sec.offsetWidth * 0.7, Math.min(c.sec.offsetHeight * 0.4, 420));
    });
  }

  /* ───────── tipografía cinética (los spans ya vienen del build) ───────── */
  const KIN: any[] = [];
  $$('[data-kin]').forEach((root) => {
    const d = root.dataset;
    const base = { w0: +d.w0, wd0: +d.wd0, w1: +d.w1, wd1: +d.wd1, sg: +(d.sigma || 150), wave: !!d.wave };
    const letters = $$('.ch', root).map((el, i) => ({
      el,
      i,
      cw: base.w0 * 0.18,
      cwd: base.wd0 + 48,
    }));
    const kr = { root, base, letters, t0: null as number | null };
    KIN.push(kr);
    if (reduce) {
      letters.forEach((L: any) => {
        L.el.classList.add('go');
        L.el.style.fontVariationSettings = `'wght' ${base.w0},'wdth' ${base.wd0}`;
      });
    }
  });
  if (!reduce) {
    const kio = new IntersectionObserver(
      (es) =>
        es.forEach((e) => {
          if (e.isIntersecting) {
            const kr = KIN.find((k) => k.root === e.target);
            if (kr && kr.t0 == null) kr.t0 = performance.now();
          }
        }),
      { threshold: 0.25 },
    );
    KIN.forEach((k) => kio.observe(k.root));
  }

  /* ───────── marquee con velocidad de scroll ───────── */
  const MQ = [
    { el: $('#mq1'), items: ['TypeScript', 'Python', 'PostgreSQL', 'Docker', 'Linux'], dir: 1, off: 0, half: 1 },
    { el: $('#mq2'), items: ['Next.js', 'Node.js', 'Redis', 'Traefik', 'Playwright'], dir: -1, off: 0, half: 1 },
  ];
  MQ.forEach((m) => {
    const h = m.items.map((i) => `<span>${i}</span>`).join('');
    m.el.innerHTML = h + h + h;
  });
  function measure() {
    MQ.forEach((m) => {
      m.half = m.el.scrollWidth / 3 || 1;
      if (!m.off) m.off = m.dir < 0 ? m.half : 0;
    });
  }
  (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(measure);
  addEventListener('resize', measure);
  measure();

  /* ───────── puntero, lente y anillo ───────── */
  const hero = $('#home');
  const ring = $('#ring');
  let px = -1e5,
    py = -1e5,
    lastMove = -1e9,
    rx = 0,
    ry = 0,
    prev = 0,
    lastY = scrollY,
    sk = 0;
  addEventListener(
    'pointermove',
    (e) => {
      px = e.clientX;
      py = e.clientY;
      lastMove = performance.now();
      if (fine) ring.classList.add('on');
    },
    { passive: true },
  );
  const ringLbl = $('#ringLbl');
  function labelFor(el: any) {
    if (el.closest('.phead')) return el.closest('.prow').classList.contains('open') ? T('cerrar', 'close') : T('abrir', 'open');
    if (el.closest('.mail')) return T('escribir', 'write');
    if (el.closest('#copy')) return T('copiar', 'copy');
    return T('ir', 'go');
  }
  document.addEventListener('pointerover', (e: any) => {
    const t = e.target.closest && e.target.closest('.phead,.mail,.ct-row a,.ct-row button');
    ring.classList.toggle('big', !!t);
    ringLbl.textContent = t ? labelFor(t) : '';
  });
  document.documentElement.addEventListener('mouseleave', () => {
    px = py = -1e5;
    ring.classList.remove('on');
  });

  function frame(t: number) {
    const dt = Math.min(0.05, (t - prev) / 1000 || 0.016);
    prev = t;
    const k = 1 - Math.exp(-dt * 8);
    const idle = !fine || t - lastMove > 2600;
    /* letras */
    if (!reduce)
      KIN.forEach((kr) => {
        if (kr.t0 == null && kr.root === $('#name')) kr.t0 = t;
        if (kr.t0 == null) return;
        const rr = kr.root.getBoundingClientRect();
        if (rr.bottom < -120 || rr.top > innerHeight + 120) return;
        const b = kr.base,
          s2 = 2 * b.sg * b.sg;
        for (const L of kr.letters) {
          if (t < kr.t0 + 250 + L.i * 38) continue;
          if (!L.el.classList.contains('go')) L.el.classList.add('go');
          let inf = 0;
          if (!idle) {
            const r = L.el.getBoundingClientRect(),
              dx = r.left + r.width / 2 - px,
              dy = r.top + r.height / 2 - py;
            inf = Math.exp(-(dx * dx + dy * dy) / s2);
          } else if (b.wave) {
            inf = 0.55 * 0.5 * (Math.sin(t / 950 - L.i * 0.42) + 1);
          }
          L.cw += (b.w0 + (b.w1 - b.w0) * inf - L.cw) * k;
          L.cwd += (b.wd0 + (b.wd1 - b.wd0) * inf - L.cwd) * k;
          L.el.style.fontVariationSettings = `'wght' ${L.cw.toFixed(1)},'wdth' ${L.cwd.toFixed(1)}`;
        }
      });
    /* lente de cada sección */
    if (!reduce)
      CS.forEach((c: any) => {
        if (!c.hot) return;
        const r = c.sec.getBoundingClientRect();
        if (r.bottom < 0 || r.top > innerHeight) return;
        let tx, ty;
        if (!idle) {
          tx = px - r.left;
          ty = py - r.top;
        } else {
          const top = Math.max(r.top, 0),
            bot = Math.min(r.bottom, innerHeight);
          tx = r.width * (0.5 + 0.32 * Math.sin(t / 2700 + c.i * 1.3));
          ty = top + (bot - top) * (0.5 + 0.3 * Math.sin(t / 1900 + 1 + c.i)) - r.top;
        }
        if (!c.ready) {
          c.lx = tx;
          c.ly = ty;
          c.ready = true;
        }
        c.lx += (tx - c.lx) * k * 0.8;
        c.ly += (ty - c.ly) * k * 0.8;
        lensPos(c, c.lx, c.ly);
      });
    /* anillo */
    if (fine && !reduce) {
      rx += (px - rx) * k * 1.4;
      ry += (py - ry) * k * 1.4;
      ring.style.transform = `translate3d(${rx.toFixed(1)}px,${ry.toFixed(1)}px,0)`;
    }
    /* marquee */
    const vel = scrollY - lastY;
    lastY = scrollY;
    sk += (Math.max(-9, Math.min(9, vel * 0.28)) - sk) * k;
    if (!reduce)
      MQ.forEach((m) => {
        m.off += m.dir * (0.55 + Math.abs(vel) * 0.5);
        const x = ((m.off % m.half) + m.half) % m.half;
        m.el.style.transform = `translate3d(${-x}px,0,0) skewX(${(-sk * m.dir).toFixed(2)}deg)`;
      });
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  /* ───────── scroll: progreso, enunciado, reveal, menú activo ───────── */
  const prog = $('#prog');
  function stmtUpdate() {
    if (!words.length) return;
    const r = stmt.getBoundingClientRect(),
      vh = innerHeight;
    const p = Math.min(1, Math.max(0, (vh * 0.9 - r.top) / (vh * 0.5 + r.height * 0.55)));
    const n = words.length;
    words.forEach((w, i) => {
      w.style.opacity = (0.16 + 0.84 * Math.min(1, Math.max(0, (p * (n + 5) - i) / 4))).toFixed(3);
    });
  }
  let ticking = false;
  function onScroll() {
    ticking = false;
    const d = document.documentElement;
    prog.style.transform = `scaleX(${d.scrollTop / (d.scrollHeight - d.clientHeight || 1)})`;
    stmtUpdate();
  }
  addEventListener(
    'scroll',
    () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(onScroll);
      }
    },
    { passive: true },
  );
  onScroll();
  const io = new IntersectionObserver(
    (es) =>
      es.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('in-v');
          io.unobserve(e.target);
        }
      }),
    { threshold: 0.12, rootMargin: '0px 0px -6% 0px' },
  );
  $$('.rv').forEach((el) => io.observe(el));
  const mlinks = $$('#mlinks a');
  const so = new IntersectionObserver(
    (es) =>
      es.forEach((e) => {
        if (e.isIntersecting) mlinks.forEach((a) => a.classList.toggle('on', a.getAttribute('href') === '#' + e.target.id));
      }),
    { rootMargin: '-45% 0px -50% 0px' },
  );
  $$('section[id],#home').forEach((s) => so.observe(s));
  const navEl = $('#nav');
  const no = new IntersectionObserver(
    (es) =>
      es.forEach((e) => {
        if (e.isIntersecting) navEl.classList.toggle('inv', e.target.classList.contains('inv'));
      }),
    { rootMargin: '0px 0px -94% 0px' },
  );
  $$('section,.hero').forEach((s) => no.observe(s));

  /* ───────── proyectos: lista ya renderizada, aquí solo se pliega ───────── */
  let openId: string | null = 'pgaa';
  function toggleRow(row: any, force?: boolean) {
    const was = row.classList.contains('open');
    const want = force == null ? !was : force;
    $$('.prow').forEach((r) => {
      r.classList.remove('open');
      r.querySelector('.phead').setAttribute('aria-expanded', 'false');
      r.querySelector('.pbody').inert = true;
    });
    if (want) {
      row.classList.add('open');
      row.querySelector('.phead').setAttribute('aria-expanded', 'true');
      row.querySelector('.pbody').inert = false;
      openId = row.dataset.id;
    } else openId = null;
  }
  $('#plist').addEventListener('click', (e: any) => {
    const b = e.target.closest('.phead');
    if (!b) return;
    toggleRow(b.parentElement);
    ringLbl.textContent = labelFor(b);
  });
  function openProject(id: string) {
    const row = $(`.prow[data-id="${id}"]`);
    if (!row) return;
    toggleRow(row, true);
    setTimeout(() => row.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' }), 60);
  }

  /* ───────── reloj, copiar, init ───────── */
  const fmt = new Intl.DateTimeFormat('es-CO', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
    timeZone: 'America/Bogota',
  });
  function clock() {
    const s = fmt.format(new Date());
    $$('.clock').forEach((c) => (c.textContent = s));
  }
  clock();
  setInterval(clock, 1000);
  const toastEl = $('#toast');
  let tt: any;
  function toast(m: string) {
    toastEl.textContent = m;
    toastEl.classList.add('show');
    clearTimeout(tt);
    tt = setTimeout(() => toastEl.classList.remove('show'), 2200);
  }
  async function copyMail() {
    const m = 'asbravopa@gmail.com';
    try {
      await navigator.clipboard.writeText(m);
    } catch {
      const x = document.createElement('textarea');
      x.value = m;
      document.body.appendChild(x);
      x.select();
      try {
        document.execCommand('copy');
      } catch {
        /* ignore */
      }
      x.remove();
    }
    toast(T('Correo copiado', 'Email copied'));
  }
  $('#copy').addEventListener('click', copyMail);

  /* ───────── paleta de comandos (Ctrl/⌘ K  o  /) ───────── */
  const pal = $('#pal');
  const palIn = $('#palIn');
  const palList = $('#palList');
  let palSel = 0;
  let palItems: any[] = [];
  let palLast: any = null;
  const norm = (s: string) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const isMac = /Mac|iPhone|iPad/.test(navigator.platform || '');
  $('#palBtn').textContent = isMac ? '⌘ K' : 'Ctrl K';
  const goTo = (id: string) => {
    closePal();
    $(id).scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
  };
  function palCmds() {
    return [
      { t: T('Ir a Sobre mí', 'Go to About'), k: 'about sobre mi', run: () => goTo('#about') },
      { t: T('Ir a Trayectoria', 'Go to Experience'), k: 'experience trayectoria experiencia estudios', run: () => goTo('#experience') },
      { t: T('Ir a Trabajo', 'Go to Work'), k: 'work trabajo proyectos projects', run: () => goTo('#work') },
      { t: T('Ir a Stack', 'Go to Stack'), k: 'stack tecnologias', run: () => goTo('#stack') },
      { t: T('Ir a Contacto', 'Go to Contact'), k: 'contact contacto', run: () => goTo('#contact') },
      ...$$('.prow').map((row) => ({
        t: T('Abrir proyecto: ', 'Open project: ') + row.querySelector('.pname').textContent.trim(),
        k: 'proyecto project ' + row.dataset.id,
        run: () => {
          closePal();
          openProject(row.dataset.id);
        },
      })),
      {
        t: T('Cambiar tema', 'Toggle theme'),
        k: 'theme tema oscuro claro dark light',
        run: () => {
          closePal();
          toggleTheme();
        },
      },
      {
        t: T('Cambiar idioma', 'Switch language'),
        k: 'language idioma english español',
        run: () => {
          closePal();
          $('#lang').click();
        },
      },
      {
        t: T('Copiar correo', 'Copy email'),
        k: 'copy copiar correo email mail',
        run: () => {
          closePal();
          copyMail();
        },
      },
      {
        t: 'GitHub',
        k: 'github repos codigo',
        run: () => {
          closePal();
          window.open('https://github.com/Andrez421', '_blank', 'noopener');
        },
      },
      {
        t: 'sudo contratar',
        k: 'sudo hire contratar',
        secret: true,
        run: () => {
          closePal();
          $('#contact').scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
          toast(T('Permiso concedido. Escríbeme.', 'Permission granted. Write to me.'));
        },
      },
    ];
  }
  function palRender() {
    const q = norm(palIn.value.trim());
    const toks = q.split(/\s+/).filter(Boolean);
    palItems = palCmds().filter((c: any) => (!c.secret || q.startsWith('sudo')) && toks.every((t) => norm(c.t + ' ' + c.k).includes(t)));
    palSel = Math.min(palSel, Math.max(0, palItems.length - 1));
    palList.innerHTML = palItems.length
      ? palItems
          .map((c: any, i: number) => `<li role="option" data-i="${i}" class="${i === palSel ? 'sel' : ''}" aria-selected="${i === palSel}">${c.t}</li>`)
          .join('')
      : `<li class="none">${T('Sin resultados', 'No results')}</li>`;
  }
  function openPal() {
    palLast = document.activeElement;
    palIn.value = '';
    palIn.placeholder = T('Escribe un comando…', 'Type a command…');
    $('#palHint').textContent = T('↑↓ moverse   Enter ejecutar   Esc cerrar', '↑↓ move   Enter run   Esc close');
    palSel = 0;
    palRender();
    pal.classList.add('open');
    palIn.focus();
  }
  function closePal() {
    if (!pal.classList.contains('open')) return;
    pal.classList.remove('open');
    if (palLast && palLast.focus) palLast.focus();
    // `focus()` on a non-focusable element is a no-op, which used to leave the
    // focus inside the palette's own hidden input: the keyboard handler then saw
    // an INPUT as the active element and suppressed the `/` shortcut until the
    // user clicked somewhere else. Blur whatever remains inside the dialog.
    const ae: any = document.activeElement;
    if (ae && pal.contains(ae) && typeof ae.blur === 'function') ae.blur();
  }
  palIn.addEventListener('input', () => {
    palSel = 0;
    palRender();
  });
  palIn.addEventListener('keydown', (e: any) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      const n = palItems.length;
      if (!n) return;
      palSel = (palSel + (e.key === 'ArrowDown' ? 1 : -1) + n) % n;
      palRender();
      const s = $('.sel', palList);
      if (s) s.scrollIntoView({ block: 'nearest' });
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const c = palItems[palSel];
      if (c) c.run();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      closePal();
    }
  });
  palList.addEventListener('click', (e: any) => {
    const li = e.target.closest('li[data-i]');
    if (li) palItems[+li.dataset.i].run();
  });
  palList.addEventListener('pointermove', (e: any) => {
    const li = e.target.closest('li[data-i]');
    if (li && +li.dataset.i !== palSel) {
      palSel = +li.dataset.i;
      $$('li', palList).forEach((x, i) => {
        x.classList.toggle('sel', i === palSel);
        x.setAttribute('aria-selected', i === palSel);
      });
    }
  });
  pal.addEventListener('pointerdown', (e: any) => {
    if (e.target === pal) closePal();
  });
  $('#palBtn').addEventListener('click', openPal);
  addEventListener('keydown', (e: any) => {
    const ae: any = document.activeElement;
    // Focus inside the palette only counts as typing while the palette is open.
    const typing =
      (/INPUT|TEXTAREA/.test(ae.tagName) && !pal.contains(ae)) || ae.isContentEditable;
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      pal.classList.contains('open') ? closePal() : openPal();
    } else if (e.key === '/' && !typing && !pal.classList.contains('open')) {
      e.preventDefault();
      openPal();
    }
  });

  /* ───────── imán en los enlaces de contacto ───────── */
  if (fine && !reduce)
    $$('.ct-row a,.ct-row button').forEach((el) => {
      el.addEventListener('pointermove', (e: any) => {
        const r = el.getBoundingClientRect();
        el.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.25}px,${(e.clientY - r.top - r.height / 2) * 0.4}px)`;
      });
      el.addEventListener('pointerleave', () => (el.style.transform = ''));
    });

  $('#yr').textContent = new Date().getFullYear();
  applyTheme(theme);
  applyLang(lang);
  buildCode();
  (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(buildCode);
  let rz: any;
  addEventListener('resize', () => {
    clearTimeout(rz);
    rz = setTimeout(buildCode, 300);
  });
})();
