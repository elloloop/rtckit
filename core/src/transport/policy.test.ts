import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  decideTransport,
  shouldFallbackToSfu,
  SFU_PARTICIPANT_THRESHOLD,
} from './policy';

test('SFU disabled → always mesh, even for large groups', () => {
  assert.deepEqual(decideTransport({ participantCount: 9, sfuEnabled: false }), {
    transport: 'mesh',
    reason: 'sfu_disabled',
  });
});

test('> 3 participants → SFU by default', () => {
  const d = decideTransport({ participantCount: 4, sfuEnabled: true });
  assert.equal(d.transport, 'sfu');
  assert.equal(d.reason, 'group_call_sfu');
});

test('≤ 3 participants → mesh primary', () => {
  for (const n of [1, 2, 3]) {
    const d = decideTransport({ participantCount: n, sfuEnabled: true });
    assert.equal(d.transport, 'mesh', `n=${n}`);
    assert.equal(d.reason, 'mesh_primary');
  }
});

test('≤ 3 participants + mesh failed → SFU fallback', () => {
  const d = decideTransport({
    participantCount: 2,
    sfuEnabled: true,
    meshFailed: true,
  });
  assert.equal(d.transport, 'sfu');
  assert.equal(d.reason, 'mesh_failed_fallback_sfu');
});

test('threshold boundary is exactly 3', () => {
  assert.equal(SFU_PARTICIPANT_THRESHOLD, 3);
  assert.equal(
    decideTransport({ participantCount: 3, sfuEnabled: true }).transport,
    'mesh',
  );
  assert.equal(
    decideTransport({ participantCount: 4, sfuEnabled: true }).transport,
    'sfu',
  );
});

test('shouldFallbackToSfu: any failed peer triggers fallback', () => {
  assert.equal(
    shouldFallbackToSfu({
      peerStates: ['connecting', 'failed'],
      connectDeadlineExceeded: false,
    }),
    true,
  );
});

test('shouldFallbackToSfu: deadline exceeded with no connected peer triggers fallback', () => {
  assert.equal(
    shouldFallbackToSfu({
      peerStates: ['connecting', 'connecting'],
      connectDeadlineExceeded: true,
    }),
    true,
  );
});

test('shouldFallbackToSfu: deadline exceeded but a peer connected → stay on mesh', () => {
  assert.equal(
    shouldFallbackToSfu({
      peerStates: ['connected', 'connecting'],
      connectDeadlineExceeded: true,
    }),
    false,
  );
});

test('shouldFallbackToSfu: healthy mesh → no fallback', () => {
  assert.equal(
    shouldFallbackToSfu({
      peerStates: ['connected', 'connected'],
      connectDeadlineExceeded: false,
    }),
    false,
  );
});
