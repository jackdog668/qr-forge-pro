# Changelog

## [1.0.0] - 2026-03-18

### Added
- Full QR code generator with 8 content types (URL, Text, Wi-Fi, Email, Phone, SMS, vCard, Location)
- 4 dot styles: Square, Rounded, Dots, Diamond
- Logo overlay with drag-and-drop upload
- Frame labels with custom text
- PNG, SVG, JPG export + clipboard copy
- Persistent library with search, type filters, favorites
- Style presets that persist across sessions
- Bulk generation (up to 100 at once)
- 4-tab bottom navigation (Create, Library, Presets, Bulk)
- Error correction level selector (L/M/Q/H)
- Custom foreground/background colors
- Configurable size (256-2048px) and margin

### Security
- Full security audit: 12 findings identified and fixed
- XSS prevention via comprehensive output escaping
- Storage schema validation on load (type checking, enum whitelisting, length caps)
- CDN integrity via SRI hash
- IIFE namespace isolation (single `window.QF` global)
- Blob URL memory leak fix
- Bulk generation resource caps (100 entries, 512px max)
- Save debounce with duplicate detection
- Full XML escaping in SVG output
- Wi-Fi password field with show/hide toggle
- Toast race condition fix
- Security headers in vercel.json (X-Content-Type-Options, X-Frame-Options, Referrer-Policy)
