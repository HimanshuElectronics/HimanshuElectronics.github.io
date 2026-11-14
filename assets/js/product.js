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
    var media = imgs.length
      ? '<div class="pgal__main"><img data-gallery-main-image src="' + imgs[0] + '" alt="' + esc(p.name) + '"></div>' +
        (imgs.length > 1 ? '<div class="pgal__thumbs">' + imgs.map(function (u, i) { return '<button type="button" class="pgal__thumb' + (i === 0 ? ' pgal__thumb--on' : '') + '" data-gallery-thumb data-image-url="' + u + '" aria-label="Photo ' + (i + 1) + '"><img src="' + u + '" alt=""></button>'; }).join('') + '</div>' : '')
      : '<div class="pgal__main pgal__main--art"><svg aria-hidden="true"><use href="#' + esc(cat.icon) + '"/></svg></div>';
    var msg = 'Hello Himanshu Electronics, I want the price for: ' + p.name + (brand ? ' (' + brand.name + ')' : '');
    box.innerHTML = '<div class="pgal">' + media + '</div><div class="pinfo">' +
      '<p class="eyebrow">' + esc(cat.name) + (brand ? ' &middot; ' + esc(brand.name) : '') + '</p>' +
      '<h1>' + esc(p.name) + '</h1><p class="pinfo__desc">' + esc(p.description || '') + '</p>' +
      (p.packagingInfo ? '<p class="pinfo__note">Pack: ' + esc(p.packagingInfo) + '</p>' : '') + '<p class="pcard__price" style="font-size:20px">' + (p.price ? 'MRP &#8377;' + esc(p.price) : 'Contact for price') + '</p>' +
      '<div class="pinfo__btns"><a class="btn" href="' + wa(msg) + '" target="_blank" rel="noopener"><svg class="ico" aria-hidden="true"><use href="#s-wa"/></svg> Get price on WhatsApp</a><a class="btn btn--ghost" href="tel:+91' + '9639228237' + '"><svg class="ico" aria-hidden="true"><use href="#s-phone"/></svg> Call</a><button type="button" class="btn btn--dark" data-add-list="' + esc(p.id) + '"><i class="ri-add-line"></i></button></div>' +
      '<p class="pinfo__note">Wholesale rates depend on quantity and brand. Tell us how many you need.</p></div>';
    var th = box.querySelectorAll('[data-gallery-thumb]'), main = box.querySelector('[data-gallery-main-image]');
    th.forEach(function (b) { b.addEventListener('click', function () { main.src = b.getAttribute('data-image-url'); th.forEach(function (t) { t.classList.toggle('pgal__thumb--on', t === b); }); }); });
    if (window.HE_zoomInit) window.HE_zoomInit();
    var rel = d.products.filter(function (x) { return x.categoryId === p.categoryId && x.id !== p.id; });
    var rbox = $('#related');
    if (!rel.length) { rbox.parentNode.parentNode.hidden = true; return; }
    rbox.innerHTML = rel.map(function (x) {
      return '<article class="pcard" data-id="' + esc(x.id) + '"><a class="pcard__media" href="product.html?slug=' + encodeURIComponent(x.slug || x.id) + '"><svg aria-hidden="true"><use href="#' + esc(cat.icon) + '"/></svg></a><div class="pcard__body"><h3 class="pcard__name"><a href="product.html?slug=' + encodeURIComponent(x.slug || x.id) + '">' + esc(x.name) + '</a></h3><p class="pcard__meta">' + esc(cat.name) + '</p><a class="pcard__btn" style="margin-top:12px" href="product.html?slug=' + encodeURIComponent(x.slug || x.id) + '">View</a></div></article>';
    }).join('');
  }).catch(function () { $('#pdetail').innerHTML = '<div class="empty">Could not load the product. Please call 9639228237.</div>'; });
})();
