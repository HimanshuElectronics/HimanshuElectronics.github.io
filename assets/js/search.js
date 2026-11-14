/* Himanshu Electronics - site search (search.html?q=fan): products, categories and pages. */
(function () {
  'use strict';
  var WA = '919639228237';
  var PAGES = [
    ['Products', 'products.html', 'all products fans wires bulbs irons appliances'], ['Brands', 'brands.html', 'orient fybros havells brands'],
    ['Book Home Service', 'repair.html', 'repair home service worker book slot fan iron led tv cooler technician visit'],
    ['Wholesale and dealers', 'wholesale.html', 'wholesale dealer bulk rate contractor electrician'], ['About us', 'about.html', 'about shop himanshu electronics'],
    ['Contact', 'contact.html', 'contact phone whatsapp address hours call'], ['Delivery', 'delivery.html', 'delivery pickup'],
    ['FAQ', 'faq.html', 'questions help answers'], ['Gallery', 'gallery.html', 'photos pictures'], ['Returns', 'returns.html', 'return warranty refund']
  ];
  var POP = ['Fan', 'Wire', 'LED bulb', 'Iron', 'Cooler', 'Home service', 'Wholesale', 'Contact'];
  var $ = function (i) { return document.getElementById(i); };
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function norm(s) { return String(s || '').toLowerCase().replace(/[^a-z0-9 ]+/g, ' ').replace(/\s+/g, ' ').trim(); }
  var idx = [], q0 = new URLSearchParams(location.search).get('q') || '';
  function gj(n) { return fetch('data/' + n + '.json').then(function (r) { return r.json(); }); }
  Promise.all([gj('products'), gj('categories'), gj('brands')]).then(function (r) {
    var cats = {}, brs = {}; r[1].forEach(function (c) { cats[c.id] = c; }); r[2].forEach(function (b) { brs[b.id] = b; });
    r[0].forEach(function (p) {
      if (p.status != null && p.status !== 'published') return;
      var c = cats[p.categoryId] || { name: '' }, b = brs[p.brandId] || { name: '' };
      idx.push({ t: p.name, sub: [c.name, b.name, p.packagingInfo].filter(Boolean).join(' · '), url: 'product.html?slug=' + encodeURIComponent(p.slug || p.id), hay: norm(p.name + ' ' + c.name + ' ' + b.name + ' ' + (p.packagingInfo || '') + ' ' + (p.description || '')), head: norm(p.name), kind: 'Product' });
    });
    r[1].forEach(function (c) { idx.push({ t: c.name, sub: 'Category', url: 'products.html?cat=' + c.slug, hay: norm(c.name), head: norm(c.name), kind: 'Category' }); });
    r[2].forEach(function (b) { if (b.isActive !== false) idx.push({ t: b.name, sub: 'Brand', url: 'products.html?brand=' + b.slug, hay: norm(b.name + ' ' + (b.description || '')), head: norm(b.name), kind: 'Brand' }); });
    PAGES.forEach(function (p) { idx.push({ t: p[0], sub: 'Page', url: p[1], hay: norm(p[0] + ' ' + p[2]), head: norm(p[0]), kind: 'Page' }); });
    start();
  });
  function start() {
    var inp = $('sin'); inp.value = q0;
    $('spop').innerHTML = POP.map(function (w) { return '<button type="button" class="chip" data-q="' + esc(w) + '">' + esc(w) + '</button>'; }).join('');
    function render() {
      var q = norm(inp.value), words = q ? q.split(' ') : [];
      $('sclear').hidden = !q; $('sstart').hidden = !!q;
      var hits = [];
      if (words.length) idx.forEach(function (it) {
        var s = 0; for (var i = 0; i < words.length; i++) { if (it.hay.indexOf(words[i]) < 0) { s = 0; break; } s += it.head.indexOf(words[i]) === 0 ? 6 : it.head.indexOf(words[i]) > -1 ? 4 : 1; }
        if (s) hits.push([it, s]);
      });
      hits.sort(function (a, b) { return b[1] - a[1]; });
      $('scount').textContent = q && hits.length ? hits.length + (hits.length === 1 ? ' result' : ' results') + ' for "' + inp.value.trim() + '"' : '';
      $('sres').innerHTML = hits.length ? '<ul class="slist">' + hits.slice(0, 40).map(function (h) { return '<li><a href="' + h[0].url + '"><span class="slist__kind">' + h[0].kind + '</span><span class="slist__t">' + esc(h[0].t) + '</span><span class="slist__s">' + esc(h[0].sub) + '</span></a></li>'; }).join('') + '</ul>' : '';
      $('snone').hidden = !q || hits.length > 0;
      $('swa').href = 'https://wa.me/' + WA + '?text=' + encodeURIComponent('Hello Himanshu Electronics, do you have: ' + inp.value.trim() + '?');
      try { history.replaceState(null, '', q ? 'search.html?q=' + encodeURIComponent(inp.value.trim()) : 'search.html'); } catch (e) {}
    }
    inp.addEventListener('input', render);
    $('sform').addEventListener('submit', function (e) { e.preventDefault(); inp.blur(); });
    $('sclear').addEventListener('click', function () { inp.value = ''; render(); inp.focus(); });
    document.addEventListener('click', function (e) { var b = e.target.closest('[data-q]'); if (b) { inp.value = b.getAttribute('data-q'); render(); } });
    render(); if (!q0) inp.focus();
  }
})();
