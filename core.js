/* NaNa Lab. QR payload helpers. No requests, redirects, or tracking links. */
(function (root) {
  'use strict';
  const escapeWifi = value => String(value).replace(/[\\;,:\"]/g, '\\$&');
  function payload(values) {
    const type = values.type || 'url';
    if (type === 'wifi') {
      const ssid = String(values.ssid || '');
      if (!ssid.trim()) throw new Error('Wi-Fi 이름(SSID)을 입력하세요.');
      if (new TextEncoder().encode(ssid).length > 32) throw new Error('Wi-Fi 이름은 UTF-8 기준 32바이트까지 입력하세요.');
      const auth = values.auth || 'WPA';
      if (!['WPA', 'WEP', 'nopass'].includes(auth)) throw new Error('Wi-Fi 보안 방식을 선택하세요.');
      const password = String(values.password || '');
      if (auth !== 'nopass' && !password) throw new Error('Wi-Fi 비밀번호를 입력하세요.');
      return `WIFI:T:${auth};S:${escapeWifi(ssid)};P:${escapeWifi(auth === 'nopass' ? '' : password)};H:${values.hidden ? 'true' : 'false'};;`;
    }
    const text = String(values.text || '').trim();
    if (!text) throw new Error(type === 'url' ? '웹사이트 주소를 입력하세요.' : 'QR 코드에 담을 내용을 입력하세요.');
    if (type === 'url') {
      let parsed;
      try { parsed = new URL(text); } catch (_) { throw new Error('https://로 시작하는 전체 주소를 입력하세요.'); }
      if (!['https:', 'http:'].includes(parsed.protocol) || !parsed.hostname) throw new Error('http:// 또는 https:// 웹 주소만 사용할 수 있습니다.');
      if (parsed.username || parsed.password) throw new Error('로그인 정보가 포함된 주소는 사용할 수 없습니다.');
    } else if (type !== 'text') throw new Error('지원하지 않는 QR 코드 종류입니다.');
    if (new TextEncoder().encode(text).length > 2000) throw new Error('내용이 너무 깁니다. UTF-8 기준 2,000바이트 이내로 줄여 주세요.');
    return text;
  }
  function create(values, level = 'M') {
    if (!['M', 'Q', 'H'].includes(level)) throw new Error('오류 복원 수준을 선택하세요.');
    const text = payload(values);
    const engine = root.NaNaQR || (typeof require === 'function' && require('./vendor/qrcode.min.js'));
    if (!engine) throw new Error('QR 처리기를 불러오지 못했습니다. 새로고침하세요.');
    try { return {text, code: engine.create(text, {errorCorrectionLevel: level})}; }
    catch (_) { throw new Error('현재 복원 수준에 비해 내용이 너무 깁니다. 내용을 줄이거나 기본 복원 수준을 선택하세요.'); }
  }
  function svg(code) {
    const n = code.modules.size, quiet = 4, size = n + quiet * 2;
    const paths = [];
    for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
      if (code.modules.get(y, x)) paths.push(`M${x + quiet},${y + quiet}h1v1h-1z`);
    }
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="1024" height="1024" shape-rendering="crispEdges"><rect width="${size}" height="${size}" fill="#fff"/><path d="${paths.join('')}" fill="#102539"/></svg>`;
  }
  function draw(canvas, code, target = 512) {
    const n = code.modules.size, scale = Math.max(1, Math.ceil(target / (n + 8)));
    canvas.width = canvas.height = (n + 8) * scale;
    const context = canvas.getContext('2d');
    context.fillStyle = '#fff'; context.fillRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = '#102539';
    for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) if (code.modules.get(y, x)) context.fillRect((x + 4) * scale, (y + 4) * scale, scale, scale);
    return canvas;
  }
  const api = {escapeWifi, payload, create, svg, draw};
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.QrMaker = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
