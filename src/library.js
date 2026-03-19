// Library module: CRUD, presets, favorites, export/import, batch ops

import { esc, DB, valLib, valPre } from './storage.js';
import { renderQR } from './qr-engine.js';
import { toast, closeModal, goTo } from './ui.js';
import { state, getLogoImg } from './main.js';

const $ = (id) => document.getElementById(id);

export let library = [];
export let presets = [];
let libFilter = 'all';
let saveLock = false;
let batchMode = false;
let selected = new Set();

// ── Init ──
export function loadData() {
  const rawLib = DB.get('qr-library');
  if (Array.isArray(rawLib)) library = rawLib.map(valLib).filter(Boolean);
  const rawPre = DB.get('qr-presets');
  if (Array.isArray(rawPre)) presets = rawPre.map(valPre).filter(Boolean);
}

// ── Save to library ──
export function saveToLib(lastRender) {
  if (!lastRender || saveLock) return;
  saveLock = true;
  const saveBtn = $('saveBtn');
  if (saveBtn) saveBtn.disabled = true;

  const name = $('saveName').value.trim() || `QR ${new Date().toLocaleDateString()}`;
  if (library.some((i) => i.data === lastRender.data && i.name === name)) {
    toast('Already saved');
    setTimeout(() => { saveLock = false; if (saveBtn) saveBtn.disabled = false; }, 1000);
    return;
  }

  const tc = document.createElement('canvas');
  renderQR(lastRender.data, tc, 200, lastRender.fg, lastRender.bg, lastRender.dot, lastRender.ecl, lastRender.margin || 2, null, null);

  const entry = valLib({
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    name,
    data: lastRender.data,
    type: lastRender.type || state.type,
    fg: lastRender.fg,
    bg: lastRender.bg,
    dot: lastRender.dot,
    ecl: lastRender.ecl,
    margin: lastRender.margin,
    frame: lastRender.frame,
    size: lastRender.size,
    thumb: tc.toDataURL('image/png'),
    fav: false,
    created: new Date().toISOString(),
  });

  if (!entry) {
    toast('Save failed');
    saveLock = false;
    if (saveBtn) saveBtn.disabled = false;
    return;
  }

  library.unshift(entry);
  DB.set('qr-library', library);
  toast(`Saved "${name}"`);
  setTimeout(() => { saveLock = false; if (saveBtn) saveBtn.disabled = false; }, 1500);
}

// ── Render library grid ──
export function renderLib() {
  const search = ($('libSearch')?.value || '').toLowerCase();
  let items = library;
  if (libFilter === 'fav') items = items.filter((i) => i.fav);
  else if (libFilter !== 'all') items = items.filter((i) => i.type === libFilter);
  if (search) items = items.filter((i) => i.name.toLowerCase().includes(search) || i.data.toLowerCase().includes(search));

  $('libStats').innerHTML = `<div class="lib-stat"><div class="sv">${library.length}</div><div class="sl">Total</div></div><div class="lib-stat"><div class="sv">${library.filter((i) => i.fav).length}</div><div class="sl">Favs</div></div><div class="lib-stat"><div class="sv">${new Set(library.map((i) => i.type)).size}</div><div class="sl">Types</div></div>`;

  const types = ['all', 'fav', ...new Set(library.map((i) => i.type))];
  $('libFilters').innerHTML = types.map((t) => `<button class="lib-filt${t === libFilter ? ' on' : ''}" onclick="QF.setFilter('${esc(t)}')">${t === 'all' ? 'All' : t === 'fav' ? '\u2B50 Favs' : esc(t.toUpperCase())}</button>`).join('');

  if (!items.length) {
    $('libGrid').innerHTML = `<div class="lib-empty"><div class="lib-empty-icon">\u{1F4E6}</div><div class="lib-empty-text">${library.length === 0 ? 'No saved QR codes yet' : 'No matches'}</div><div class="lib-empty-sub">${library.length === 0 ? 'Generate and save from Create tab' : 'Try different search'}</div></div>`;
    return;
  }

  const bm = batchMode ? 'batch-mode' : '';
  $('libGrid').innerHTML = `<div class="lib-grid ${bm}">${items.map((i) => `<div class="lib-card${selected.has(i.id) ? ' selected' : ''}" onclick="QF.cardClick('${esc(i.id)}')"><div class="lib-card-thumb"><img src="${esc(i.thumb)}" alt="${esc(i.name)}"><button class="lib-card-fav${i.fav ? ' faved' : ''}" onclick="event.stopPropagation();QF.togFav('${esc(i.id)}')">${i.fav ? '\u2605' : '\u2606'}</button><div class="lib-card-sel">\u2713</div></div><div class="lib-card-body"><div class="lib-card-name">${esc(i.name)}</div><div class="lib-card-type">${esc(i.type)}</div></div></div>`).join('')}</div>`;
}

export function setFilter(f) { libFilter = f; renderLib(); }

export function cardClick(id) {
  if (batchMode) {
    if (selected.has(id)) selected.delete(id);
    else selected.add(id);
    renderLib();
  } else {
    openDetail(id);
  }
}

export function togFav(id) {
  const item = library.find((i) => i.id === id);
  if (item) {
    item.fav = !item.fav;
    DB.set('qr-library', library);
    renderLib();
  }
}

// ── Batch ops ──
export function toggleBatch() {
  batchMode = !batchMode;
  selected.clear();
  $('batchBtn').innerHTML = batchMode ? '&#x2612; Cancel' : '&#x2610; Select';
  $('batchDelBtn').style.display = batchMode ? 'inline-flex' : 'none';
  $('batchDlBtn').style.display = batchMode ? 'inline-flex' : 'none';
  renderLib();
}

export function batchDelete() {
  if (!selected.size) return;
  const count = selected.size;
  const removed = library.filter((i) => selected.has(i.id));
  library = library.filter((i) => !selected.has(i.id));
  selected.clear();
  DB.set('qr-library', library);
  renderLib();
  toast(`Deleted ${count} items`, () => {
    library = [...removed, ...library];
    DB.set('qr-library', library);
    renderLib();
  });
}

export function batchDownload() {
  if (!selected.size) return;
  library.filter((i) => selected.has(i.id)).forEach((item, idx) => {
    const c = document.createElement('canvas');
    try {
      renderQR(item.data, c, item.size || 512, item.fg, item.bg, item.dot, item.ecl, item.margin || 2, null, null);
    } catch { return; }
    setTimeout(() => {
      const a = document.createElement('a');
      a.download = `${item.name.replace(/[^a-zA-Z0-9]/g, '_')}.png`;
      a.href = c.toDataURL('image/png');
      a.click();
    }, idx * 200);
  });
  toast(`Downloading ${selected.size} files`);
}

// ── Export/Import ──
export function exportLib() {
  if (!library.length) { toast('Nothing to export'); return; }
  const blob = new Blob([JSON.stringify(library, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.download = `qr-forge-library-${new Date().toISOString().slice(0, 10)}.json`;
  a.href = URL.createObjectURL(blob);
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 5000);
  toast(`Exported ${library.length} codes`);
}

export function importLib(e) {
  const file = e.target.files[0];
  if (!file) return;
  file.text().then((text) => {
    try {
      const data = JSON.parse(text);
      if (!Array.isArray(data)) { toast('Invalid file'); return; }
      const valid = data.map(valLib).filter(Boolean);
      const newIds = new Set(library.map((i) => i.id));
      const added = valid.filter((v) => !newIds.has(v.id));
      library = [...added, ...library];
      DB.set('qr-library', library);
      renderLib();
      toast(`Imported ${added.length} new codes`);
    } catch {
      toast('Import failed: invalid JSON');
    }
  });
  e.target.value = '';
}

// ── Detail modal ──
export function openDetail(id) {
  const item = library.find((i) => i.id === id);
  if (!item) return;
  const cvs = document.createElement('canvas');
  try { renderQR(item.data, cvs, 300, item.fg, item.bg, item.dot, item.ecl, item.margin || 2, null, null); } catch {}

  $('modal').innerHTML = `<button class="modal-close" onclick="QF.closeModal()">&times;</button><div class="modal-qr"><canvas id="mcvs"></canvas></div><div class="modal-name">${esc(item.name)}</div><div class="modal-type">${esc(item.type)}</div><div class="modal-data">${esc(item.data)}</div><div class="modal-date">${esc(new Date(item.created).toLocaleString())}</div><div class="modal-actions"><button class="btn-s" onclick="QF.modDL('${esc(item.id)}','png')">PNG</button><button class="btn-s" onclick="QF.modDL('${esc(item.id)}','jpg')">JPG</button><button class="modal-del" onclick="QF.delItem('${esc(item.id)}')">Delete</button></div>`;

  setTimeout(() => {
    const mc = $('mcvs');
    if (mc) { mc.width = cvs.width; mc.height = cvs.height; mc.getContext('2d').drawImage(cvs, 0, 0); }
  }, 50);
  $('modalBg').classList.add('vis');
}

export function modDL(id, fmt) {
  const item = library.find((i) => i.id === id);
  if (!item) return;
  const cvs = document.createElement('canvas');
  renderQR(item.data, cvs, item.size || 512, item.fg, item.bg, item.dot, item.ecl, item.margin || 2, null, item.frame || null);
  const a = document.createElement('a');
  a.download = `${item.name.replace(/[^a-zA-Z0-9]/g, '_')}.${fmt}`;
  a.href = cvs.toDataURL(fmt === 'jpg' ? 'image/jpeg' : 'image/png', 0.95);
  a.click();
  toast(`${fmt.toUpperCase()} downloaded`);
}

export function delItem(id) {
  const item = library.find((i) => i.id === id);
  const idx = library.indexOf(item);
  if (!item) return;
  library = library.filter((i) => i.id !== id);
  DB.set('qr-library', library);
  closeModal();
  renderLib();
  toast('Deleted from library', () => {
    library.splice(idx, 0, item);
    DB.set('qr-library', library);
    renderLib();
  });
}

// ── Presets ──
export function savePreset() {
  const name = prompt('Preset name:', `${state.dot} ${state.fg}`);
  if (!name) return;
  const p = valPre({ id: Date.now().toString(36), name, fg: state.fg, bg: state.bg, dot: state.dot, ecl: state.ecl, margin: state.margin, created: new Date().toISOString() });
  if (!p) return;
  presets.unshift(p);
  DB.set('qr-presets', presets);
  renderPresets();
  toast('Preset saved');
}

export function renderPresets() {
  if (!presets.length) {
    $('presetGrid').innerHTML = '<div class="preset-empty">\u{1F3A8} No presets yet. Save one from Create.</div>';
    return;
  }
  $('presetGrid').innerHTML = `<div class="preset-grid">${presets.map((p) => `<div class="preset-card" onclick="QF.applyPreset('${esc(p.id)}')"><button class="preset-del" onclick="event.stopPropagation();QF.delPreset('${esc(p.id)}')">&times;</button><div class="preset-card-colors"><div class="preset-card-swatch" style="background:${esc(p.fg)}"></div><div class="preset-card-swatch" style="background:${esc(p.bg)}"></div></div><div class="preset-card-name">${esc(p.name)}</div><div class="preset-card-info">${esc(p.dot)} // ECL-${esc(p.ecl)}</div></div>`).join('')}</div>`;
}

export function applyPreset(id) {
  const p = presets.find((x) => x.id === id);
  if (!p) return;
  state.fg = p.fg; state.bg = p.bg; state.dot = p.dot; state.ecl = p.ecl; state.margin = p.margin || 2;
  $('fgC').value = p.fg; $('bgC').value = p.bg;
  import('./ui.js').then(({ updClr, setDotUI, setEclUI }) => {
    updClr(state);
    $('marginS').value = state.margin;
    setDotUI(state.dot);
    setEclUI(state.ecl);
    goTo('create', () => {});
    toast('Preset applied');
  });
}

export function delPreset(id) {
  presets = presets.filter((p) => p.id !== id);
  DB.set('qr-presets', presets);
  renderPresets();
  toast('Deleted');
}
