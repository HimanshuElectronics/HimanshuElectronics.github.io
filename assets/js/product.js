/* Himanshu Electronics - product detail page: product.html?id=ceiling-fan */
(function () {
  'use strict';
  var WA = '919639228237';
  function $(s) { return document.querySelector(s); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function wa(t) { return 'https://wa.me/' + WA + '?text=' + encodeURIComponent(t); }
  var slug = new URLSearchParams(location.search).get('slug');
  function gj(n) { return fetch('data/' + n + '.json').then(function (r) { return r.json(); }); }
  Promise.all([gj('products'), gj('categories'), gj('brands')]).then(function (r) {
    var d = { products: r[0].filter(function (x) { return x.status == null || x.status === 'published'; }), categories: r[1], brands: r[2] };
    var p = d.products.filter(function (x) { return String(x.slug || x.id) === slug; })[0];
    var box = $('#pdetail');
    if (!p) { box.innerHTML = '<div class="empty"><p>We could not find this product.</p><a class="btn" href="products.html">See all products</a></div>'; $('#related').parentNode.parentNode.parentNode.hidden = true; return; }
    var cat = d.categories.filter(function (c) { return c.id === p.categoryId; })[0] || { name: '', icon: 'i-box' };
    var brand = d.brands.filter(function (b) { return b.id === p.brandId; })[0] || null;
    document.title = p.name + ' | Himanshu Electronics';
    $('#crumb').textContent = p.name;
    var imgs = (p.images || []).map(function (f) { return 'assets/images/products/' + encodeURIComponent(f); });
    var art = imgs.length
      ? '<img data-gallery-main-image src="' + imgs[0] + '" alt="' + esc(p.name) + '" draggable="false">'
      : '<svg aria-hidden="true"><use href="#' + esc(cat.icon) + '"/></svg>';
    var media = '<div class="pgal__main pstage' + (imgs.length ? '' : ' pgal__main--art') + '" data-tilt><span class="pstage__glow"></span><div class="pstage__obj">' + art + '</div><span class="pstage__ring"></span><span class="pstage__hint">Drag to tilt</span></div>' +
      (imgs.length > 1 ? '<div class="pgal__thumbs">' + imgs.map(function (u, i) { return '<button type="button" class="pgal__thumb' + (i === 0 ? ' pgal__thumb--on' : '') + '" data-gallery-thumb data-image-url="' + u + '" aria-label="Photo ' + (i + 1) + '"><img src="' + u + '" alt=""></button>'; }).join('') + '</div>' : '');
    var words = String(p.name).trim().split(/\s+/), last = words.pop();
    var title = (words.length ? esc(words.join(' ')) + '<br>' : '') + '<span class="ptitle__hl">' + esc(last) + '.</span>';
    var stats = [];
    stats.push(['Category', cat.name]);
    if (brand) stats.push(['Brand', brand.name]);
    if (p.packagingInfo) stats.push(['Pack', p.packagingInfo]);
    stats.push(['Price', p.price ? '&#8377;' + esc(p.price) : 'Ask us']);
    var colors = (p.colors || []).filter(function (c) { return c && c.name; });
    var chosen = colors.length ? colors[0].name : '';
    var msg0 = 'Hello Himanshu Electronics, I want the price for: ' + p.name + (brand ? ' (' + brand.name + ')' : '');
    function msg() { return msg0 + (chosen ? '\nColour: ' + chosen : ''); }
    box.className = 'pdetail pshow';
    box.innerHTML = '<div class="pgal">' + media + '</div><div class="pinfo">' +
      '<p class="eyebrow pshow__eye">' + esc(cat.name) + (brand ? ' / ' + esc(brand.name) : '') + '</p>' +
      '<h1 class="ptitle">' + title + '</h1><p class="pinfo__desc">' + esc(p.description || '') + '</p>' +
      '<div class="pstats">' + stats.map(function (x) { return '<div class="pstats__i"><b>' + (x[0] === 'Price' ? x[1] : esc(x[1])) + '</b><span>' + x[0] + '</span></div>'; }).join('') + '</div>' +
      (colors.length ? '<div class="pcolors"><span class="pcolors__lab">Colour <b id="pcName">' + esc(chosen) + '</b></span><div class="pcolors__dots">' + colors.map(function (c, i) { return '<button type="button" class="pcolors__dot' + (i === 0 ? ' is-on' : '') + '" data-color="' + esc(c.name) + '" style="--c:' + esc(c.hex || '#999') + '" aria-label="' + esc(c.name) + '"></button>'; }).join('') + '</div></div>' : '') +
      '<div class="pinfo__btns"><a class="btn" id="pWa" href="' + wa(msg()) + '" target="_blank" rel="noopener"><svg class="ico" aria-hidden="true"><use href="#s-wa"/></svg> Get price on WhatsApp</a><a class="btn btn--ghost" href="tel:+919639228237"><svg class="ico" aria-hidden="true"><use href="#s-phone"/></svg> Call</a><button class="btn btn--ghost" type="button" data-add-list="' + esc(p.id) + '"><i class="ri-add-line"></i> Add to list</button></div>' +
      '<p class="pinfo__note">Wholesale rates depend on quantity and brand. Tell us how many you need.</p></div>';
    box.querySelectorAll('[data-color]').forEach(function (b) { b.addEventListener('click', function () { chosen = b.getAttribute('data-color'); box.querySelectorAll('[data-color]').forEach(function (x) { x.classList.toggle('is-on', x === b); }); $('#pcName').textContent = chosen; $('#pWa').href = wa(msg()); }); });
    /* tilt: drag (or move the mouse) to turn the product; a drag never counts as a tap-to-zoom */
    var st = box.querySelector('[data-tilt]'), obj = box.querySelector('.pstage__obj'), sx = 0, sy = 0, down = false, moved = false, reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
    function tilt(rx, ry) { obj.style.setProperty('--rx', rx + 'deg'); obj.style.setProperty('--ry', ry + 'deg'); }
    function clamp(v, m) { return Math.max(-m, Math.min(m, v)); }
    if (!reduce) {
      st.addEventListener('pointerdown', function (e) { down = true; moved = false; sx = e.clientX; sy = e.clientY; st.classList.add('is-drag'); try { st.setPointerCapture(e.pointerId); } catch (x) {} });
      st.addEventListener('pointermove', function (e) {
        var r = st.getBoundingClientRect();
        if (down) { var dx = e.clientX - sx, dy = e.clientY - sy; if (Math.abs(dx) + Math.abs(dy) > 6) moved = true; tilt(clamp(-dy * .25, 18), clamp(dx * .4, 34)); }
        else if (e.pointerType === 'mouse') tilt(clamp(-((e.clientY - r.top) / r.height - .5) * 20, 12), clamp(((e.clientX - r.left) / r.width - .5) * 40, 20));
      });
      function end() { down = false; st.classList.remove('is-drag'); tilt(0, 0); }
      st.addEventListener('pointerup', end); st.addEventListener('pointercancel', end); st.addEventListener('pointerleave', function () { if (!down) tilt(0, 0); });
      st.addEventListener('click', function (e) { if (moved) { e.stopImmediatePropagation(); e.preventDefault(); moved = false; } }, true);
    }
    var th = box.querySelectorAll('[data-gallery-thumb]'), main = box.querySelector('[data-gallery-main-image]');
    th.forEach(function (b) { b.addEventListener('click', function () { main.src = b.getAttribute('data-image-url'); th.forEach(function (t) { t.classList.toggle('pgal__thumb--on', t === b); }); }); });
    if (window.HE_zoomInit) window.HE_zoomInit();
    var rel = d.products.filter(function (x) { return x.categoryId === p.categoryId && x.id !== p.id; });
    var rbox = $('#related');
    if (!rel.length) { rbox.parentNode.parentNode.hidden = true; return; }
    rbox.innerHTML = rel.map(function (x) {
      return '<article class="pcard" data-id="' + esc(x.id) + '"><a class="pcard__media" href="product.html?slug=' + encodeURIComponent(x.slug || x.id) + '"><svg aria-hidden="true"><use href="#' + esc(cat.icon) + '"/></svg></a><div class="pcard__body"><h3 class="pcard__name"><a href="product.html?slug=' + encodeURIComponent(x.slug || x.id) + '">' + esc(x.name) + '</a></h3><p class="pcard__meta">' + esc(cat.name) + '</p><p class="pcard__price">' + (x.price ? 'MRP &#8377;' + esc(x.price) : 'Contact for price') + '</p><a class="pcard__btn" style="margin-top:12px" href="product.html?slug=' + encodeURIComponent(x.slug || x.id) + '">View</a></div></article>';
    }).join('');
    if (window.HE) window.HE.refresh(rbox);
    if (window.RT_refreshButtons) window.RT_refreshButtons();
  }).catch(function () { $('#pdetail').innerHTML = '<div class="empty">Could not load the product. Please call 9639228237.</div>'; });
})();
