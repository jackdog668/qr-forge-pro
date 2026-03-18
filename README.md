# QR Forge Pro

**Unlimited QR codes. Zero subscriptions. Never expire.**

A full-featured, security-audited QR code generator that runs entirely client-side. No backend, no tracking, no expiration. Static QR codes encode data directly into the pattern; scan them in 10 years and they still work.

Built by [Digital Alchemy Academy](https://beacons.ai/dbcreations) as a free alternative to $15.99/mo QR code services.

![version](https://img.shields.io/badge/version-1.0.0-40FF78?style=flat-square&labelColor=0A0B0D)
![license](https://img.shields.io/badge/license-MIT-FFDB40?style=flat-square&labelColor=0A0B0D)
![security](https://img.shields.io/badge/security-audited-00C8FF?style=flat-square&labelColor=0A0B0D)

---

## Features

| Feature | Paid Services ($15.99/mo) | QR Forge Pro |
|---|---|---|
| Static QR codes | Unlimited | **Unlimited** |
| Dynamic QR codes | 250 (capped) | N/A (static = never expire) |
| Scans | Unlimited | **Unlimited** (no server) |
| Logo overlay | Paid tiers | **Built in** |
| Dot styles | Basic | **4 styles** |
| Content types | Basic | **8 types** |
| Bulk generation | 500 cap | **100 per batch** |
| Exports | JPG, PNG, SVG, EPS | **PNG, SVG, JPG** |
| Frame labels | Paid | **Built in** |
| Persistent library | Cloud (their server) | **Local storage** |
| Style presets | No | **Yes** |
| Price | $191.88/year | **$0** |

### Content Types

URL, Text, Wi-Fi (auto-connect), Email (mailto with subject/body), Phone (tap-to-call), SMS (pre-filled), vCard (full contact cards), GPS Location

### Style Options

Custom colors, 4 dot styles (Square, Rounded, Dots, Diamond), logo overlay with drag-and-drop, frame labels, 4 error correction levels, sizes from 256px to 2048px (print-ready), adjustable margins

### App Features

- **Library** with search, filter, favorites (persists across sessions)
- **Style Presets** that save and reuse configurations
- **Bulk Generate** up to 100 codes at once
- **Export** as PNG, SVG, JPG, or copy to clipboard
- **Mobile-first** responsive design with bottom tab navigation

---

## Security

Full security audit completed. See [docs/SECURITY-AUDIT.md](docs/SECURITY-AUDIT.md) for the complete report.

**12 findings identified and fixed:**
- 1 Critical (XSS via storage poisoning)
- 2 High (schema validation, CDN SRI)
- 5 Medium (memory leak, bulk cap, SVG escaping, save debounce, logo UX)
- 4 Low (toast race, password visibility, namespace, escape coverage)

### Architecture

- 100% client-side, no backend, no API keys, no tracking
- IIFE-wrapped with single `window.QF` namespace
- Schema-validated storage on every load
- SRI-verified CDN dependency
- Full HTML/XML escaping on all dynamic values

---

## Deploy

### Vercel (recommended)
```bash
git clone https://github.com/jackdog668/qr-forge-pro.git
cd qr-forge-pro
vercel
```

### Any Static Host
Serve the `public/` directory. The entire app is one `index.html`.

```bash
npx serve public
```

### GitHub Pages
Fork > Settings > Pages > Source: `main` branch, `/public` folder

---

## Project Structure

```
qr-forge-pro/
├── public/
│   └── index.html          # The entire app (single-file)
├── docs/
│   └── SECURITY-AUDIT.md   # Full security audit report
├── vercel.json              # Vercel deployment config
├── package.json             # Project metadata
├── LICENSE                  # MIT License
├── CHANGELOG.md             # Version history
└── README.md
```

---

## Why Static QR Codes?

Most QR services sell "dynamic" codes that route through their servers for analytics. Stop paying? Codes break. Server down? Codes break.

**Static QR codes** encode data directly into the visual pattern. No middleman. The data IS the code. For 95% of use cases (business cards, Wi-Fi, menus, flyers), static is what you want.

---

## License

MIT

---

Built by **Desi (Desmond Baker Jr.)** at [Digital Alchemy Academy](https://beacons.ai/dbcreations)

*Build it. Commit it. Deploy it. Repeat.*
