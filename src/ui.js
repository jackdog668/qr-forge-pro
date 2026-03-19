// UI module: toast, navigation, form rendering, theme, modals

import { esc } from './storage.js';
import { TYPES, DOTS, VD, VE, VT, ECL_MAP } from './templates.js';

const $ = (id) => document.getElementById(id);

// ── Toast with undo ──
let toastTimer = null;
let undoCb = null;

export function toast(m, undo) {
  $('toastMsg').textContent = m;
  const t = $('toast');
  const oldBtn = t.querySelector('.toast-undo');
  if (oldBtn) oldBtn.remove();
  if (undo) {
    undoCb = undo;
    const btn = document.createElement('button');
    btn.className = 'toast-undo';
    btn.textContent = 'Undo';
    btn.onclick = () => {
      if (undoCb) { undoCb(); undoCb = null; }
      t.classList.remove('show');
    };
    t.appendChild(btn);
  } else {
    undoCb = null;
  }
  if (toastTimer) clearTimeout(toastTimer);
  t.classList.add('show');
  toastTimer = setTimeout(() => {
    t.classList.remove('show');
    toastTimer = null;
    undoCb = null;
    const b = t.querySelector('.toast-undo');
    if (b) b.remove();
  }, undo ? 5000 : 2200);
}

// ── Navigation ──
export function goTo(pg, onNavigate) {
  if (onNavigate) onNavigate(pg);
  document.querySelectorAll('.page').forEach((p) => p.classList.remove('active'));
  const target = $('pg-' + pg);
  if (target) target.classList.add('active');
  document.querySelectorAll('.bnav-btn').forEach((b) => {
    const active = b.dataset.pg === pg;
    b.classList.toggle('active', active);
    b.setAttribute('aria-selected', active);
  });
  window.scrollTo(0, 0);
}

// ── Modal ──
export function closeModal() {
  $('modalBg').classList.remove('vis');
}

// ── Theme toggle ──
export function initTheme() {
  const saved = localStorage.getItem('qf-theme') || 'dark';
  document.documentElement.setAttribute('data-theme', saved);
  updateThemeIcon(saved);
}

export function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme') || 'dark';
  const next = current === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('qf-theme', next);
  updateThemeIcon(next);
}

function updateThemeIcon(theme) {
  const btn = $('themeToggle');
  if (btn) btn.innerHTML = theme === 'dark' ? '&#x2600;' : '&#x1F319;';
}

// ── Form rendering ──
export function renderForm(state, onInput) {
  const t = TYPES.find((x) => x.id === state.type);
  let h = '';
  if (state.type === 'geo') {
    h += `<div style="text-align:right; margin-bottom: 10px;"><button class="btn-s" onclick="QF.useMyLoc()" style="padding:4px 8px;font-size:0.8rem;background:#10a37f;color:#fff;">&#x1F4CD; Use Current Location</button></div>`;
  }
  t.fields.forEach((f) => {
    h += `<div class="field">`;
    if (f.lbl) h += `<label>${esc(f.lbl)}</label>`;
    if (f.type === 'textarea')
      h += `<textarea id="f-${esc(f.id)}" placeholder="${esc(f.ph)}" oninput="QF.onInput()"></textarea>`;
    else if (f.type === 'select')
      h += `<select id="f-${esc(f.id)}" onchange="QF.onInput()">${f.opts.map((o) => `<option>${esc(o)}</option>`).join('')}</select>`;
    else if (f.pw)
      h += `<div class="pw-row"><input type="password" id="f-${esc(f.id)}" placeholder="${esc(f.ph)}" oninput="QF.onInput()"><button class="pw-toggle" type="button" onclick="QF.togglePw(this)">Show</button></div>`;
    else if (f.type === 'file')
      h += `<input type="file" id="f-${esc(f.id)}" accept="${f.accept || ''}" onchange="QF.handleFileInput(event, '${esc(f.id)}')">`;
    else
      h += `<input type="${esc(f.type)}" id="f-${esc(f.id)}" placeholder="${esc(f.ph)}" oninput="QF.onInput()">`;
    h += `</div>`;
  });
  
  if (state.type === 'url') {
    h += `<details class="utm-builder" style="margin-top: 10px; background: var(--bg-sec); padding: 8px; border-radius: 8px; border: 1px solid var(--bd);">
      <summary style="cursor: pointer; font-size: 0.85em; color: var(--accent);">+ Add UTM Tags (Optional)</summary>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; margin-top: 0.5rem;">
        <input type="text" id="f-utm_source" placeholder="Source (e.g. google)" oninput="QF.onInput()" style="font-size: 0.8em; padding: 6px; border: 1px solid var(--bd); border-radius: 4px; background: var(--bg); color: var(--txt);">
        <input type="text" id="f-utm_medium" placeholder="Medium (e.g. cpc)" oninput="QF.onInput()" style="font-size: 0.8em; padding: 6px; border: 1px solid var(--bd); border-radius: 4px; background: var(--bg); color: var(--txt);">
        <input type="text" id="f-utm_campaign" placeholder="Campaign" oninput="QF.onInput()" style="font-size: 0.8em; padding: 6px; border: 1px solid var(--bd); border-radius: 4px; background: var(--bg); color: var(--txt);">
        <input type="text" id="f-utm_term" placeholder="Term" oninput="QF.onInput()" style="font-size: 0.8em; padding: 6px; border: 1px solid var(--bd); border-radius: 4px; background: var(--bg); color: var(--txt);">
      </div>
    </details>`;
  }

  $('formArea').innerHTML = h;
}

// ── Type chips ──
export function renderTypeChips(state) {
  $('typeChips').innerHTML = TYPES.map(
    (t) =>
      `<button class="chip${t.id === state.type ? ' on' : ''}" data-t="${esc(t.id)}" onclick="QF.setType('${esc(t.id)}')">${t.icon} ${esc(t.label)}</button>`
  ).join('');
}

// ── Dot style grid ──
export function renderDotGrid(state) {
  $('dotGrid').innerHTML = DOTS.map(
    (d) =>
      `<div class="dot-opt${d.id === state.dot ? ' on' : ''}" data-d="${esc(d.id)}" onclick="QF.setDot('${esc(d.id)}')"><svg viewBox="0 0 24 24">${d.svg}</svg><div class="dl">${esc(d.label)}</div></div>`
  ).join('');
}

// ── ECL row ──
export function renderEclRow(state) {
  $('eclRow').innerHTML = VE.map(
    (e) =>
      `<button class="ecl-b${e === state.ecl ? ' on' : ''}" data-e="${e}" onclick="QF.setEcl('${e}')">${e} ${ECL_MAP[e]}</button>`
  ).join('');
}

// ── Color update ──
export function updClr(state) {
  $('fgH').textContent = state.fg = $('fgC').value;
  $('bgH').textContent = state.bg = $('bgC').value;
  if ($('bgTrans')) state.bgTrans = $('bgTrans').checked;
  if ($('fgC2')) $('fgH2').textContent = state.fg2 = $('fgC2').value;
  if ($('fg2Wrap')) $('fg2Wrap').style.display = state.fgType !== 'solid' ? 'block' : 'none';
  if (typeof QF !== 'undefined' && QF.onInput) QF.onInput();
}

// ── Toggles ──
export function handleFrameUI(state) {
  $('frameF').style.display = state.frameStyle !== 'none' ? 'block' : 'none';
}

export function togglePw(btn) {
  const inp = btn.previousElementSibling;
  inp.type = inp.type === 'password' ? 'text' : 'password';
  btn.textContent = inp.type === 'password' ? 'Show' : 'Hide';
}

// ── Dot + ECL selector updates ──
export function setDotUI(id) {
  document.querySelectorAll('.dot-opt').forEach((o) => o.classList.toggle('on', o.dataset.d === id));
}

export function setEclUI(id) {
  document.querySelectorAll('.ecl-b').forEach((b) => b.classList.toggle('on', b.dataset.e === id));
}

// ── Keyboard shortcuts overlay ──
export function showKB() {
  $('kbOverlay').classList.add('vis');
}

export function closeKB() {
  $('kbOverlay').classList.remove('vis');
}

// ── Template grid ──
export function renderTemplateGrid(templates) {
  $('tplGrid').innerHTML = templates.map(
    (t, i) =>
      `<div class="tpl-card" onclick="QF.useTpl(${i})"><div class="tpl-icon">${t.icon}</div><div class="tpl-name">${esc(t.name)}</div><div class="tpl-desc">${esc(t.desc)}</div></div>`
  ).join('');
}

// ── Logo handling ──
export function handleLogo(e, onLogoChange) {
  const file = e.target.files[0];
  if (!file) return;
  const r = new FileReader();
  r.onload = (ev) => {
    const img = new Image();
    img.onload = () => {
      onLogoChange(img);
      
      try {
        const c = document.createElement('canvas');
        c.width = 50; c.height = 50;
        const actx = c.getContext('2d', { willReadFrequently: true });
        actx.drawImage(img, 0, 0, 50, 50);
        const dat = actx.getImageData(0,0,50,50).data;
        let R=0, G=0, B=0, cnt=0;
        for(let j=0; j<dat.length; j+=4) {
          if(dat[j+3] >= 128) { R+=dat[j]; G+=dat[j+1]; B+=dat[j+2]; cnt++; }
        }
        if (cnt > 0) {
          const hex = '#' + [Math.round(R/cnt), Math.round(G/cnt), Math.round(B/cnt)]
            .map(x=>x.toString(16).padStart(2,'0')).join('');
          const fgInp = document.getElementById('fgC');
          const fgTyp = document.getElementById('fgType');
          if (fgInp && fgTyp && window.QF) {
            fgInp.value = hex;
            fgTyp.value = 'solid';
            window.QF.S.fgType = 'solid';
            window.QF.updClr();
          }
        }
      } catch (err) { console.log('Branding extraction skipped', err); }

      $('logoImg').src = ev.target.result;
      $('logoNm').textContent = file.name;
      $('logoSz').textContent = `${img.width}x${img.height}`;
      $('upTxt').style.display = 'none';
      $('logoPrev').classList.add('vis');
      $('logoDZ').classList.add('has');
      $('logoWarn').style.display = 'block';
    };
    img.src = ev.target.result;
  };
  r.readAsDataURL(file);
}

export function rmLogo(e, onLogoChange) {
  e.stopPropagation();
  onLogoChange(null);
  $('logoIn').value = '';
  $('upTxt').style.display = 'block';
  $('logoPrev').classList.remove('vis');
  $('logoDZ').classList.remove('has');
  $('logoWarn').style.display = 'none';
}

// ── Preview rendering ──
export function showPreview(state, data, canvas, logoImg) {
  // Import renderQR dynamically to avoid circular deps
  import('./qr-engine.js').then(({ renderQR }) => {
    const text = state.frameStyle !== 'none' ? ($('frameTxt').value.trim() || 'SCAN ME') : null;
    try {
      renderQR(data, canvas, 256, state.fgType, state.fg, state.fg2, state.bg, state.dot, state.eye, state.ecl, state.margin, logoImg, state.frameStyle, text);
      $('qrFrame').style.background = state.frameStyle === 'none' ? state.bg : '#f0f0f0';
      $('prevEmpty').style.display = 'none';
      $('prevLive').classList.add('vis');

      $('qrMeta').innerHTML = `<b>${esc(state.type.toUpperCase())}</b> // 256px preview // ECL-${esc(state.ecl)} // ${esc(state.dot)}${logoImg ? ' +logo' : ''}${state.frameStyle !== 'none' ? ' +frame' : ''}<br>${data.length.toLocaleString()} chars`;
    } catch {
      // Data too long for this ECL — silently ignore in preview
    }
  });
}
