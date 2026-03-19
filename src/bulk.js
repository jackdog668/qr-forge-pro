// Bulk generation module

import { renderQR } from './qr-engine.js';
import { toast } from './ui.js';
import { state, getLogoImg } from './main.js';

const $ = (id) => document.getElementById(id);

export function genBulk() {
  const input = $('bulkIn').value.trim();
  if (!input) return;
  let lines = input.split('\n').map((l) => l.trim()).filter((l) => l);
  if (lines.length > 100) {
    lines = lines.slice(0, 100);
    toast('Capped at 100');
  }
  const container = $('bulkRes');
  container.innerHTML = '';
  let count = 0;
  const bs = Math.min(state.size, 512);

  lines.forEach((line, i) => {
    const card = document.createElement('div');
    card.className = 'bulk-item';
    const c = document.createElement('canvas');
    try {
      renderQR(line, c, bs, state.fg, state.bg, state.dot, state.ecl, state.margin, null, null);
    } catch {
      return;
    }
    count++;
    const lbl = document.createElement('div');
    lbl.className = 'bulk-lbl';
    lbl.textContent = line.length > 22 ? line.slice(0, 22) + '...' : line;
    const dl = document.createElement('button');
    dl.className = 'bulk-dl';
    dl.textContent = 'Download';
    dl.onclick = () => {
      const a = document.createElement('a');
      a.download = `qr-bulk-${i + 1}.png`;
      a.href = c.toDataURL('image/png');
      a.click();
    };
    card.appendChild(c);
    card.appendChild(lbl);
    card.appendChild(dl);
    container.appendChild(card);
  });
  toast(`${count} codes generated`);
}

export async function handleCSV(e) {
  const file = e.target.files[0];
  if (!file) return;
  const text = await file.text();
  const lines = text.split('\n').map(l => l.trim()).filter(l => l);
  if (!lines.length) return toast('Empty CSV');

  toast(`Processing ${lines.length} QR codes...`);

  if (typeof JSZip === 'undefined') {
    return toast('JSZip library not loaded');
  }

  const zip = new JSZip();
  const folder = zip.folder("QR_Forge_Export");
  
  const bs = Math.max(state.size, 512); 
  let valid = 0;
  
  const c = document.createElement('canvas');
  const logo = getLogoImg();
  const textTitle = state.frameStyle !== 'none' ? (document.getElementById('frameTxt').value.trim() || 'SCAN ME') : null;

  for (let i = 0; i < lines.length; i++) {
    // Basic CSV split parser (handles simple commas, but not quoted commas)
    // To be perfectly robust for simple needs, we map first to data, second to name
    // e.g: "https://example.com, my-code"
    const row = lines[i];
    let data = row;
    let name = `qr_${i+1}`;

    const firstComma = row.indexOf(',');
    if (firstComma !== -1) {
      data = row.slice(0, firstComma).trim();
      const col2 = row.slice(firstComma + 1).trim();
      if (col2) name = col2.replace(/[^a-z0-9_-]/gi, '_');
    }

    if (!data) continue;

    try {
      renderQR(data, c, bs, state.fgType, state.fg, state.fg2, state.bg, state.dot, state.eye, state.ecl, state.margin, logo, state.frameStyle, textTitle);
      const b64 = c.toDataURL('image/png').split(',')[1];
      folder.file(`${name}.png`, b64, { base64: true });
      valid++;
    } catch(err) {
      console.warn('Skipping line', i+1, err);
    }
  }

  toast(`Zipping ${valid} files...`);
  
  const blob = await zip.generateAsync({ type: 'blob' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `qr_export_${Date.now()}.zip`;
  a.click();
  toast('ZIP Downloaded!');
  e.target.value = ''; // reset
}
