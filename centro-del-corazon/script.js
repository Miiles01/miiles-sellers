(() => {
  const d = document, root = d.documentElement;
  const $ = (s, c = d) => [...c.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* ---------- Cosas que no dependen de GSAP ---------- */

  // Imágenes reales: <div data-img="x" data-src="img/foto.jpg|https://respaldo.jpg">
  // Prueba cada fuente en orden; si ninguna carga, se queda un color sólido de la marca.
  $('[data-img][data-src]').forEach(box => {
    const srcs = box.dataset.src.split('|').filter(Boolean);
    const tryNext = () => {
      const src = srcs.shift();
      if (!src) return;
      const img = new Image();
      img.onload = () => {
        // Se pinta como fondo del mismo .media-fill: las animaciones de GSAP siguen apuntando al mismo nodo
        const fill = box.querySelector(':scope > .media-fill');
        fill.style.background = `center / cover no-repeat url("${src}")`;
        fill.classList.add('has-img');
      };
      img.onerror = tryNext;
      img.src = src;
    };
    tryNext();
  });

  // Hoja del menú móvil
  const sheet = d.getElementById('sheet'), burger = d.querySelector('.burger');
  let lenis = null;
  const setSheet = open => {
    sheet.classList.toggle('open', open);
    sheet.setAttribute('aria-hidden', !open);
    burger.classList.toggle('on', open);
    burger.setAttribute('aria-expanded', open);
    burger.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
    root.classList.toggle('lock', open);
    paintBar();
    lenis && (open ? lenis.stop() : lenis.start());
  };
  burger.addEventListener('click', () => setSheet(!sheet.classList.contains('open')));
  addEventListener('keydown', e => e.key === 'Escape' && setSheet(false));
  matchMedia('(min-width: 768px)').addEventListener('change', e => e.matches && setSheet(false));

  // Barra: sólida en cuanto deja atrás la portada + enlace activo según la sección
  const bar = d.querySelector('.bar'), hero = d.querySelector('.hero');
  const paintBar = () => {
    const past = scrollY > hero.offsetHeight - bar.offsetHeight - 8;
    bar.classList.toggle('is-solid', past && !sheet.classList.contains('open'));
  };
  addEventListener('scroll', paintBar, { passive: true });
  addEventListener('resize', paintBar);
  paintBar();
  const links = $('.nav a');
  const watched = links.map(a => d.querySelector(a.getAttribute('href'))).filter(Boolean);
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(entries => entries.forEach(e => {
      if (!e.isIntersecting) return;
      links.forEach(a => a.classList.toggle('is-active', a.getAttribute('href') === '#' + e.target.id));
    }), { rootMargin: '-45% 0px -50% 0px' });
    watched.forEach(el => io.observe(el));
  }

  // Tabs con píldora deslizante
  $('[data-tabs]').forEach(box => {
    const menu = box.querySelector('.tabs-menu');
    const pill = Object.assign(d.createElement('span'), { className: 'tab-pill' });
    menu.append(pill);
    const place = () => {
      const on = menu.querySelector('.tab.is-on');
      pill.style.width = on.offsetWidth + 'px';
      pill.style.height = on.offsetHeight + 'px';
      pill.style.transform = `translate(${on.offsetLeft}px, ${on.offsetTop}px)`;
    };
    place();
    addEventListener('resize', place);
    d.fonts && d.fonts.ready.then(place);

    box.addEventListener('click', e => {
      const t = e.target.closest('[data-tab]');
      if (!t || t.classList.contains('is-on')) return;
      $('.tab', box).forEach(b => b.classList.toggle('is-on', b === t));
      $('.pane', box).forEach(p => p.classList.toggle('is-on', p.dataset.pane === t.dataset.tab));
      place();
      t.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' });
      if (window.gsap && !reduce) {
        gsap.fromTo($('.pane.is-on .dish', box), { y: 28, opacity: 0 },
          { y: 0, opacity: 1, duration: .8, ease: 'power3.out', stagger: .08, clearProps: 'transform,opacity' });
      }
    });
  });

  /* ---------- Sin GSAP o con movimiento reducido: página estática funcional ---------- */
  if (!window.gsap || !window.ScrollTrigger || reduce) {
    $('a[href^="#"]').forEach(a => a.addEventListener('click', () => setSheet(false)));
    return;
  }

  root.classList.add('js');
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ ignoreMobileResize: true });

  /* ---------- Smooth scroll (Lenis) enlazado a ScrollTrigger ---------- */
  if (window.Lenis) {
    lenis = new Lenis({ lerp: .09, smoothWheel: true });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(t => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    lenis.stop(); // se libera al terminar el preloader
  }
  $('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
    const id = a.getAttribute('href');
    const target = id.length > 1 ? d.querySelector(id) : d.body;
    if (!target) return;
    e.preventDefault();
    const wasOpen = sheet.classList.contains('open');
    setSheet(false);
    const go = () => lenis ? lenis.scrollTo(target, { duration: 1.6, easing: t => 1 - Math.pow(1 - t, 4) })
                           : target.scrollIntoView({ behavior: 'smooth' });
    wasOpen ? setTimeout(go, 350) : go();
  }));

  /* ---------- Utilidad: partir texto en palabras con máscara ---------- */
  const done = new WeakSet();
  const split = el => {
    if (done.has(el)) return [];
    done.add(el);
    el.setAttribute('aria-label', el.textContent.replace(/\s+/g, ' ').trim());
    const words = [];
    const walk = node => [...node.childNodes].forEach(n => {
      if (n.nodeType === 3) {
        const frag = d.createDocumentFragment();
        n.textContent.split(/(\s+)/).forEach(t => {
          if (!t) return;
          if (/^\s+$/.test(t)) return frag.append(' ');
          const w = d.createElement('span'), i = d.createElement('span');
          w.className = 'w'; i.className = 'wi'; i.textContent = t;
          w.setAttribute('aria-hidden', 'true'); w.append(i); frag.append(w); words.push(i);
        });
        n.replaceWith(frag);
      } else if (n.nodeType === 1 && n.tagName !== 'BR') walk(n);
    });
    walk(el);
    return words;
  };

  const heroWords = split(d.querySelector('.hero .lines'));
  const headings = $('.display-l, .h-md, .h-sm').map(el => ({ el, words: split(el) }));
  const scrubs = $('.display, .display-s').map(el => ({ el, words: split(el) }));

  /* ---------- Estados iniciales (todo oculto tras el preloader) ---------- */
  gsap.set(heroWords, { yPercent: 115 });
  gsap.set('.bar', { yPercent: -120 });
  gsap.set(['.hero .label', '.hero .btn'], { opacity: 0, y: 24 });
  gsap.set('.wa-float', { scale: 0 });
  gsap.set('.hero .marquee-track', { yPercent: 40, opacity: 0 });
  gsap.set('.hero .media-fill', { scale: 1.3 });

  /* ---------- Preloader → entrada del hero ---------- */
  const pre = d.querySelector('.pre'), count = d.querySelector('.pre-count');
  const counter = { n: 0 };
  const intro = gsap.timeline({ paused: true, defaults: { ease: 'power4.out' } })
    .to('.hero .media-fill', { scale: 1, duration: 2.2, ease: 'expo.out' }, 0)
    .to(heroWords, { yPercent: 0, duration: 1.3, stagger: .05 }, .15)
    .to('.hero .label', { opacity: .8, y: 0, duration: 1 }, .5)
    .to('.hero .btn', { opacity: 1, y: 0, duration: 1, stagger: .1 }, .7)
    .to('.wa-float', { scale: 1, duration: 1, ease: 'elastic.out(1, .5)' }, 1.4)
    .to('.hero .marquee-track', { yPercent: 0, opacity: 1, duration: 1.6, ease: 'expo.out' }, .3)
    .to('.bar', { yPercent: 0, duration: 1.1 }, .9);

  let started = false;
  const start = () => {
    if (started) return; started = true;
    gsap.timeline()
      .to(pre, { yPercent: -100, duration: 1.1, ease: 'expo.inOut' })
      .add(() => intro.play(), '-=.55')
      .add(() => { pre.remove(); lenis && lenis.start(); ScrollTrigger.refresh(); });
  };
  const fontsReady = d.fonts ? Promise.race([d.fonts.ready, new Promise(r => setTimeout(r, 1500))]) : Promise.resolve();
  fontsReady.then(() => gsap.to(counter, {
    n: 100, duration: 1.3, ease: 'power2.inOut',
    onUpdate: () => count.textContent = Math.round(counter.n),
    onComplete: start
  }));
  setTimeout(start, 5000); // red de seguridad

  /* ---------- Barra: se oculta al bajar, vuelve al subir + progreso ---------- */
  ScrollTrigger.create({
    start: 0, end: 'max',
    onUpdate: s => {
      if (!started || sheet.classList.contains('open')) return;
      const hide = s.direction === 1 && s.scroll() > 240;
      bar.classList.toggle('is-hidden', hide);
    }
  });
  gsap.to('.progress', { scaleX: 1, ease: 'none', scrollTrigger: { start: 0, end: 'max', scrub: .3 } });

  /* ---------- Titulares: palabras suben desde una máscara ---------- */
  headings.forEach(({ el, words }) => {
    gsap.set(words, { yPercent: 115 });
    ScrollTrigger.create({
      trigger: el, start: 'top 90%', once: true,
      onEnter: () => gsap.to(words, { yPercent: 0, duration: 1.1, ease: 'power4.out', stagger: .045 })
    });
  });

  /* ---------- Párrafos grandes: cada palabra se enciende con el scroll ---------- */
  scrubs.forEach(({ el, words }) => {
    gsap.fromTo(words, { opacity: .14 }, {
      opacity: 1, ease: 'none', stagger: .12,
      scrollTrigger: { trigger: el, start: 'top 85%', end: 'bottom 55%', scrub: true }
    });
  });

  /* ---------- Entradas suaves: fade + subida, en lotes ---------- */
  const fadeSel = '.intro .label, .text-item, .split-text .label, .split-text .muted, .split-text .btn, .tabs-menu, .pane.is-on .dish, .footer-grid > *, .footer-cta .btn, .num';
  gsap.set(fadeSel, { opacity: 0, y: 36 });
  ScrollTrigger.batch(fadeSel, {
    start: 'top 92%', once: true,
    onEnter: els => gsap.to(els, { opacity: 1, y: 0, duration: 1.1, ease: 'power3.out', stagger: .1, clearProps: 'transform' })
  });
  // Línea divisoria que crece en cada ítem de lista
  $('.text-item').forEach(el => ScrollTrigger.create({
    trigger: el, start: 'top 90%', once: true,
    onEnter: () => gsap.to(el, { '--line': 1, duration: 1.4, ease: 'expo.out' })
  }));

  /* ---------- Títulos XL (Nuestro / Menú): máscara + deriva horizontal ---------- */
  $('.xl-title').forEach(t => {
    const lines = $('span', t);
    gsap.from(lines, {
      yPercent: 110, duration: 1.4, ease: 'expo.out', stagger: .12,
      scrollTrigger: { trigger: t, start: 'top 85%', once: true }
    });
    lines.forEach((l, i) => gsap.fromTo(l, { x: i ? '4vw' : '-4vw' }, {
      x: i ? '-4vw' : '4vw', ease: 'none',
      scrollTrigger: { trigger: t, start: 'top bottom', end: 'bottom top', scrub: true }
    }));
  });

  /* ---------- Todo lo que depende del tamaño de pantalla ---------- */
  const mm = gsap.matchMedia();
  mm.add({ wide: '(min-width: 768px)', narrow: '(max-width: 767px)' }, ctx => {
    const narrow = ctx.conditions.narrow;
    const par = narrow ? 3 : 5;   // % de parallax en imágenes
    const lift = narrow ? 40 : 90; // px de deriva del contenido

    // Parallax interno de cada imagen
    $('.media, .bleed, .ratio-23, .thumb').forEach(box => {
      const fill = box.querySelector('.media-fill');
      if (!fill || box.closest('.hero') && !box.classList.contains('media')) return;
      if (box.classList.contains('media')) return; // el hero se maneja abajo
      gsap.fromTo(fill, { yPercent: -par }, {
        yPercent: par, ease: 'none',
        scrollTrigger: { trigger: box, start: 'top bottom', end: 'bottom top', scrub: true }
      });
    });

    // Hero: la imagen se queda atrás, el contenido sube y se desvanece
    const heroST = { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true };
    gsap.to('.hero .media', { yPercent: 18, ease: 'none', scrollTrigger: heroST });
    gsap.to('.hero-overlay', { opacity: 2.2, ease: 'none', scrollTrigger: heroST });
    gsap.to('.hero-mid', { y: -lift, opacity: 0, ease: 'none',
      scrollTrigger: { ...heroST, end: 'center top' } });

    // Imágenes a todo el ancho: se abren desde un marco al entrar
    $('.bleed').forEach(b => {
      gsap.fromTo(b, { clipPath: narrow ? 'inset(5% 4% 5% 4%)' : 'inset(12% 8% 12% 8%)' }, {
        clipPath: 'inset(0% 0% 0% 0%)', ease: 'none',
        scrollTrigger: { trigger: b, start: 'top 95%', end: 'top 30%', scrub: true }
      });
    });
    // Miniatura: sale por abajo y deriva a otra velocidad (profundidad)
    $('.thumb').forEach(t => {
      gsap.fromTo(t, { clipPath: 'inset(100% 0% 0% 0%)' }, {
        clipPath: 'inset(0% 0% 0% 0%)', duration: 1.4, ease: 'expo.out',
        scrollTrigger: { trigger: t, start: 'top 95%', once: true }
      });
      gsap.fromTo(t, { y: lift }, {
        y: -lift, ease: 'none',
        scrollTrigger: { trigger: t.closest('.bleed'), start: 'top bottom', end: 'bottom top', scrub: true }
      });
    });

    // Imágenes 2:3: cortina que se abre + zoom que se asienta
    $('.ratio-23').forEach(box => {
      gsap.fromTo(box, { clipPath: 'inset(0% 0% 100% 0%)' }, {
        clipPath: 'inset(0% 0% 0% 0%)', duration: 1.6, ease: 'expo.inOut',
        scrollTrigger: { trigger: box, start: 'top 88%', once: true }
      });
      gsap.from(box.querySelector('.media-fill'), {
        scale: 1.35, duration: 2, ease: 'expo.out',
        scrollTrigger: { trigger: box, start: 'top 88%', once: true }
      });
    });

    // Bloque de texto del split flota a distinta velocidad que su imagen
    if (!narrow) $('.split-text').forEach(t => gsap.fromTo(t, { y: 60 }, {
      y: -60, ease: 'none',
      scrollTrigger: { trigger: t.closest('.split'), start: 'top bottom', end: 'bottom top', scrub: true }
    }));

    // Footer: el contenido emerge desde abajo
    gsap.fromTo('.footer-cta', { y: narrow ? -30 : -80 }, {
      y: 0, ease: 'none',
      scrollTrigger: { trigger: '.footer', start: 'top bottom', end: 'top 20%', scrub: true }
    });
  });

  /* ---------- Marquee: velocidad ligada al scroll ---------- */
  const tweens = $('.marquee-track').map(t => gsap.to(t, { xPercent: -50, ease: 'none', duration: 40, repeat: -1 }));
  let boost = 0, dir = 1, last = scrollY;
  gsap.ticker.add(() => {
    const v = lenis ? lenis.velocity : scrollY - last; last = scrollY;
    if (Math.abs(v) > .1) dir = v > 0 ? 1 : -1;
    boost += (Math.min(Math.abs(v), 40) * .3 - boost) * .08;
    tweens.forEach(t => t.timeScale(dir * (1 + boost)));
  });

  /* ---------- Solo puntero fino: cursor, botones magnéticos ---------- */
  if (fine) {
    const c = d.querySelector('.cursor');
    gsap.set(c, { xPercent: -50, yPercent: -50, opacity: 0 });
    const qx = gsap.quickTo(c, 'x', { duration: .45, ease: 'power3' });
    const qy = gsap.quickTo(c, 'y', { duration: .45, ease: 'power3' });
    addEventListener('pointermove', e => { qx(e.clientX); qy(e.clientY); gsap.to(c, { opacity: 1, duration: .3, overwrite: 'auto' }); });
    $('a, button').forEach(el => {
      el.addEventListener('pointerenter', () => gsap.to(c, { scale: 3, duration: .4, ease: 'power3' }));
      el.addEventListener('pointerleave', () => gsap.to(c, { scale: 1, duration: .4, ease: 'power3' }));
    });
    $('.btn').forEach(b => {
      b.addEventListener('pointermove', e => {
        const r = b.getBoundingClientRect();
        gsap.to(b, { x: (e.clientX - r.left - r.width / 2) * .3, y: (e.clientY - r.top - r.height / 2) * .4, duration: .5, ease: 'power3' });
      });
      b.addEventListener('pointerleave', () => gsap.to(b, { x: 0, y: 0, duration: 1, ease: 'elastic.out(1, .4)' }));
    });
  }

  addEventListener('load', () => ScrollTrigger.refresh());
})();
