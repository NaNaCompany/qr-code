document.addEventListener('DOMContentLoaded', () => {
  'use strict';
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
    label.textContent = type === 'text' ? 'QR 코드에 담을 텍스트' : '웹사이트 주소';
    content.placeholder = type === 'text' ? '한글·영문·숫자 등 원하는 내용을 입력하세요.' : 'https://example.com';
    setStatus('내용을 입력하고 만들기를 누르세요.');
  }));
  form.addEventListener('input', () => { if (generated) { clear(); setStatus('내용이 변경됐습니다. QR 코드를 다시 만들어 주세요.'); } });
  form.addEventListener('change', () => { if (generated) { clear(); setStatus('설정이 변경됐습니다. QR 코드를 다시 만들어 주세요.'); } document.getElementById('wifi-password').disabled = value('wifi-auth') === 'nopass'; });
  form.addEventListener('submit', event => {
    event.preventDefault(); clear();
    try {
      const result = QrMaker.create({type, text: value('content'), ssid: value('wifi-ssid'), password: value('wifi-password'), auth: value('wifi-auth'), hidden: document.getElementById('wifi-hidden').checked}, value('ecc'));
      const canvas = document.getElementById('qr-canvas'); QrMaker.draw(canvas, result.code, Number(value('size')));
      generated = result; const svg = new Blob([QrMaker.svg(result.code)], {type: 'image/svg+xml;charset=utf-8'}); const url = URL.createObjectURL(svg); links.push(url);
      const svgLink = document.getElementById('save-svg'); svgLink.href = url; svgLink.removeAttribute('aria-disabled');
      const pngLink = document.getElementById('save-png'); pngLink.href = canvas.toDataURL('image/png'); pngLink.removeAttribute('aria-disabled');
      document.getElementById('qr-empty').hidden = true; document.getElementById('qr-result').hidden = false;
      document.getElementById('qr-details').textContent = `${canvas.width} × ${canvas.height}px · PNG / 벡터 SVG · 여백 4모듈`;
      setStatus('QR 코드를 만들었습니다. 카메라로 인식되는지 확인한 뒤 사용하세요.');
    } catch (error) { setStatus(error.message || 'QR 코드를 만들지 못했습니다.', true); }
  });
  document.getElementById('reset-button').addEventListener('click', () => { form.reset(); clear(); document.getElementById('wifi-password').disabled = false; setStatus('입력한 내용을 지웠습니다.'); });
  window.addEventListener('pagehide', clear);
});
