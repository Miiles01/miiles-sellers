(() => {
  const D = window.SELLERS;
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
  const cs = getComputedStyle(document.documentElement);
  const ms = (name, fb) => {
    const v = parseFloat(cs.getPropertyValue(name));
    return Number.isFinite(v) ? v : fb;
  };
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const money = (n) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(n);
  const withIva = (n) => Math.round(n * (1 + D.iva));
  const ivaPct = Math.round(D.iva * 100);
  const has = (v) => v !== null && v !== undefined && v !== '';

  const ICON = {
    check: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3.5 8.5l3 3 6-7"/></svg>',
    chevron: '<span class="t-acc-chevron"><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4 6.5L8 10.5L12 6.5"/></svg></span>',
    copy: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="8" y="8" width="12" height="12" rx="3"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/></svg>',
    plus: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>',
    minus: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14"/></svg>',
  };

  // ---------------- Almacenamiento (sesión + nombre) ----------------
  const safe = (fn, fb) => { try { return fn(); } catch { return fb; } };
  const session = {
    get: () => safe(() => sessionStorage.getItem('miiles_sellers_ok') === '1', false),
    set: (v) => safe(() => (v ? sessionStorage.setItem('miiles_sellers_ok', '1') : sessionStorage.removeItem('miiles_sellers_ok'))),
  };
  const nameStore = {
    get: () => safe(() => localStorage.getItem('miiles_sellers_name') || '', ''),
    set: (v) => safe(() => localStorage.setItem('miiles_sellers_name', v)),
  };

  // ---------------- PIN ----------------
  const lock = $('#lock');
  const app = $('#app');
  const wrap = $('#pin-form');
  const shaker = $('.t-input', wrap);
  const boxes = $$('.pin-box', wrap);

  function showError() {
    wrap.classList.add('is-error');
    shaker.classList.add('is-error');
    shaker.classList.remove('is-shaking');
    void shaker.offsetWidth;
    shaker.classList.add('is-shaking');
    const shakeMs = ms('--shake-dur-a', 80) * 2 + ms('--shake-dur-b', 60) * 2;
    setTimeout(() => shaker.classList.remove('is-shaking'), shakeMs + 20);
    if (wrap._revertTimer) clearTimeout(wrap._revertTimer);
    wrap._revertTimer = setTimeout(() => {
      wrap._revertTimer = null;
      clearError();
    }, shakeMs + ms('--revert-hold', 3000));
  }
  function clearError() {
    if (wrap._revertTimer) { clearTimeout(wrap._revertTimer); wrap._revertTimer = null; }
    wrap.classList.remove('is-error');
    shaker.classList.remove('is-error');
  }

  function check() {
    const code = boxes.map((b) => b.value).join('');
    if (code.length < boxes.length) return;
    if (code === D.pin) {
      session.set(true);
      if (nameStore.get()) unlock();
      else askName();
    } else {
      showError();
      boxes.forEach((b) => (b.value = ''));
      boxes[0].focus();
    }
  }

  boxes.forEach((box, i) => {
    box.addEventListener('input', () => {
      if (wrap.classList.contains('is-error')) clearError();
      const digits = box.value.replace(/\D/g, '');
      if (digits.length > 1) {
        // Autocompletado o varios dígitos a la vez: repártelos entre las cajas
        digits.slice(0, boxes.length - i).split('').forEach((d, j) => (boxes[i + j].value = d));
        boxes[Math.min(i + digits.length, boxes.length - 1)].focus();
      } else {
        box.value = digits;
        if (box.value && i < boxes.length - 1) boxes[i + 1].focus();
      }
      check();
    });
    box.addEventListener('keydown', (e) => {
      if (e.key === 'Backspace' && !box.value && i > 0) boxes[i - 1].focus();
      if (e.key === 'ArrowLeft' && i > 0) boxes[i - 1].focus();
      if (e.key === 'ArrowRight' && i < boxes.length - 1) boxes[i + 1].focus();
    });
    box.addEventListener('paste', (e) => {
      const digits = (e.clipboardData.getData('text') || '').replace(/\D/g, '').slice(0, boxes.length);
      if (!digits) return;
      e.preventDefault();
      boxes.forEach((b, j) => (b.value = digits[j] || ''));
      boxes[Math.min(digits.length, boxes.length - 1)].focus();
      check();
    });
  });
  wrap.addEventListener('submit', (e) => e.preventDefault());

  // Paso 2: nombre para el saludo
  const stepPin = $('#step-pin');
  const stepName = $('#step-name');
  function askName() {
    stepPin.hidden = true;
    stepName.hidden = false;
    $('#name-input').focus();
  }
  stepName.addEventListener('submit', (e) => {
    e.preventDefault();
    const v = $('#name-input').value.trim().split(/\s+/)[0] || '';
    if (v) nameStore.set(v.charAt(0).toUpperCase() + v.slice(1));
    unlock();
  });
  $('#skip-name').addEventListener('click', unlock);

  $('#logout').addEventListener('click', () => {
    session.set(false);
    closeMenu();
    app.hidden = true;
    lock.hidden = false;
    stepName.hidden = true;
    stepPin.hidden = false;
    $('#greeting').classList.remove('is-shown');
    boxes.forEach((b) => (b.value = ''));
    window.scrollTo(0, 0);
    boxes[0].focus();
  });

  // ---------------- Toast + copiar ----------------
  const toast = $('#toast');
  let toastTimer;
  function showToast(text) {
    $('#toast-text').textContent = text;
    toast.classList.add('is-open');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('is-open'), 2200);
  }
  async function copy(text, msg) {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const t = document.createElement('textarea');
      t.value = text;
      t.style.position = 'fixed';
      t.style.opacity = '0';
      document.body.appendChild(t);
      t.select();
      document.execCommand('copy');
      t.remove();
    }
    showToast(msg);
  }

  // ---------------- Saludo ----------------
  function greeting() {
    const h = new Date().getHours();
    return h < 12 ? 'Buenos días' : h < 18 ? 'Buenas tardes' : 'Buenas noches';
  }
  function renderGreeting() {
    const name = nameStore.get();
    $('#greet-time').textContent = greeting();
    $('#greet-name').textContent = name || 'equipo';
    $('#me-name').textContent = name || 'Equipo';
    $('#avatar').textContent = (name || 'M').charAt(0).toUpperCase();
  }

  // ---------------- Render ----------------
  const periodo = (s) => (s.periodo === 'mes' ? ' / mes' : '');
  const catName = (id) => (D.categorias.find((c) => c.id === id) || {}).nombre || '';

  function renderStats() {
    const maxCom = Math.max(...D.servicios.map((s) => s.comision));
    const stats = [
      { icon: 'assets/miiles-azul.svg', num: D.servicios.length, lbl: 'Servicios para vender' },
      { icon: 'assets/estrella-azul.svg', num: money(maxCom), lbl: 'Comisión máxima por venta' },
      { icon: 'assets/sonrisa-azul.svg', num: `+${ivaPct}%`, lbl: 'IVA solo si piden factura' },
    ];
    $('#stats').innerHTML = stats.map((s) => `
      <div class="stat">
        <span class="stat-tile"><img src="${s.icon}" alt=""></span>
        <span class="stat-num">${esc(s.num)}</span>
        <span class="stat-lbl">${esc(s.lbl)}</span>
      </div>`).join('');
  }

  function accordion(title, bodyHtml) {
    return `
      <div class="t-acc" data-open="false">
        <button class="t-acc-head" type="button" aria-expanded="false">${esc(title)}${ICON.chevron}</button>
        <div class="t-acc-panel"><div class="t-acc-panel-inner"><div>${bodyHtml}</div></div></div>
      </div>`;
  }

  function summary(s) {
    const lines = [
      `*${s.nombre}*`,
      s.descripcion,
      '',
      ...s.incluye.map((x) => `• ${x}`),
      '',
      `Precio: ${money(s.precio)} MXN${periodo(s)}`,
      `Con factura: ${money(withIva(s.precio))} MXN${periodo(s)} (incluye ${ivaPct}% de IVA)`,
    ];
    return lines.join('\n');
  }

  function renderServices() {
    $('#service-row').innerHTML = D.servicios.map((s) => `
      <article class="service" data-cat="${esc(s.categoria)}">
        <div class="service-top">
          <span class="icon-bubble"><img src="${esc(s.icono)}" alt=""></span>
          <span class="tag">${esc(catName(s.categoria))}</span>
        </div>
        <h3>${esc(s.nombre)}</h3>
        <p class="service-desc">${esc(s.descripcion)}</p>
        <div class="price-block">
          <p class="price">${money(s.precio)}<small>MXN${periodo(s)}</small></p>
          <p class="price-iva">${money(withIva(s.precio))} con IVA, si requiere factura</p>
        </div>
        <div class="earn"><span>Tu comisión</span><strong>${money(s.comision)}</strong></div>
        <p class="earn-note">${esc(s.comisionNota)}</p>
        ${has(s.clienteIdeal) || has(s.dolor) ? `
          <div class="service-meta">
            ${has(s.clienteIdeal) ? `<p><strong>Cliente ideal:</strong> ${esc(s.clienteIdeal)}</p>` : ''}
            ${has(s.dolor) ? `<p><strong>Su dolor:</strong> ${esc(s.dolor)}</p>` : ''}
          </div>` : ''}
        ${accordion('Qué incluye', `<ul class="check-list">${s.incluye.map((x) => `<li>${ICON.check}<span>${esc(x)}</span></li>`).join('')}</ul>`)}
        <div class="service-actions">
          <button class="btn-soft" type="button" data-copy-service="${esc(s.id)}">${ICON.copy}Copiar para WhatsApp</button>
        </div>
      </article>`).join('');
  }

  function renderRules() {
    $('#rules').innerHTML = D.comisiones.map((r) => `
      <div class="rule">
        <h3>${esc(r.titulo)}</h3>
        <p class="${has(r.texto) ? '' : 'tbd'}">${has(r.texto) ? esc(r.texto) : 'Por definir'}</p>
      </div>`).join('');
  }

  function renderSteps() {
    $('#steps').innerHTML = D.proceso.map((s, i) => `
      <li class="step">
        <span class="step-num">${i + 1}</span>
        <h3>${esc(s.titulo)}</h3>
        <p>${esc(s.texto)}</p>
      </li>`).join('');
  }

  function renderFaq() {
    $('#faq').innerHTML = D.objeciones.map((o) => accordion(o.pregunta, esc(o.respuesta))).join('');
  }

  // ---------------- Clicks: acordeón y copiar ----------------
  document.addEventListener('click', (e) => {
    const head = e.target.closest('.t-acc-head');
    if (head) {
      const acc = head.closest('.t-acc');
      const open = acc.getAttribute('data-open') === 'true';
      acc.setAttribute('data-open', String(!open));
      head.setAttribute('aria-expanded', String(!open));
      return;
    }
    const copyBtn = e.target.closest('[data-copy-service]');
    if (copyBtn) {
      const s = D.servicios.find((x) => x.id === copyBtn.dataset.copyService);
      copy(summary(s), 'Resumen copiado');
    }
  });

  // ---------------- Tabs sliding ----------------
  function makeTabs(bar, onSelect) {
    const pill = $('.t-tabs-pill', bar);
    const tabs = $$('.t-tab', bar);
    const active = () => tabs.find((t) => t.getAttribute('aria-selected') === 'true') || tabs[0];
    function moveTo(tab, animate) {
      if (!animate) {
        const prev = pill.style.transition;
        pill.style.transition = 'none';
        pill.style.transform = `translateX(${tab.offsetLeft}px)`;
        pill.style.width = `${tab.offsetWidth}px`;
        void pill.offsetWidth;
        pill.style.transition = prev;
      } else {
        pill.style.transform = `translateX(${tab.offsetLeft}px)`;
        pill.style.width = `${tab.offsetWidth}px`;
      }
    }
    tabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        tabs.forEach((t) => t.setAttribute('aria-selected', t === tab ? 'true' : 'false'));
        moveTo(tab, true);
        onSelect(tab);
      });
    });
    window.addEventListener('resize', () => moveTo(active(), false));
    return { snap: () => moveTo(active(), false) };
  }

  let catTabs;
  function setupCategories() {
    const bar = $('#cat-tabs');
    const opts = [{ id: 'todos', nombre: 'Todos' }, ...D.categorias];
    bar.innerHTML = '<span class="t-tabs-pill" aria-hidden="true"></span>' +
      opts.map((c, i) => `<button class="t-tab" role="tab" type="button" aria-selected="${i === 0}" data-cat="${esc(c.id)}">${esc(c.nombre)}</button>`).join('');
    catTabs = makeTabs(bar, (tab) => {
      const cat = tab.dataset.cat;
      $$('.service').forEach((card) => (card.hidden = cat !== 'todos' && card.dataset.cat !== cat));
      $('#service-row').scrollTo({ left: 0 });
    });
  }

  // ---------------- Calculadora ----------------
  const counts = Object.fromEntries(D.servicios.map((s) => [s.id, 0]));
  const valueEl = $('#calc-value');

  function setDigits(str) {
    valueEl.classList.remove('is-animating');
    valueEl.replaceChildren();
    const chars = str.split('');
    chars.forEach((ch, i) => {
      const span = document.createElement('span');
      span.className = 't-digit';
      span.textContent = ch;
      if (i === chars.length - 2) span.dataset.stagger = '1';
      else if (i === chars.length - 1) span.dataset.stagger = '2';
      valueEl.appendChild(span);
    });
    void valueEl.offsetHeight;
    valueEl.classList.add('is-animating');
  }

  function renderCalc() {
    $('#calc-list').innerHTML = D.servicios.map((s) => `
      <div class="calc-item">
        <div class="calc-item-text">
          <b>${esc(s.nombre)}</b>
          <small>${money(s.comision)} por venta · ${esc(s.comisionNota)}</small>
        </div>
        <div class="stepper">
          <button type="button" data-step="-1" data-id="${esc(s.id)}" aria-label="Quitar una venta de ${esc(s.nombre)}" disabled>${ICON.minus}</button>
          <output id="count-${esc(s.id)}">0</output>
          <button type="button" class="plus" data-step="1" data-id="${esc(s.id)}" aria-label="Agregar una venta de ${esc(s.nombre)}">${ICON.plus}</button>
        </div>
      </div>`).join('');
    $('#calc-list').addEventListener('click', (e) => {
      const btn = e.target.closest('[data-step]');
      if (!btn) return;
      const id = btn.dataset.id;
      counts[id] = Math.max(0, Math.min(99, counts[id] + Number(btn.dataset.step)));
      $(`#count-${id}`).textContent = counts[id];
      btn.parentElement.querySelector('[data-step="-1"]').disabled = counts[id] === 0;
      updateCalc();
    });
    updateCalc();
  }

  let lastShown = '';
  function updateCalc() {
    const sales = Object.values(counts).reduce((a, b) => a + b, 0);
    const total = D.servicios.reduce((sum, s) => sum + counts[s.id] * s.comision, 0);
    $('#calc-note').textContent = sales
      ? `${sales} ${sales === 1 ? 'venta' : 'ventas'} este mes`
      : 'Agrega tus ventas con los botones +';
    const text = money(total);
    if (text !== lastShown) { lastShown = text; setDigits(text); }
  }

  // ---------------- Sidebar: navegación, scroll y móvil ----------------
  const shell = app;
  const menuBtn = $('#menu-btn');
  function openMenu() { shell.classList.add('menu-open'); menuBtn.setAttribute('aria-expanded', 'true'); }
  function closeMenu() { shell.classList.remove('menu-open'); menuBtn.setAttribute('aria-expanded', 'false'); }
  menuBtn.addEventListener('click', () => (shell.classList.contains('menu-open') ? closeMenu() : openMenu()));
  $('#scrim').addEventListener('click', closeMenu);
  document.addEventListener('keydown', (e) => e.key === 'Escape' && closeMenu());

  const navLinks = $$('#sb-nav a');
  const sections = navLinks.map((a) => document.getElementById(a.dataset.target));
  let spyPausedUntil = 0;

  function setActive(id) {
    navLinks.forEach((a) => (a.dataset.target === id ? a.setAttribute('aria-current', 'true') : a.removeAttribute('aria-current')));
  }
  function goTo(id) {
    closeMenu();
    setActive(id);
    spyPausedUntil = Date.now() + 900;
    document.getElementById(id).scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  navLinks.forEach((a) => a.addEventListener('click', (e) => { e.preventDefault(); goTo(a.dataset.target); }));
  $$('[data-goto]').forEach((b) => b.addEventListener('click', () => goTo(b.dataset.goto)));

  window.addEventListener('scroll', () => {
    if (Date.now() < spyPausedUntil || app.hidden) return;
    let current = sections[0];
    for (const s of sections) if (s.getBoundingClientRect().top <= window.innerHeight * 0.35) current = s;
    // Al llegar al fondo, marca la última sección
    if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) current = sections[sections.length - 1];
    setActive(current.id);
  }, { passive: true });

  // ---------------- Arranque ----------------
  renderStats();
  renderServices();
  renderRules();
  renderSteps();
  renderFaq();
  setupCategories();
  renderCalc();

  function unlock() {
    lock.hidden = true;
    app.hidden = false;
    renderGreeting();
    requestAnimationFrame(() => {
      catTabs.snap();
      const g = $('#greeting');
      g.classList.remove('is-hiding', 'is-shown');
      void g.offsetHeight;
      g.classList.add('is-shown');
      window.dispatchEvent(new Event('scroll'));
    });
  }

  if (session.get()) unlock();
})();
