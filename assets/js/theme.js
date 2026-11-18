/* Himanshu Electronics - saved display settings, applied before the page is drawn (loaded in <head>).
   Stored on the visitor's own phone (localStorage):
   he_theme: dark | light | auto (missing = dark), he_fs: lg, he_lang: hi, he_motion: reduced, he_contrast: high, he_remember: off */
(function () {
  'use strict';
  var d = document.documentElement;
  try {
    var t = localStorage.getItem('he_theme') || 'dark';
    var light = t === 'light' || (t === 'auto' && window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches);
    d.setAttribute('data-theme', light ? 'light' : 'dark');
    d.setAttribute('data-theme-pref', t);
    if (localStorage.getItem('he_fs') === 'lg') d.setAttribute('data-fs', 'lg');
    if (localStorage.getItem('he_lang') === 'hi') d.setAttribute('data-lang', 'hi');
    if (localStorage.getItem('he_motion') === 'reduced') d.setAttribute('data-motion', 'reduced');
    if (localStorage.getItem('he_contrast') === 'high') d.setAttribute('data-contrast', 'high');
  } catch (e) { d.setAttribute('data-theme', 'dark'); }
  window.addEventListener('beforeinstallprompt', function (e) { e.preventDefault(); window.__heInstallEvt = e; });
})();
