// Bulk generation module

import { renderQR } from './qr-engine.js';
import { toast } from './ui.js';
import { state } from './main.js';

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
