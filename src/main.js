// Main entry point — event wiring, state, PWA, keyboard shortcuts
import './styles/main.css';

import { TYPES, TEMPLATES, VD, VE, VT } from './templates.js';
import { DB, esc, valLib, valPre } from './storage.js';
import { renderQR, buildData, generateSVG } from './qr-engine.js';
import {
  toast, goTo, closeModal,
  initTheme, toggleTheme,
  renderForm, renderTypeChips, renderDotGrid, renderEclRow,
  updClr, toggleFrame, togglePw, setDotUI, setEclUI,
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

const $ = (id) => document.getElementById(id);

// ── Shared state ──
export const state = {
  type: 'url',
  fg: '#000000',
  bg: '#FFFFFF',
  dot: 'square',
  ecl: 'M',
  size: 512,
  margin: 2,
  frame: false,
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

// ── Frame toggle wrapper ──
function handleToggleFrame() {
  toggleFrame(state);
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

// ── Generate full-size render ──
function generate() {
  const data = buildData(state.type);
  if (!data) {
    toast('Enter some content first');
    return;
  }
  const frame = state.frame ? ($('frameTxt').value.trim() || null) : null;
  try {
    const cvs = $('qr-canvas');
    renderQR(data, cvs, state.size, state.fg, state.bg, state.dot, state.ecl, state.margin, logoImg, frame);
    $('qrFrame').style.background = state.bg;
    $('qrMeta').innerHTML =
      `<b>${esc(state.type.toUpperCase())}</b> // ${state.size}px // ECL-${esc(state.ecl)} // ${esc(state.dot)}${logoImg ? ' +logo' : ''}${frame ? ' +frame' : ''}<br>${data.length.toLocaleString()} chars`;
    $('prevCard').style.display = 'block';
    lastRender = { data, size: state.size, fg: state.fg, bg: state.bg, dot: state.dot, ecl: state.ecl, margin: state.margin, frame, type: state.type };
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
  const svg = generateSVG(lastRender.data, lastRender.size, lastRender.fg, lastRender.bg, lastRender.dot, lastRender.ecl, lastRender.margin, lastRender.frame);
  const blob = new Blob([svg], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.download = `qr-${Date.now()}.svg`;
  a.href = url;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
  toast('SVG downloaded');
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
      await navigator.share({ files: [file], title: 'QR Code', text: 'Generated with QR Forge Pro' });
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
  toggleFrame: handleToggleFrame,
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
};

boot();
