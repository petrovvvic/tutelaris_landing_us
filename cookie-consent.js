/* Optional analytics loads only after an explicit, versioned choice. */
(function () {
  'use strict';

  var STORAGE_KEY = 'tutelaris_consent_v2';
  var MAX_AGE_MS = 365 * 24 * 60 * 60 * 1000; // 12 Monate, danach erneute Abfrage
  var lang = (document.documentElement.lang || 'de').toLowerCase().indexOf('en') === 0 ? 'en' : 'de';
  var privacyHref = lang === 'en' ? 'https://tutelaris.de/datenschutz.html' : 'datenschutz.html';

  var T = {
    de: {
      bannerTitle: 'Cookie- & Datenschutzeinstellungen',
      bannerBody: 'Mit Ihrer Einwilligung nutzen wir Google Analytics, um Seitenbesuche und Demo-Anfragen auszuwerten. Ohne Einwilligung bleibt die Analyse deaktiviert. Alle Inhalte funktionieren unabhängig davon.',
      privacyLink: 'Datenschutzerklärung',
      btnNecessary: 'Nur Notwendige',
      btnSettings: 'Einstellungen',
      btnAcceptAll: 'Alle akzeptieren',
      modalTitle: 'Datenschutz-Einstellungen',
      modalIntro: 'Die optionale Analyse hilft uns, die Website zu verbessern. Sie können Ihre Einwilligung jederzeit hier widerrufen.',
      catNecessaryTitle: 'Technisch notwendig',
      catNecessaryBadge: 'Immer aktiv',
      catNecessaryDesc: 'Wird benötigt, damit die Website funktioniert und Ihre Cookie-Auswahl gespeichert werden kann. Kann nicht deaktiviert werden.',
      catFontsTitle: 'Besucherstatistik & Conversions',
      catFontsDesc: 'Google Analytics misst besuchte Seiten und Interaktionen wie Demo-Anfragen. Dabei werden Cookies gesetzt und Daten an Google übermittelt. Namen, E-Mail-Adressen und Formularinhalte senden wir nicht als Analyseereignisse. Werbefunktionen sind deaktiviert.',
      btnSave: 'Auswahl speichern',
      close: 'Schließen',
      footerLink: 'Cookie-Einstellungen'
    },
    en: {
      bannerTitle: 'Cookie & Privacy Settings',
      bannerBody: 'With your permission, we use Google Analytics to measure visits and demo requests. Analytics stays off unless you agree. All website features work either way.',
      privacyLink: 'Privacy Policy',
      btnNecessary: 'Necessary only',
      btnSettings: 'Settings',
      btnAcceptAll: 'Accept all',
      modalTitle: 'Privacy Settings',
      modalIntro: 'Optional analytics helps us improve the website. You can withdraw your permission here at any time.',
      catNecessaryTitle: 'Technically necessary',
      catNecessaryBadge: 'Always active',
      catNecessaryDesc: 'Required for the website to function and to remember your cookie choice. Cannot be turned off.',
      catFontsTitle: 'Visitor & conversion analytics',
      catFontsDesc: 'Google Analytics measures page visits and interactions such as demo requests. It uses cookies and sends data to Google. We do not send names, email addresses or form contents as analytics events. Advertising features are disabled.',
      btnSave: 'Save choice',
      close: 'Close',
      footerLink: 'Cookie Settings'
    }
  }[lang];

  function readConsent() {
    try {
      var raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      var data = JSON.parse(raw);
      if (!data || data.v !== 2 || typeof data.analytics !== 'boolean' || !data.ts) return null;
      var age = Date.now() - new Date(data.ts).getTime();
      if (!Number.isFinite(age) || age < 0 || age > MAX_AGE_MS) return null;
      return data;
    } catch (e) {
      return null;
    }
  }

  function writeConsent(analytics) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({
        necessary: true,
        analytics: !!analytics,
        ts: new Date().toISOString(),
        v: 2
      }));
    } catch (e) { /* Local Storage nicht verfügbar – Auswahl gilt nur für diesen Aufruf */ }
  }

  var STYLE = '' +
    '.tut-cc-banner,.tut-cc-modal{font-family:Inter,"Plus Jakarta Sans",-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;}' +
    '.tut-cc-banner{position:fixed;left:0;right:0;bottom:0;z-index:9999;background:#fff;border-top:1px solid #e4e7ec;box-shadow:0 -8px 30px rgba(15,23,42,.10);padding:18px 20px;display:flex;flex-wrap:wrap;align-items:center;gap:16px;}' +
    '.tut-cc-text{flex:1 1 380px;min-width:0;}' +
    '.tut-cc-title{font-weight:800;font-size:14.5px;color:#0b0f19;margin:0 0 4px;}' +
    '.tut-cc-body{font-size:13px;line-height:1.55;color:#475467;margin:0;}' +
    '.tut-cc-links{display:flex;flex-wrap:wrap;align-items:center;gap:16px;margin:8px 0 0;}' +
    '.tut-cc-links a,.tut-cc-links button{font-size:12.5px;font-weight:600;color:#2563eb;text-decoration:underline;background:none;border:none;padding:0;cursor:pointer;}' +
    '.tut-cc-actions{display:flex;flex-wrap:wrap;gap:10px;align-items:center;flex:0 0 auto;}' +
    '.tut-cc-btn{appearance:none;border-radius:999px;font-size:13.5px;font-weight:600;padding:9px 18px;cursor:pointer;white-space:nowrap;border:1px solid transparent;}' +
    '.tut-cc-btn-primary{background:#4f89fb;color:#fff;}' +
    '.tut-cc-btn-primary:hover{background:#3d75e6;}' +
    '.tut-cc-btn-secondary{background:#fff;color:#344054;border-color:#d0d5dd;}' +
    '.tut-cc-btn-secondary:hover{background:#f8f9fb;}' +
    '.tut-cc-overlay{position:fixed;inset:0;z-index:10000;background:rgba(15,23,42,.55);display:flex;align-items:center;justify-content:center;padding:16px;}' +
    '.tut-cc-modal{background:#fff;border-radius:20px;max-width:560px;width:100%;max-height:88vh;overflow-y:auto;padding:26px;box-shadow:0 24px 60px rgba(15,23,42,.25);}' +
    '.tut-cc-modal-head{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;margin-bottom:6px;}' +
    '.tut-cc-modal h2{font-size:19px;font-weight:800;color:#0b0f19;margin:0;}' +
    '.tut-cc-modal-close{appearance:none;background:none;border:none;cursor:pointer;color:#98a2b3;font-size:20px;line-height:1;padding:4px;}' +
    '.tut-cc-modal-intro{font-size:13.5px;color:#475467;line-height:1.6;margin:8px 0 20px;}' +
    '.tut-cc-cat{border:1px solid #e4e7ec;border-radius:14px;padding:16px;margin-bottom:14px;}' +
    '.tut-cc-cat-head{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:8px;}' +
    '.tut-cc-cat-title{font-size:14.5px;font-weight:700;color:#0b0f19;}' +
    '.tut-cc-badge{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.04em;color:#2563eb;background:#eef4fe;border-radius:999px;padding:3px 10px;}' +
    '.tut-cc-cat-desc{font-size:13px;line-height:1.55;color:#667085;margin:0;}' +
    '.tut-cc-switch{position:relative;display:inline-block;width:42px;height:24px;flex:0 0 auto;}' +
    '.tut-cc-switch input{position:absolute;inset:0;opacity:0;width:100%;height:100%;z-index:1;cursor:pointer;}' +
    '.tut-cc-slider{position:absolute;cursor:pointer;inset:0;background:#d0d5dd;border-radius:999px;transition:.15s;}' +
    '.tut-cc-slider:before{content:"";position:absolute;height:18px;width:18px;left:3px;top:3px;background:#fff;border-radius:50%;transition:.15s;}' +
    '.tut-cc-switch input:focus-visible + .tut-cc-slider{outline:2px solid #2563eb;outline-offset:3px;}' +
    '.tut-cc-switch input:checked + .tut-cc-slider{background:#4f89fb;}' +
    '.tut-cc-switch input:checked + .tut-cc-slider:before{transform:translateX(18px);}' +
    '.tut-cc-switch input:disabled + .tut-cc-slider{opacity:.6;cursor:default;}' +
    '.tut-cc-modal-actions{display:flex;flex-wrap:wrap;gap:10px;justify-content:flex-end;margin-top:18px;}' +
    '.tut-cc-modal-foot{margin-top:16px;font-size:12.5px;color:#98a2b3;text-align:right;}' +
    '.tut-cc-modal-foot a{color:#667085;text-decoration:underline;}' +
    '@media (max-width:640px){.tut-cc-banner{padding:16px;}.tut-cc-actions{width:100%;}.tut-cc-actions .tut-cc-btn{flex:1 1 auto;text-align:center;}}';

  function injectStyle() {
    var s = document.createElement('style');
    s.setAttribute('data-tut-cc', '');
    s.textContent = STYLE;
    document.head.appendChild(s);
  }

  var banner = null;
  var overlay = null;

  function removeBanner() {
    if (banner && banner.parentNode) banner.parentNode.removeChild(banner);
    banner = null;
  }

  function closeModal() {
    if (overlay && overlay.parentNode) overlay.parentNode.removeChild(overlay);
    overlay = null;
  }

  function finish(analytics) {
    writeConsent(analytics);
    window.dispatchEvent(new CustomEvent('tutelaris:consent', { detail: { analytics: !!analytics } }));
    removeBanner();
    closeModal();
  }

  function openModal() {
    if (overlay) return;
    var stored = readConsent();
    var analyticsOn = stored ? stored.analytics : false;

    overlay = document.createElement('div');
    overlay.className = 'tut-cc-overlay';
    overlay.setAttribute('role', 'presentation');
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) closeModal();
    });

    var modal = document.createElement('div');
    modal.className = 'tut-cc-modal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-label', T.modalTitle);

    modal.innerHTML =
      '<div class="tut-cc-modal-head"><h2>' + T.modalTitle + '</h2>' +
      '<button type="button" class="tut-cc-modal-close" aria-label="' + T.close + '">✕</button></div>' +
      '<p class="tut-cc-modal-intro">' + T.modalIntro + '</p>' +
      '<div class="tut-cc-cat">' +
      '<div class="tut-cc-cat-head"><span class="tut-cc-cat-title">' + T.catNecessaryTitle + '</span>' +
      '<label class="tut-cc-switch"><input type="checkbox" checked disabled><span class="tut-cc-slider"></span></label></div>' +
      '<p class="tut-cc-cat-desc">' + T.catNecessaryDesc + ' (' + T.catNecessaryBadge + ')</p></div>' +
      '<div class="tut-cc-cat">' +
      '<div class="tut-cc-cat-head"><span class="tut-cc-cat-title">' + T.catFontsTitle + '</span>' +
      '<label class="tut-cc-switch"><input type="checkbox" aria-label="' + T.catFontsTitle + '" id="tut-cc-analytics-toggle"' + (analyticsOn ? ' checked' : '') + '><span class="tut-cc-slider"></span></label></div>' +
      '<p class="tut-cc-cat-desc">' + T.catFontsDesc + '</p></div>' +
      '<div class="tut-cc-modal-actions">' +
      '<button type="button" class="tut-cc-btn tut-cc-btn-secondary" data-act="save">' + T.btnSave + '</button>' +
      '<button type="button" class="tut-cc-btn tut-cc-btn-primary" data-act="all">' + T.btnAcceptAll + '</button>' +
      '</div>' +
      '<div class="tut-cc-modal-foot"><a href="' + privacyHref + '">' + T.privacyLink + '</a></div>';

    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    modal.querySelector('.tut-cc-modal-close').addEventListener('click', closeModal);
    modal.querySelector('[data-act="save"]').addEventListener('click', function () {
      var checked = modal.querySelector('#tut-cc-analytics-toggle').checked;
      finish(checked);
    });
    modal.querySelector('[data-act="all"]').addEventListener('click', function () {
      finish(true);
    });

    function onKeydown(e) {
      if (e.key === 'Escape') {
        closeModal();
        document.removeEventListener('keydown', onKeydown);
      }
    }
    document.addEventListener('keydown', onKeydown);
  }

  function showBanner() {
    banner = document.createElement('div');
    banner.className = 'tut-cc-banner';
    banner.setAttribute('role', 'region');
    banner.setAttribute('aria-label', T.bannerTitle);
    banner.innerHTML =
      '<div class="tut-cc-text"><p class="tut-cc-title">' + T.bannerTitle + '</p>' +
      '<p class="tut-cc-body">' + T.bannerBody + '</p>' +
      '<p class="tut-cc-links"><a href="' + privacyHref + '">' + T.privacyLink + '</a>' +
      '<button type="button" data-act="settings">' + T.btnSettings + '</button></p></div>' +
      '<div class="tut-cc-actions">' +
      '<button type="button" class="tut-cc-btn tut-cc-btn-secondary" data-act="necessary">' + T.btnNecessary + '</button>' +
      '<button type="button" class="tut-cc-btn tut-cc-btn-primary" data-act="all">' + T.btnAcceptAll + '</button>' +
      '</div>';
    document.body.appendChild(banner);

    banner.querySelector('[data-act="necessary"]').addEventListener('click', function () {
      finish(false);
    });
    banner.querySelector('[data-act="all"]').addEventListener('click', function () {
      finish(true);
    });
    banner.querySelector('[data-act="settings"]').addEventListener('click', openModal);
  }

  function init() {
    injectStyle();
    var consent = readConsent();
    if (!consent) showBanner();
  }

  window.tutCookieConsent = { openSettings: openModal, getConsent: readConsent };

  if (document.body) {
    init();
  } else {
    document.addEventListener('DOMContentLoaded', init);
  }
})();
