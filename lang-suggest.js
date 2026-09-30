/* Sprachhinweis: schlaegt die andere Sprachversion vor, statt weiterzuleiten.
   Keine Weiterleitung, damit Googlebot (crawlt aus den USA mit en-US) die
   deutsche Seite weiter sieht und hreflang seine Arbeit machen kann.
   Die Leiste erscheint erst, wenn die Cookie-Entscheidung gefallen ist -
   sonst wuerde sie den Consent-Banner ueberdecken (beide bottom:0). */
(function () {
  var CHOICE_KEY  = 'tutelaris_lang_choice';

  var here  = (document.documentElement.lang || 'de').slice(0, 2).toLowerCase();
  var other = here === 'de' ? 'en' : 'de';
  var url   = other === 'de' ? 'https://tutelaris.de/' : 'https://tutelarisapp.com/';

  function get(k) { try { return window.localStorage.getItem(k); } catch (e) { return null; } }
  function set(k, v) { try { window.localStorage.setItem(k, v); } catch (e) {} }

  // localStorage gilt nur pro Domain - die Entscheidung reist im Link mit.
  var param = new URLSearchParams(window.location.search).get('lang');
  if (param) { set(CHOICE_KEY, param.slice(0, 2).toLowerCase()); return; }
  if (get(CHOICE_KEY)) return;

  var wantsOther = (navigator.languages || [navigator.language || ''])
    .some(function (l) { return String(l).toLowerCase().indexOf(other) === 0; });
  if (!wantsOther) return;

  var T = other === 'en'
    ? { text: 'This page is also available in English.', go: 'Switch to English', stay: 'Stay here' }
    : { text: 'Diese Seite gibt es auch auf Deutsch.',   go: 'Zur deutschen Seite', stay: 'Hier bleiben' };

  function show() {
    if (document.getElementById('tut-lang-bar')) return;

    var bar = document.createElement('div');
    bar.id = 'tut-lang-bar';
    bar.setAttribute('role', 'region');
    bar.setAttribute('aria-label', other === 'en' ? 'Language suggestion' : 'Sprachhinweis');
    bar.style.cssText = 'position:fixed;left:0;right:0;bottom:0;z-index:9998;display:flex;' +
      'flex-wrap:wrap;align-items:center;justify-content:center;gap:14px;padding:14px 18px;' +
      'background:#0b0f19;color:#fff;box-shadow:0 -8px 30px rgba(15,23,42,.18);' +
      'font:14px/1.5 Inter,system-ui,sans-serif';

    var txt = document.createElement('span');
    txt.textContent = T.text;

    var go = document.createElement('a');
    go.href = url + '?lang=' + other;
    go.textContent = T.go;
    go.style.cssText = 'background:#4f89fb;color:#fff;padding:8px 18px;border-radius:999px;' +
      'font-weight:600;text-decoration:none;white-space:nowrap';
    go.addEventListener('click', function () { set(CHOICE_KEY, other); });

    var stay = document.createElement('button');
    stay.type = 'button';
    stay.textContent = T.stay;
    stay.style.cssText = 'background:none;border:0;color:#98a2b3;cursor:pointer;font:inherit;' +
      'text-decoration:underline;padding:8px 4px';
    stay.addEventListener('click', function () { set(CHOICE_KEY, here); bar.remove(); });

    bar.appendChild(txt); bar.appendChild(go); bar.appendChild(stay);
    document.body.appendChild(bar);
  }

  function start() {
    // Nicht die Consent-Validierung nachbauen, sondern nachsehen, ob der Banner
    // wirklich steht. cookie-consent.js laeuft wegen defer garantiert vorher.
    if (!document.querySelector('.tut-cc-banner')) { show(); return; }
    window.addEventListener('tutelaris:consent', show, { once: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();
