document.addEventListener('DOMContentLoaded', () => {
  'use strict';
  const t = AppI18n.t;
  let type = 'url', generated = null, links = [];
  const form = document.getElementById('qr-form'), status = document.getElementById('status');
  const value = id => document.getElementById(id).value;
  const setStatus = (text, error = false) => { status.textContent = text; status.classList.toggle('error', error); };
  function clear() {
    links.forEach(url => URL.revokeObjectURL(url)); links = []; generated = null;
    document.getElementById('qr-result').hidden = true; document.getElementById('qr-empty').hidden = false;
    for (const id of ['save-png', 'save-svg']) { document.getElementById(id).removeAttribute('href'); document.getElementById(id).setAttribute('aria-disabled', 'true'); }
  }
  document.querySelectorAll('[data-kind]').forEach(button => button.addEventListener('click', () => {
    type = button.dataset.kind; clear();
    document.querySelectorAll('[data-kind]').forEach(tab => tab.setAttribute('aria-pressed', String(tab === button)));
    document.getElementById('text-fields').hidden = type === 'wifi'; document.getElementById('wifi-fields').hidden = type !== 'wifi';
    const label = document.getElementById('content-label'), content = document.getElementById('content');
    label.textContent = type === 'text' ? t('textLabel') : t('urlLabel');
    content.placeholder = type === 'text' ? t('textPlaceholder') : 'https://example.com';
    setStatus(t('inputPrompt'));
  }));
  form.addEventListener('input', () => { if (generated) { clear(); setStatus(t('qrChanged')); } });
  form.addEventListener('change', () => { if (generated) { clear(); setStatus(t('qrSettingsChanged')); } document.getElementById('wifi-password').disabled = value('wifi-auth') === 'nopass'; });
  form.addEventListener('submit', event => {
    event.preventDefault(); clear();
    try {
      const result = QrMaker.create({type, text: value('content'), ssid: value('wifi-ssid'), password: value('wifi-password'), auth: value('wifi-auth'), hidden: document.getElementById('wifi-hidden').checked}, value('ecc'));
      const canvas = document.getElementById('qr-canvas'); QrMaker.draw(canvas, result.code, Number(value('size')));
      generated = result; const svg = new Blob([QrMaker.svg(result.code)], {type: 'image/svg+xml;charset=utf-8'}); const url = URL.createObjectURL(svg); links.push(url);
      const svgLink = document.getElementById('save-svg'); svgLink.href = url; svgLink.removeAttribute('aria-disabled');
      canvas.toBlob(blob => {
        if (!blob || generated !== result) return;
        const pngUrl = URL.createObjectURL(blob); links.push(pngUrl);
        const pngLink = document.getElementById('save-png'); pngLink.href = pngUrl; pngLink.removeAttribute('aria-disabled');
      }, 'image/png');
      document.getElementById('qr-empty').hidden = true; document.getElementById('qr-result').hidden = false;
      document.getElementById('qr-details').textContent = t('qrDetails', {width: canvas.width, height: canvas.height});
      setStatus(t('qrDone'));
    } catch (error) { setStatus(AppI18n.error(error.message) || t('qrFailed'), true); }
  });
  document.getElementById('reset-button').addEventListener('click', () => { form.reset(); clear(); document.getElementById('wifi-password').disabled = false; setStatus(t('inputCleared')); });
  window.addEventListener('pagehide', clear);
});
