/* Himanshu Electronics - Enquiry List (pattern from Rajput Traders).
   Tap "+" on a product to add it. A list button appears (list icon with a count).
   Open it to change quantities and send the whole list to the shop on WhatsApp.
   The list is saved on the visitor's own phone (localStorage). */
(function () {
  'use strict';
  var WA = '919639228237', KEY = 'he_enquiry_v1', MAX = 9999;
  var items = {}, byId = {}, ready = null, drawer, fab, toast, toastTimer;
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function load() { try { var o = JSON.parse(localStorage.getItem(KEY) || '{}'); items = {}; Object.keys(o).forEach(function (k) { var q = parseInt(o[k], 10); if (q > 0) items[k] = Math.min(q, MAX); }); } catch (e) { items = {}; } }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(items)); } catch (e) {} }
  function ids() { return Object.keys(items); }
  function qty(id) { return items[String(id)] || 0; }
  function getJSON(n) { return fetch('data/' + n + '.json').then(function (r) { return r.ok ? r.json() : []; }).catch(function () { return []; }); }
  function catalog() {
    if (!ready) ready = Promise.all([getJSON('products'), getJSON('brands'), getJSON('categories')]).then(function (r) {
      var b = {}, c = {};
      r[1].forEach(function (x) { b[x.id] = x; }); r[2].forEach(function (x) { c[x.id] = x; });
      r[0].forEach(function (p) {
        if (!p || !p.name || (p.status != null && p.status !== 'published')) return;
        byId[String(p.id)] = { id: p.id, name: p.name, slug: p.slug || p.id, brand: b[p.brandId] ? b[p.brandId].name : '', pack: p.packagingInfo || '', price: parseFloat(p.price) > 0 ? parseFloat(p.price) : 0, order: p.sortOrder || 0,
          img: p.images && p.images.length ? 'assets/images/products/' + encodeURIComponent(p.images[0]) : '', icon: c[p.categoryId] ? c[p.categoryId].icon : 'i-box' };
      });
      return byId;
    });
    return ready;
  }
  function changed() { save(); refresh(); }
  function setQty(id, q) { id = String(id); q = parseInt(q, 10); if (!(q > 0)) delete items[id]; else items[id] = Math.min(q, MAX); changed(); }
  function total() { var t = 0; ids().forEach(function (id) { if (byId[id] && byId[id].price) t += byId[id].price * items[id]; }); return t; }

  function refreshButtons() {
    var list = document.querySelectorAll('[data-add-list]');
    for (var i = 0; i < list.length; i++) {
      var b = list[i], on = qty(b.getAttribute('data-add-list')) > 0, w = on ? '1' : '0';
      if (b.getAttribute('data-state') === w) continue;
      b.setAttribute('data-state', w); b.classList.toggle('is-added', on); b.setAttribute('aria-pressed', on ? 'true' : 'false');
      b.innerHTML = '<i class="' + (on ? 'ri-check-line' : 'ri-add-line') + '" aria-hidden="true"></i>';
    }
  }
  window.RT_refreshButtons = refreshButtons;

  function build() {
    fab = document.createElement('button'); fab.type = 'button'; fab.className = 'enq-fab'; fab.hidden = true; fab.setAttribute('data-open-list', ''); fab.setAttribute('aria-label', 'Open your enquiry list');
    fab.innerHTML = '<i class="ri-file-list-3-line" aria-hidden="true"></i><span class="enq-fab__badge">0</span>';
    document.body.appendChild(fab);
    toast = document.createElement('div'); toast.className = 'enq-toast'; toast.setAttribute('role', 'status');
    toast.innerHTML = '<span class="enq-toast__text"></span><button type="button" class="enq-toast__btn" data-open-list>View list</button>';
    document.body.appendChild(toast);
    drawer = document.createElement('div'); drawer.className = 'enq'; drawer.setAttribute('aria-hidden', 'true');
    drawer.innerHTML = '<div class="enq__backdrop" data-enq-close></div><aside class="enq__panel" role="dialog" aria-modal="true" aria-labelledby="enqTitle">' +
      '<header class="enq__head"><h2 class="enq__title" id="enqTitle">Your Enquiry List <span data-enq-count></span></h2><button type="button" class="enq__close" data-enq-close aria-label="Close list"><i class="ri-close-line" aria-hidden="true"></i></button></header>' +
      '<div class="enq__body" data-enq-body></div>' +
      '<footer class="enq__foot" data-enq-foot><div class="enq__total" data-enq-totalrow><span>Estimated total (at MRP)</span><strong data-enq-total></strong></div>' +
      '<p class="enq__note">Final wholesale prices are confirmed by the shop on WhatsApp.</p>' +
      '<a class="btn btn--block enq__send" data-enq-send target="_blank" rel="noopener"><i class="ri-whatsapp-line" aria-hidden="true"></i> Send list on WhatsApp</a>' +
      '<button type="button" class="enq__clear" data-enq-clear>Clear list</button></footer></aside>' +
      '<div class="enq-confirm" data-enq-confirm hidden><div class="enq-confirm__box" role="alertdialog"><h3>Clear your list?</h3><p>All products will be removed from your enquiry list.</p><div class="enq-confirm__actions"><button type="button" class="btn btn--ghost" data-enq-no>Keep list</button><button type="button" class="btn" data-enq-yes>Yes, clear</button></div></div></div>';
    document.body.appendChild(drawer);
    drawer.addEventListener('click', function (e) {
      var t = e.target, g = function (a) { var el = t.closest('[' + a + ']'); return el ? el.getAttribute(a) : null; };
      if (t.closest('[data-enq-close]')) { close(); return; }
      if (t.closest('[data-enq-no]') || t.matches('[data-enq-confirm]')) { drawer.querySelector('[data-enq-confirm]').hidden = true; return; }
      if (t.closest('[data-enq-yes]')) { drawer.querySelector('[data-enq-confirm]').hidden = true; items = {}; changed(); return; }
      if (t.closest('[data-enq-clear]')) { drawer.querySelector('[data-enq-confirm]').hidden = false; return; }
      var d = g('data-enq-dec'), i = g('data-enq-inc'), r = g('data-enq-remove');
      if (d !== null) setQty(d, qty(d) - 1); else if (i !== null) setQty(i, qty(i) + 1); else if (r !== null) setQty(r, 0);
    });
    drawer.addEventListener('change', function (e) { var inp = e.target.closest('[data-enq-input]'); if (inp) setQty(inp.getAttribute('data-enq-input'), inp.value); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && isOpen()) close(); });
  }
  function isOpen() { return drawer.classList.contains('is-open'); }
  function open() { catalog().then(function () { render(); drawer.classList.add('is-open'); drawer.setAttribute('aria-hidden', 'false'); document.body.classList.add('body--drawer-open'); toast.classList.remove('is-visible'); }); }
  function close() { drawer.querySelector('[data-enq-confirm]').hidden = true; drawer.classList.remove('is-open'); drawer.setAttribute('aria-hidden', 'true'); document.body.classList.remove('body--drawer-open'); }
  function message() {
    var lines = ['Hello Himanshu Electronics, I would like the wholesale price for these products:', ''], n = 0;
    ids().forEach(function (id) { var p = byId[id]; if (!p) return; n++; lines.push(n + '. ' + p.name + (p.brand || p.pack ? ' (' + [p.brand, p.pack].filter(Boolean).join(', ') + ')' : '') + ' x ' + items[id]); });
    return lines.join('\n');
  }
  function render() {
    var n = ids().length, body = drawer.querySelector('[data-enq-body]');
    drawer.querySelector('[data-enq-count]').textContent = n ? '(' + n + ')' : '';
    drawer.querySelector('[data-enq-foot]').hidden = n === 0;
    var tt = total(); drawer.querySelector('[data-enq-totalrow]').hidden = !tt;
    drawer.querySelector('[data-enq-total]').textContent = '₹' + tt.toLocaleString('en-IN');
    drawer.querySelector('[data-enq-send]').href = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(message());
    if (!n) { body.innerHTML = '<div class="enq__empty"><i class="ri-file-list-3-line" aria-hidden="true"></i><p class="enq__empty-title">Your list is empty</p><p>Tap + on the products you need. Then send the whole list to us on WhatsApp.</p><a href="products.html" class="btn">Browse products</a></div>'; return; }
    body.innerHTML = '<ul class="enq__items">' + ids().filter(function (id) { return byId[id]; }).sort(function (a, b) { return byId[a].order - byId[b].order; }).map(function (id) {
      var p = byId[id], href = 'product.html?slug=' + encodeURIComponent(p.slug);
      var im = p.img ? '<img src="' + p.img + '" alt="" loading="lazy">' : '<svg aria-hidden="true"><use href="#' + esc(p.icon) + '"/></svg>';
      return '<li class="enq-item"><a href="' + href + '" class="enq-item__img">' + im + '</a><div class="enq-item__main"><a href="' + href + '" class="enq-item__name">' + esc(p.name) + '</a>' +
        '<span class="enq-item__meta">' + esc([p.brand, p.pack].filter(Boolean).join(' · ')) + '</span><span class="enq-item__price">' + (p.price ? 'MRP ₹' + p.price : 'Price on request') + '</span>' +
        '<div class="enq-stepper"><button type="button" data-enq-dec="' + esc(id) + '" aria-label="Fewer"><i class="ri-subtract-line"></i></button><input type="number" inputmode="numeric" min="1" max="' + MAX + '" value="' + items[id] + '" data-enq-input="' + esc(id) + '" aria-label="Quantity"><button type="button" data-enq-inc="' + esc(id) + '" aria-label="More"><i class="ri-add-line"></i></button></div></div>' +
        '<button type="button" class="enq-item__remove" data-enq-remove="' + esc(id) + '" aria-label="Remove"><i class="ri-delete-bin-line"></i></button></li>';
    }).join('') + '</ul>';
  }
  function refresh() {
    if (!fab) return;
    var n = ids().length; fab.hidden = n === 0; fab.querySelector('.enq-fab__badge').textContent = n;
    if (!n) toast.classList.remove('is-visible');
    refreshButtons();
    if (drawer && isOpen()) { var a = document.activeElement, k = a && a.getAttribute && a.getAttribute('data-enq-input'); render(); if (k) { var again = drawer.querySelector('[data-enq-input="' + k + '"]'); if (again) again.focus(); } }
  }
  function init() {
    load(); build(); refresh();
    document.addEventListener('click', function (e) {
      var a = e.target.closest('[data-add-list]');
      if (a) {
        e.preventDefault(); var id = a.getAttribute('data-add-list');
        if (qty(id) > 0) { open(); return; }
        items[String(id)] = 1; changed();
        catalog().then(function () { toast.querySelector('.enq-toast__text').textContent = (byId[String(id)] ? byId[String(id)].name : 'Product') + ' added to your list'; toast.classList.add('is-visible'); clearTimeout(toastTimer); toastTimer = setTimeout(function () { toast.classList.remove('is-visible'); }, 2600); });
        return;
      }
      if (e.target.closest('[data-open-list]')) { e.preventDefault(); open(); }
    });
    var pending = false;
    new MutationObserver(function () { if (pending) return; pending = true; requestAnimationFrame(function () { pending = false; refreshButtons(); }); }).observe(document.body, { childList: true, subtree: true });
    window.addEventListener('storage', function (e) { if (e.key === KEY) { load(); refresh(); } });
  }
  init();
})();
