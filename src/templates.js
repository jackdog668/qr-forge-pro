// Data constants for QR types, templates, and dot styles

export const VD = ['square', 'rounded', 'dots', 'diamond'];
export const VE = ['L', 'M', 'Q', 'H'];
export const VT = ['url', 'text', 'wifi', 'email', 'phone', 'sms', 'vcard', 'geo'];

export const TEMPLATES = [
  { icon: '\u{1F310}', name: 'Website', desc: 'Link to any URL', type: 'url', prefill: { url: 'https://' } },
  { icon: '\u{1F4F6}', name: 'Wi-Fi Sign', desc: 'Auto-connect guests', type: 'wifi', prefill: {} },
  { icon: '\u{1F4C7}', name: 'Business Card', desc: 'Full vCard contact', type: 'vcard', prefill: {} },
  { icon: '\u{1F4F1}', name: 'Social Link', desc: 'Profile or linktree', type: 'url', prefill: { url: 'https://beacons.ai/' } },
  { icon: '\u2709', name: 'Email Me', desc: 'Pre-filled mailto', type: 'email', prefill: {} },
  { icon: '\u{1F4CD}', name: 'Location', desc: 'GPS pin on maps', type: 'geo', prefill: {} },
  { icon: '\u{1F4DE}', name: 'Call Me', desc: 'Tap-to-call number', type: 'phone', prefill: {} },
  { icon: '\u{1F4AC}', name: 'Text Me', desc: 'Pre-filled SMS', type: 'sms', prefill: {} },
];

export const TYPES = [
  { id: 'url', icon: '\u{1F517}', label: 'URL', fields: [{ id: 'url', type: 'url', ph: 'https://example.com' }] },
  { id: 'text', icon: '\u270F', label: 'Text', fields: [{ id: 'text', type: 'textarea', ph: 'Any text or data...' }] },
  { id: 'wifi', icon: '\u{1F4F6}', label: 'Wi-Fi', fields: [{ id: 'wifi-ssid', type: 'text', ph: 'Network Name', lbl: 'SSID' }, { id: 'wifi-pass', type: 'password', ph: 'Password', lbl: 'Password', pw: 1 }, { id: 'wifi-enc', type: 'select', lbl: 'Encryption', opts: ['WPA', 'WEP', 'nopass'] }] },
  { id: 'email', icon: '\u2709', label: 'Email', fields: [{ id: 'em-addr', type: 'email', ph: 'name@example.com', lbl: 'Address' }, { id: 'em-subj', type: 'text', ph: 'Subject', lbl: 'Subject' }, { id: 'em-body', type: 'textarea', ph: 'Body...', lbl: 'Body' }] },
  { id: 'phone', icon: '\u{1F4DE}', label: 'Phone', fields: [{ id: 'phone', type: 'tel', ph: '+1 234 567 8900' }] },
  { id: 'sms', icon: '\u{1F4AC}', label: 'SMS', fields: [{ id: 'sms-num', type: 'tel', ph: '+1 234 567 8900', lbl: 'Number' }, { id: 'sms-msg', type: 'textarea', ph: 'Message...', lbl: 'Message' }] },
  { id: 'vcard', icon: '\u{1F464}', label: 'vCard', fields: [{ id: 'vc-first', type: 'text', ph: 'First Name', lbl: 'First' }, { id: 'vc-last', type: 'text', ph: 'Last Name', lbl: 'Last' }, { id: 'vc-phone', type: 'tel', ph: 'Phone', lbl: 'Phone' }, { id: 'vc-email', type: 'email', ph: 'Email', lbl: 'Email' }, { id: 'vc-org', type: 'text', ph: 'Organization', lbl: 'Org' }, { id: 'vc-url', type: 'url', ph: 'Website', lbl: 'URL' }] },
  { id: 'geo', icon: '\u{1F4CD}', label: 'Location', fields: [{ id: 'geo-lat', type: 'text', ph: '41.8781', lbl: 'Lat' }, { id: 'geo-lng', type: 'text', ph: '-87.6298', lbl: 'Lng' }] },
];

export const DOTS = [
  { id: 'square', label: 'Square', svg: '<rect x="4" y="4" width="7" height="7" fill="currentColor"/><rect x="13" y="4" width="7" height="7" fill="currentColor"/><rect x="4" y="13" width="7" height="7" fill="currentColor"/><rect x="13" y="13" width="7" height="7" fill="currentColor"/>' },
  { id: 'rounded', label: 'Round', svg: '<rect x="4" y="4" width="7" height="7" rx="2" fill="currentColor"/><rect x="13" y="4" width="7" height="7" rx="2" fill="currentColor"/><rect x="4" y="13" width="7" height="7" rx="2" fill="currentColor"/><rect x="13" y="13" width="7" height="7" rx="2" fill="currentColor"/>' },
  { id: 'dots', label: 'Dots', svg: '<circle cx="7.5" cy="7.5" r="3.5" fill="currentColor"/><circle cx="16.5" cy="7.5" r="3.5" fill="currentColor"/><circle cx="7.5" cy="16.5" r="3.5" fill="currentColor"/><circle cx="16.5" cy="16.5" r="3.5" fill="currentColor"/>' },
  { id: 'diamond', label: 'Diamond', svg: '<polygon points="7.5,4 11,7.5 7.5,11 4,7.5" fill="currentColor"/><polygon points="16.5,4 20,7.5 16.5,11 13,7.5" fill="currentColor"/><polygon points="7.5,13 11,16.5 7.5,20 4,16.5" fill="currentColor"/><polygon points="16.5,13 20,16.5 16.5,20 13,16.5" fill="currentColor"/>' },
];

export const ECL_MAP = { L: '7%', M: '15%', Q: '25%', H: '30%' };
