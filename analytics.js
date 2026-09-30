/* Shared GA4 funnel. Never pass form fields, link URLs or arbitrary DOM text. */
(function () {
  'use strict';
  var ID = 'G-K18Q80GHW0';
  var enabled = false, initialized = false, viewed = false;
  var locale = document.documentElement.lang.indexOf('en') === 0 ? 'en' : 'de';
  var allowed = ['demo_open', 'demo_form_start', 'generate_lead', 'demo_submit_error', 'booking_click', 'feature_view', 'scroll_depth'];
  window['ga-disable-' + ID] = true;
  function cleanUrl(value) {
    try { var u = new URL(value); return u.origin + u.pathname; } catch (_) { return ''; }
  }
  function gtag() { window.dataLayer.push(arguments); }
  function track(name, props) {
    if (!enabled || allowed.indexOf(name) < 0) return;
    var data = { site_language: locale, site_domain: location.hostname, page_location: cleanUrl(location.href) };
    if (props) {
      if (['header', 'hero', 'footer', 'content'].indexOf(props.placement) >= 0) data.placement = props.placement;
      if (['sofort-meldung', 'ki-vorschlag', 'massnahmen', 'datenanalyse', 'sicherheitskultur'].indexOf(props.feature) >= 0) data.feature = props.feature;
      if ([25, 50, 75, 90].indexOf(props.percent) >= 0) data.percent = props.percent;
    }
    gtag('event', name, data);
  }
  function clearCookies() {
    document.cookie.split(';').forEach(function (cookie) {
      var name = cookie.trim().split('=')[0];
      if (!/^_ga(?:_|$)/.test(name)) return;
      var parts = location.hostname.split('.');
      var domains = ['', location.hostname];
      for (var i = 0; i < parts.length - 1; i++) domains.push('.' + parts.slice(i).join('.'));
      domains.forEach(function (domain) {
        document.cookie = name + '=; Max-Age=0; path=/' + (domain ? '; domain=' + domain : '') + '; SameSite=Lax';
      });
    });
  }
  function apply(consent) {
    enabled = !!(consent && consent.analytics);
    window['ga-disable-' + ID] = !enabled;
    if (!enabled) { clearCookies(); return; }
    if (!initialized) {
      initialized = true;
      window.dataLayer = window.dataLayer || [];
      window.gtag = gtag;
      gtag('consent', 'default', { analytics_storage: 'denied', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied' });
      gtag('consent', 'update', { analytics_storage: 'granted' });
      gtag('js', new Date());
      gtag('config', ID, {
        send_page_view: false, allow_google_signals: false, allow_ad_personalization_signals: false,
        cookie_expires: 60 * 60 * 24 * 365,
        page_location: cleanUrl(location.href), page_referrer: cleanUrl(document.referrer),
        site_language: locale, site_domain: location.hostname
      });
      var script = document.createElement('script');
      script.async = true;
      script.src = 'https://www.googletagmanager.com/gtag/js?id=' + ID;
      document.head.appendChild(script);
    }
    if (!viewed) {
      viewed = true;
      gtag('event', 'page_view', { page_location: cleanUrl(location.href), page_referrer: cleanUrl(document.referrer), site_language: locale, site_domain: location.hostname });
    }
  }
  window.tutAnalytics = { track: track };
  window.addEventListener('tutelaris:consent', function (e) { apply(e.detail); });
  window.addEventListener('storage', function (e) {
    if (e.key === 'tutelaris_consent_v2' || e.key === null) apply(window.tutCookieConsent.getConsent());
  });
  apply(window.tutCookieConsent && window.tutCookieConsent.getConsent());
  function placement(el) {
    return el.closest('header') ? 'header' : el.closest('footer') ? 'footer' : el.closest('.hero-top') ? 'hero' : 'content';
  }
  document.addEventListener('click', function (e) {
    var el = e.target.closest('a, button');
    if (!el) return;
    if (el.matches('.demo-open-btn')) track('demo_open', { placement: placement(el) });
    if (el.matches('.demo-booking-link, .demo-success-booking')) track('booking_click');
    if (el.matches('.module-tab-btn')) track('feature_view', { feature: el.dataset.tab });
  });
  document.addEventListener('submit', function (e) {
    if (e.target.matches('.demo-trigger-form')) {
      var input = e.target.querySelector('input[type=email]');
      if (input && input.checkValidity()) track('demo_open', { placement: placement(e.target) });
    }
  });
  var started = false;
  document.addEventListener('input', function (e) {
    if (enabled && !started && e.target.closest('#demo-modal-form')) { started = true; track('demo_form_start'); }
  });
  var depths = {};
  window.addEventListener('scroll', function () {
    if (!enabled) return;
    var height = document.documentElement.scrollHeight - innerHeight;
    if (height <= 0) return;
    var percent = Math.round(scrollY / height * 100);
    [25, 50, 75, 90].forEach(function (depth) {
      if (percent >= depth && !depths[depth]) { depths[depth] = true; track('scroll_depth', { percent: depth }); }
    });
  }, { passive: true });
})();
