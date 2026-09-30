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
  const TBD = 'Por definir';
  const has = (v) => v !== null && v !== undefined && v !== '';

  const CHECK = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3.5 8.5l3 3 6-7"/></svg>';
  const CHEVRON = '<span class="t-acc-chevron"><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4 6.5L8 10.5L12 6.5"/></svg></span>';
  const COPY = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="8" y="8" width="12" height="12" rx="3"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/></svg>';

  // ---------------- Sesión ----------------
  const KEY = 'miiles_sellers_ok';
  const store = {
    get() { try { return sessionStorage.getItem(KEY) === '1'; } catch { return false; } },
    set(v) { try { v ? sessionStorage.setItem(KEY, '1') : sessionStorage.removeItem(KEY); } catch {} },
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
      store.set(true);
      unlock();
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

  $('#logout').addEventListener('click', () => {
    store.set(false);
    app.hidden = true;
    lock.hidden = false;
    $('#hero').classList.remove('is-shown');
    boxes.forEach((b) => (b.value = ''));
    window.scrollTo(0, 0);
    boxes[0].focus();
  });

  // ---------------- Toast ----------------
  const toast = $('#toast');
  let toastTimer;
  function showToast(text) {
    $('#toast-text').textContent = text;
    toast.classList.add('is-open');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('is-open'), 2200);
  }
  async function copy(text) {
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
    showToast('Link copiado');
  }
  const url = (ruta) => D.sitio.replace(/\/$/, '') + ruta;

  // ---------------- Render ----------------
  function accordion(title, bodyHtml) {
    return `
      <div class="t-acc" data-open="false">
        <button class="t-acc-head" type="button" aria-expanded="false">${esc(title)}${CHEVRON}</button>
        <div class="t-acc-panel"><div class="t-acc-panel-inner"><div>${bodyHtml}</div></div></div>
      </div>`;
  }

  function renderProducts() {
    $('#product-grid').innerHTML = D.productos.map((p) => `
      <article class="card product">
        <div class="icon-bubble"><img src="${esc(p.icono)}" alt=""></div>
        <h3 class="h3">${esc(p.nombre)}</h3>
        <p class="product-desc">${esc(p.resumen)}</p>
        <div class="price">
          <p class="price-label">Precio desde</p>
          ${has(p.precio)
            ? `<p class="price-value">${money(p.precio)}<small>MXN</small></p>`
            : `<p class="tbd">${TBD}</p>`}
        </div>
        <div class="chips">
          <span class="chip"><img src="assets/estrella-azul.svg" alt="">Comisión ${has(p.comision) ? esc(p.comision) + '%' : TBD.toLowerCase()}</span>
          <span class="chip">Entrega ${has(p.entrega) ? esc(p.entrega) : TBD.toLowerCase()}</span>
        </div>
        <p class="ideal"><strong>Ideal para:</strong> ${esc(p.idealPara)}</p>
        <div class="acc-group">
          ${accordion('Qué incluye', `<ul class="check-list">${p.incluye.map((x) => `<li>${CHECK}<span>${esc(x)}</span></li>`).join('')}</ul>`)}
        </div>
        <button class="btn" type="button" data-copy="${esc(url(p.brief))}">
          Copiar link del brief <img src="assets/flecha-blanco.svg" alt="">
        </button>
      </article>`).join('');
  }

  function renderRules() {
    $('#rules').innerHTML = D.comisiones.map((r) => `
      <div class="card rule">
        <h3 class="h3">${esc(r.titulo)}</h3>
        <p>${has(r.texto) ? esc(r.texto) : TBD}</p>
      </div>`).join('');
  }

  function renderBenefits() {
    $('#benefit-grid').innerHTML = D.beneficios.map((b) => `
      <div class="card benefit">
        <div class="icon-bubble"><img src="${esc(b.icono)}" alt=""></div>
        <h3 class="h3">${esc(b.titulo)}</h3>
        <p>${esc(b.texto)}</p>
      </div>`).join('');
  }

  function renderSteps() {
    $('#steps').innerHTML = D.proceso.map((s, i) => `
      <li class="card step">
        <span class="step-num">${i + 1}</span>
        <h3 class="h3">${esc(s.titulo)}</h3>
        <p>${esc(s.texto)}</p>
      </li>`).join('');
    $('#resources').innerHTML = D.recursos.map((r) => `
      <div class="card resource">
        <div>
          <h3 class="h3">${esc(r.titulo)}</h3>
          <p>${esc(r.texto)}</p>
        </div>
        <div class="resource-actions">
          <button class="icon-btn" type="button" data-copy="${esc(url(r.ruta))}" aria-label="Copiar link de ${esc(r.titulo)}">${COPY}</button>
          <a class="icon-btn icon-btn--blue" href="${esc(url(r.ruta))}" target="_blank" rel="noopener" aria-label="Abrir ${esc(r.titulo)}"><img src="assets/flecha-blanco.svg" alt=""></a>
        </div>
      </div>`).join('');
  }

  function renderFaq() {
    $('#faq').innerHTML = `<div class="acc-group">${D.objeciones.map((o) => accordion(o.pregunta, esc(o.respuesta))).join('')}</div>`;
  }

  // ---------------- Accordion + copiar ----------------
  document.addEventListener('click', (e) => {
    const head = e.target.closest('.t-acc-head');
    if (head) {
      const acc = head.closest('.t-acc');
      const open = acc.getAttribute('data-open') === 'true';
      acc.setAttribute('data-open', String(!open));
      head.setAttribute('aria-expanded', String(!open));
      return;
    }
    const copyBtn = e.target.closest('[data-copy]');
    if (copyBtn) copy(copyBtn.dataset.copy);
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
    function select(tab, animate = true) {
      tabs.forEach((t) => t.setAttribute('aria-selected', t === tab ? 'true' : 'false'));
      moveTo(tab, animate);
      // En móvil la barra se desplaza: mantén visible la pestaña activa
      const scroller = bar.parentElement;
      if (scroller.scrollWidth > scroller.clientWidth) {
        scroller.scrollTo({ left: tab.offsetLeft - scroller.clientWidth / 2 + tab.offsetWidth / 2, behavior: animate ? 'smooth' : 'auto' });
      }
    }
    tabs.forEach((tab) => tab.addEventListener('click', () => { select(tab); onSelect && onSelect(tab); }));
    window.addEventListener('resize', () => moveTo(active(), false));
    return { tabs, select, snap: () => moveTo(active(), false) };
  }

  // Navegación por secciones + seguimiento del scroll
  let navTabs;
  let spyPausedUntil = 0;
  function setupNav() {
    navTabs = makeTabs($('#section-tabs'), (tab) => {
      spyPausedUntil = Date.now() + 900;
      document.getElementById(tab.dataset.target).scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
    const sections = navTabs.tabs.map((t) => document.getElementById(t.dataset.target));
    const spy = () => {
      if (Date.now() < spyPausedUntil || app.hidden) return;
      let current = sections[0];
      for (const s of sections) {
        if (s.getBoundingClientRect().top <= window.innerHeight * 0.4) current = s;
      }
      const tab = navTabs.tabs.find((t) => t.dataset.target === current.id);
      if (tab.getAttribute('aria-selected') !== 'true') navTabs.select(tab);
    };
    window.addEventListener('scroll', spy, { passive: true });
  }

  // ---------------- Calculadora ----------------
  let calcProduct = D.productos[0];
  const amount = $('#calc-amount');
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

  let lastShown = '';
  function updateCalc() {
    const raw = parseInt(amount.value.replace(/\D/g, ''), 10);
    const n = Number.isFinite(raw) ? raw : 0;
    amount.value = n ? new Intl.NumberFormat('es-MX').format(n) : '';
    const rate = calcProduct.comision;
    const box = valueEl.parentElement;
    let text;
    if (has(rate)) {
      $('#calc-rate').textContent = `${calcProduct.nombre}: ${rate}% de comisión sobre el monto de la venta.`;
      text = money(Math.round((n * rate) / 100));
      box.classList.remove('is-tbd');
    } else {
      $('#calc-rate').textContent = `La comisión de ${calcProduct.nombre} está por definir.`;
      text = TBD;
      box.classList.add('is-tbd');
    }
    if (text !== lastShown) { lastShown = text; setDigits(text); }
  }

  function setupCalc() {
    const bar = $('#calc-tabs');
    bar.innerHTML = '<span class="t-tabs-pill" aria-hidden="true"></span>' +
      D.productos.map((p, i) => `<button class="t-tab" role="tab" type="button" aria-selected="${i === 0}" data-id="${esc(p.id)}">${esc(p.nombre)}</button>`).join('');
    const tabs = makeTabs(bar, (tab) => {
      calcProduct = D.productos.find((p) => p.id === tab.dataset.id);
      if (has(calcProduct.precio)) amount.value = String(calcProduct.precio);
      updateCalc();
    });
    if (has(calcProduct.precio)) amount.value = String(calcProduct.precio);
    amount.addEventListener('input', updateCalc);
    updateCalc();
    return tabs;
  }

  // ---------------- Arranque ----------------
  renderProducts();
  renderRules();
  renderBenefits();
  renderSteps();
  renderFaq();

  let calcTabs;
  let ready = false;
  function unlock() {
    lock.hidden = true;
    app.hidden = false;
    if (!ready) {
      setupNav();
      calcTabs = setupCalc();
      ready = true;
    }
    requestAnimationFrame(() => {
      navTabs.snap();
      calcTabs.snap();
      const hero = $('#hero');
      hero.classList.remove('is-hiding', 'is-shown');
      void hero.offsetHeight;
      hero.classList.add('is-shown');
    });
  }

  if (store.get()) unlock();
})();
