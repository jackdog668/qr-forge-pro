# Changelog

All notable changes to QrCody.

## [2.0.0] - 2026-03-18

### Added
- **PWA Support**: manifest.json, service worker, installable on home screen with app icon
- **QR Scanner**: Camera-based QR code reader via jsQR, 5th navigation tab
- **Export/Import**: Backup and restore library as JSON, with deduplication on import
- **Templates Gallery**: 8 quick-start templates (Website, Wi-Fi Sign, Business Card, Social Link, Email Me, Location, Call Me, Text Me)
- **Batch Operations**: Select mode in Library, bulk delete with undo, bulk download as PNGs
- **Share API**: Web Share API on mobile with clipboard fallback on desktop
- **Offline Mode**: Service worker caches all assets, offline indicator bar
- **Keyboard Shortcuts**: `?` help, `Ctrl+Enter` generate, `Ctrl+S` save, `Esc` close, `1-5` tabs
- **Undo Delete**: 5-second undo window with toast button for library and batch deletes
- **ARIA Accessibility**: Live regions on toast, tab roles on nav, aria-modal on dialogs, aria-hidden on decorative SVGs
- **SEO Meta Tags**: Open Graph, Twitter Cards, proper description and author
- **CSP Headers**: Content-Security-Policy, HSTS, X-Frame-Options via vercel.json
- **Open Source Standards**: CONTRIBUTING.md, .editorconfig

### Security
- Fixed scanner XSS vector: scanned data no longer injected into onclick attributes
- Added `noopener,noreferrer` to all `window.open` calls
- CSP header restricts script sources to self and cdnjs only
- Service worker cache uses versioned cache names for clean updates

## [1.0.0] - 2026-03-18

### Added
- Full QR code generator with 8 content types
- 4 dot styles (Square, Rounded, Dots, Diamond)
- Logo overlay with drag-and-drop
- Frame labels, custom colors, 4 error correction levels
- Persistent library with search, filter, favorites
- Style presets
- Bulk generation (up to 100)
- PNG, SVG, JPG export, clipboard copy
- Mobile-first responsive design

### Security (12 findings fixed)
- XSS via storage poisoning (Critical)
- Storage schema validation on load (High)
- CDN SRI hash verification (High)
- Blob URL memory leak, bulk cap, SVG escaping (Medium)
- Save debounce, logo UX, toast race, password toggle, IIFE namespace, escape coverage (Low)
