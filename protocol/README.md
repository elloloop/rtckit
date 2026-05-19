# rtckit signaling protocol

Versioned, transport-agnostic message schema — the single source of truth
so the TypeScript `core/` and the Go server interop exactly, and so
alternative carriers (WebSocket pub/sub by default; a self-hosted
signaling server on fixed boxes later) drop in unchanged.

The canonical definition currently lives in
[`core/src/signaling/protocol.ts`](../core/src/signaling/protocol.ts)
(`PROTOCOL_VERSION = 1`): room join/leave, SDP offer/answer, ICE, and
`transport-switch` (mesh⇄SFU migration announced room-wide so peers
re-establish in lockstep).

Next: extract this into a language-neutral spec here (JSON Schema) with
Go types generated from it, so neither side hand-maintains the wire
format.
