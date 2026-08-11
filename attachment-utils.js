(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  root.FrameAttachments = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
  const ALLOWED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);

  const validateImageFile = (file) => {
    if (!file) return { ok: false, message: 'No se seleccionó ningún archivo.' };
    if (!ALLOWED_IMAGE_TYPES.has(String(file.type || '').toLowerCase())) {
      return { ok: false, message: 'Usá una imagen JPG, PNG, WebP o GIF.' };
    }
    if (!Number.isFinite(file.size) || file.size <= 0) {
      return { ok: false, message: 'La imagen está vacía o no se puede leer.' };
    }
    if (file.size > MAX_IMAGE_BYTES) {
      return { ok: false, message: 'La imagen supera el límite de 10 MB.' };
    }
    return { ok: true };
  };

  const validateImageUrl = (value) => {
    try {
      const url = new URL(String(value || '').trim());
      return url.protocol === 'https:' || url.protocol === 'http:';
    } catch (_) { return false; }
  };

  const safeFileName = (name) => String(name || 'image')
    .normalize('NFKD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9._-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80) || 'image';

  const storageErrorMessage = (err) => {
    const code = err && err.code || '';
    if (code === 'storage/timeout' || code === 'storage/unknown' || code === 'storage/retry-limit-exceeded')
      return 'Storage no respondió. Verificá que el bucket esté listo y probá de nuevo.';
    if (code === 'storage/unauthorized') return 'No tenés permiso para subir imágenes.';
    if (code === 'storage/quota-exceeded') return 'Se agotó el espacio de Storage.';
    if (code === 'storage/canceled') return 'La carga fue cancelada.';
    return 'No se pudo subir la imagen. Probá de nuevo.';
  };

  const waitForUpload = (task, options) => {
    const opts = options || {};
    const timeoutMs = opts.timeoutMs || 30000;
    return new Promise((resolve, reject) => {
      let settled = false;
      const finish = (fn, value) => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        fn(value);
      };
      const timer = setTimeout(() => {
        if (typeof task.cancel === 'function') task.cancel();
        finish(reject, Object.assign(new Error('Upload timeout'), { code: 'storage/timeout' }));
      }, timeoutMs);
      task.on('state_changed', (snap) => {
        const total = snap && snap.totalBytes || 0;
        if (opts.onProgress && total > 0) opts.onProgress(Math.round((snap.bytesTransferred / total) * 100));
      }, (err) => finish(reject, err), () => finish(resolve, task.snapshot));
    });
  };

  return { MAX_IMAGE_BYTES, validateImageFile, validateImageUrl, safeFileName, storageErrorMessage, waitForUpload };
});
