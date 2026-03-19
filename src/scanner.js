// QR Scanner module: camera access and jsQR decoding

import { toast } from './ui.js';

const $ = (id) => document.getElementById(id);

let scanning = false;
let scanAnim = null;

export function toggleScan() {
  if (scanning) stopScan();
  else startScan();
}

export async function startScan() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
    const video = $('scanVideo');
    video.srcObject = stream;
    scanning = true;
    $('scanToggle').innerHTML = '&#x23F9; Stop Camera';
    $('scanResult').style.display = 'none';
    $('scanLine').style.display = 'block';

    const canvas = $('scanCanvas');
    const ctx = canvas.getContext('2d', { willReadFrequently: true });

    function tick() {
      if (!scanning) return;
      if (video.readyState === video.HAVE_ENOUGH_DATA) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0);
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = window.jsQR(imgData.data, imgData.width, imgData.height, { inversionAttempts: 'dontInvert' });
        if (code) {
          showScanResult(code.data);
          return;
        }
      }
      scanAnim = requestAnimationFrame(tick);
    }
    tick();
  } catch {
    toast('Camera access denied');
  }
}

export function stopScan() {
  scanning = false;
  if (scanAnim) cancelAnimationFrame(scanAnim);
  const video = $('scanVideo');
  if (video.srcObject) video.srcObject.getTracks().forEach((t) => t.stop());
  video.srcObject = null;
  $('scanToggle').innerHTML = '&#x1F4F7; Start Camera';
  $('scanLine').style.display = 'none';
}

function showScanResult(data) {
  stopScan();
  const isURL = /^https?:\/\//i.test(data);
  const resultEl = $('scanResult');
  resultEl.style.display = 'block';
  resultEl.innerHTML = `<div class="scan-result-label">Decoded</div><div class="scan-result-data" id="scanData"></div><div class="scan-actions"><button class="btn-s" id="scanCopy">&#x1F4CB; Copy</button>${isURL ? '<button class="btn-s" id="scanOpen">&#x1F517; Open</button>' : ''}<button class="btn-s" onclick="QF.toggleScan()">&#x1F504; Scan Again</button></div>`;
  $('scanData').textContent = data;
  $('scanCopy').onclick = () => {
    navigator.clipboard.writeText(data);
    toast('Copied!');
  };
  if (isURL) {
    $('scanOpen').onclick = () => window.open(data, '_blank', 'noopener,noreferrer');
  }
}

export function isScanning() {
  return scanning;
}
