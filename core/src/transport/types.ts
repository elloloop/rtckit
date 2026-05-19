/**
 * Transport seam. `VideoTransport` is what the room/UI consumes; it never
 * knows whether it's talking P2P mesh or an SFU. `SfuAdapter` is the
 * provider boundary — Cloudflare today, mediasoup/LiveKit on fixed boxes
 * later — swapping it is a binding change, nothing else.
 *
 * Interfaces only in this slice; MeshTransport + CloudflareSfuAdapter are
 * subsequent phases (see README roadmap).
 */

export interface LocalMedia {
  stream: MediaStream;
}

export interface RemoteParticipant {
  id: string;
  stream: MediaStream;
}

export interface VideoTransportEvents {
  onRemoteAdded(p: RemoteParticipant): void;
  onRemoteRemoved(id: string): void;
  /** Fatal transport failure — the orchestrator decides whether to
   *  migrate (mesh→SFU) based on {@link import('./policy.ts')}. */
  onFailed(reason: string): void;
}

export interface VideoTransport {
  readonly kind: 'mesh' | 'sfu';
  start(local: LocalMedia, ev: VideoTransportEvents): Promise<void>;
  /** Hot-swap the published stream (camera toggle, screen share,
   *  blurred/virtual-bg track) without renegotiating the room. */
  replaceLocal(local: LocalMedia): Promise<void>;
  stop(): Promise<void>;
}

/**
 * Provider boundary for SFU mode. Every method maps to a server-side
 * proxied call (the App Secret never reaches the browser — see
 * backend/internal/service/realtime). A new provider = a new
 * implementation of this interface + a config binding.
 */
export interface SfuAdapter {
  readonly provider: string;
  /** Create a session; returns the opaque session handle. */
  createSession(): Promise<{ sessionId: string }>;
  publish(
    sessionId: string,
    tracks: MediaStreamTrack[],
  ): Promise<{ trackIds: string[] }>;
  subscribe(
    sessionId: string,
    remoteTrackIds: string[],
  ): Promise<MediaStreamTrack[]>;
  close(sessionId: string): Promise<void>;
}
