(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var WA = '919639228237';

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function waLink(text) { return 'https://wa.me/' + WA + '?text=' + encodeURIComponent(text); }

  /* ---------- header ---------- */
  var header = $('.header');
  var burger = $('#burger');
  if (burger && header) {
    burger.addEventListener('click', function () {
      var open = header.classList.toggle('header--open');
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }
  function toggler(wrapSel, btnSel) {
    var wrap = $(wrapSel), btn = $(btnSel);
    if (!wrap || !btn) return;
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      var o = wrap.classList.toggle('is-open');
      btn.setAttribute('aria-expanded', o ? 'true' : 'false');
    });
    document.addEventListener('click', function (e) {
      if (!wrap.contains(e.target)) { wrap.classList.remove('is-open'); btn.setAttribute('aria-expanded', 'false'); }
    });
  }
  toggler('#allcat', '#allcatBtn');
  toggler('#navMore', '#navMoreBtn');

  /* ---------- reveal ---------- */
  var rv = $$('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('reveal--in'); io.unobserve(e.target); } });
    }, { threshold: 0.1 });
    rv.forEach(function (el) { io.observe(el); });
  } else { rv.forEach(function (el) { el.classList.add('reveal--in'); }); }

  /* ---------- hero slider ---------- */
  var slides = $$('.hero__slide');
  if (slides.length > 1) {
    var dots = $$('.hero__dot'), cur = 0, timer = null;
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var go = function (i) {
      cur = (i + slides.length) % slides.length;
      slides.forEach(function (s, k) { s.classList.toggle('hero__slide--active', k === cur); s.setAttribute('aria-hidden', k === cur ? 'false' : 'true'); });
      dots.forEach(function (d, k) { d.classList.toggle('hero__dot--active', k === cur); });
    };
    var start = function () { if (!reduce) { stop(); timer = setInterval(function () { go(cur + 1); }, 5500); } };
    var stop = function () { if (timer) { clearInterval(timer); timer = null; } };
    dots.forEach(function (d, k) { d.addEventListener('click', function () { go(k); start(); }); });
    var hero = $('.hero');
    if (hero) { hero.addEventListener('mouseenter', stop); hero.addEventListener('mouseleave', start); }
    document.addEventListener('visibilitychange', function () { if (document.hidden) stop(); else start(); });
    go(0); start();
  }

  /* ---------- data (same model as Rajput Traders: products, categories, brands) ---------- */
  function getJSON(n) { return fetch('data/' + n + '.json').then(function (r) { return r.ok ? r.json() : []; }).catch(function () { return []; }); }
  function byOrder(a, b) { return (a.sortOrder || 0) - (b.sortOrder || 0) || String(a.name).localeCompare(String(b.name)); }
  function prep(r) {
    var cats = {}, brands = {};
    (r[1] || []).forEach(function (c) { cats[c.id] = c; });
    (r[2] || []).forEach(function (b) { brands[b.id] = b; });
    var products = (r[0] || []).filter(function (p) { return p && p.name && (p.status == null || p.status === 'published'); })
      .map(function (p) { p.cat = cats[p.categoryId] || null; p.brand = brands[p.brandId] || null; return p; }).sort(byOrder);
    return { products: products, categories: (r[1] || []).slice().sort(byOrder), brands: (r[2] || []).filter(function (b) { return b.isActive !== false; }).sort(byOrder) };
  }

  function card(p, norev) {
    var meta = p.cat ? p.cat.name : '';
    if (p.brand) meta += ' · ' + p.brand.name;
    if (p.packagingInfo) meta += ' · ' + p.packagingInfo;
    var msg = 'Hello Himanshu Electronics, I want the price for: ' + p.name + (p.brand ? ' (' + p.brand.name + ')' : '');
    var href = 'product.html?slug=' + encodeURIComponent(p.slug || p.id);
    var media = (p.images && p.images.length)
      ? '<img src="assets/images/products/' + encodeURIComponent(p.images[0]) + '" alt="' + esc(p.name) + '" loading="lazy" decoding="async">'
      : '<svg aria-hidden="true"><use href="#' + esc(p.cat ? p.cat.icon : 'i-box') + '"/></svg>';
    var price = p.price ? 'MRP &#8377;' + esc(p.price) : 'Contact for price';
    return '<article class="pcard' + (norev ? '' : ' reveal') + '" data-id="' + esc(p.id) + '">' +
      '<a class="pcard__media" href="' + href + '" aria-label="View ' + esc(p.name) + '">' + media + '</a>' +
      '<div class="pcard__body"><h3 class="pcard__name"><a href="' + href + '">' + esc(p.name) + '</a></h3>' +
      '<p class="pcard__meta">' + esc(meta) + '</p><p class="pcard__price">' + price + '</p>' +
      '<div class="pcard__row"><a class="pcard__btn" href="' + waLink(msg) + '" target="_blank" rel="noopener"><svg class="ico" aria-hidden="true"><use href="#s-wa"/></svg> Get Price</a>' +
      '<button type="button" class="pcard__add" data-add-list="' + esc(p.id) + '" aria-label="Add ' + esc(p.name) + ' to enquiry list"><i class="ri-add-line" aria-hidden="true"></i></button></div>' +
      '</div></article>';
  }
  function observeNew(root) {
    var els = $$('.reveal', root);
    if ('IntersectionObserver' in window && typeof io !== 'undefined') { els.forEach(function (el) { io.observe(el); }); }
    else { els.forEach(function (el) { el.classList.add('reveal--in'); }); }
  }
  function brandCards(brands, products, big) {
    var n = {};
    products.forEach(function (p) { if (p.brandId) n[p.brandId] = (n[p.brandId] || 0) + 1; });
    return brands.map(function (b) {
      var logo = b.logo ? '<img src="assets/images/brands/' + encodeURIComponent(b.logo) + '" alt="' + esc(b.name) + ' logo" class="bcard__logo" loading="lazy" onerror="this.remove()">' : '';
      var url = 'products.html?brand=' + encodeURIComponent(b.slug);
      if (!big) return '<a class="bcard" href="' + url + '">' + logo + '<span class="bcard__name">' + esc(b.name) + '</span></a>';
      var c = n[b.id] || 0;
      return '<article class="bcard bcard--big reveal">' + logo + '<h3 class="bcard__name">' + esc(b.name) + '</h3>' +
        (b.description ? '<p class="bcard__desc">' + esc(b.description) + '</p>' : '') +
        '<p class="bcard__count">' + (c ? c + (c === 1 ? ' product' : ' products') : 'Ask us for products') + '</p>' +
        '<a class="btn btn--block" href="' + url + '">View products</a></article>';
    }).join('');
  }

  var popular = $('#popular'), listRoot = $('#plist'), allcatMenu = $('#allcatMenu'), homecats = $('#homecats'), homeBrands = $('#homebrands'), brandList = $('#brandlist');
  if (popular || listRoot || allcatMenu || homeBrands || brandList) {
    Promise.all([getJSON('products'), getJSON('categories'), getJSON('brands')]).then(function (r) {
      var d = prep(r);
      if (allcatMenu && d.categories.length) allcatMenu.innerHTML = d.categories.map(function (c) { return '<a class="allcat__link" href="products.html?cat=' + esc(c.slug) + '"><svg aria-hidden="true"><use href="#' + esc(c.icon || 'i-box') + '"/></svg>' + esc(c.name) + '</a>'; }).join('');
      if (homecats && d.categories.length) homecats.innerHTML = d.categories.map(function (c) {
        return '<a class="cats__item" href="products.html?cat=' + esc(c.slug) + '"><span class="cats__icon"><svg aria-hidden="true"><use href="#' + esc(c.icon || 'i-box') + '"/></svg></span><span class="cats__name">' + esc(c.name) + '</span><span class="cats__sub">' + esc(c.sub || '') + '</span></a>';
      }).join('') + '<a class="cats__item" href="wholesale.html"><span class="cats__icon"><svg aria-hidden="true"><use href="#i-box"/></svg></span><span class="cats__name">Bulk Orders</span><span class="cats__sub">Dealer rates</span></a>';
      if (homeBrands && d.brands.length) homeBrands.innerHTML = brandCards(d.brands.slice(0, 6), d.products, false) + (d.brands.length > 6 ? '<a class="bcard bcard--more" href="brands.html">and more brands...</a>' : '');
      if (brandList) {
        brandList.innerHTML = d.brands.length ? brandCards(d.brands, d.products, true) : '<div class="empty">Brands coming soon. Call us on 9639228237.</div>';
        var bc = $('#brandchips');
        if (bc && d.brands.length > 1) { bc.hidden = false; bc.innerHTML = d.brands.map(function (b) { return '<a class="chip" href="products.html?brand=' + esc(b.slug) + '">' + esc(b.name) + '</a>'; }).join(''); }
        window.HE.refresh(brandList);
      }
      if (popular) {
        var feat = d.products.filter(function (p) { return p.featured; });
        popular.innerHTML = (feat.length ? feat : d.products.slice(0, 10)).map(function (p) { return card(p, true); }).join('');
        window.HE.refresh(popular);
      }
      if (listRoot) initList(d);
    }).catch(function () {
      var t = '<div class="empty">Could not load the product list. Please call us on 9639228237.</div>';
      if (popular) popular.innerHTML = t;
      if (listRoot) listRoot.innerHTML = t;
    });
  }

  function initList(d) {
    var params = new URLSearchParams(location.search);
    var state = { q: params.get('q') || '', cat: params.get('cat') || '', brand: params.get('brand') || '' };
    var qIn = $('#fq'), chips = $('#fchips'), brandSel = $('#fbrand'), count = $('#fcount');
    var usedBrands = d.brands.filter(function (b) { return d.products.some(function (p) { return p.brandId === b.id; }); });
    if (brandSel) {
      if (usedBrands.length > 1) {
        brandSel.innerHTML = '<option value="">All brands</option>' + usedBrands.map(function (b) { return '<option value="' + esc(b.slug) + '">' + esc(b.name) + '</option>'; }).join('');
        brandSel.value = state.brand;
      } else { brandSel.style.display = 'none'; }
    }
    qIn.value = state.q;
    chips.innerHTML = '<button type="button" class="chip" data-cat="">All</button>' +
      d.categories.map(function (c) { return '<button type="button" class="chip" data-cat="' + esc(c.slug) + '">' + esc(c.name) + '</button>'; }).join('');

    function render() {
      var grouped = !state.q && !state.cat && !state.brand;
      var q = state.q.trim().toLowerCase();
      var out = d.products.filter(function (p) {
        if (state.cat && !(p.cat && p.cat.slug === state.cat)) return false;
        if (state.brand && !(p.brand && p.brand.slug === state.brand)) return false;
        if (q) {
          var hay = (p.name + ' ' + (p.description || '') + ' ' + (p.cat ? p.cat.name : '') + ' ' + (p.brand ? p.brand.name : '') + ' ' + (p.packagingInfo || '')).toLowerCase();
          return q.split(/\s+/).every(function (w) { return hay.indexOf(w) > -1; });
        }
        return true;
      });
      $$('.chip', chips).forEach(function (c) { c.classList.toggle('chip--on', c.getAttribute('data-cat') === state.cat); });
      count.textContent = (grouped ? d.products.length : out.length) + ((grouped ? d.products.length : out.length) === 1 ? ' product' : ' products');
      listRoot.className = grouped ? 'pgroups' : 'products products--page';
      if (grouped) {
        listRoot.innerHTML = d.categories.map(function (c) {
          var ps = d.products.filter(function (p) { return p.categoryId === c.id; });
          if (!ps.length) return '';
          return '<section class="pgroup"><div class="pgroup__head"><h2 class="pgroup__title">' + esc(c.name) + '</h2><span class="pgroup__count">' + ps.length + (ps.length === 1 ? ' product' : ' products') + '</span><button type="button" class="pgroup__all" data-viewall="' + esc(c.slug) + '">View all</button></div><div class="pscroll">' +
            ps.map(function (p) { return card(p, true); }).join('') + '</div></section>';
        }).join('') || '<div class="empty">Products are coming soon. Call us on 9639228237.</div>';
        window.HE.refresh(listRoot);
      } else if (!out.length) {
        listRoot.innerHTML = '<div class="empty" style="grid-column:1/-1"><p>No match found for what you searched.</p><p style="margin:10px 0 16px">We may still have it. Ask us on WhatsApp.</p>' +
          '<a class="btn" href="' + waLink('Hello Himanshu Electronics, do you have: ' + (state.q || 'this product') + '?') + '" target="_blank" rel="noopener"><svg class="ico" aria-hidden="true"><use href="#s-wa"/></svg> Ask on WhatsApp</a></div>';
      } else {
        listRoot.innerHTML = out.map(function (p) { return card(p); }).join('');
        window.HE.refresh(listRoot);
      }
      var u = new URLSearchParams();
      if (state.q) u.set('q', state.q);
      if (state.cat) u.set('cat', state.cat);
      if (state.brand) u.set('brand', state.brand);
      try { history.replaceState(null, '', location.pathname + (u.toString() ? '?' + u.toString() : '')); } catch (e) {}
    }
    qIn.addEventListener('input', function () { state.q = qIn.value; render(); });
    chips.addEventListener('click', function (e) { var b = e.target.closest('.chip'); if (!b) return; state.cat = b.getAttribute('data-cat'); render(); });
    listRoot.addEventListener('click', function (e) {
      var b = e.target.closest('[data-viewall]'); if (!b) return;
      state.cat = b.getAttribute('data-viewall'); render(); window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    if (brandSel) brandSel.addEventListener('change', function () { state.brand = brandSel.value; render(); });
    render();
  }

  /* ---------- enquiry form -> WhatsApp ---------- */
  var f = $('#waForm');
  if (f) {
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      var d = new FormData(f);
      var t = 'Hello Himanshu Electronics,\nName: ' + (d.get('name') || '') + '\nPhone: ' + (d.get('phone') || '') +
        '\nInterested in: ' + (d.get('topic') || '') + '\nDetails: ' + (d.get('msg') || '');
      window.open(waLink(t), '_blank', 'noopener');
    });
  }

  /* ---------- electricity wire + light-up (cheap: IntersectionObserver + one rAF-throttled transform) ---------- */
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var litIO = null;
  if ('IntersectionObserver' in window && !reduceMotion) {
    litIO = new IntersectionObserver(function (es) {
      es.forEach(function (e) { e.target.classList.toggle('is-lit', e.isIntersecting); });
    }, { rootMargin: '-38% 0px -38% 0px', threshold: 0 });
  }
  var wire = $('.wire'), tick = false, idle = null;
  var pulses = wire ? $$('.wg', wire) : [];
  var base = wire ? $$('.wp', wire) : [];
  function wireFrame() {
    tick = false;
    var y = window.scrollY;
    for (var i = 0; i < pulses.length; i++) {
      // pulses ride along the wires in step with the scroll position (down = flows down)
      var off = -(((y * 0.9) + i * 137) % 500);
      pulses[i].style.strokeDashoffset = off;
      base[i].style.strokeDashoffset = off;
    }
  }
  if (wire && !reduceMotion) {
    window.addEventListener('scroll', function () {
      if (!tick) { tick = true; requestAnimationFrame(wireFrame); }
      wire.classList.add('wire--on');
      clearTimeout(idle); idle = setTimeout(function () { wire.classList.remove('wire--on'); }, 350);
    }, { passive: true });
    wireFrame();
  }

  window.HE = {
    refresh: function (root) {
      $$('.pcard', root).forEach(function (el) { if (litIO) litIO.observe(el); });
      observeNew(root);
      if (window.RT_refreshButtons) window.RT_refreshButtons();
    }
  };
  $$('.promo').forEach(function (el) { if (litIO) litIO.observe(el); });

  /* ---------- home service booking ---------- */
  var wRoot = $('#workers');
  if (wRoot) {
    var picked = '', svc = '', all = [];
    var pn = $('#pickedName'), pc = $('#pickedClear');
    function drawWorkers() {
      var out = all.filter(function (w) { return !svc || (w.skills || []).indexOf(svc.replace('&amp;', '&')) > -1; });
      wRoot.innerHTML = out.length ? out.map(function (w) {
        var ini = w.name.split(/\s+/).map(function (s) { return s[0]; }).join('').slice(0, 2).toUpperCase();
        return '<article class="wcard' + (picked === w.name ? ' is-picked' : '') + '"><div class="wcard__top"><div class="wcard__av">' + esc(ini) + '</div><div><div class="wcard__name">' + esc(w.name) + '</div><div class="wcard__role">' + esc(w.role || '') + '</div></div></div>' +
          '<div class="wcard__tags">' + (w.skills || []).map(function (s) { return '<span>' + esc(s) + '</span>'; }).join('') + '</div>' +
          '<p class="wcard__meta">' + esc(w.area || '') + (w.exp ? ' &middot; ' + esc(w.exp) : '') + '</p>' +
          (w.available === false ? '<p class="wcard__busy">Busy today. You can still book another day.</p>' : '') +
          '<button type="button" class="btn" data-pick="' + esc(w.name) + '">' + (picked === w.name ? 'Selected' : 'Select this worker') + '</button></article>';
      }).join('') : '<div class="empty">No worker listed for this service yet. Choose Any available worker below, or call us.</div>';
    }
    function setPick(n) { picked = n; pn.textContent = n || 'Any available worker'; pc.hidden = !n; drawWorkers(); }
    fetch('data/workers.json').then(function (r) { return r.json(); }).then(function (d) { all = d.workers || []; drawWorkers(); })
      .catch(function () { wRoot.innerHTML = '<div class="empty">Could not load workers. Please call us on 9639228237.</div>'; });
    wRoot.addEventListener('click', function (e) {
      var b = e.target.closest('[data-pick]'); if (!b) return;
      setPick(b.getAttribute('data-pick'));
      var f2 = $('#bookForm'); if (f2 && f2.scrollIntoView) f2.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
    pc.addEventListener('click', function () { setPick(''); });
    $('#wchips').addEventListener('click', function (e) {
      var b = e.target.closest('.chip'); if (!b) return;
      svc = b.getAttribute('data-svc');
      $$('#wchips .chip').forEach(function (c) { c.classList.toggle('chip--on', c === b); });
      var sel = $('#bookForm select[name=service]'); if (sel && svc) sel.value = svc.replace('&amp;', '&');
      drawWorkers();
    });
    var bf = $('#bookForm');
    var di = bf.querySelector('input[name=date]'); if (di) { var t = new Date(); di.min = t.getFullYear() + '-' + ('0' + (t.getMonth() + 1)).slice(-2) + '-' + ('0' + t.getDate()).slice(-2); }
    bf.addEventListener('submit', function (e) {
      e.preventDefault();
      var d = new FormData(bf);
      var msg = 'Hello Himanshu Electronics, I want to book a home service.\nWorker: ' + (picked || 'Any available worker') + '\nService: ' + d.get('service') +
        '\nDate: ' + d.get('date') + '\nSlot: ' + d.get('slot') + '\nName: ' + d.get('name') + '\nPhone: ' + d.get('phone') + '\nAddress: ' + d.get('address') + '\nProblem: ' + (d.get('msg') || '-');
      window.open(waLink(msg), '_blank', 'noopener');
    });
  }


  /* ---------- latest updates strip (from data/updates.json) ---------- */
  var uHost = $('#updates');
  if (uHost) {
    fetch('data/updates.json').then(function (r) { return r.json(); }).then(function (rows) {
      var t = new Date(), today = t.getFullYear() + '-' + ('0' + (t.getMonth() + 1)).slice(-2) + '-' + ('0' + t.getDate()).slice(-2);
      var list = (rows || []).filter(function (u) { return u && u.title && u.isActive !== false && (!u.expiresOn || u.expiresOn >= today); }).slice(0, 6);
      if (!list.length) return;
      uHost.innerHTML = '<div class="wrap"><div class="updates__bar" role="region" aria-label="Latest updates"><span class="updates__label">Latest<br>Update</span><div class="updates__viewport">' +
        list.map(function (u, i) {
          var inner = '<strong>' + esc(u.title) + '</strong>' + (u.text ? '<span>' + esc(u.text) + '</span>' : '');
          var link = /^(https?:\/\/|[a-z0-9_-]+\.html)/i.test(u.link || '') ? u.link : '';
          return '<div class="updates__item' + (i === 0 ? ' is-active' : '') + '">' + (link ? '<a class="updates__slide" href="' + esc(link) + '">' + inner + '</a>' : '<div class="updates__slide">' + inner + '</div>') + '</div>';
        }).join('') + '</div></div></div>';
      uHost.hidden = false;
      var items = $$('.updates__item', uHost), k = 0;
      if (items.length > 1 && !reduceMotion) setInterval(function () { items[k].classList.remove('is-active'); k = (k + 1) % items.length; items[k].classList.add('is-active'); }, 4500);
    }).catch(function () {});
  }

  /* ---------- open / closed badge + offline support ---------- */
  var hrs = $('.hours');
  if (hrs) {
    try {
      var ist = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
      var m = ist.getHours() * 60 + ist.getMinutes(), open = m >= 570 && m < 1260;
      var tag = document.createElement('strong'); tag.textContent = open ? 'Open now' : 'Closed now (opens 9:30 AM)';
      tag.style.color = open ? '#3ddc84' : '#ff9b9b'; tag.style.marginRight = '8px';
      hrs.insertBefore(tag, hrs.children[1] || null);
    } catch (e) {}
  }
  if ('serviceWorker' in navigator && location.protocol === 'https:') { navigator.serviceWorker.register('sw.js').catch(function () {}); }
})();
