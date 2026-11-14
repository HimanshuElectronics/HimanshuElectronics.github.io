/* Himanshu Electronics - order page (order.html): shows the enquiry list as a price table,
   collects details and opens WhatsApp with the full order. */
(function () {
  'use strict';
  var WA = '919639228237';
  var $ = function (id) { return document.getElementById(id); };
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function money(n) { return '₹' + (Math.round(n * 100) / 100).toLocaleString('en-IN'); }
  var E = null;
  var d = new Date();
  $('of-date').min = d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2);
  function lines() {
    return E.ids().map(function (id) { return { id: id, p: E.item(id), q: E.qty(id) }; }).filter(function (r) { return r.p; })
      .sort(function (a, b) { return (a.p.order - b.p.order) || a.p.name.localeCompare(b.p.name); });
  }
  function render() {
    var rows = lines();
    $('order-empty').hidden = rows.length > 0; $('order-content').hidden = rows.length === 0;
    if (!rows.length) return;
    $('order-count').textContent = '(' + rows.length + ')';
    $('order-rows').innerHTML = rows.map(function (r) {
      var p = r.p;
      return '<tr><td><a href="product.html?slug=' + encodeURIComponent(p.slug) + '" class="otable__name">' + esc(p.name) + '</a><span class="otable__meta">' + esc([p.brand, p.pack].filter(Boolean).join(' · ')) + '</span></td>' +
        '<td class="num">' + r.q + '</td><td class="num">' + (p.price ? money(p.price) : '<span class="otable__na">On request</span>') + '</td><td class="num">' + (p.price ? money(p.price * r.q) : '-') + '</td></tr>';
    }).join('');
    $('order-total').textContent = E.total() ? money(E.total()) : 'On request';
  }
  function bad(id, on) { var el = document.querySelector('[data-err="' + id + '"]'); if (el) el.hidden = !on; $(id).setAttribute('aria-invalid', on ? 'true' : 'false'); }
  function validate() {
    var ok = true, first = null;
    function mark(id, isBad) { bad(id, isBad); if (isBad) { ok = false; if (!first) first = $(id); } }
    mark('of-name', !$('of-name').value.trim());
    var dg = $('of-mobile').value.replace(/\D/g, '').replace(/^(91|0)(?=\d{10}$)/, '');
    mark('of-mobile', !/^[6-9]\d{9}$/.test(dg));
    mark('of-city', !$('of-city').value.trim());
    if (first) first.focus();
    return ok;
  }
  function message() {
    var out = ['Hello Himanshu Electronics, I would like to place an order.', '', 'Name: ' + $('of-name').value.trim(), 'Mobile: ' + $('of-mobile').value.trim()];
    if ($('of-business').value.trim()) out.push('Shop / business: ' + $('of-business').value.trim());
    out.push('Delivery address: ' + $('of-city').value.trim());
    var dv = $('of-date').value; if (dv) { var q = dv.split('-'); out.push('Date needed: ' + q[2] + '/' + q[1] + '/' + q[0]); }
    out.push('', 'Order list:');
    lines().forEach(function (r, i) {
      var p = r.p;
      out.push((i + 1) + '. ' + p.name + (p.brand || p.pack ? ' (' + [p.brand, p.pack].filter(Boolean).join(', ') + ')' : '') + ' - Qty ' + r.q + (p.price ? ' x Rs ' + p.price + ' = Rs ' + (Math.round(p.price * r.q * 100) / 100) : ' - price on request'));
    });
    if (E.total()) out.push('', 'Estimated total at MRP: Rs ' + E.total());
    out.push('Please confirm the wholesale price and delivery.');
    if ($('of-notes').value.trim()) out.push('', 'Notes: ' + $('of-notes').value.trim());
    return out.join('\n');
  }
  $('of-send').addEventListener('click', function (e) {
    if (!validate()) { e.preventDefault(); return; }
    try { localStorage.setItem(E.CKEY, JSON.stringify({ name: $('of-name').value.trim(), mobile: $('of-mobile').value.trim(), business: $('of-business').value.trim(), city: $('of-city').value.trim() })); } catch (x) {}
    this.setAttribute('href', 'https://wa.me/' + WA + '?text=' + encodeURIComponent(message()));
  });
  function start() {
    E = window.HE_enq;
    if (!E) { setTimeout(start, 80); return; }
    try { var c = JSON.parse(localStorage.getItem(E.CKEY) || 'null'); if (c) { $('of-name').value = c.name || ''; $('of-mobile').value = c.mobile || ''; $('of-business').value = c.business || ''; $('of-city').value = c.city || ''; } } catch (x) {}
    E.catalog().then(function () { render(); E.onChange(render); });
  }
  start();
})();
