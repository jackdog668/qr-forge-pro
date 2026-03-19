// Storage utilities: localStorage wrapper, validation, helpers

import { VD, VE, VT } from './templates.js';

// ── Helpers ──
export function esc(s) {
  if (typeof s !== 'string') s = String(s || '');
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

export function isHex(v) {
  return typeof v === 'string' && /^#[0-9a-fA-F]{6}$/.test(v);
}

// ── Storage (localStorage-backed) ──
export const DB = {
  get(k) {
    try {
      const raw = localStorage.getItem(k);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },
  set(k, v) {
    try {
      localStorage.setItem(k, JSON.stringify(v));
      return true;
    } catch {
      return false;
    }
  },
};

// ── Library entry validation ──
export function valLib(e) {
  if (!e || typeof e !== 'object' || typeof e.id !== 'string' || typeof e.data !== 'string') return null;
  return {
    id: e.id.replace(/[^a-z0-9]/gi, '').slice(0, 20),
    name: (typeof e.name === 'string' ? e.name : 'Untitled').slice(0, 100),
    data: e.data.slice(0, 5000),
    type: VT.includes(e.type) ? e.type : 'text',
    fg: isHex(e.fg) ? e.fg : '#000000',
    bg: isHex(e.bg) ? e.bg : '#FFFFFF',
    dot: VD.includes(e.dot) ? e.dot : 'square',
    ecl: VE.includes(e.ecl) ? e.ecl : 'M',
    margin: [1, 2, 4].includes(e.margin) ? e.margin : 2,
    frame: typeof e.frame === 'string' ? e.frame.slice(0, 50) : null,
    size: [256, 512, 1024, 2048].includes(e.size) ? e.size : 512,
    thumb: typeof e.thumb === 'string' && e.thumb.startsWith('data:image/') ? e.thumb : '',
    fav: e.fav === true,
    created: typeof e.created === 'string' ? e.created : new Date().toISOString(),
  };
}

// ── Preset validation ──
export function valPre(p) {
  if (!p || typeof p !== 'object' || typeof p.id !== 'string') return null;
  return {
    id: p.id.replace(/[^a-z0-9]/gi, '').slice(0, 20),
    name: (typeof p.name === 'string' ? p.name : 'Untitled').slice(0, 50),
    fg: isHex(p.fg) ? p.fg : '#000000',
    bg: isHex(p.bg) ? p.bg : '#FFFFFF',
    dot: VD.includes(p.dot) ? p.dot : 'square',
    ecl: VE.includes(p.ecl) ? p.ecl : 'M',
    margin: [1, 2, 4].includes(p.margin) ? p.margin : 2,
    created: typeof p.created === 'string' ? p.created : new Date().toISOString(),
  };
}
