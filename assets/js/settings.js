/* Himanshu Electronics - Settings panel (same features as the Rajput Traders panel).
   Appearance (Dark/Light/Auto), text size, high contrast, reduce animations, Hindi (automatic translation),
   remember details, contact shortcuts, install app, share, copy link, report a problem, clear enquiry list,
   reset, about. Everything is saved on the visitor's phone only. Open it from any [data-open-settings]. */
(function () {
  'use strict';
  var HE = window.HE; if (!HE) return;
  var esc = HE.esc, root = document.documentElement, panel, site = {};
  function get(k, f) { try { return localStorage.getItem(k) || f; } catch (e) { return f; } }
  function set(k, v) { try { if (v == null) localStorage.removeItem(k); else localStorage.setItem(k, v); } catch (e) {} }
  var mq = window.matchMedia ? window.matchMedia('(prefers-color-scheme: light)') : null;

  function applyTheme(p) {
    var light = p === 'light' || (p === 'auto' && mq && mq.matches);
    root.setAttribute('data-theme', light ? 'light' : 'dark'); root.setAttribute('data-theme-pref', p);
    var m = document.querySelector('meta[name="theme-color"]'); if (m) m.setAttribute('content', light ? '#ffffff' : '#0b2147');
  }
  function setTheme(p) { set('he_theme', p === 'dark' ? null : p); applyTheme(p); refresh(); }
  if (mq && mq.addEventListener) mq.addEventListener('change', function () { if (get('he_theme', 'dark') === 'auto') applyTheme('auto'); });
  function setSize(v) { if (v === 'lg') { root.setAttribute('data-fs', v); set('he_fs', v); } else { root.removeAttribute('data-fs'); set('he_fs', null); } refresh(); }

  /* Hindi through Google's automatic translation (loaded only when chosen) */
  var protectRe = null;
  function cookieSet(n, v, days) {
    var exp = days ? '; max-age=' + days * 86400 : '; max-age=0', host = location.hostname;
    document.cookie = n + '=' + v + exp + '; path=/';
    if (host.indexOf('.') !== -1) document.cookie = n + '=' + v + exp + '; path=/; domain=' + host;
  }
  function setLang(c) { if (c === 'hi') { set('he_lang', 'hi'); cookieSet('googtrans', '/en/hi', 365); } else { set('he_lang', null); cookieSet('googtrans', '', 0); } location.reload(); }
  function escRe(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
  function protectText(node) {
    if (!protectRe) return;
    var w = document.createTreeWalker(node, NodeFilter.SHOW_TEXT, { acceptNode: function (n) {
      var p = n.parentNode; if (!p || !n.nodeValue || n.nodeValue.length < 3) return NodeFilter.FILTER_REJECT;
      if (/^(SCRIPT|STYLE|NOSCRIPT|TEXTAREA|INPUT|OPTION)$/.test(p.nodeName)) return NodeFilter.FILTER_REJECT;
      if (p.closest && p.closest('.notranslate,[translate="no"]')) return NodeFilter.FILTER_REJECT;
      protectRe.lastIndex = 0; return protectRe.test(n.nodeValue) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT; } });
    var nodes = [], n; while ((n = w.nextNode())) nodes.push(n);
    nodes.forEach(function (nd) {
      var t = nd.nodeValue, fr = document.createDocumentFragment(), last = 0, m; protectRe.lastIndex = 0;
      while ((m = protectRe.exec(t))) {
        if (m.index > last) fr.appendChild(document.createTextNode(t.slice(last, m.index)));
        var s = document.createElement('span'); s.className = 'notranslate'; s.setAttribute('translate', 'no'); s.textContent = m[0]; fr.appendChild(s); last = m.index + m[0].length;
      }
      if (last < t.length) fr.appendChild(document.createTextNode(t.slice(last)));
      if (nd.parentNode) nd.parentNode.replaceChild(fr, nd);
    });
  }
  function J(n) { return fetch('data/' + n + '.json').then(function (r) { return r.json(); }).catch(function () { return null; }); }
  function startHindi() {
    root.setAttribute('data-lang', 'hi'); cookieSet('googtrans', '/en/hi', 365);
    var f = document.createElement('link'); f.rel = 'stylesheet'; f.href = 'https://fonts.googleapis.com/css2?family=Noto+Sans+Devanagari:wght@400;500;600;700&display=swap'; document.head.appendChild(f);
    Promise.all([J('brands'), J('products')]).then(function (r) {
      var names = ['Himanshu Electronics', 'Himanshu', 'WhatsApp'];
      (r[0] || []).forEach(function (b) { if (b && b.name) names.push(b.name); });
      (r[1] || []).forEach(function (p) { if (p && p.name) names.push(p.name); });
      names = names.filter(function (v, i, a) { return v && a.indexOf(v) === i; }).sort(function (a, b) { return b.length - a.length; });
      protectRe = new RegExp(names.map(escRe).join('|'), 'gi'); protectText(document.body);
      var timer; new MutationObserver(function () { clearTimeout(timer); timer = setTimeout(function () { protectText(document.body); }, 150); }).observe(document.body, { childList: true, subtree: true });
      var h = document.createElement('div'); h.id = 'he_gt'; h.className = 'he-gt notranslate'; document.body.appendChild(h);
      window.heTranslateInit = function () { new google.translate.TranslateElement({ pageLanguage: 'en', includedLanguages: 'en,hi', autoDisplay: false }, 'he_gt'); };
      var s = document.createElement('script'); s.src = 'https://translate.google.com/translate_a/element.js?cb=heTranslateInit'; s.async = true; document.body.appendChild(s);
    });
  }

  function row(i, l, a, x) { return '<button type="button" class="set-row" ' + a + '><i class="' + i + '" aria-hidden="true"></i><span>' + l + '</span>' + (x || '') + '</button>'; }
  function sw(k, l, h, on) { return '<button type="button" class="set-switch' + (on ? ' is-on' : '') + '" role="switch" aria-checked="' + on + '" data-set-switch="' + k + '"><span class="set-switch__text"><strong>' + l + '</strong><small>' + h + '</small></span><span class="set-switch__track" aria-hidden="true"><span></span></span></button>'; }
  function chev() { return '<i class="ri-arrow-down-s-line set-row__chev" aria-hidden="true"></i>'; }
  function seg(g, v, cur, i, l) { var on = v === cur; return '<button type="button" class="set-seg__btn' + (on ? ' is-on' : '') + '" data-set-' + g + '="' + v + '" aria-pressed="' + on + '">' + (i ? '<i class="' + i + '" aria-hidden="true"></i>' : '') + '<span>' + l + '</span></button>'; }
  function isStandalone() { return (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) || window.navigator.standalone === true; }
  function isIos() { return /iphone|ipad|ipod/i.test(navigator.userAgent || ''); }
  function savedName() { try { var c = JSON.parse(localStorage.getItem('he_customer_v1') || 'null'); return c && c.name ? c.name : ''; } catch (e) { return ''; } }
  function listCount() { return window.HE_enq && HE_enq.count ? HE_enq.count() : 0; }
  function phone() { return String(site.phone || '9639228237').replace(/\D/g, '').slice(-10); }
  function wa(t) { return 'https://wa.me/' + String(site.whatsapp || HE.WA) + (t ? '?text=' + encodeURIComponent(t) : ''); }
  function flash(t) { var f = panel.querySelector('[data-set-flash]'); if (!f) return; f.textContent = t; f.classList.add('is-on'); clearTimeout(flash.t); flash.t = setTimeout(function () { f.classList.remove('is-on'); }, 2400); }
  function copyText(t) {
    if (navigator.clipboard && navigator.clipboard.writeText) return navigator.clipboard.writeText(t);
    return new Promise(function (ok, no) { try { var a = document.createElement('textarea'); a.value = t; a.style.position = 'fixed'; a.style.opacity = '0'; document.body.appendChild(a); a.select(); var d = document.execCommand('copy'); document.body.removeChild(a); d ? ok() : no(); } catch (e) { no(e); } });
  }
  var SHARE = { title: 'Himanshu Electronics - Wholesale electricals, Bijnor', text: 'Fans, wires, lighting, irons and home appliances at wholesale rates - Himanshu Electronics' };
  function shareUrl() { return location.origin + '/'; }
  function doShare() { if (navigator.share) { navigator.share({ title: SHARE.title, text: SHARE.text, url: shareUrl() }).catch(function () {}); return; } window.open('https://wa.me/?text=' + encodeURIComponent(SHARE.text + '\n' + shareUrl()), '_blank', 'noopener'); }
  function doInstall() {
    var ev = window.__heInstallEvt;
    if (ev && ev.prompt) { ev.prompt(); ev.userChoice.then(function (r) { window.__heInstallEvt = null; if (r && r.outcome === 'accepted') flash('Installing - check your home screen'); render(); }); return; }
    var h = panel.querySelector('[data-set-install-how]'); h.hidden = !h.hidden;
  }
  function setSwitch(k, on) {
    if (k === 'contrast') { if (on) { root.setAttribute('data-contrast', 'high'); set('he_contrast', 'high'); } else { root.removeAttribute('data-contrast'); set('he_contrast', null); } }
    else if (k === 'motion') { if (on) { root.setAttribute('data-motion', 'reduced'); set('he_motion', 'reduced'); } else { root.removeAttribute('data-motion'); set('he_motion', null); } }
    else if (k === 'remember') { set('he_remember', on ? null : 'off'); if (!on) set('he_customer_v1', null); }
    render();
  }

  function build() {
    panel = document.createElement('div'); panel.className = 'set'; panel.id = 'settingsPanel'; panel.setAttribute('aria-hidden', 'true');
    panel.innerHTML = '<div class="set__backdrop" data-set-close></div><section class="set__sheet" role="dialog" aria-modal="true" aria-labelledby="setTitle"><header class="set__head"><h2 id="setTitle"><i class="ri-settings-3-line" aria-hidden="true"></i> Settings</h2><button type="button" class="set__close" data-set-close aria-label="Close settings"><i class="ri-close-line" aria-hidden="true"></i></button></header><div class="set__body" data-set-body></div><div class="set-flash" data-set-flash role="status" aria-live="polite"></div></section>';
    document.body.appendChild(panel);
  }
  function render() {
    var theme = get('he_theme', 'dark'), lang = get('he_lang', 'en'), size = get('he_fs', 'normal');
    var contrast = get('he_contrast', '') === 'high', motion = get('he_motion', '') === 'reduced', remember = get('he_remember', '') !== 'off';
    var body = panel.querySelector('[data-set-body]'), keep = body.querySelector('#setReportText'), keepVal = keep ? keep.value : '';
    function openState(s) { var el = body.querySelector(s); return !!el && !el.hidden; }
    var reportOpen = openState('.set-report'), aboutOpen = openState('.set-about'), howOpen = openState('[data-set-install-how]'), clearAsk = openState('[data-set-clear-ask]');
    var name = savedName(), n = listCount(), p = phone();
    var how = isIos() ? 'In Safari, tap the Share button, then "Add to Home Screen".' : 'In Chrome, tap the three dots, then "Add to Home screen" or "Install app".';
    body.innerHTML =
      '<div class="set-group"><h3>Appearance</h3><div class="set-seg">' + seg('theme', 'dark', theme, 'ri-moon-line', 'Dark') + seg('theme', 'light', theme, 'ri-sun-line', 'Light') + seg('theme', 'auto', theme, 'ri-contrast-2-line', 'Auto') + '</div><p class="set-hint">Auto follows your phone setting.</p>' +
      '<h3 class="set-sub">Text size</h3><div class="set-seg">' + seg('size', 'normal', size, '', 'Normal') + seg('size', 'lg', size, '', 'Large') + '</div>' +
      sw('contrast', 'High contrast', 'Stronger colours and borders, easier to read', contrast) + sw('motion', 'Reduce animations', 'Stops the electricity, strips and glow. Lighter on slow phones', motion) + '</div>' +
      '<div class="set-group"><h3>Language</h3><div class="set-seg">' + seg('lang', 'en', lang, '', 'English') + seg('lang', 'hi', lang, '', '<span class="notranslate" translate="no">हिन्दी</span>') + '</div><p class="set-hint">Hindi uses automatic translation. Shop, brand and product names stay in English.</p></div>' +
      '<div class="set-group"><h3>My details</h3>' + sw('remember', 'Remember my details', 'Fills your name, mobile and address in the order form next time', remember) + row('ri-user-unfollow-line', name ? 'Clear saved details (' + esc(name) + ')' : 'Clear saved details', 'data-set-forget') + '</div>' +
      '<div class="set-group"><h3>Contact us</h3><div class="set-contact"><a class="set-contact__btn" href="tel:+91' + p + '"><i class="ri-phone-line" aria-hidden="true"></i><span>Call</span></a><a class="set-contact__btn" href="' + esc(wa('Hello Himanshu Electronics')) + '" target="_blank" rel="noopener"><i class="ri-whatsapp-line" aria-hidden="true"></i><span>WhatsApp</span></a>' +
      (site.mapUrl ? '<a class="set-contact__btn" href="' + esc(site.mapUrl) + '" target="_blank" rel="noopener"><i class="ri-map-pin-2-line" aria-hidden="true"></i><span>Directions</span></a>' : '') +
      (site.email ? '<a class="set-contact__btn" href="mailto:' + esc(site.email) + '"><i class="ri-mail-line" aria-hidden="true"></i><span>Email</span></a>' : '') + '</div></div>' +
      '<div class="set-group"><h3>App &amp; sharing</h3>' + (!isStandalone() ? row('ri-install-line', 'Install app on home screen', 'data-set-install') + '<p class="set-hint set-how" data-set-install-how' + (howOpen ? '' : ' hidden') + '>' + how + '</p>' : '') +
      row('ri-share-forward-line', 'Share this website', 'data-set-share') + row('ri-links-line', 'Copy website link', 'data-set-copy') + '</div>' +
      '<div class="set-group"><h3>Help</h3>' + row('ri-flag-line', 'Report a problem', 'data-set-report-toggle', chev()) +
      '<div class="set-report"' + (reportOpen ? '' : ' hidden') + '><label for="setReportText">What went wrong?</label><textarea id="setReportText" rows="3" placeholder="For example: a photo is not loading on the Products page"></textarea><span class="ferr" id="setReportErr" hidden>Please describe the problem in a few words.</span><a href="#" class="btn btn--block set-report__send" data-set-report-send target="_blank" rel="noopener"><i class="ri-whatsapp-line" aria-hidden="true"></i> Send report on WhatsApp</a></div>' +
      (n ? row('ri-delete-bin-line', 'Clear enquiry list (' + n + ')', 'data-set-clear-list') + '<div class="set-ask" data-set-clear-ask' + (clearAsk ? '' : ' hidden') + '><p>Remove all ' + n + ' products from your list?</p><div><button type="button" class="btn btn--ghost" data-set-clear-no>Keep list</button><button type="button" class="btn" data-set-clear-yes>Yes, clear</button></div></div>' : '') +
      row('ri-restart-line', 'Reset settings', 'data-set-reset') + '</div>' +
      '<div class="set-group"><h3>About</h3>' + row('ri-information-line', 'About this site', 'data-set-about-toggle', chev()) +
      '<div class="set-about"' + (aboutOpen ? '' : ' hidden') + '><p><strong class="notranslate" translate="no">Himanshu Electronics</strong><br>Wholesale fans, wires, lighting, irons and home appliances, Bijnor</p>' + (site.gstNumber ? '<p>GST No. <span class="notranslate" translate="no">' + esc(site.gstNumber) + '</span></p>' : '') + '<p>' + esc(site.hoursText || 'Open daily, 9:30 AM to 9:00 PM') + '</p><p class="set-about__links"><a href="privacy.html">Privacy Policy</a> · <a href="terms.html">Terms</a> · <a href="returns.html">Returns</a> · <a href="delivery.html">Delivery</a></p></div></div>' +
      '<p class="set-foot">Settings are saved on this phone only.</p>';
    var ta = body.querySelector('#setReportText'); if (ta && keepVal) ta.value = keepVal;
    var ch = body.querySelectorAll('.set-row__chev'); if (reportOpen && ch[0]) ch[0].style.transform = 'rotate(180deg)'; if (aboutOpen && ch[1]) ch[1].style.transform = 'rotate(180deg)';
  }
  function refresh() { if (panel && panel.classList.contains('is-open')) { try { render(); } catch (e) {} } }
  function open() { panel.classList.add('is-open'); try { render(); } catch (err) { panel.querySelector('[data-set-body]').innerHTML = '<p class="set-hint">Settings could not load fully. Please refresh the page.</p>'; } panel.setAttribute('aria-hidden', 'false'); document.body.style.overflow = 'hidden'; var c = panel.querySelector('.set__close'); if (c) c.focus(); }
  function close() { panel.classList.remove('is-open'); panel.setAttribute('aria-hidden', 'true'); document.body.style.overflow = ''; }
  function reportLink() {
    var ta = panel.querySelector('#setReportText'), er = panel.querySelector('#setReportErr'), t = ta.value.trim();
    if (t.length < 4) { er.hidden = false; ta.focus(); return null; }
    er.hidden = true;
    return wa('Hello Himanshu Electronics, I want to report a problem on your website.\n\nProblem: ' + t + '\n\nPage: ' + location.href + '\nScreen: ' + window.innerWidth + 'x' + window.innerHeight + '\nTheme: ' + root.getAttribute('data-theme') + ', Language: ' + get('he_lang', 'en') + '\nDevice: ' + (navigator.userAgent || '').replace(/\s+/g, ' ').slice(0, 120));
  }
  function toggleBlock(sel, i) { var el = panel.querySelector(sel); el.hidden = !el.hidden; var c = panel.querySelectorAll('.set-row__chev')[i]; if (c) c.style.transform = el.hidden ? '' : 'rotate(180deg)'; }
  function resetAll() {
    ['he_theme', 'he_fs', 'he_contrast', 'he_motion', 'he_remember'].forEach(function (k) { set(k, null); });
    applyTheme('dark'); root.removeAttribute('data-fs'); root.removeAttribute('data-contrast'); root.removeAttribute('data-motion');
    if (get('he_lang', 'en') === 'hi') setLang('en'); else { render(); flash('Settings reset'); }
  }
  function onClick(e) {
    var t = e.target, op = t.closest('[data-open-settings]');
    if (op) { e.preventDefault(); var dd = document.getElementById('navMore'); if (dd) dd.classList.remove('is-open'); var bg = document.getElementById('burger'); if (bg && bg.getAttribute('aria-expanded') === 'true') bg.click(); open(); return; }
    if (!panel.contains(t)) return;
    var b;
    if (t.closest('[data-set-close]')) close();
    else if ((b = t.closest('[data-set-theme]'))) setTheme(b.getAttribute('data-set-theme'));
    else if ((b = t.closest('[data-set-size]'))) setSize(b.getAttribute('data-set-size'));
    else if ((b = t.closest('[data-set-lang]'))) { var l = b.getAttribute('data-set-lang'); if (l !== get('he_lang', 'en')) setLang(l); }
    else if ((b = t.closest('[data-set-switch]'))) setSwitch(b.getAttribute('data-set-switch'), b.getAttribute('aria-checked') !== 'true');
    else if (t.closest('[data-set-forget]')) { set('he_customer_v1', null); render(); flash('Saved details cleared'); }
    else if (t.closest('[data-set-install]')) doInstall();
    else if (t.closest('[data-set-share]')) doShare();
    else if (t.closest('[data-set-copy]')) copyText(shareUrl()).then(function () { flash('Website link copied'); }, function () { flash('Could not copy the link'); });
    else if (t.closest('[data-set-report-toggle]')) toggleBlock('.set-report', 0);
    else if (t.closest('[data-set-about-toggle]')) toggleBlock('.set-about', 1);
    else if ((b = t.closest('[data-set-report-send]'))) { var k = reportLink(); if (!k) e.preventDefault(); else b.setAttribute('href', k); }
    else if (t.closest('[data-set-clear-list]')) panel.querySelector('[data-set-clear-ask]').hidden = false;
    else if (t.closest('[data-set-clear-no]')) panel.querySelector('[data-set-clear-ask]').hidden = true;
    else if (t.closest('[data-set-clear-yes]')) { if (window.HE_enq) HE_enq.clear(); render(); flash('Enquiry list cleared'); }
    else if (t.closest('[data-set-reset]')) resetAll();
  }
  build();
  document.addEventListener('click', onClick);
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && panel.classList.contains('is-open')) close(); });
  J('site').then(function (s) { site = s || {}; refresh(); });
  window.addEventListener('appinstalled', function () { window.__heInstallEvt = null; refresh(); });
  if (get('he_lang', 'en') === 'hi') startHindi();
  window.HE.settings = { open: open, close: close };
})();
