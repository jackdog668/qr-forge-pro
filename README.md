# QR Forge Pro

**Free, unlimited QR code generator with persistent storage. Static codes that never expire.**

> Replaces $15.99/mo QR code subscription services with a zero-cost, client-side app that runs entirely in your browser.

---

## What It Does

QR Forge Pro generates **static QR codes** — the data is encoded directly into the pattern itself. No redirect server, no scan limits, no expiration dates, no subscriptions. Scan the code in 10 years and it still works.

### Features

| Feature | QR Forge Pro | Typical Paid Service |
|---------|-------------|---------------------|
| Static QR codes | **Unlimited** | Unlimited |
| Content types | **8** (URL, Text, Wi-Fi, Email, Phone, SMS, vCard, Location) | 3-5 |
| Logo overlay | **Built-in** | Paid tier |
| Dot styles | **4** (Square, Rounded, Dots, Diamond) | Paid tier |
| Frame labels | **Built-in** | Paid tier |
| Export formats | **PNG, SVG, JPG** + clipboard | PNG, JPG |
| Bulk generation | **100 at once** | 500 (capped) |
| Persistent library | **Unlimited saves** | Limited |
| Style presets | **Unlimited** | N/A |
| Price | **$0** | $15.99/mo ($191.88/yr) |

### App Structure

- **Create** — Full QR generator with all 8 content types, colors, dot styles, logo overlay, frame labels, ECL settings
- **Library** — Persistent saved QR codes with search, filter by type, favorites system, detail modal with downloads
- **Presets** — Save and reuse style configurations across sessions  
- **Bulk** — Paste a list, generate up to 100 QR codes at once

---

## Quick Start

### Option 1: Open Directly

Just open `public/index.html` in any modern browser. No install, no build, no server.

### Option 2: Local Dev Server

```bash
npx serve public -l 3000
```

### Option 3: Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/jackdog668/qr-forge-pro)

---

## Security

This app was built with a security-first approach. A full audit was conducted covering OWASP categories A03 (Injection), A04 (Insecure Design), and A05 (Security Misconfiguration).

### Security measures implemented:

- **XSS prevention** — All dynamic values escaped via `esc()` before innerHTML injection, including single-quote contexts
- **Storage schema validation** — Every library entry and preset validated on load with type checking, enum whitelisting, hex color format verification, and string length caps
- **CDN integrity** — Subresource Integrity (SRI) hash on external script with `crossorigin="anonymous"`  
- **Input validation** — Enum whitelisting for dot styles, ECL levels, and content types
- **Memory management** — Blob URLs revoked after SVG downloads
- **Resource caps** — Bulk generation capped at 100 entries, canvas size capped at 512px for bulk
- **Namespace isolation** — All code wrapped in IIFE, single `window.QF` namespace exposed
- **Save debounce** — Duplicate detection + lock mechanism prevents spam saves
- **Full XML escaping** — SVG output sanitized for all special characters

See [`docs/SECURITY-AUDIT.md`](docs/SECURITY-AUDIT.md) for the complete audit report.

---

## Architecture

```
qr-forge-pro/
├── public/
│   └── index.html          # Complete app (single-file, zero dependencies beyond QR lib)
├── docs/
│   └── SECURITY-AUDIT.md   # Full security audit with findings and fixes
├── package.json
├── vercel.json              # Vercel deployment config
├── .gitignore
├── LICENSE
├── CHANGELOG.md
└── README.md
```

### Tech Stack

- **Rendering**: Pure Canvas API for QR code generation with custom dot style renderers
- **QR Engine**: `qrcode-generator` v1.4.4 (auto-detects optimal QR version 1-40)
- **Storage**: `window.storage` API for persistent library and presets
- **Export**: Canvas `toDataURL()` for PNG/JPG, programmatic SVG construction for vector output
- **UI**: Vanilla HTML/CSS/JS with CSS custom properties, zero framework overhead

### Storage Schema

```
qr-library → Array<{
  id: string,        // alphanumeric, max 20 chars
  name: string,      // max 100 chars
  data: string,      // encoded QR content, max 5000 chars
  type: enum,        // url|text|wifi|email|phone|sms|vcard|geo
  fg: string,        // hex color #RRGGBB
  bg: string,        // hex color #RRGGBB
  dot: enum,         // square|rounded|dots|diamond
  ecl: enum,         // L|M|Q|H
  margin: enum,      // 1|2|4
  frame: string|null, // frame label text, max 50 chars
  size: enum,        // 256|512|1024|2048
  thumb: string,     // base64 PNG data URL
  fav: boolean,
  created: ISO8601
}>

qr-presets → Array<{
  id: string,
  name: string,
  fg: string,
  bg: string,
  dot: enum,
  ecl: enum,
  margin: enum,
  created: ISO8601
}>
```

---

## Content Type Formats

| Type | Format | Example |
|------|--------|---------|
| URL | Raw URL | `https://digitalalchemy.dev` |
| Text | Raw text | `Hello from QR Forge Pro` |
| Wi-Fi | `WIFI:T:{enc};S:{ssid};P:{pass};;` | `WIFI:T:WPA;S:MyNet;P:pass123;;` |
| Email | `mailto:{addr}?subject={s}&body={b}` | `mailto:desi@da.dev?subject=Hi` |
| Phone | `tel:{number}` | `tel:+13125551234` |
| SMS | `sms:{number}?body={msg}` | `sms:+13125551234?body=Hello` |
| vCard | vCard 3.0 spec | Full contact card |
| Location | `geo:{lat},{lng}` | `geo:41.8781,-87.6298` |

---

## License

MIT — see [LICENSE](LICENSE)

---

## Credits

Built by **Desmond Baker Jr.** / [Digital Alchemy Academy](https://beacons.ai/dbcreations)

*Build it. Commit it. Deploy it. Repeat.*
