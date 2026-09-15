(() => {
  'use strict';

  const root = document.documentElement;
  const themeToggle = document.getElementById('theme-toggle');
  const tabs = document.querySelectorAll('.tab-button');
  const panels = document.querySelectorAll('.tool-panel');
  const qrForm = document.getElementById('qr-form');
  const urlInput = document.getElementById('url-input');
  const urlHelp = document.getElementById('url-help');
  const qrPlaceholder = document.getElementById('qr-placeholder');
  const qrOutput = document.getElementById('qr-output');
  const qrCode = document.getElementById('qr-code');
  const generatedUrl = document.getElementById('generated-url');
  const fileInput = document.getElementById('qr-file');
  const dropZone = document.getElementById('drop-zone');
  const scanResult = document.getElementById('scan-result');
  const scanError = document.getElementById('scan-error');
  const previewImage = document.getElementById('preview-image');
  const decodedUrl = document.getElementById('decoded-url');
  const openLink = document.getElementById('open-link');
  const toast = document.getElementById('toast');
  let currentUrl = '';
  let decodedText = '';
  let toastTimer;

  const savedTheme = readSavedTheme();
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  setTheme(savedTheme || (prefersDark ? 'dark' : 'light'));
  lucide.createIcons();

  function readSavedTheme() {
    try {
      const value = localStorage.getItem('qr-theme');
      return value === 'light' || value === 'dark' ? value : null;
    } catch {
      return null;
    }
  }

  function setTheme(theme) {
    const safeTheme = theme === 'dark' ? 'dark' : 'light';
    root.dataset.theme = safeTheme;
    const isDark = safeTheme === 'dark';
    themeToggle.setAttribute('aria-label', isDark ? '라이트 모드로 전환' : '다크 모드로 전환');
    try {
      localStorage.setItem('qr-theme', safeTheme);
    } catch {
      // 저장소 접근이 차단된 환경에서도 현재 세션의 테마 전환은 유지합니다.
    }
  }

  themeToggle.addEventListener('click', () => {
    setTheme(root.dataset.theme === 'dark' ? 'light' : 'dark');
  });

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      tabs.forEach((item) => {
        const selected = item === tab;
        item.classList.toggle('active', selected);
        item.setAttribute('aria-selected', String(selected));
      });
      panels.forEach((panel) => {
        const selected = panel.id === tab.dataset.panel;
        panel.classList.toggle('active', selected);
        panel.hidden = !selected;
      });
    });
  });

  function normalizeUrl(value) {
    const trimmed = value.trim();
    if (!trimmed || trimmed.length > 2048) return null;
    const explicitScheme = trimmed.match(/^[a-z][a-z\d+.-]*:/i)?.[0];
    if (explicitScheme && !/^https?:$/i.test(explicitScheme)) return null;
    const withProtocol = explicitScheme ? trimmed : `https://${trimmed}`;
    try {
      const parsed = new URL(withProtocol);
      if (!['http:', 'https:'].includes(parsed.protocol)) return null;
      if (!parsed.hostname.includes('.') && parsed.hostname !== 'localhost') return null;
      return parsed.href;
    } catch {
      return null;
    }
  }

  function setUrlError(message) {
    urlInput.classList.toggle('invalid', Boolean(message));
    urlInput.setAttribute('aria-invalid', String(Boolean(message)));
    urlHelp.classList.toggle('error', Boolean(message));
    urlHelp.textContent = message || 'http:// 또는 https://로 시작하지 않아도 괜찮아요.';
  }

  qrForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const normalized = normalizeUrl(urlInput.value);
    if (!normalized) {
      setUrlError('올바른 웹사이트 주소를 입력해 주세요.');
      urlInput.focus();
      return;
    }
    setUrlError('');
    currentUrl = normalized;
    urlInput.value = normalized;
    qrCode.replaceChildren();
    new QRCode(qrCode, {
      text: normalized,
      width: 420,
      height: 420,
      colorDark: '#171a16',
      colorLight: '#ffffff',
      correctLevel: QRCode.CorrectLevel.H
    });
    generatedUrl.textContent = normalized;
    qrPlaceholder.classList.add('hidden');
    qrOutput.classList.remove('hidden');
  });

  urlInput.addEventListener('input', () => {
    if (urlInput.classList.contains('invalid')) setUrlError('');
  });

  document.getElementById('download-button').addEventListener('click', () => {
    const canvas = qrCode.querySelector('canvas');
    const image = qrCode.querySelector('img');
    const source = canvas ? canvas.toDataURL('image/png') : image?.src;
    if (!source) return;
    const anchor = document.createElement('a');
    anchor.href = source;
    anchor.download = `qr-link-${new URL(currentUrl).hostname}.png`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    showToast('QR 이미지를 저장했어요');
  });

  document.getElementById('copy-generated').addEventListener('click', () => copyText(currentUrl));
  document.getElementById('copy-decoded').addEventListener('click', () => copyText(decodedText));

  async function copyText(text) {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      showToast('클립보드에 복사했어요');
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      textarea.remove();
      showToast('클립보드에 복사했어요');
    }
  }

  function showToast(message) {
    toast.querySelector('span').textContent = message;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 2200);
  }

  ['dragenter', 'dragover'].forEach((eventName) => {
    dropZone.addEventListener(eventName, (event) => {
      event.preventDefault();
      dropZone.classList.add('dragging');
    });
  });
  ['dragleave', 'drop'].forEach((eventName) => {
    dropZone.addEventListener(eventName, (event) => {
      event.preventDefault();
      dropZone.classList.remove('dragging');
    });
  });
  dropZone.addEventListener('drop', (event) => handleFile(event.dataTransfer.files[0]));
  dropZone.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      fileInput.click();
    }
  });
  fileInput.addEventListener('change', () => handleFile(fileInput.files[0]));

  function showScanError(message) {
    scanResult.classList.add('hidden');
    scanError.querySelector('span').textContent = message;
    scanError.classList.remove('hidden');
    dropZone.classList.remove('hidden');
  }

  function handleFile(file) {
    scanError.classList.add('hidden');
    if (!file) return;
    const allowedImageTypes = new Set(['image/png', 'image/jpeg', 'image/webp']);
    if (!allowedImageTypes.has(file.type)) {
      showScanError('PNG, JPG, WEBP 이미지만 선택할 수 있어요.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      showScanError('10MB 이하의 이미지를 선택해 주세요.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => decodeQrImage(reader.result);
    reader.onerror = () => showScanError('이미지를 불러오지 못했어요. 다시 시도해 주세요.');
    reader.readAsDataURL(file);
  }

  function decodeQrImage(source) {
    const image = new Image();
    image.onload = () => {
      const pixelCount = image.naturalWidth * image.naturalHeight;
      if (!pixelCount || pixelCount > 25_000_000) {
        showScanError('이미지 해상도가 너무 커요. 2,500만 픽셀 이하 이미지를 사용해 주세요.');
        return;
      }
      try {
        const canvas = document.getElementById('decode-canvas');
        const context = canvas.getContext('2d', { willReadFrequently: true });
        if (!context) throw new Error('Canvas context unavailable');
        const maxDimension = 1600;
        const scale = Math.min(1, maxDimension / Math.max(image.naturalWidth, image.naturalHeight));
        canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
        canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height, { inversionAttempts: 'attemptBoth' });
        if (!code) {
          showScanError('QR 코드를 찾지 못했어요. 더 선명한 이미지를 사용해 주세요.');
          return;
        }
        displayDecodedResult(source, code.data);
      } catch {
        showScanError('이미지를 안전하게 처리하지 못했어요. 다른 이미지를 사용해 주세요.');
      }
    };
    image.onerror = () => showScanError('지원하지 않거나 손상된 이미지예요.');
    image.src = source;
  }

  function displayDecodedResult(source, text) {
    decodedText = text;
    const normalized = normalizeUrl(text);
    previewImage.src = source;
    decodedUrl.textContent = text;
    if (normalized) {
      decodedUrl.href = normalized;
      decodedUrl.removeAttribute('aria-disabled');
      openLink.href = normalized;
      openLink.classList.remove('hidden');
    } else {
      decodedUrl.removeAttribute('href');
      decodedUrl.setAttribute('aria-disabled', 'true');
      openLink.classList.add('hidden');
    }
    dropZone.classList.add('hidden');
    scanError.classList.add('hidden');
    scanResult.classList.remove('hidden');
  }
})();
