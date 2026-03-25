// Main entry point — event wiring, state, PWA, keyboard shortcuts
import './styles/main.css';

import { TYPES, TEMPLATES, VD, VE, VT } from './templates.js';
import { DB, esc, valLib, valPre } from './storage.js';
import { renderQR, buildData, generateSVG } from './qr-engine.js';
import {
  toast, goTo, closeModal,
  initTheme, toggleTheme,
  renderForm, renderTypeChips, renderDotGrid, renderEclRow,
  updClr, handleFrameUI as uiHandleFrameUI, togglePw, setDotUI, setEclUI,
  showKB, closeKB,
  renderTemplateGrid, handleLogo, rmLogo,
} from './ui.js';
import {
  loadData, library, presets,
  saveToLib, renderLib, setFilter, cardClick, togFav,
  toggleBatch, batchDelete, batchDownload, exportLib, importLib,
  openDetail, modDL, delItem,
  savePreset, renderPresets, applyPreset, delPreset,
} from './library.js';
import { toggleScan, stopScan } from './scanner.js';
import { genBulk } from './bulk.js';

window.vcardPhotoData = '';

const $ = (id) => document.getElementById(id);

// ── Shared state ──
export const state = {
  type: 'url',
  fgType: 'solid',
  fg: '#000000',
  fg2: '#000000',
  bg: '#FFFFFF',
  bgTrans: false,
  dot: 'square',
  eye: 'square',
  ecl: 'M',
  size: 512,
  margin: 2,
  frameStyle: 'none',
  frameTxt: 'SCAN ME',
};

let logoImg = null;
let lastRender = null;
let deferredPrompt = null;
let previewTimer = null;

export function getLogoImg() { return logoImg; }

// ── onInput is a no-op now (kept for HTML oninput attrs) ──
function onInput() {}

// ── Type switching ──
function setType(id) {
  if (!VT.includes(id)) return;
  state.type = id;
  renderTypeChips(state);
  renderForm(state, onInput);
}

// ── Dot / ECL ──
function setDot(id) {
  if (!VD.includes(id)) return;
  state.dot = id;
  setDotUI(id);
}
function setEcl(id) {
  if (!VE.includes(id)) return;
  state.ecl = id;
  setEclUI(id);
}

// ── Color update wrapper ──
function handleUpdClr() {
  updClr(state);
}

// ── Frame UI ──
function handleFrameUILocal() {
  uiHandleFrameUI(state);
}

// ── Template usage ──
function useTpl(i) {
  const t = TEMPLATES[i];
  setType(t.type);
  if (t.prefill) {
    Object.entries(t.prefill).forEach(([k, v]) => {
      const el = $('f-' + k);
      if (el) el.value = v;
    });
  }
}

// ── Logo handling wrappers ──
function handleLogoInput(e) {
  handleLogo(e, (img) => {
    logoImg = img;
    });
}
function handleRmLogo(e) {
  rmLogo(e, (img) => {
    logoImg = img;
    });
}

function handleFileInput(e, id) {
  const file = e.target.files[0];
  if (!file) {
    if (id === 'vc-photo') window.vcardPhotoData = '';
    return;
  }
  const img = new Image();
  const url = URL.createObjectURL(file);
  img.onload = () => {
    URL.revokeObjectURL(url);
    const cvs = document.createElement('canvas');
    const maxSize = 96;
    let w = img.width;
    let h = img.height;
    if (w > h && w > maxSize) { h *= maxSize / w; w = maxSize; }
    else if (h >= w && h > maxSize) { w *= maxSize / h; h = maxSize; }
    cvs.width = w; cvs.height = h;
    const ctx = cvs.getContext('2d');
    ctx.drawImage(img, 0, 0, w, h);
    if (id === 'vc-photo') {
      window.vcardPhotoData = cvs.toDataURL('image/jpeg', 0.6).split(',')[1];
      generate();
    }
  };
  img.src = url;
}

// ── Generate full-size render ──
function generate() {
  const data = buildData(state.type);
  if (!data) {
    toast('Enter some content first');
    return;
  }
    const text = state.frameStyle !== 'none' ? ($('frameTxt').value.trim() || 'SCAN ME') : null;
    try {
      const cvs = $('qr-canvas');
      const actualBg = state.bgTrans ? 'transparent' : state.bg;
      renderQR(data, cvs, state.size, state.fgType, state.fg, state.fg2, actualBg, state.dot, state.eye, state.ecl, state.margin, logoImg, state.frameStyle, text);
      $('qrFrame').style.background = state.frameStyle === 'none' ? state.bg : '#f0f0f0'; // reset preview bg
      $('qrMeta').innerHTML =
        `<b>${esc(state.type.toUpperCase())}</b> // ${state.size}px // ECL-${esc(state.ecl)} // ${esc(state.dot)}${logoImg ? ' +logo' : ''}${state.frameStyle !== 'none' ? ' +frame' : ''}<br>${data.length.toLocaleString()} chars`;
      $('prevCard').style.display = 'block';
      lastRender = { data, size: state.size, fgType: state.fgType, fg: state.fg, fg2: state.fg2, bg: state.bg, bgTrans: state.bgTrans, dot: state.dot, eye: state.eye, ecl: state.ecl, margin: state.margin, frameStyle: state.frameStyle, type: state.type, text };
      
      const inputs = {};
      document.querySelectorAll('#formArea input, #formArea select, #formArea textarea').forEach(el => {
          if(el.id) inputs[el.id] = el.value;
      });
      lastRender.inputs = inputs;
      
      import('./library.js').then(l => l.saveToHistory(lastRender));
      
      const bw = $('btnWifi');
      if (bw) bw.style.display = state.type === 'wifi' ? 'flex' : 'none';
    $('saveName').value = '';
    toast('QR code generated!');
    // Scroll to the output
    $('prevCard').scrollIntoView({ behavior: 'smooth', block: 'start' });
  } catch {
    toast('Error: data too long for this ECL level');
  }
}

// ── Downloads ──
function dlPNG() {
  ensureFullRender();
  if (!lastRender) return;
  const a = document.createElement('a');
  a.download = `qr-${Date.now()}.png`;
  a.href = $('qr-canvas').toDataURL('image/png');
  a.click();
  toast('PNG downloaded');
}

function dlJPG() {
  ensureFullRender();
  if (!lastRender) return;
  const a = document.createElement('a');
  a.download = `qr-${Date.now()}.jpg`;
  a.href = $('qr-canvas').toDataURL('image/jpeg', 0.95);
  a.click();
  toast('JPG downloaded');
}

function dlSVG() {
  ensureFullRender();
  if (!lastRender) return;
  const actualBg = lastRender.bgTrans ? 'transparent' : lastRender.bg;
  const svg = generateSVG(lastRender.data, lastRender.size, lastRender.fgType, lastRender.fg, lastRender.fg2, actualBg, lastRender.dot, lastRender.eye, lastRender.ecl, lastRender.margin, lastRender.frameStyle, lastRender.text, !!logoImg);
  const blob = new Blob([svg], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.download = `qr-${Date.now()}.svg`;
  a.href = url;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
  toast('SVG downloaded');
}

function printQR() {
  ensureFullRender();
  if (!lastRender) return;
  import('./qr-engine.js').then(({ generateSVG }) => {
    const actualBg = lastRender.bgTrans ? 'transparent' : lastRender.bg;
    const svg = generateSVG(lastRender.data, lastRender.size, lastRender.fgType, lastRender.fg, lastRender.fg2, actualBg, lastRender.dot, lastRender.eye, lastRender.ecl, lastRender.margin, lastRender.frameStyle, lastRender.text);
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast('Popup blocked! Allow popups to print.');
      return;
    }
    printWindow.document.write(`<!DOCTYPE html><html><head><title>Print High-Res QR</title><style>@page{size:auto;margin:0}body{margin:0;padding:2cm;display:flex;justify-content:center;align-items:flex-start;min-height:100vh;box-sizing:border-box;font-family:sans-serif}.wrap{text-align:center}svg{max-width:100%;height:auto;display:block;margin:0 auto;box-shadow:0 4px 12px rgba(0,0,0,0.1)}@media print{svg{box-shadow:none;max-height:90vh}}.instruction{color:#666;margin-top:2rem}@media print{.instruction{display:none}}</style></head><body><div class="wrap">${svg}<div class="instruction">Press Ctrl+P / Cmd+P to print or save as PDF</div></div><script>setTimeout(()=>{window.print();},500);</script></body></html>`);
    printWindow.document.close();
  });
}

function printWifi() {
  ensureFullRender();
  if (!lastRender || state.type !== 'wifi') return;
  const ssid = document.getElementById('f-wifi-ssid')?.value || 'Guest';
  const pass = document.getElementById('f-wifi-pass')?.value || 'None';
  import('./qr-engine.js').then(({ generateSVG }) => {
    const actualBg = lastRender.bgTrans ? 'transparent' : lastRender.bg;
    const svg = generateSVG(lastRender.data, lastRender.size, lastRender.fgType, lastRender.fg, lastRender.fg2, actualBg, lastRender.dot, lastRender.eye, lastRender.ecl, lastRender.margin, 'none', '', !!logoImg);
    const printWindow = window.open('', '_blank');
    if (!printWindow) return toast('Popup blocked!');
    printWindow.document.write(`
      <!DOCTYPE html><html><head><title>Wi-Fi Tent Card</title>
      <style>
        @page { size: landscape; margin: 0; }
        body { margin: 0; font-family: sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; background: #fff; text-align: center; }
        .card { width: 20cm; height: 10cm; border: 2px dashed #ccc; display: flex; align-items: center; justify-content: center; page-break-inside: avoid; gap: 3cm; text-align: left; position: relative; }
        .fold-line { position: absolute; left: 0; right: 0; top: 50%; border-top: 1px dotted #999; }
        .info { max-width: 50%; }
        .info h1 { font-size: 3rem; margin: 0 0 10px; color: #111; }
        .info h2 { font-size: 1.5rem; margin: 0 0 20px; color: #666; font-weight: 500; }
        .info p { font-size: 1.5rem; color: #000; margin: 5px 0; font-family: monospace; background: #eee; padding: 10px; border-radius: 8px; }
        .qr-wrap { width: 7cm; height: 7cm; }
        svg { width: 100%; height: 100%; }
        @media print { .card { border: none; } .instruction, .fold-line { display: none; } body { padding: 0; margin: 0; } }
      </style>
      </head><body>
        <div class="card">
          <div class="fold-line"></div>
          <div class="info">
            <h1>Guest Wi-Fi</h1>
            <h2>Scan to connect instantly</h2>
            <p><strong>SSID:</strong> ${ssid}</p>
            <p><strong>PASS:</strong> ${pass}</p>
          </div>
          <div class="qr-wrap">${svg}</div>
        </div>
        <div class="instruction">Cut along dashed line, fold in half like a tent. Cmd+P to print.</div>
        <script>setTimeout(()=>{window.print();},500);</script>
      </body></html>
    `);
    printWindow.document.close();
  });
}

function ensureFullRender() {
  const data = buildData(state.type);
  if (!data) return;
  if (!lastRender || lastRender.data !== data || lastRender.size !== state.size) {
    generate();
  }
}

// ── Copy + Share ──
async function copyQR() {
  ensureFullRender();
  if (!lastRender) return;
  try {
    const blob = await new Promise((r) => $('qr-canvas').toBlob(r, 'image/png'));
    await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
    toast('Copied!');
  } catch {
    toast('Copy failed');
  }
}

async function shareQR() {
  ensureFullRender();
  if (!lastRender) return;
  try {
    const blob = await new Promise((r) => $('qr-canvas').toBlob(r, 'image/png'));
    const file = new File([blob], 'qr-code.png', { type: 'image/png' });
    if (navigator.canShare?.({ files: [file] })) {
      await navigator.share({ files: [file], title: 'QR Code', text: 'Generated with QrCody' });
      toast('Shared!');
    } else {
      await copyQR();
    }
  } catch {
    await copyQR();
  }
}

// ── Save to library wrapper ──
function handleSaveToLib() {
  ensureFullRender();
  saveToLib(lastRender);
}

// ── Navigation wrapper ──
function handleGoTo(pg) {
  goTo(pg, (page) => {
    if (page !== 'scan' && typeof stopScan === 'function') stopScan();
    if (page === 'library') renderLib();
    if (page === 'presets') renderPresets();
  });
}

// ── PWA ──
function installPWA() {
  if (deferredPrompt) {
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then(() => {
      deferredPrompt = null;
      $('pwaBanner').classList.remove('vis');
    });
  }
}
function dismissPWA() {
  $('pwaBanner').classList.remove('vis');
}

// ── Boot ──
function boot() {
  // Init theme
  initTheme();

  // Load library data
  loadData();

  // Render UI
  renderTemplateGrid(TEMPLATES);
  renderTypeChips(state);
  renderForm(state, onInput);
  renderDotGrid(state);
  renderEclRow(state);
  updClr(state);

  // Hide loading, show create page
  $('appLoading').style.display = 'none';
  $('pg-create').classList.add('active');

  // Drag-drop logo
  const dz = $('logoDZ');
  dz.addEventListener('dragover', (e) => {
    e.preventDefault();
    dz.style.borderColor = 'var(--grn)';
  });
  dz.addEventListener('dragleave', () => {
    dz.style.borderColor = '';
  });
  dz.addEventListener('drop', (e) => {
    e.preventDefault();
    dz.style.borderColor = '';
    if (e.dataTransfer.files.length) {
      $('logoIn').files = e.dataTransfer.files;
      handleLogoInput({ target: { files: e.dataTransfer.files } });
    }
  });

  // Keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    if (e.key === '?' && !e.ctrlKey && !e.metaKey && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
      e.preventDefault();
      showKB();
      return;
    }
    if (e.key === 'Escape') { closeModal(); closeKB(); return; }
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') { e.preventDefault(); generate(); return; }
    if ((e.metaKey || e.ctrlKey) && e.key === 's') { e.preventDefault(); handleSaveToLib(); return; }
    if (!e.ctrlKey && !e.metaKey && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
      if (e.key === '1') handleGoTo('create');
      if (e.key === '2') handleGoTo('library');
      if (e.key === '3') handleGoTo('scan');
      if (e.key === '4') handleGoTo('presets');
      if (e.key === '5') handleGoTo('bulk');
    }
  });

  // PWA
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  }
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    $('pwaBanner').classList.add('vis');
  });

  // Offline indicator
  window.addEventListener('online', () => $('offlineBar').classList.remove('vis'));
  window.addEventListener('offline', () => $('offlineBar').classList.add('vis'));
  if (!navigator.onLine) $('offlineBar').classList.add('vis');
}

// ── Public API (exposed to HTML onclick handlers) ──
window.QF = {
  S: state,
  setType,
  setDot,
  setEcl,
  updClr: handleUpdClr,
  handleFrameUI: handleFrameUILocal,
  togglePw,
  handleLogo: handleLogoInput,
  rmLogo: handleRmLogo,
  onInput,
  generate,
  saveToLib: handleSaveToLib,
  dlPNG,
  dlSVG,
  dlJPG,
  copyQR,
  shareQR,
  renderLib,
  setFilter,
  cardClick,
  togFav,
  openDetail,
  closeModal,
  modDL,
  delItem,
  savePreset,
  renderPresets,
  applyPreset,
  delPreset,
  genBulk,
  goTo: handleGoTo,
  toast,
  useTpl,
  toggleBatch,
  batchDelete,
  batchDownload,
  exportLib,
  importLib,
  toggleScan,
  showKB,
  closeKB,
  installPWA,
  dismissPWA,
  toggleTheme,
  printQR,
  printWifi,
  handleFileInput,
  handleCSV: async (e) => {
    const { handleCSV } = await import('./bulk.js');
    handleCSV(e);
  },
  handleRemix: async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const img = new Image();
    img.onload = () => {
      const c = document.createElement('canvas');
      const ctx = c.getContext('2d');
      // jsQR likes smaller constraints, but we can pass raw
      const max = 1000;
      let w = img.width; let h = img.height;
      if (w > max || h > max) {
        const ratio = Math.min(max/w, max/h);
        w *= ratio; h *= ratio;
      }
      c.width = w; c.height = h;
      ctx.drawImage(img, 0, 0, w, h);
      const imgData = ctx.getImageData(0, 0, c.width, c.height);
      const code = window.jsQR(imgData.data, imgData.width, imgData.height);
      if (code && code.data) {
        toast('QR Code Decoded!');
        const textChip = document.querySelector(`.chip[data-t="text"]`);
        if (textChip) textChip.click();
        setTimeout(() => {
          const txtEl = document.getElementById('f-text');
          if (txtEl) {
            txtEl.value = code.data;
            generate();
          }
        }, 50);
      } else {
        toast('No QR code found in image');
      }
      e.target.value = '';
    };
    img.src = URL.createObjectURL(file);
  },
  useMyLoc: () => {
    if (!navigator.geolocation) return toast('Geolocation not supported by your browser');
    toast('Locating satellite...');
    navigator.geolocation.getCurrentPosition(p => {
      const lat = document.getElementById('f-geo-lat');
      const lng = document.getElementById('f-geo-lng');
      if (lat && lng) {
        lat.value = p.coords.latitude.toFixed(6);
        lng.value = p.coords.longitude.toFixed(6);
        toast('Location updated!');
        window.QF.onInput && window.QF.onInput();
      }
    }, err => {
      console.error(err);
      toast('Failed to get location');
    }, { enableHighAccuracy: true });
  }
};

boot();
