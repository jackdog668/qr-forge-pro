# Changelog

## [1.0.0] - 2026-03-18

### Added
- Full QR code generator with 8 content types (URL, Text, Wi-Fi, Email, Phone, SMS, vCard, Location)
- 4 dot styles: Square, Rounded, Dots, Diamond
- Logo overlay with drag-and-drop upload
- Frame labels with custom text
- 4 error correction levels (L/M/Q/H)
- Configurable size (256px to 2048px)
- PNG, SVG, JPG export + clipboard copy
- Persistent library with search, filter, favorites
- Style presets that persist across sessions
- Bulk generation (up to 100 codes)
- Mobile-first responsive design with bottom tab navigation
- Full security audit with 12 findings identified and fixed

### Security (Audit v1.0.0)
- Fixed: XSS via storage poisoning (Critical)
- Fixed: Storage schema validation on load (High)
- Fixed: Added SRI hash for CDN dependency (High)
- Fixed: Blob URL memory leak in SVG export (Medium)
- Fixed: Bulk generation capped at 100 entries (Medium)
- Fixed: Logo persistence UX indicator (Medium)
- Fixed: Full XML escaping in SVG output (Medium)
- Fixed: Save debounce + duplicate detection (Medium)
- Fixed: Toast timeout race condition (Low)
- Fixed: Wi-Fi password field with show/hide toggle (Low)
- Fixed: IIFE wrapper to prevent global namespace pollution (Low)
- Fixed: Single-quote escaping in esc() function (Low)
