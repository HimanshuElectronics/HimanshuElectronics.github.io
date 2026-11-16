/* Contact, FAQ, gallery, delivery and technician details. Data comes from data/*.json */
(function () {
  'use strict';
  var HE = window.HE; if (!HE) return;
  var esc = HE.esc;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  function J(n) { return fetch('data/' + n + '.json').then(function (r) { return r.ok ? r.json() : null; }).catch(function () { return null; }); }
  function phoneFmt(p) { p = String(p || '').replace(/\D/g, '').slice(-10); return p.slice(0, 5) + ' ' + p.slice(5); }

  /* ---- shop details (data/site.json) ---- */
  var site = {};
  J('site').then(function (s) {
    site = s || {};
    $$('[data-site="address"]').forEach(function (el) { if (site.address) { el.innerHTML = esc(site.address).replace(/\n/g, '<br>'); } });
    $$('[data-site-show="gst"]').forEach(function (el) { if (site.gstNumber) { el.querySelector('strong').textContent = site.gstNumber; el.hidden = false; } });
    $$('[data-site-show="map"]').forEach(function (el) {
      if (site.mapEmbed) { el.innerHTML = '<iframe src="' + esc(site.mapEmbed) + '" title="Himanshu Electronics on the map" loading="lazy" referrerpolicy="no-referrer-when-downgrade" allowfullscreen></iframe>'; el.hidden = false; }
      else if (site.mapUrl) { el.innerHTML = '<a class="btn" href="' + esc(site.mapUrl) + '" target="_blank" rel="noopener">Open in Google Maps</a>'; el.hidden = false; }
    });
    $$('[data-site-show="directions"]').forEach(function (el) { if (site.mapUrl) { el.href = site.mapUrl; el.hidden = false; } });
    $$('[data-site-show="email"]').forEach(function (el) { if (site.email) { el.href = 'mailto:' + site.email; el.querySelector('span').textContent = site.email; el.hidden = false; } });
  });

  /* ---- open now badge (Indian time) ---- */
  $$('[data-open-badge]').forEach(function (el) {
    try {
      var p = new Intl.DateTimeFormat('en-GB', { hour: 'numeric', minute: 'numeric', hour12: false, timeZone: 'Asia/Kolkata' }).formatToParts(new Date());
      var h = 0, m = 0; p.forEach(function (x) { if (x.type === 'hour') h = +x.value; if (x.type === 'minute') m = +x.value; });
      var t = h + m / 60, open = t >= 9.5 && t < 21;
      el.textContent = open ? 'Open now' : 'Closed now';
      el.className = 'badge ' + (open ? 'badge--open' : 'badge--closed'); el.hidden = false;
    } catch (e) {}
  });

  /* ---- contact form (inquiry type -> WhatsApp or email) ---- */
  var cf = $('#contactForm');
  if (cf) {
    var T = { general: 'General enquiry', product: 'Product enquiry', wholesale: 'Wholesale / dealer', bulk: 'Bulk order', service: 'Home service', complaint: 'Complaint', feedback: 'Feedback', other: 'Other' };
    var q = new URLSearchParams(location.search).get('type'); if (q && T[q]) cf.elements.type.value = q;
    function text() { var d = new FormData(cf); return 'Hello Himanshu Electronics,\nType: ' + T[d.get('type')] + '\nName: ' + d.get('name') + '\nMobile: ' + d.get('mobile') + (d.get('business') ? '\nShop / business: ' + d.get('business') : '') + '\n\nMessage:\n' + d.get('message'); }
    function bad() {
      var ok = true, d = new FormData(cf);
      var map = { name: String(d.get('name')).trim().length < 2, mobile: !/^(\+?91|0)?[6-9]\d{9}$/.test(String(d.get('mobile')).replace(/[\s\-()]/g, '')), message: String(d.get('message')).trim().length < 5 };
      Object.keys(map).forEach(function (k) { var e = $('[data-err=' + k + ']', cf); if (e) e.hidden = !map[k]; if (map[k]) ok = false; });
      return !ok;
    }
    cf.addEventListener('submit', function (e) { e.preventDefault(); if (bad()) return; window.open(HE.waLink(text()), '_blank', 'noopener'); var s = $('#contactDone'); s.hidden = false; s.textContent = 'WhatsApp should open with your message ready. Just tap Send. If it did not open, call 9639228237.'; });
    var em = $('#sendEmail');
    if (em) em.addEventListener('click', function () { if (bad() || !site.email) return; location.href = 'mailto:' + site.email + '?subject=' + encodeURIComponent('Enquiry from ' + cf.elements.name.value) + '&body=' + encodeURIComponent(text()); });
    J('site').then(function (s) { if (s && s.email && em) em.hidden = false; });
    $$('[data-quick]').forEach(function (b) { b.addEventListener('click', function () { cf.elements.type.value = b.getAttribute('data-quick'); cf.scrollIntoView({ behavior: 'smooth', block: 'start' }); }); });
    J('faqs').then(function (f) {
      var list = (f || []).filter(function (x) { return x.isPublished !== false; }).sort(function (a, b) { return (b.isPopular ? 1 : 0) - (a.isPopular ? 1 : 0) || a.sortOrder - b.sortOrder; }).slice(0, 3);
      var h = $('#contactFaq'); if (h && list.length) h.innerHTML = list.map(function (x) { return '<details class="faq-item"><summary>' + esc(x.question) + '</summary><p>' + esc(x.answer) + '</p></details>'; }).join('');
      HE.refresh(document);
    });
  }

  /* ---- FAQ page ---- */
  var fl = $('#faqList');
  if (fl) {
    var LAB = { products: 'Products', delivery: 'Delivery', bulk: 'Wholesale', payments: 'Prices', service: 'Home service', general: 'General' };
    var st = { q: '', c: '' };
    J('faqs').then(function (rows) {
      var all = (rows || []).filter(function (x) { return x && x.question && x.isPublished !== false; }).sort(function (a, b) { return a.sortOrder - b.sortOrder; });
      var cats = []; all.forEach(function (x) { if (x.category && cats.indexOf(x.category) < 0) cats.push(x.category); });
      var chips = $('#faqChips'); chips.innerHTML = '<button class="chip chip--on" data-c="" type="button">All</button>' + cats.map(function (c) { return '<button class="chip" data-c="' + esc(c) + '" type="button">' + esc(LAB[c] || c) + '</button>'; }).join('');
      function draw() {
        var terms = st.q.toLowerCase().split(/\s+/).filter(Boolean);
        var out = all.filter(function (x) { if (st.c && x.category !== st.c) return false; var h = (x.question + ' ' + x.answer).toLowerCase(); return terms.every(function (t) { return h.indexOf(t) > -1; }); });
        fl.innerHTML = out.map(function (x) { return '<details class="faq-item" name="faq"><summary>' + esc(x.question) + '</summary><p>' + esc(x.answer).replace(/\n/g, '<br>') + '</p></details>'; }).join('');
        $('#faqNone').hidden = out.length > 0;
        $$('.chip', chips).forEach(function (b) { b.classList.toggle('chip--on', b.getAttribute('data-c') === st.c); });
        HE.refresh(fl);
      }
      chips.addEventListener('click', function (e) { var b = e.target.closest('.chip'); if (!b) return; st.c = b.getAttribute('data-c'); draw(); });
      $('#faqQ').addEventListener('input', function (e) { st.q = e.target.value; draw(); });
      draw();
      var s = document.createElement('script'); s.type = 'application/ld+json';
      s.textContent = JSON.stringify({ '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: all.map(function (x) { return { '@type': 'Question', name: x.question, acceptedAnswer: { '@type': 'Answer', text: x.answer } }; }) }).replace(/</g, '\\u003c');
      document.head.appendChild(s);
    });
  }

  /* ---- delivery chips ---- */
  var dc = $('#deliveryChips');
  if (dc) J('delivery').then(function (d) {
    var a = d && d.areas ? d.areas.filter(Boolean) : [];
    if (!a.length) return;
    dc.innerHTML = a.map(function (x) { return '<span class="dchip"><i class="ri-map-pin-2-line"></i> ' + esc(x) + '</span>'; }).join(''); dc.hidden = false;
    var t = $('#deliveryText'); if (t) t.textContent = 'We deliver to the towns below. Not on the list? Message us your location and we will check.';
    HE.refresh(dc);
  });

  /* ---- gallery + viewer ---- */
  var gg = $('#galGrid');
  if (gg) {
    var LAB2 = { products: 'Products', shop: 'Our shop', delivery: 'Deliveries', events: 'Events' }, items = [], sec = '', cur = 0, list = [];
    var box = $('#lightbox');
    function src(i) { return 'assets/images/gallery/' + encodeURIComponent(i.image); }
    function drawG() {
      list = items.filter(function (i) { return !sec || i.section === sec; });
      gg.innerHTML = list.map(function (i, n) { return '<button type="button" class="gcard" data-n="' + n + '"><img src="' + src(i) + '" alt="' + esc(i.title || 'Gallery photo') + '" loading="lazy" onerror="this.closest(\'.gcard\').remove()">' + (i.title ? '<span>' + esc(i.title) + '</span>' : '') + '</button>'; }).join('');
      $('#galEmpty').hidden = items.length > 0; HE.refresh(gg);
      $$('#galChips .chip').forEach(function (b) { b.classList.toggle('chip--on', b.getAttribute('data-s') === sec); });
    }
    function show(n) { if (!list.length) return; cur = (n + list.length) % list.length; var i = list[cur]; $('img', box).src = src(i); $('.lightbox__cap', box).textContent = i.title || ''; }
    function close() { box.classList.remove('lightbox--on'); document.body.style.overflow = ''; }
    J('gallery').then(function (g) {
      var rows = g && g.items ? g.items : [];
      items = rows.filter(function (i) { return i && i.image && i.isActive !== false; }).sort(function (a, b) { return (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0) || (a.sortOrder || 0) - (b.sortOrder || 0); });
      var used = Object.keys(LAB2).filter(function (s) { return items.some(function (i) { return i.section === s; }); });
      var ch = $('#galChips'); if (used.length > 1) { ch.hidden = false; ch.innerHTML = '<button class="chip chip--on" data-s="" type="button">All</button>' + used.map(function (s) { return '<button class="chip" data-s="' + s + '" type="button">' + LAB2[s] + '</button>'; }).join(''); }
      ch.addEventListener('click', function (e) { var b = e.target.closest('.chip'); if (!b) return; sec = b.getAttribute('data-s'); drawG(); });
      drawG();
    });
    gg.addEventListener('click', function (e) { var c = e.target.closest('.gcard'); if (!c) return; show(+c.getAttribute('data-n')); box.classList.add('lightbox--on'); document.body.style.overflow = 'hidden'; });
    box.addEventListener('click', function (e) { if (e.target.closest('[data-x]') || e.target === box) close(); else if (e.target.closest('[data-prev]')) show(cur - 1); else if (e.target.closest('[data-next]')) show(cur + 1); });
    document.addEventListener('keydown', function (e) { if (!box.classList.contains('lightbox--on')) return; if (e.key === 'Escape') close(); if (e.key === 'ArrowLeft') show(cur - 1); if (e.key === 'ArrowRight') show(cur + 1); });
    var x0 = null; box.addEventListener('touchstart', function (e) { x0 = e.changedTouches[0].clientX; }, { passive: true });
    box.addEventListener('touchend', function (e) { if (x0 === null) return; var dx = e.changedTouches[0].clientX - x0; x0 = null; if (Math.abs(dx) > 50) show(cur + (dx < 0 ? 1 : -1)); }, { passive: true });
  }

  /* ---- technician details page ---- */
  var wd = $('#wdetail');
  if (wd) {
    var id = new URLSearchParams(location.search).get('id');
    J('workers').then(function (d) {
      var w = ((d && d.workers) || []).filter(function (x) { return x.id === id; })[0];
      if (!w) { wd.innerHTML = '<div class="empty"><p>Technician not found.</p><a class="btn" style="margin-top:14px" href="repair.html">See all technicians</a></div>'; return; }
      document.title = w.name + ' | Himanshu Electronics';
      $('#wcrumb').textContent = w.name;
      var ini = w.name.split(/\s+/).map(function (x) { return x[0]; }).join('').slice(0, 2).toUpperCase();
      var ph = w.photo ? '<img src="assets/images/workers/' + encodeURIComponent(w.photo) + '" alt="' + esc(w.name) + '" onerror="this.remove()">' : '';
      var tel = String(w.phone || '').replace(/\D/g, '').slice(-10);
      var msg = 'Hello ' + w.name + ', I found you on Himanshu Electronics website. I need: ';
      wd.innerHTML = '<div class="wphoto">' + ph + '<span class="wphoto__ini">' + esc(ini) + '</span></div>' +
        '<div class="pinfo"><h1>' + esc(w.name) + '</h1><p class="pinfo__desc">' + esc(w.role || '') + '</p>' +
        '<div class="wcard__tags">' + (w.skills || []).map(function (x) { return '<span>' + esc(x) + '</span>'; }).join('') + '</div>' +
        '<ul class="winfo"><li><b>Area</b>' + esc(w.area || 'Ask the shop') + '</li><li><b>Experience</b>' + esc(w.exp || '-') + '</li><li><b>Status</b>' + (w.available === false ? 'Busy today' : 'Available') + '</li>' + (tel ? '<li><b>Mobile</b><a href="tel:+91' + tel + '">' + phoneFmt(tel) + '</a></li>' : '') + '</ul>' +
        (w.bio ? '<p class="pinfo__desc">' + esc(w.bio) + '</p>' : '') +
        '<div class="pinfo__btns"><a class="btn" href="repair.html?worker=' + encodeURIComponent(w.id) + '#bookForm">Book this technician</a>' + (tel ? '<a class="btn btn--ghost" href="tel:+91' + tel + '">Call</a><a class="btn btn--ghost" target="_blank" rel="noopener" href="https://wa.me/91' + tel + '?text=' + encodeURIComponent(msg) + '">WhatsApp</a>' : '') + '</div>' +
        '<p class="pinfo__note">Independent technician. He is not an employee of Himanshu Electronics but takes work through the shop. After booking, please call him to confirm the visit. Visit charges are agreed with him.</p></div>';
    });
  }
})();
