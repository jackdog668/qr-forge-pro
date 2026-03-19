// Data constants for QR types, templates, and dot styles

export const VD = ['square', 'rounded', 'dots', 'diamond', 'star', 'cross'];
export const VE = ['L', 'M', 'Q', 'H'];
export const VT = ['url', 'text', 'whatsapp', 'telegram', 'wifi', 'email', 'phone', 'sms', 'vcard', 'appstore', 'secure', 'event', 'crypto', 'geo', 'linkinbio'];

export const TEMPLATES = [
  { icon: '\u{1F310}', name: 'Website', desc: 'Link to any URL', type: 'url', prefill: { url: 'https://' } },
  { icon: '\u{1F4F1}', name: 'Link in Bio', desc: 'No-host micro-page', type: 'linkinbio', prefill: { 'lb-name': 'My Page' } },
  { icon: '\u{1F4F6}', name: 'Wi-Fi Sign', desc: 'Auto-connect guests', type: 'wifi', prefill: {} },
  { icon: '\u{1F4C7}', name: 'Business Card', desc: 'Full vCard contact', type: 'vcard', prefill: {} },
  { icon: '\u{1F4F1}', name: 'Social Link', desc: 'Profile or linktree', type: 'url', prefill: { url: 'https://beacons.ai/' } },
  { icon: '\u2709', name: 'Email Me', desc: 'Pre-filled mailto', type: 'email', prefill: {} },
  { icon: '\u{1F4CD}', name: 'Location', desc: 'GPS pin on maps', type: 'geo', prefill: {} },
  { icon: '\u{1F4DE}', name: 'Call Me', desc: 'Tap-to-call number', type: 'phone', prefill: {} },
  { icon: '\u{1F4AC}', name: 'Text Me', desc: 'Pre-filled SMS', type: 'sms', prefill: {} },
  { icon: '\u{1F4AC}', name: 'WhatsApp', desc: 'Direct WA chat', type: 'whatsapp', prefill: {} },
  { icon: '\u{1F4E4}', name: 'Telegram', desc: 'Direct TG chat', type: 'telegram', prefill: {} },
];

export const TYPES = [
  { id: 'url', icon: '\u{1F517}', label: 'URL', fields: [{ id: 'url', type: 'url', ph: 'https://example.com' }] },
  { id: 'text', icon: '\u270F', label: 'Text', fields: [{ id: 'text', type: 'textarea', ph: 'Any text or data...' }] },
  { id: 'wifi', icon: '\u{1F4F6}', label: 'Wi-Fi', fields: [{ id: 'wifi-ssid', type: 'text', ph: 'Network Name', lbl: 'SSID' }, { id: 'wifi-pass', type: 'password', ph: 'Password', lbl: 'Password', pw: 1 }, { id: 'wifi-enc', type: 'select', lbl: 'Encryption', opts: ['WPA', 'WEP', 'nopass'] }] },
  { id: 'email', icon: '\u2709', label: 'Email', fields: [{ id: 'em-addr', type: 'email', ph: 'name@example.com', lbl: 'Address' }, { id: 'em-subj', type: 'text', ph: 'Subject', lbl: 'Subject' }, { id: 'em-body', type: 'textarea', ph: 'Body...', lbl: 'Body' }] },
  { id: 'phone', icon: '\u{1F4DE}', label: 'Phone', fields: [{ id: 'phone', type: 'tel', ph: '+1 234 567 8900' }] },
  { id: 'sms', icon: '\u{1F4AC}', label: 'SMS', fields: [{ id: 'sms-num', type: 'tel', ph: '+1 234 567 8900', lbl: 'Number' }, { id: 'sms-msg', type: 'textarea', ph: 'Message...', lbl: 'Message' }] },
  { id: 'whatsapp', icon: '\u{1F4F1}', label: 'WhatsApp', fields: [{ id: 'wa-phone', type: 'tel', ph: '1234567890 (inc. country code)', lbl: 'Phone' }, { id: 'wa-msg', type: 'textarea', ph: 'Message...', lbl: 'Message' }] },
  { id: 'telegram', icon: '\u{1F4E4}', label: 'Telegram', fields: [{ id: 'tg-user', type: 'text', ph: 'username (no @)', lbl: 'Username' }, { id: 'tg-msg', type: 'textarea', ph: 'Message...', lbl: 'Message' }] },
  { id: 'vcard', icon: '\u{1F464}', label: 'vCard', fields: [{ id: 'vc-first', type: 'text', ph: 'First Name', lbl: 'First' }, { id: 'vc-last', type: 'text', ph: 'Last Name', lbl: 'Last' }, { id: 'vc-phone', type: 'tel', ph: 'Phone', lbl: 'Phone' }, { id: 'vc-email', type: 'email', ph: 'Email', lbl: 'Email' }, { id: 'vc-org', type: 'text', ph: 'Organization', lbl: 'Org' }, { id: 'vc-url', type: 'url', ph: 'Website', lbl: 'URL' }, { id: 'vc-photo', type: 'file', accept: 'image/*', lbl: 'Profile Photo' }] },
  { id: 'appstore', icon: '\u{1F4F1}', label: 'App Store', fields: [{ id: 'as-ios', type: 'url', ph: 'https://apps.apple.com/...', lbl: 'iOS Link' }, { id: 'as-and', type: 'url', ph: 'https://play.google.com/...', lbl: 'Android Link' }, { id: 'as-web', type: 'url', ph: 'https://example.com...', lbl: 'Fallback URL' }] },
  { id: 'secure', icon: '\u{1F512}', label: 'Secure Text', fields: [{ id: 'sec-msg', type: 'textarea', ph: 'Secret message...', lbl: 'Message' }, { id: 'sec-pw', type: 'password', ph: 'Password to unlock', lbl: 'Generate Password', pw: true }] },
  { id: 'event', icon: '\u{1F4C5}', label: 'Event', fields: [{ id: 'ev-title', type: 'text', ph: 'Meeting', lbl: 'Title' }, { id: 'ev-desc', type: 'textarea', ph: 'Details...', lbl: 'Desc' }, { id: 'ev-loc', type: 'text', ph: 'Address/Room', lbl: 'Location' }, { id: 'ev-start', type: 'datetime-local', lbl: 'Start' }, { id: 'ev-end', type: 'datetime-local', lbl: 'End' }] },
  { id: 'crypto', icon: '\u{20BF}', label: 'Crypto', fields: [{ id: 'cr-coin', type: 'select', opts: ['Bitcoin', 'Ethereum'], lbl: 'Coin' }, { id: 'cr-addr', type: 'text', ph: '1A1zP1...', lbl: 'Address' }, { id: 'cr-amt', type: 'number', ph: '0.05', lbl: 'Amount' }] },
  { id: 'geo', icon: '\u{1F4CD}', label: 'Location', fields: [{ id: 'geo-lat', type: 'text', ph: '41.8781', lbl: 'Lat' }, { id: 'geo-lng', type: 'text', ph: '-87.6298', lbl: 'Lng' }] },
  { id: 'linkinbio', icon: '\u{1F310}', label: 'Bio Link', fields: [{ id: 'lb-name', type: 'text', ph: 'Your Name', lbl: 'Name' }, { id: 'lb-bio', type: 'text', ph: 'Short Bio', lbl: 'Bio' }, { id: 'lb-t1', type: 'text', ph: 'Link 1 Title', lbl: 'Link 1' }, { id: 'lb-u1', type: 'url', ph: 'https://...', lbl: 'URL 1' }, { id: 'lb-t2', type: 'text', ph: 'Link 2 Title', lbl: 'Link 2' }, { id: 'lb-u2', type: 'url', ph: 'https://...', lbl: 'URL 2' }, { id: 'lb-t3', type: 'text', ph: 'Link 3 Title', lbl: 'Link 3' }, { id: 'lb-u3', type: 'url', ph: 'https://...', lbl: 'URL 3' }] },
];

export const DOTS = [
  { id: 'square', label: 'Square', svg: '<rect x="4" y="4" width="7" height="7" fill="currentColor"/><rect x="13" y="4" width="7" height="7" fill="currentColor"/><rect x="4" y="13" width="7" height="7" fill="currentColor"/><rect x="13" y="13" width="7" height="7" fill="currentColor"/>' },
  { id: 'rounded', label: 'Round', svg: '<rect x="4" y="4" width="7" height="7" rx="2" fill="currentColor"/><rect x="13" y="4" width="7" height="7" rx="2" fill="currentColor"/><rect x="4" y="13" width="7" height="7" rx="2" fill="currentColor"/><rect x="13" y="13" width="7" height="7" rx="2" fill="currentColor"/>' },
  { id: 'dots', label: 'Dots', svg: '<circle cx="7.5" cy="7.5" r="3.5" fill="currentColor"/><circle cx="16.5" cy="7.5" r="3.5" fill="currentColor"/><circle cx="7.5" cy="16.5" r="3.5" fill="currentColor"/><circle cx="16.5" cy="16.5" r="3.5" fill="currentColor"/>' },
  { id: 'diamond', label: 'Diamond', svg: '<polygon points="7.5,4 11,7.5 7.5,11 4,7.5" fill="currentColor"/><polygon points="16.5,4 20,7.5 16.5,11 13,7.5" fill="currentColor"/><polygon points="7.5,13 11,16.5 7.5,20 4,16.5" fill="currentColor"/><polygon points="16.5,13 20,16.5 16.5,20 13,16.5" fill="currentColor"/>' },
  { id: 'star', label: 'Star', svg: '<polygon points="7.5,4 8.5,6.5 11,7.5 8.5,8.5 7.5,11 6.5,8.5 4,7.5 6.5,6.5" fill="currentColor"/><polygon points="16.5,4 17.5,6.5 20,7.5 17.5,8.5 16.5,11 15.5,8.5 13,7.5 15.5,6.5" fill="currentColor"/><polygon points="7.5,13 8.5,15.5 11,16.5 8.5,17.5 7.5,20 6.5,17.5 4,16.5 6.5,15.5" fill="currentColor"/><polygon points="16.5,13 17.5,15.5 20,16.5 17.5,17.5 16.5,20 15.5,17.5 13,16.5 15.5,15.5" fill="currentColor"/>' },
  { id: 'cross', label: 'Cross', svg: '<polygon points="6.5,4 8.5,4 8.5,6.5 11,6.5 11,8.5 8.5,8.5 8.5,11 6.5,11 6.5,8.5 4,8.5 4,6.5 6.5,6.5" fill="currentColor"/><polygon points="15.5,4 17.5,4 17.5,6.5 20,6.5 20,8.5 17.5,8.5 17.5,11 15.5,11 15.5,8.5 13,8.5 13,6.5 15.5,6.5" fill="currentColor"/><polygon points="6.5,13 8.5,13 8.5,15.5 11,15.5 11,17.5 8.5,17.5 8.5,20 6.5,20 6.5,17.5 4,17.5 4,15.5 6.5,15.5" fill="currentColor"/><polygon points="15.5,13 17.5,13 17.5,15.5 20,15.5 20,17.5 17.5,17.5 17.5,20 15.5,20 15.5,17.5 13,17.5 13,15.5 15.5,15.5" fill="currentColor"/>' },
];

export const ECL_MAP = { L: '7%', M: '15%', Q: '25%', H: '30%' };
