# QR Forge Pro - Security & Bug Audit Report
**Auditor:** Claude (Security Auditor Skill)
**Date:** March 17, 2026
**Scope:** Full client-side HTML/JS app (490 lines)
**OWASP Category Focus:** A03 Injection, A04 Insecure Design, A05 Security Misconfiguration

---

## SEVERITY LEGEND
- 🔴 **CRITICAL** - Exploitable now, data loss or code execution
- 🟠 **HIGH** - Exploitable with moderate effort, significant impact
- 🟡 **MEDIUM** - Requires specific conditions, moderate impact
- 🔵 **LOW** - Minor, best-practice violation

---

## 🔴 CRITICAL - XSS via Storage Poisoning (CWE-79)

**Location:** `renderLib()` line 438, `renderPresets()` line 457, `openDetail()` line 446

**Issue:** Library items and presets are loaded from `window.storage` and rendered via `innerHTML`. While `esc()` is used for `name` and `data` fields, several fields are injected RAW into HTML:

```js
// UNSAFE - i.type goes straight into HTML
<div class="lib-card-type">${i.type}</div>

// UNSAFE - p.fg/p.bg go into style attributes
style="background:${p.fg}"

// UNSAFE - i.id goes into onclick handlers
onclick="openDetail('${i.id}')"
onclick="togFav('${i.id}')"
```

**Attack vector:** Open DevTools console → manipulate `window.storage` → inject payload as `type`, `id`, or color value → next time library renders, XSS fires.

**Example exploit:**
```js
// From DevTools console:
let lib = JSON.parse((await window.storage.get('qr-library')).value);
lib[0].id = "');alert(document.cookie);//";
await window.storage.set('qr-library', JSON.stringify(lib));
// Navigate to Library tab → XSS fires
```

**Fix:** Escape ALL dynamic values in innerHTML templates, or validate storage data on load.

---

## 🟠 HIGH - No Storage Schema Validation (CWE-20)

**Location:** `boot()` line 474-476

**Issue:** Storage data is loaded with zero validation:
```js
library = await DB.get('qr-library') || [];
presets = await DB.get('qr-presets') || [];
```

Malformed data (wrong types, missing fields, corrupted JSON) will crash the app silently or cause undefined behavior throughout. No migration strategy if schema changes between versions.

**Fix:** Validate shape on load, discard corrupted entries, add schema version.

---

## 🟠 HIGH - CDN Dependency Without SRI (CWE-829)

**Location:** Line 7

```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/qrcode-generator/1.4.4/qrcode.min.js"></script>
```

**Issue:** No Subresource Integrity (SRI) hash. If cdnjs is compromised or a MITM occurs, arbitrary JavaScript executes in the app context with full access to storage.

**Fix:** Add `integrity` and `crossorigin` attributes.

---

## 🟡 MEDIUM - Blob URL Memory Leak (CWE-401)

**Location:** `dlSVG()` line 418

```js
a.href = URL.createObjectURL(blob);
a.click();
// Never calls URL.revokeObjectURL()
```

**Issue:** Every SVG download creates an object URL that's never revoked. Over a session with many downloads, memory accumulates. Each blob stays in browser memory until page unload.

**Fix:** Revoke after download triggers.

---

## 🟡 MEDIUM - Bulk Generation Has No Cap (CWE-770)

**Location:** `genBulk()` line 462

**Issue:** No limit on number of lines processed. Pasting 5,000+ lines will:
- Create 5,000+ canvas elements (each allocating GPU memory)
- Freeze the browser tab
- Potentially crash on mobile devices

The 2048px size option makes this worse: each canvas = ~16MB.

**Fix:** Cap at 100 entries, warn user, add progress indicator.

---

## 🟡 MEDIUM - Logo Not Persisted in Library (Functional Bug)

**Location:** `saveToLib()` line 425, `openDetail()` line 445, `modDL()` line 451

**Issue:** When saving to library, the thumbnail is rendered WITHOUT logo (`null` passed). When re-downloading from library, logo is also `null`. So:
1. User generates QR with logo overlay ✅
2. User saves to library
3. Library thumbnail has NO logo ❌
4. Download from library modal has NO logo ❌

The user's QR code silently loses its logo on save.

**Fix:** Either store the logo as a base64 data URL in the library entry, or clearly indicate that logo overlay is session-only and won't be saved.

---

## 🟡 MEDIUM - SVG Frame Text Incomplete Escaping

**Location:** `dlSVG()` line 416

```js
frame.replace(/&/g,'&amp;').replace(/</g,'&lt;')
```

**Issue:** Missing `>` and `"` escaping for SVG context. Also missing single-quote escape. While exploitation is limited in an SVG `<text>` element, a frame label containing `"` could break attributes if the SVG is later embedded in HTML.

**Fix:** Use full XML escaping: `& < > " '`

---

## 🟡 MEDIUM - Duplicate Save Spam

**Location:** `saveToLib()` line 423

**Issue:** No debounce, no duplicate detection. User can spam the "Save to Library" button and create unlimited identical entries. Combined with base64 thumbnails (~3-5KB each), storage can fill up.

**Fix:** Debounce the save button, check for duplicate data before saving.

---

## 🔵 LOW - Toast Race Condition

**Location:** `toast()` line 304

**Issue:** Rapid successive toasts share the same DOM element. The `setTimeout` from a previous toast can hide the current one early, or two toasts overlap visually.

**Fix:** Clear existing timeout before setting new one.

---

## 🔵 LOW - Wi-Fi Password Visible in Plain Text

**Location:** Form field `f-wifi-pass`, type="text"

**Issue:** Wi-Fi password is displayed in plain text. While this is intentional (user needs to verify what gets encoded), it's a shoulder-surfing risk. The password also gets stored in library entries as part of the `data` field.

**Fix:** Consider `type="password"` with a show/hide toggle.

---

## 🔵 LOW - Global Namespace Pollution

**Location:** All functions and variables

**Issue:** Everything is global: `S`, `library`, `presets`, `DB`, `generate`, `saveToLib`, `renderQR`, etc. Any future script or browser extension can read/modify app state, call functions, or extract stored QR data.

**Fix:** Wrap in IIFE or use modules.

---

## 🔵 LOW - `esc()` Missing Single Quote Escape

**Location:** Line 305

```js
function esc(s){return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;')}
```

**Issue:** No single-quote escape (`'` → `&#39;`). onclick handlers use single quotes: `onclick="openDetail('${i.id}')"`. A stored ID containing `'` could break out of the handler.

**Fix:** Add `&#39;` replacement.

---

## DEVTOOLS TRICKS (Attack Surface Awareness)

These aren't "bugs" per se, but things to know about the attack surface for a client-side app:

1. **Full state readable from console:** `S`, `library`, `presets` expose all app data
2. **Storage directly manipulable:** `await window.storage.get('qr-library')` dumps all saved QR codes
3. **Functions callable from console:** `generate()`, `saveToLib()`, `dlPNG()` all callable
4. **Canvas pixel data extractable:** `document.getElementById('qr-canvas').toDataURL()` grabs current QR
5. **Library exportable:** `JSON.stringify(library)` dumps everything including thumbnails
6. **No CSP headers:** Since this runs as a standalone HTML file, there's no Content Security Policy. Inline scripts execute freely.

---

## SUMMARY

| Severity | Count | Fixed? |
|----------|-------|--------|
| 🔴 Critical | 1 | Fixing below |
| 🟠 High | 2 | Fixing below |
| 🟡 Medium | 5 | Fixing below |
| 🔵 Low | 4 | Fixing below |
| **Total** | **12** | |

---

## RECOMMENDED PRIORITY

1. Fix XSS via storage poisoning (escape all innerHTML values)
2. Add storage schema validation on boot
3. Add SRI hash to CDN script
4. Cap bulk generation
5. Fix logo persistence or add clear UX indicator
6. Fix SVG escaping, blob leak, toast race, save debounce
