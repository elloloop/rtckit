/**
 * Headless event/callback contract — the heart of "bring your own UI".
 *
 * rtckit ships NO UI. It emits a precise, typed stream of room events so
 * the implementor drives their own interface: animate the mic ring from
 * `participantSpeaking`, swap a tile on `activeSpeakerChanged`, show a
 * spinner on `connectionQualityChanged`, etc.
 *
 * Contract only in this slice (no emitter impl yet) — but this is the
 * frozen surface every transport/binding must satisfy, so consumers and
 * the React bindings can be built against it independently.
 */

export type ParticipantId = string;

export interface ParticipantInfo {
  id: ParticipantId;
  /** Opaque, app-supplied display identity (rtckit never interprets it). */
  meta?: Readonly<Record<string, string>>;
  isLocal: boolean;
}

export type ConnectionQuality = 'excellent' | 'good' | 'poor' | 'lost';
export type TrackKind = 'audio' | 'video' | 'screen';

/**
 * Event name → payload. A single typed map so a typed emitter, the React
 * hooks, and contract tests all share one source of truth.
 */
export interface RoomEventMap {
  participantJoined: { participant: ParticipantInfo };
  participantLeft: { id: ParticipantId };
  /** Continuous voice-activity signal. `level` is 0..1 — wire it straight
   *  to a mic-ring animation. Fires for local and remote participants. */
  participantSpeaking: { id: ParticipantId; speaking: boolean; level: number };
  activeSpeakerChanged: { id: ParticipantId | null };
  trackPublished: { id: ParticipantId; kind: TrackKind; track: MediaStreamTrack };
  trackUnpublished: { id: ParticipantId; kind: TrackKind };
  muteChanged: { id: ParticipantId; kind: TrackKind; muted: boolean };
  connectionQualityChanged: { id: ParticipantId; quality: ConnectionQuality };
  /** Mesh⇄SFU migration (size threshold or mesh failure). UI usually
   *  ignores this; surfaced for diagnostics/telemetry. */
  transportSwitched: { transport: 'mesh' | 'sfu'; reason: string };
  roomStateChanged: { state: 'connecting' | 'connected' | 'reconnecting' | 'closed' };
  error: { fatal: boolean; code: string; message: string };
}

export type RoomEventName = keyof RoomEventMap;
export type RoomEventHandler<K extends RoomEventName> = (
  payload: RoomEventMap[K],
) => void;

/** Subscription surface consumers (and the React bindings) implement
 *  against. Returns an unsubscribe fn — no framework assumptions. */
export interface RoomEvents {
  on<K extends RoomEventName>(event: K, handler: RoomEventHandler<K>): () => void;
  off<K extends RoomEventName>(event: K, handler: RoomEventHandler<K>): void;
}
