/**
 * Transport-selection policy — the keystone of the kit and a *pure*
 * function (no WebRTC, no I/O) so it is exhaustively unit-testable.
 *
 * Product rules (from the brief):
 *   - SFU feature off            → always mesh (P2P only; safe default)
 *   - participants > 3           → SFU (mesh of 4+ is N·(N−1) connections)
 *   - participants ≤ 3           → mesh primary, SFU *fallback* on mesh failure
 *
 * The decision is data-in/data-out. The orchestrator owns side effects;
 * this module owns the rule and nothing else.
 */

export type Transport = 'mesh' | 'sfu';

export interface TransportInput {
  /** Total participants in the room, including the local user. */
  participantCount: number;
  /** Master feature flag (NEXT_PUBLIC_SFU_ENABLED). When false the SFU
   *  path is unavailable and we never select or fall back to it. */
  sfuEnabled: boolean;
  /** True once the mesh attempt has been observed to fail for this room
   *  (see {@link shouldFallbackToSfu}). Drives the ≤3 fallback. */
  meshFailed?: boolean;
}

export interface TransportDecision {
  transport: Transport;
  /** Stable machine-readable reason — useful for logs/metrics/tests. */
  reason:
    | 'sfu_disabled'
    | 'group_call_sfu'
    | 'mesh_primary'
    | 'mesh_failed_fallback_sfu';
}

/** The group-size threshold above which SFU is the default. */
export const SFU_PARTICIPANT_THRESHOLD = 3;

export function decideTransport(input: TransportInput): TransportDecision {
  const { participantCount, sfuEnabled, meshFailed = false } = input;

  if (!sfuEnabled) {
    return { transport: 'mesh', reason: 'sfu_disabled' };
  }
  if (participantCount > SFU_PARTICIPANT_THRESHOLD) {
    return { transport: 'sfu', reason: 'group_call_sfu' };
  }
  if (meshFailed) {
    return { transport: 'sfu', reason: 'mesh_failed_fallback_sfu' };
  }
  return { transport: 'mesh', reason: 'mesh_primary' };
}

/**
 * Pure predicate: given the observed RTCPeerConnection states across the
 * mesh, has it failed hard enough to migrate the room to the SFU?
 *
 * Kept separate from {@link decideTransport} so connection-state handling
 * is testable without a browser. The orchestrator feeds it the states it
 * collects from `pc.connectionState` / `pc.iceConnectionState` plus a
 * connect-deadline flag.
 */
export interface MeshHealth {
  /** `RTCPeerConnection.connectionState` values across current peers. */
  peerStates: ReadonlyArray<
    'new' | 'connecting' | 'connected' | 'disconnected' | 'failed' | 'closed'
  >;
  /** True if no peer reached `connected` before the connect deadline. */
  connectDeadlineExceeded: boolean;
}

export function shouldFallbackToSfu(h: MeshHealth): boolean {
  if (h.peerStates.some((s) => s === 'failed')) return true;
  if (
    h.connectDeadlineExceeded &&
    !h.peerStates.some((s) => s === 'connected')
  ) {
    return true;
  }
  return false;
}
