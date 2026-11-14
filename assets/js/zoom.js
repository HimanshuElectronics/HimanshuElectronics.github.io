/* Himanshu Electronics - product photo zoom (pattern from Rajput Traders).
   Tap the big photo to open it full screen. Pinch / double-tap / wheel / + - to zoom,
   drag to move, swipe to change photo, X / Esc / Back to close. */
(function () {
  'use strict';
  var MAX = 5, DOUBLE = 2.6;
  var root, stage, img, counter, hint;
  var list = [], index = 0, open = false, pushed = false;
  var s = 1, tx = 0, ty = 0, pointers = {}, pinch = null, drag = null, lastTap = { t: 0, x: 0, y: 0 };

  function photos() {
    var th = Array.prototype.slice.call(document.querySelectorAll('[data-gallery-thumb]'));
    if (th.length) return { urls: th.map(function (b) { return b.getAttribute('data-image-url'); }), start: Math.max(0, th.findIndex(function (b) { return b.classList.contains('pgal__thumb--on'); })), thumbs: th };
    var m = document.querySelector('[data-gallery-main-image]');
    return { urls: m ? [m.currentSrc || m.src] : [], start: 0, thumbs: [] };
  }
  function build() {
    root = document.createElement('div');
    root.className = 'pz'; root.setAttribute('role', 'dialog'); root.setAttribute('aria-modal', 'true'); root.hidden = true;
    root.innerHTML = '<div class="pz__bar"><span class="pz__count" data-pz-count></span><button type="button" class="pz__btn" data-pz-close aria-label="Close"><i class="ri-close-line"></i></button></div>' +
      '<div class="pz__stage" data-pz-stage><img class="pz__img" alt="" draggable="false"></div>' +
      '<button type="button" class="pz__nav pz__nav--prev" data-pz-prev aria-label="Previous photo"><i class="ri-arrow-left-s-line"></i></button>' +
      '<button type="button" class="pz__nav pz__nav--next" data-pz-next aria-label="Next photo"><i class="ri-arrow-right-s-line"></i></button>' +
      '<div class="pz__tools"><button type="button" class="pz__btn" data-pz-out aria-label="Zoom out"><i class="ri-subtract-line"></i></button><span class="pz__hint" data-pz-hint>Pinch or double-tap to zoom</span><button type="button" class="pz__btn" data-pz-in aria-label="Zoom in"><i class="ri-add-line"></i></button></div>';
    document.body.appendChild(root);
    stage = root.querySelector('[data-pz-stage]'); img = root.querySelector('.pz__img');
    counter = root.querySelector('[data-pz-count]'); hint = root.querySelector('[data-pz-hint]');
    root.addEventListener('click', function (e) {
      if (e.target.closest('[data-pz-close]')) close();
      else if (e.target.closest('[data-pz-prev]')) go(index - 1);
      else if (e.target.closest('[data-pz-next]')) go(index + 1);
      else if (e.target.closest('[data-pz-in]')) zoomBy(1.6);
      else if (e.target.closest('[data-pz-out]')) zoomBy(1 / 1.6);
    });
    stage.addEventListener('pointerdown', down); stage.addEventListener('pointermove', move);
    stage.addEventListener('pointerup', up); stage.addEventListener('pointercancel', up);
    stage.addEventListener('wheel', function (e) { e.preventDefault(); zoomAt(s * (e.deltaY < 0 ? 1.2 : 1 / 1.2), e.clientX, e.clientY); }, { passive: false });
    document.addEventListener('keydown', function (e) {
      if (!open) return;
      if (e.key === 'Escape') close(); else if (e.key === 'ArrowRight') go(index + 1); else if (e.key === 'ArrowLeft') go(index - 1);
      else if (e.key === '+' || e.key === '=') zoomBy(1.6); else if (e.key === '-') zoomBy(1 / 1.6);
    });
    window.addEventListener('popstate', function () { if (open) { pushed = false; close(); } });
    window.addEventListener('resize', function () { if (open) { clamp(); apply(false); } });
  }
  function apply(anim) { img.style.transition = anim ? 'transform .22s ease' : 'none'; img.style.transform = 'translate(' + tx + 'px,' + ty + 'px) scale(' + s + ')'; root.classList.toggle('pz--zoomed', s > 1.01); }
  function clamp() {
    var mx = Math.max(0, (img.clientWidth * s - stage.clientWidth) / 2), my = Math.max(0, (img.clientHeight * s - stage.clientHeight) / 2);
    tx = Math.max(-mx, Math.min(mx, tx)); ty = Math.max(-my, Math.min(my, ty));
    if (s <= 1.01) { tx = 0; ty = 0; }
  }
  function zoomAt(ns, cx, cy, anim) {
    ns = Math.max(1, Math.min(MAX, ns));
    var r = stage.getBoundingClientRect(), px = cx - (r.left + r.width / 2), py = cy - (r.top + r.height / 2);
    tx = px - (px - tx) * (ns / s); ty = py - (py - ty) * (ns / s); s = ns; clamp(); apply(anim);
  }
  function zoomBy(f) { var r = stage.getBoundingClientRect(); zoomAt(s * f, r.left + r.width / 2, r.top + r.height / 2, true); }
  function reset() { s = 1; tx = 0; ty = 0; apply(false); }
  function dist(a, b) { return Math.hypot(a.x - b.x, a.y - b.y); }
  function down(e) {
    stage.setPointerCapture(e.pointerId); pointers[e.pointerId] = { x: e.clientX, y: e.clientY };
    var ids = Object.keys(pointers);
    if (ids.length === 2) { pinch = { d: dist(pointers[ids[0]], pointers[ids[1]]), s: s }; drag = null; }
    else if (ids.length === 1) drag = { x: e.clientX, y: e.clientY, tx: tx, ty: ty, moved: false };
  }
  function move(e) {
    if (!pointers[e.pointerId]) return;
    pointers[e.pointerId] = { x: e.clientX, y: e.clientY };
    var ids = Object.keys(pointers);
    if (ids.length === 2 && pinch) { var a = pointers[ids[0]], b = pointers[ids[1]]; zoomAt(pinch.s * dist(a, b) / pinch.d, (a.x + b.x) / 2, (a.y + b.y) / 2); }
    else if (drag && ids.length === 1) {
      var dx = e.clientX - drag.x, dy = e.clientY - drag.y;
      if (Math.abs(dx) + Math.abs(dy) > 6) drag.moved = true;
      if (s > 1.01) { tx = drag.tx + dx; ty = drag.ty + dy; clamp(); apply(false); } else { tx = dx; ty = 0; apply(false); }
    }
  }
  function up(e) {
    var had = pointers[e.pointerId]; delete pointers[e.pointerId];
    if (pinch) { if (Object.keys(pointers).length < 2) pinch = null; if (s < 1.05) { s = 1; clamp(); apply(true); } return; }
    if (!drag || !had) return;
    var d = drag; drag = null, dx = e.clientX - d.x, dy = e.clientY - d.y;
    if (s <= 1.01) {
      if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.2) { tx = 0; apply(false); go(dx < 0 ? index + 1 : index - 1); return; }
      tx = 0; apply(true);
    }
    if (!d.moved) {
      var now = Date.now();
      if (now - lastTap.t < 320 && Math.hypot(e.clientX - lastTap.x, e.clientY - lastTap.y) < 40) {
        lastTap.t = 0;
        if (s > 1.01) { s = 1; tx = 0; ty = 0; apply(true); } else zoomAt(DOUBLE, e.clientX, e.clientY, true);
      } else lastTap = { t: now, x: e.clientX, y: e.clientY };
    }
  }
  var dx, dy;
  function show() { img.src = list[index]; counter.textContent = list.length > 1 ? (index + 1) + ' / ' + list.length : ''; root.classList.toggle('pz--single', list.length < 2); reset(); }
  function go(i) { if (list.length < 2) return; index = Math.max(0, Math.min(list.length - 1, i)); show(); }
  function openAt() {
    var p = photos(); if (!p.urls.length) return;
    list = p.urls; index = p.start;
    if (!root) build();
    root.hidden = false; open = true; document.body.classList.add('body--drawer-open'); show();
    try { history.pushState({ pz: 1 }, ''); pushed = true; } catch (e) { pushed = false; }
    hint.classList.remove('is-off'); clearTimeout(openAt.t); openAt.t = setTimeout(function () { hint.classList.add('is-off'); }, 3500);
  }
  function close() {
    if (!open) return;
    open = false; root.hidden = true; document.body.classList.remove('body--drawer-open');
    var p = photos();
    if (p.thumbs[index] && !p.thumbs[index].classList.contains('pgal__thumb--on')) p.thumbs[index].click();
    if (pushed) { pushed = false; try { history.back(); } catch (e) {} }
  }
  function init() {
    var main = document.querySelector('.pgal__main');
    if (!main || main.getAttribute('data-zoom-ready') || !main.querySelector('[data-gallery-main-image]')) return;
    main.setAttribute('data-zoom-ready', '1');
    main.insertAdjacentHTML('beforeend', '<span class="pgal__hint"><i class="ri-zoom-in-line"></i> Tap to zoom</span>');
    main.addEventListener('click', openAt);
  }
  window.HE_zoomInit = init; init();
})();
