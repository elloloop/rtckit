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
 * Provider boundary for SFU mode — **WHIP/WHEP-shaped on purpose**.
 *
 * WHIP (RFC 9725) and WHEP are the standard HTTP WebRTC ingest/egress
 * exchange: POST a local SDP offer, get an SDP answer + a resource URL,
 * DELETE the resource to leave. Modeling the seam on the standard means
 * any WHIP/WHEP-capable SFU (Cloudflare Realtime today; self-hosted
 * mediasoup/LiveKit on fixed boxes later) is a drop-in — the provider is
 * a swappable binding, not a foundation.
 *
 * Every call is brokered by the control-plane backend so the provider
 * App Secret never reaches the browser. A provider that lacks WHIP/WHEP
 * gets a native adapter that still satisfies this interface.
 */
export interface SfuAdapter {
  readonly provider: string;
  /** WHIP: publish local tracks. `offer` is the browser's SDP; resolves
   *  to the SFU's SDP answer + the resource URL used to tear down. */
  whipPublish(offer: string): Promise<{ answer: string; resource: string }>;
  /** WHEP: subscribe to the room's remote media. */
  whepSubscribe(offer: string): Promise<{ answer: string; resource: string }>;
  /** DELETE the WHIP/WHEP resource (leave / unpublish). */
  close(resource: string): Promise<void>;
}
