/**
 * Signaling protocol — versioned, transport-agnostic message schema.
 *
 * This is a *contract*, not an implementation. The default carrier is a
 * WebSocket pub/sub topic (subsequent phase), but the protocol is defined
 * independently so it can be contract-tested and so alternative carriers
 * (or a self-hosted signaling server on fixed boxes) drop in unchanged.
 */

export const PROTOCOL_VERSION = 1 as const;

export interface Envelope<T extends SignalMessage = SignalMessage> {
  v: typeof PROTOCOL_VERSION;
  roomId: string;
  /** Sender's opaque client id. */
  from: string;
  /** Target client id, or omitted for room-wide broadcast. */
  to?: string;
  msg: T;
}

export type SignalMessage =
  | { type: 'peer-joined' }
  | { type: 'peer-left' }
  | { type: 'sdp-offer'; sdp: string }
  | { type: 'sdp-answer'; sdp: string }
  | { type: 'ice'; candidate: RTCIceCandidateInit }
  /** Transport migration (e.g. mesh→SFU) announced room-wide so peers
   *  re-establish on the new transport in lockstep. */
  | { type: 'transport-switch'; transport: 'mesh' | 'sfu' };

export type SignalType = SignalMessage['type'];

/** Narrowing helper used by carriers + contract tests. */
export function isSignalType<K extends SignalType>(
  m: SignalMessage,
  k: K,
): m is Extract<SignalMessage, { type: K }> {
  return m.type === k;
}
