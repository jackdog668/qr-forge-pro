// QR Engine: rendering, data building, downloads

import { esc } from './storage.js';

const $ = (id) => document.getElementById(id);

// ── Error correction level mapping ──
function getECL(l) {
  return ['L', 'M', 'Q', 'H'].includes(l) ? l : 'M';
}

// ── Rounded rect helpers ──
function rrp(c, x, y, w, h, rt, rr, rb, rl) {
  c.moveTo(x + rt, y);
  c.lineTo(x + w - rr, y);
  c.quadraticCurveTo(x + w, y, x + w, y + rr);
  c.lineTo(x + w, y + h - rb);
  c.quadraticCurveTo(x + w, y + h, x + w - rb, y + h);
  c.lineTo(x + rl, y + h);
  c.quadraticCurveTo(x, y + h, x, y + h - rl);
  c.lineTo(x, y + rt);
  c.quadraticCurveTo(x, y, x + rt, y);
  c.closePath();
}

function rrect(c, x, y, w, h, r) {
  c.beginPath();
  rrp(c, x, y, w, h, r);
  c.fill();
}

// ── Core QR rendering to canvas ──
export function renderQR(data, cvs, size, fgType, fg, fg2, bg, style, eyeStyle, ecl, margin, logo, frameStyle, frameTxt) {
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
  
  let cw = size;
  let ch = size;
  let ox = 0;
  let oy = 0;
  let fh = 0;

  if (frameStyle === 'bottom') {
    fh = Math.round(size * 0.12);
    ch += fh;
  } else if (frameStyle === 'badge') {
    const pad = Math.round(size * 0.08);
    const topTab = Math.round(size * 0.15);
    cw += pad * 2;
    ch += pad * 2 + topTab;
    ox = pad;
    oy = pad + topTab;
  } else if (frameStyle === 'polaroid') {
    const pad = Math.round(size * 0.1);
    const botPad = Math.round(size * 0.3);
    cw += pad * 2;
    ch += pad + botPad;
    ox = pad;
    oy = pad;
  }

  cvs.width = cw;
  cvs.height = ch;
  const c = cvs.getContext('2d');

  c.clearRect(0, 0, cw, ch);

  // Frame Background
  if (frameStyle === 'bottom') {
    c.fillStyle = bg;
    c.fillRect(0, 0, cw, ch);
  } else if (frameStyle === 'polaroid') {
    c.fillStyle = '#FFFFFF';
    c.fillRect(0, 0, cw, ch);
    c.strokeStyle = '#E0E0E0';
    c.lineWidth = 2;
    c.strokeRect(1, 1, cw - 2, ch - 2);
  } else if (frameStyle === 'badge') {
    c.fillStyle = fg;
    rrect(c, 0, Math.round(cw * 0.1), cw, ch - Math.round(cw * 0.1), Math.round(cw * 0.05), Math.round(cw * 0.05), Math.round(cw * 0.05), Math.round(cw * 0.05));
    rrect(c, Math.round(cw * 0.25), 0, Math.round(cw * 0.5), Math.round(size * 0.2), Math.round(size * 0.04), Math.round(size * 0.04), 0, 0);
  } else {
    c.fillStyle = bg;
    c.fillRect(0, 0, cw, ch);
  }

  // Inner QR BG
  if (frameStyle === 'badge') {
    c.fillStyle = bg;
    rrect(c, ox, oy, size, size, Math.round(size * 0.05), Math.round(size * 0.05), Math.round(size * 0.05), Math.round(size * 0.05));
  } else if (frameStyle === 'polaroid' || frameStyle === 'bottom' || frameStyle === 'none') {
    c.fillStyle = bg;
    c.fillRect(ox, oy, size, size);
  }

  c.save();
  c.translate(ox, oy);

  // Set fill style & gradient
  if (fgType === 'linear') {
    const g = c.createLinearGradient(0, 0, size, size);
    g.addColorStop(0, fg);
    g.addColorStop(1, fg2);
    c.fillStyle = g;
  } else if (fgType === 'radial') {
    const g = c.createRadialGradient(size/2, size/2, 0, size/2, size/2, size/2);
    g.addColorStop(0, fg);
    g.addColorStop(1, fg2);
    c.fillStyle = g;
  } else {
    c.fillStyle = fg;
  }
  c.strokeStyle = c.fillStyle;
  const cs = size / tm;

  const isEye = (r, col) => (r < 7 && col < 7) || (r < 7 && col >= mc - 7) || (r >= mc - 7 && col < 7);

  let holeStart = -1, holeEnd = -1;
  if (logo) {
    const logoModuleCount = Math.floor(mc * 0.22) + 2;
    holeStart = Math.floor((mc - logoModuleCount) / 2);
    holeEnd = holeStart + logoModuleCount - 1;
  }
  const isHole = (r, col) => logo && r >= holeStart && r <= holeEnd && col >= holeStart && col <= holeEnd;

  for (let r = 0; r < mc; r++) {
    for (let col = 0; col < mc; col++) {
      if (!qr.isDark(r, col) || isEye(r, col) || isHole(r, col)) continue;
      const x = (col + margin) * cs;
      const y = (r + margin) * cs;
      switch (style) {
        case 'square':
          c.fillRect(x, y, cs, cs);
          break;
        case 'rounded':
          rrect(c, x, y, cs, cs, cs * 0.3, cs * 0.3, cs * 0.3, cs * 0.3);
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

  // Draw exactly 3 eyes
  const drawEye = (er, ecC) => {
    const x = (ecC + margin) * cs;
    const y = (er + margin) * cs;
    const s = cs * 7;
    const m = cs;
    c.lineWidth = m;
    c.beginPath();
    if (eyeStyle === 'rounded') {
      rrp(c, x + m/2, y + m/2, s - m, s - m, m * 1.5, m * 1.5, m * 1.5, m * 1.5);
      c.stroke();
      rrect(c, x + m*2, y + m*2, m*3, m*3, m * 0.8, m * 0.8, m * 0.8, m * 0.8);
    } else if (eyeStyle === 'leaf') {
      rrp(c, x + m/2, y + m/2, s - m, s - m, m * 2, 0, m * 2, 0);
      c.stroke();
      rrect(c, x + m*2, y + m*2, m*3, m*3, m * 1.2, 0, m * 1.2, 0);
    } else {
      c.strokeRect(x + m/2, y + m/2, s - m, s - m);
      c.fillRect(x + m*2, y + m*2, m*3, m*3);
    }
  };
  drawEye(0, 0);
  drawEye(0, mc - 7);
  drawEye(mc - 7, 0);

  // Logo overlay
  if (logo) {
    const ls = size * 0.22;
    const lx = (size - ls) / 2;
    const ly = (size - ls) / 2;
    const pd = ls * 0.12;
    c.fillStyle = bg;
    rrect(c, lx - pd, ly - pd, ls + pd * 2, ls + pd * 2, pd, pd, pd, pd);
    c.save();
    c.beginPath();
    rrp(c, lx, ly, ls, ls, pd * 0.6, pd * 0.6, pd * 0.6, pd * 0.6);
    c.clip();
    c.drawImage(logo, lx, ly, ls, ls);
    c.restore();
  }
  
  c.restore();

  // Frame text
  if (frameStyle && frameStyle !== 'none' && frameTxt) {
    if (frameStyle === 'bottom') {
      c.fillStyle = fg;
      c.fillRect(0, size, size, fh);
      c.fillStyle = bg;
      c.font = `bold ${Math.round(fh * 0.5)}px "Space Grotesk",sans-serif`;
      c.textAlign = 'center';
      c.textBaseline = 'middle';
      c.fillText(frameTxt, size / 2, size + fh / 2);
    } else if (frameStyle === 'badge') {
      c.fillStyle = bg;
      const th = Math.round(size * 0.2);
      c.font = `bold ${Math.round(th * 0.4)}px "Space Grotesk",sans-serif`;
      c.textAlign = 'center';
      c.textBaseline = 'middle';
      c.fillText(frameTxt, cw / 2, th / 2 + Math.round(cw * 0.02));
    } else if (frameStyle === 'polaroid') {
      c.fillStyle = '#111111';
      const markerSize = Math.round(size * 0.12);
      c.font = `bold ${markerSize}px "Caveat", "Comic Sans MS", cursive, sans-serif`;
      c.textAlign = 'center';
      c.textBaseline = 'middle';
      c.fillText(frameTxt, cw / 2, ch - Math.round(size * 0.15));
    }
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
      if (window.vcardPhotoData) c += `\nPHOTO;ENCODING=b;TYPE=JPEG:${window.vcardPhotoData}`;
      c += `\nEND:VCARD`;
      return c;
    }
    case 'appstore': {
      const ios = v('as-ios');
      const and = v('as-and');
      const web = v('as-web') || ios || and;
      if (!ios && !and && !web) return '';
      const html = `<!DOCTYPE html><html><head><title>Redirecting...</title><script>
var u=navigator.userAgent.toLowerCase();
if(/iphone|ipad|ipod/.test(u)&&'${ios}'){window.location.replace('${ios}');}
else if(/android/.test(u)&&'${and}'){window.location.replace('${and}');}
else if('${web}'){window.location.replace('${web}');}
</script></head><body style="font-family:sans-serif;text-align:center;padding-top:20vh;">Redirecting to App Store...</body></html>`;
      return `data:text/html;charset=utf-8,${encodeURIComponent(html.replace(/\n/g, ''))}`;
    }
    case 'secure': {
      const msg = v('sec-msg');
      const pw = v('sec-pw');
      if (!msg || !pw) return '';
      if (typeof CryptoJS === 'undefined') {
        console.warn('CryptoJS not loaded');
        return '';
      }
      const enc = CryptoJS.AES.encrypt(msg, pw).toString();
      const html = `<!DOCTYPE html><html><head><title>Locked Message</title><meta name="viewport" content="width=device-width,initial-scale=1">
<script src="https://cdnjs.cloudflare.com/ajax/libs/crypto-js/4.1.1/crypto-js.min.js"></script>
</head><body style="font-family:sans-serif;max-width:400px;margin:15vh auto;text-align:center;padding:20px;">
<h2 style="margin-bottom:5px;">&#x1F512; Protected Content</h2><p style="color:#666;font-size:14px;margin-bottom:20px;">Enter password to decrypt message</p>
<input type="password" id="pw" placeholder="Password" style="padding:12px;width:100%;box-sizing:border-box;margin-bottom:15px;border:1px solid #ccc;border-radius:6px;font-size:16px;">
<button onclick="dec()" style="padding:12px 20px;background:#000;color:#fff;border:none;border-radius:6px;cursor:pointer;width:100%;font-size:16px;font-weight:bold;">Unlock</button>
<div id="res" style="margin-top:25px;padding:20px;background:#f9f9f9;border:1px solid #eee;border-radius:8px;display:none;word-break:break-all;text-align:left;font-size:16px;line-height:1.5;box-shadow:0 4px 12px rgba(0,0,0,0.05);"></div>
<script>
function dec(){
  try{
    var d=CryptoJS.AES.decrypt('${enc}',document.getElementById('pw').value).toString(CryptoJS.enc.Utf8);
    if(!d)throw 1;
    var r=document.getElementById('res');r.style.display='block';r.textContent=d;
  }catch(e){alert('Incorrect password');}
}
</script></body></html>`;
      return `data:text/html;charset=utf-8,${encodeURIComponent(html.replace(/\n/g, ''))}`;
    }
    case 'event': {
      const title = v('ev-title');
      if (!title) return '';
      const formatDT = (dt) => {
        if (!dt) return '';
        const d = new Date(dt);
        if (isNaN(d.getTime())) return '';
        return d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
      };
      let c = `BEGIN:VCALENDAR\nVERSION:2.0\nBEGIN:VEVENT\nSUMMARY:${title}\n`;
      const desc = v('ev-desc'); if (desc) c += `DESCRIPTION:${desc}\n`;
      const loc = v('ev-loc'); if (loc) c += `LOCATION:${loc}\n`;
      const st = formatDT(v('ev-start')); if (st) c += `DTSTART:${st}\n`;
      const en = formatDT(v('ev-end')); if (en) c += `DTEND:${en}\n`;
      c += `END:VEVENT\nEND:VCALENDAR`;
      return c;
    }
    case 'crypto': {
      const coin = v('cr-coin');
      const addr = v('cr-addr');
      if (!addr) return '';
      const amt = v('cr-amt');
      let uri = '';
      if (coin === 'Bitcoin') uri = `bitcoin:${addr}`;
      else if (coin === 'Ethereum') uri = `ethereum:${addr}`;
      if (amt) {
        if (coin === 'Bitcoin') uri += `?amount=${amt}`;
        else if (coin === 'Ethereum') uri += `?value=${amt}`;
      }
      return uri;
    }
    case 'geo': {
      const la = v('geo-lat');
      const lo = v('geo-lng');
      return la && lo ? `geo:${la},${lo}` : '';
    }
    case 'linkinbio': {
      const nm = v('lb-name');
      if (!nm) return '';
      const bio = v('lb-bio');
      const t1 = v('lb-t1'); const u1 = v('lb-u1');
      const t2 = v('lb-t2'); const u2 = v('lb-u2');
      const t3 = v('lb-t3'); const u3 = v('lb-u3');
      
      let html = `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(nm)}</title><style>body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;background:#FAFAFA;color:#111;text-align:center;padding:2rem 1rem;margin:0}h1{margin:0 0 .5rem;font-size:1.5rem}p{margin:0 0 2rem;color:#555;font-size:1rem;line-height:1.5;white-space:pre-wrap}a{display:block;max-width:400px;margin:0 auto 1rem;padding:1rem;background:#111;color:#FFF;text-decoration:none;border-radius:12px;font-weight:600;box-shadow:0 4px 6px rgba(0,0,0,0.1)}</style></head><body><h1>${esc(nm)}</h1>`;
      
      if (bio) html += `<p>${esc(bio)}</p>`;
      if (t1 && u1) html += `<a href="${u1.replace(/"/g, '%22')}">${esc(t1)}</a>`;
      if (t2 && u2) html += `<a href="${u2.replace(/"/g, '%22')}">${esc(t2)}</a>`;
      if (t3 && u3) html += `<a href="${u3.replace(/"/g, '%22')}">${esc(t3)}</a>`;
      
      html += `</body></html>`;
      return 'data:text/html;charset=utf-8,' + encodeURIComponent(html);
    }
  }
  return '';
}

// ── SVG export ──
export function generateSVG(data, size, fgType, fg, fg2, bg, dot, eyeStyle, ecl, margin, frameStyle, frameTxt, hasLogo = false) {
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
  
  let cw = size;
  let ch = size;
  let ox = 0;
  let oy = 0;
  let fh = 0;

  if (frameStyle === 'bottom') {
    fh = Math.round(size * 0.12);
    ch += fh;
  } else if (frameStyle === 'badge') {
    const pad = Math.round(size * 0.08);
    const topTab = Math.round(size * 0.15);
    cw += pad * 2;
    ch += pad * 2 + topTab;
    ox = pad;
    oy = pad + topTab;
  } else if (frameStyle === 'polaroid') {
    const pad = Math.round(size * 0.1);
    const botPad = Math.round(size * 0.3);
    cw += pad * 2;
    ch += pad + botPad;
    ox = pad;
    oy = pad;
  }

  let rects = '';
  
  const isEye = (r, col) => (r < 7 && col < 7) || (r < 7 && col >= mc - 7) || (r >= mc - 7 && col < 7);

  let holeStart = -1, holeEnd = -1;
  if (hasLogo) {
    const logoModuleCount = Math.floor(mc * 0.22) + 2;
    holeStart = Math.floor((mc - logoModuleCount) / 2);
    holeEnd = holeStart + logoModuleCount - 1;
  }
  const isHole = (r, col) => hasLogo && r >= holeStart && r <= holeEnd && col >= holeStart && col <= holeEnd;

  for (let r = 0; r < mc; r++) {
    for (let c = 0; c < mc; c++) {
      if (!qr.isDark(r, c) || isEye(r, c) || isHole(r, c)) continue;
      const x = ((c + margin) * cs).toFixed(2);
      const y = ((r + margin) * cs).toFixed(2);
      const s = cs.toFixed(2);
      switch (dot) {
        case 'square':
          rects += `<rect x="${x}" y="${y}" width="${s}" height="${s}"/>`;
          break;
        case 'rounded':
          rects += `<rect x="${x}" y="${y}" width="${s}" height="${s}" rx="${(cs * 0.3).toFixed(2)}"/>`;
          break;
        case 'dots':
          rects += `<circle cx="${(parseFloat(x) + cs / 2).toFixed(2)}" cy="${(parseFloat(y) + cs / 2).toFixed(2)}" r="${(cs * 0.45).toFixed(2)}"/>`;
          break;
        case 'diamond': {
          const cx = parseFloat(x) + cs / 2;
          const cy = parseFloat(y) + cs / 2;
          const h = cs / 2;
          rects += `<polygon points="${cx.toFixed(2)},${(cy - h).toFixed(2)} ${(cx + h).toFixed(2)},${cy.toFixed(2)} ${cx.toFixed(2)},${(cy + h).toFixed(2)} ${(cx - h).toFixed(2)},${cy.toFixed(2)}"/>`;
          break;
        }
      }
    }
  }

  const ds = (er, ecC) => {
    const x = ((ecC + margin) * cs);
    const y = ((er + margin) * cs);
    const s = cs * 7;
    const m = cs;
    
    // SVG path helpers
    const rRectPath = (x, y, w, h, rt, rr, rb, rl) => `M${x+rt},${y} L${x+w-rr},${y} Q${x+w},${y} ${x+w},${y+rr} L${x+w},${y+h-rb} Q${x+w},${y+h} ${x+w-rb},${y+h} L${x+rl},${y+h} Q${x},${y+h} ${x},${y+h-rl} L${x},${y+rt} Q${x},${y} ${x+rt},${y} Z`;

    let e = '';
    if (eyeStyle === 'rounded') {
      e += `<path d="${rRectPath(x + m/2, y + m/2, s - m, s - m, m*1.5, m*1.5, m*1.5, m*1.5)}" fill="none" stroke="url(#fg)" stroke-width="${m.toFixed(2)}"/>`;
      e += `<path d="${rRectPath(x + m*2, y + m*2, m*3, m*3, m*0.8, m*0.8, m*0.8, m*0.8)}"/>`;
    } else if (eyeStyle === 'leaf') {
      e += `<path d="${rRectPath(x + m/2, y + m/2, s - m, s - m, m*2, 0, m*2, 0)}" fill="none" stroke="url(#fg)" stroke-width="${m.toFixed(2)}"/>`;
      e += `<path d="${rRectPath(x + m*2, y + m*2, m*3, m*3, m*1.2, 0, m*1.2, 0)}"/>`;
    } else {
      e += `<rect x="${(x + m/2).toFixed(2)}" y="${(y + m/2).toFixed(2)}" width="${(s - m).toFixed(2)}" height="${(s - m).toFixed(2)}" fill="none" stroke="url(#fg)" stroke-width="${m.toFixed(2)}"/>`;
      e += `<rect x="${(x + m*2).toFixed(2)}" y="${(y + m*2).toFixed(2)}" width="${(m*3).toFixed(2)}" height="${(m*3).toFixed(2)}"/>`;
    }
    return e;
  };

  rects += ds(0,0) + ds(0, mc-7) + ds(mc-7, 0);

  let defs = '';
  if (fgType === 'linear') {
    defs = `<defs><linearGradient id="fg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="${esc(fg)}"/><stop offset="100%" stop-color="${esc(fg2)}"/></linearGradient></defs>`;
  } else if (fgType === 'radial') {
    defs = `<defs><radialGradient id="fg"><stop offset="0%" stop-color="${esc(fg)}"/><stop offset="100%" stop-color="${esc(fg2)}"/></radialGradient></defs>`;
  } else {
    defs = `<defs><linearGradient id="fg"><stop offset="0%" stop-color="${esc(fg)}"/><stop offset="100%" stop-color="${esc(fg)}"/></linearGradient></defs>`;
  }

  let frameBgSVG = '';
  if (frameStyle === 'bottom') {
    frameBgSVG = `<rect width="${cw}" height="${ch}" fill="${esc(bg)}"/>`;
  } else if (frameStyle === 'polaroid') {
    frameBgSVG = `<rect width="${cw}" height="${ch}" fill="#FFFFFF" stroke="#E0E0E0" stroke-width="2"/>`;
  } else if (frameStyle === 'badge') {
    frameBgSVG = `
      <rect x="0" y="${Math.round(cw * 0.1)}" width="${cw}" height="${ch - Math.round(cw * 0.1)}" rx="${Math.round(cw * 0.05)}" fill="url(#fg)"/>
      <path d="M${Math.round(cw * 0.25+size*0.04)},0 L${Math.round(cw * 0.75-size*0.04)},0 Q${Math.round(cw * 0.75)},0 ${Math.round(cw * 0.75)},${Math.round(size * 0.04)} L${Math.round(cw * 0.75)},${Math.round(size * 0.2)} L${Math.round(cw * 0.25)},${Math.round(size * 0.2)} L${Math.round(cw * 0.25)},${Math.round(size * 0.04)} Q${Math.round(cw * 0.25)},0 ${Math.round(cw * 0.25+size*0.04)},0 Z" fill="url(#fg)"/>
    `;
  } else {
    frameBgSVG = `<rect width="${cw}" height="${ch}" fill="${esc(bg)}"/>`;
  }

  let qrBgSVG = '';
  if (frameStyle === 'badge') {
    qrBgSVG = `<rect x="${ox}" y="${oy}" width="${size}" height="${size}" rx="${Math.round(size * 0.05)}" fill="${esc(bg)}"/>`;
  } else {
    qrBgSVG = `<rect x="${ox}" y="${oy}" width="${size}" height="${size}" fill="${esc(bg)}"/>`;
  }

  let fs = '';
  if (frameStyle && frameStyle !== 'none' && frameTxt) {
    if (frameStyle === 'bottom') {
      fs = `<rect x="0" y="${size}" width="${size}" height="${fh}" fill="url(#fg)"/><text x="${size / 2}" y="${size + fh / 2}" fill="${esc(bg)}" font-family="Space Grotesk,sans-serif" font-weight="bold" font-size="${Math.round(fh * 0.5)}" text-anchor="middle" dominant-baseline="central">${esc(frameTxt)}</text>`;
    } else if (frameStyle === 'badge') {
      const th = Math.round(size * 0.2);
      fs = `<text x="${cw / 2}" y="${th / 2 + Math.round(cw * 0.02)}" fill="${esc(bg)}" font-family="Space Grotesk,sans-serif" font-weight="bold" font-size="${Math.round(th * 0.4)}" text-anchor="middle" dominant-baseline="central">${esc(frameTxt)}</text>`;
    } else if (frameStyle === 'polaroid') {
      const markerSize = Math.round(size * 0.12);
      fs = `<text x="${cw / 2}" y="${ch - Math.round(size * 0.15)}" fill="#111111" font-family="Caveat, Comic Sans MS, cursive, sans-serif" font-weight="bold" font-size="${markerSize}" text-anchor="middle" dominant-baseline="central">${esc(frameTxt)}</text>`;
    }
  }

  return `<?xml version="1.0"?>\n<svg xmlns="http://www.w3.org/2000/svg" width="${cw}" height="${ch}">\n${defs}\n${frameBgSVG}\n${qrBgSVG}\n<g transform="translate(${ox}, ${oy})">\n<g fill="url(#fg)">\n${rects}</g></g>\n${fs}\n</svg>`;
}
