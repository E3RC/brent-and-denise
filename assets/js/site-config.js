(function () {
  'use strict';

  var fallbackConfig = {
    contact: {
      primaryChannel: 'email',
      email: 'hello@brentanddenise.com',
      subscribeSubject: 'Subscribe',
      contactSubject: 'Contact from Brent & Denise',
      whatsappEnabled: false,
      whatsappNumber: '',
      whatsappLabel: 'Message us on WhatsApp'
    },
    social: {
      instagram: 'https://instagram.com/brentanddenise',
      youtube: 'https://youtube.com/@brentanddenise',
      x: 'https://x.com/brentanddenise',
      tiktok: 'https://tiktok.com/@brentanddenise'
    }
  };

  function encodeBody(name, email, message) {
    return encodeURIComponent('From: ') + encodeURIComponent(name) +
      encodeURIComponent('\nEmail: ') + encodeURIComponent(email) +
      encodeURIComponent('\n\n') + encodeURIComponent(message);
  }

  function mailtoHref(email, subject, body) {
    var href = 'mailto:' + email + '?subject=' + encodeURIComponent(subject || '');
    if (body) href += '&body=' + body;
    return href;
  }

  function applyEmailLinks(config) {
    var contact = config.contact || fallbackConfig.contact;
    var email = contact.email || fallbackConfig.contact.email;
    var subscribeSubject = contact.subscribeSubject || fallbackConfig.contact.subscribeSubject;

    document.querySelectorAll('[data-config-email-link]').forEach(function (link) {
      link.href = mailtoHref(email, subscribeSubject);
    });

    document.querySelectorAll('[data-config-email-text]').forEach(function (el) {
      el.textContent = email;
    });

    document.querySelectorAll('[data-config-email-href]').forEach(function (link) {
      link.href = 'mailto:' + email;
    });

    var form = document.getElementById('contact-form');
    if (form) form.action = 'mailto:' + email;
  }

  function applySocialLinks(config) {
    var social = config.social || fallbackConfig.social;

    Object.keys(social).forEach(function (key) {
      var url = social[key];
      if (!url) return;

      document.querySelectorAll('[data-social="' + key + '"]').forEach(function (link) {
        link.href = url;
      });
    });
  }

  function applyWhatsapp(config) {
    var contact = config.contact || fallbackConfig.contact;
    var link = document.getElementById('whatsapp-contact-link');
    if (!link) return;

    if (!contact.whatsappEnabled || !contact.whatsappNumber) {
      link.hidden = true;
      return;
    }

    link.hidden = false;
    link.href = 'https://wa.me/' + String(contact.whatsappNumber).replace(/\D/g, '');
    link.textContent = contact.whatsappLabel || fallbackConfig.contact.whatsappLabel;
  }

  function bindContactForm(config) {
    var contact = config.contact || fallbackConfig.contact;
    var form = document.getElementById('contact-form');
    if (!form) return;

    form.addEventListener('submit', function (e) {
      if (!form.checkValidity()) return;

      e.preventDefault();

      var email = contact.email || fallbackConfig.contact.email;
      var name = document.getElementById('contact-name').value;
      var replyEmail = document.getElementById('contact-email').value;
      var subject = document.getElementById('contact-subject').value || contact.contactSubject || fallbackConfig.contact.contactSubject;
      var message = document.getElementById('contact-message').value;
      var mailtoLink = mailtoHref(email, subject, encodeBody(name, replyEmail, message));
      var success = document.getElementById('contact-success');
      var error = document.getElementById('contact-error');

      if (success) success.classList.add('visible');
      if (error) error.classList.remove('visible');

      var mailtoWindow = window.open(mailtoLink);
      if ((!mailtoWindow || mailtoWindow.closed) && error) {
        error.classList.add('visible');
      }
    });
  }

  function applyConfig(config) {
    window.SiteConfig = config;
    applyEmailLinks(config);
    applySocialLinks(config);
    applyWhatsapp(config);
    bindContactForm(config);
  }

  function boot() {
    fetch('/assets/data/site.json')
      .then(function (response) {
        if (!response.ok) throw new Error('HTTP ' + response.status);
        return response.json();
      })
      .then(applyConfig)
      .catch(function () {
        applyConfig(fallbackConfig);
      });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
