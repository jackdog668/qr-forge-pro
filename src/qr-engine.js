// QR Engine: rendering, data building, downloads

import { esc } from './storage.js';

const $ = (id) => document.getElementById(id);

// ── Error correction level mapping ──
function getECL(l) {
  return ['L', 'M', 'Q', 'H'].includes(l) ? l : 'M';
}

// ── Rounded rect helpers ──
function rrp(c, x, y, w, h, r) {
  c.moveTo(x + r, y);
  c.lineTo(x + w - r, y);
  c.quadraticCurveTo(x + w, y, x + w, y + r);
  c.lineTo(x + w, y + h - r);
  c.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  c.lineTo(x + r, y + h);
  c.quadraticCurveTo(x, y + h, x, y + h - r);
  c.lineTo(x, y + r);
  c.quadraticCurveTo(x, y, x + r, y);
  c.closePath();
}

function rrect(c, x, y, w, h, r) {
  c.beginPath();
  rrp(c, x, y, w, h, r);
  c.fill();
}

// ── Core QR rendering to canvas ──
export function renderQR(data, cvs, size, fg, bg, style, ecl, margin, logo, frameTxt) {
  const ec = getECL(ecl);
  let qr;
  for (let t = 1; t <= 40; t++) {
    try {
      qr = window.qrcode(t, ec);
      qr.addData(data);
      qr.make();
      break;
    } catch (e) {
      if (t === 40) throw e;
    }
  }

  const mc = qr.getModuleCount();
  const tm = mc + margin * 2;
  const fh = frameTxt ? Math.round(size * 0.10) : 0;
  cvs.width = size;
  cvs.height = size + fh;
  const c = cvs.getContext('2d');

  c.fillStyle = bg;
  c.fillRect(0, 0, size, size + fh);
  c.fillStyle = fg;
  const cs = size / tm;

  for (let r = 0; r < mc; r++) {
    for (let col = 0; col < mc; col++) {
      if (!qr.isDark(r, col)) continue;
      const x = (col + margin) * cs;
      const y = (r + margin) * cs;
      switch (style) {
        case 'square':
          c.fillRect(x, y, cs, cs);
          break;
        case 'rounded':
          rrect(c, x, y, cs, cs, cs * 0.3);
          break;
        case 'dots':
          c.beginPath();
          c.arc(x + cs / 2, y + cs / 2, cs * 0.45, 0, Math.PI * 2);
          c.fill();
          break;
        case 'diamond':
          c.beginPath();
          c.moveTo(x + cs / 2, y);
          c.lineTo(x + cs, y + cs / 2);
          c.lineTo(x + cs / 2, y + cs);
          c.lineTo(x, y + cs / 2);
          c.closePath();
          c.fill();
          break;
      }
    }
  }

  // Logo overlay
  if (logo) {
    const ls = size * 0.22;
    const lx = (size - ls) / 2;
    const ly = (size - ls) / 2;
    const pd = ls * 0.12;
    c.fillStyle = bg;
    rrect(c, lx - pd, ly - pd, ls + pd * 2, ls + pd * 2, pd);
    c.save();
    c.beginPath();
    rrp(c, lx, ly, ls, ls, pd * 0.6);
    c.clip();
    c.drawImage(logo, lx, ly, ls, ls);
    c.restore();
  }

  // Frame text
  if (frameTxt) {
    c.fillStyle = fg;
    c.fillRect(0, size, size, fh);
    c.fillStyle = bg;
    c.font = `bold ${Math.round(fh * 0.5)}px "Space Grotesk",sans-serif`;
    c.textAlign = 'center';
    c.textBaseline = 'middle';
    c.fillText(frameTxt, size / 2, size + fh / 2);
  }

  return { mc, qr };
}

// ── Build data string from form fields ──
export function buildData(type) {
  const v = (id) => {
    const el = $('f-' + id);
    return el ? el.value.trim() : '';
  };

  switch (type) {
    case 'url':
      return v('url');
    case 'text':
      return v('text');
    case 'wifi': {
      const s = v('wifi-ssid');
      if (!s) return '';
      return `WIFI:T:${v('wifi-enc') || 'WPA'};S:${s};P:${v('wifi-pass')};;`;
    }
    case 'email': {
      const a = v('em-addr');
      if (!a) return '';
      let s = `mailto:${a}`;
      const p = [];
      if (v('em-subj')) p.push(`subject=${encodeURIComponent(v('em-subj'))}`);
      if (v('em-body')) p.push(`body=${encodeURIComponent(v('em-body'))}`);
      if (p.length) s += '?' + p.join('&');
      return s;
    }
    case 'phone':
      return v('phone') ? `tel:${v('phone')}` : '';
    case 'sms': {
      const n = v('sms-num');
      if (!n) return '';
      const m = v('sms-msg');
      return m ? `sms:${n}?body=${encodeURIComponent(m)}` : `sms:${n}`;
    }
    case 'vcard': {
      const fn = v('vc-first');
      if (!fn) return '';
      let c = `BEGIN:VCARD\nVERSION:3.0\nN:${v('vc-last')};${fn}\nFN:${fn} ${v('vc-last')}`;
      if (v('vc-phone')) c += `\nTEL:${v('vc-phone')}`;
      if (v('vc-email')) c += `\nEMAIL:${v('vc-email')}`;
      if (v('vc-org')) c += `\nORG:${v('vc-org')}`;
      if (v('vc-url')) c += `\nURL:${v('vc-url')}`;
      c += `\nEND:VCARD`;
      return c;
    }
    case 'geo': {
      const la = v('geo-lat');
      const lo = v('geo-lng');
      return la && lo ? `geo:${la},${lo}` : '';
    }
  }
  return '';
}

// ── SVG export ──
export function generateSVG(data, size, fg, bg, dot, ecl, margin, frame) {
  const ec = getECL(ecl);
  let qr;
  for (let t = 1; t <= 40; t++) {
    try {
      qr = window.qrcode(t, ec);
      qr.addData(data);
      qr.make();
      break;
    } catch (e) {
      if (t === 40) return null;
    }
  }

  const mc = qr.getModuleCount();
  const tm = mc + margin * 2;
  const cs = size / tm;
  const fh = frame ? Math.round(size * 0.10) : 0;
  let rects = '';

  for (let r = 0; r < mc; r++) {
    for (let c = 0; c < mc; c++) {
      if (!qr.isDark(r, c)) continue;
      const x = ((c + margin) * cs).toFixed(2);
      const y = ((r + margin) * cs).toFixed(2);
      const s = cs.toFixed(2);
      switch (dot) {
        case 'square':
          rects += `<rect x="${x}" y="${y}" width="${s}" height="${s}" fill="${esc(fg)}"/>`;
          break;
        case 'rounded':
          rects += `<rect x="${x}" y="${y}" width="${s}" height="${s}" rx="${(cs * 0.3).toFixed(2)}" fill="${esc(fg)}"/>`;
          break;
        case 'dots':
          rects += `<circle cx="${(parseFloat(x) + cs / 2).toFixed(2)}" cy="${(parseFloat(y) + cs / 2).toFixed(2)}" r="${(cs * 0.45).toFixed(2)}" fill="${esc(fg)}"/>`;
          break;
        case 'diamond': {
          const cx = parseFloat(x) + cs / 2;
          const cy = parseFloat(y) + cs / 2;
          const h = cs / 2;
          rects += `<polygon points="${cx.toFixed(2)},${(cy - h).toFixed(2)} ${(cx + h).toFixed(2)},${cy.toFixed(2)} ${cx.toFixed(2)},${(cy + h).toFixed(2)} ${(cx - h).toFixed(2)},${cy.toFixed(2)}" fill="${esc(fg)}"/>`;
          break;
        }
      }
    }
  }

  let fs = '';
  if (frame) {
    fs = `<rect x="0" y="${size}" width="${size}" height="${fh}" fill="${esc(fg)}"/><text x="${size / 2}" y="${size + fh / 2}" fill="${esc(bg)}" font-family="Space Grotesk,sans-serif" font-weight="bold" font-size="${Math.round(fh * 0.5)}" text-anchor="middle" dominant-baseline="central">${esc(frame)}</text>`;
  }

  return `<?xml version="1.0"?>\n<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size + fh}">\n<rect width="${size}" height="${size + fh}" fill="${esc(bg)}"/>\n${rects}${fs}\n</svg>`;
}
