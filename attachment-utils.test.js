const assert = require('node:assert/strict');
const A = require('./attachment-utils.js');

assert.equal(A.validateImageFile({ type: 'image/png', size: 42 }).ok, true);
assert.match(A.validateImageFile({ type: 'application/pdf', size: 42 }).message, /JPG/);
assert.match(A.validateImageFile({ type: 'image/jpeg', size: A.MAX_IMAGE_BYTES + 1 }).message, /10 MB/);
assert.equal(A.validateImageUrl('https://example.com/a.png'), true);
assert.equal(A.validateImageUrl('javascript:alert(1)'), false);
assert.equal(A.safeFileName('../../Mi foto ñ.png'), '..-..-Mi-foto-n.png');

async function run() {
  let progress = 0;
  const successfulTask = {
    snapshot: { ref: 'ok' },
    on(_event, next, _error, complete) {
      next({ bytesTransferred: 5, totalBytes: 10 });
      complete();
    }
  };
  const snapshot = await A.waitForUpload(successfulTask, { onProgress: p => { progress = p; }, timeoutMs: 50 });
  assert.equal(progress, 50);
  assert.equal(snapshot.ref, 'ok');

  let canceled = false;
  const stalledTask = { on() {}, cancel() { canceled = true; } };
  await assert.rejects(A.waitForUpload(stalledTask, { timeoutMs: 5 }), err => err.code === 'storage/timeout');
  assert.equal(canceled, true);
  console.log('attachment-utils: 10 checks passed');
}

run().catch(err => { console.error(err); process.exitCode = 1; });
