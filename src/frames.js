// Frame Definitions for QR Forge Pro

export const FRAMES = [
  {
    id: 'none',
    label: 'No Frame',
    renderCanvas: null,
    renderSVG: null
  },
  {
    id: 'bottom',
    label: 'Standard Bottom Text',
    renderCanvas: (c, size, bg, fg, txt) => {
      const fh = Math.round(size * 0.10);
      c.fillStyle = fg;
      c.fillRect(0, size, size, fh);
      c.fillStyle = bg;
      c.font = `bold ${Math.round(fh * 0.5)}px "Space Grotesk",sans-serif`;
      c.textAlign = 'center';
      c.textBaseline = 'middle';
      c.fillText(txt || 'SCAN ME', size / 2, size + fh / 2);
    },
    renderSVG: (size, bg, fg, txt, esc) => {
      const fh = Math.round(size * 0.10);
      return `<rect x="0" y="${size}" width="${size}" height="${fh}" fill="${esc(fg)}"/><text x="${size / 2}" y="${size + fh / 2}" fill="${esc(bg)}" font-family="Space Grotesk,sans-serif" font-weight="bold" font-size="${Math.round(fh * 0.5)}" text-anchor="middle" dominant-baseline="central">${esc(txt || 'SCAN ME')}</text>`;
    },
    heightOffset: 0.10, // Adds 10% to height
  },
  {
    id: 'polaroid',
    label: 'Polaroid style',
    // We will draw a white background, the QR code in the middle, and text below it.
    // The frame expands the total size.
    // Let's implement these frame logic in qr-engine.js directly to avoid circular complexity.
    heightOffset: 0.25,
  }
];
