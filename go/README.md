# @elloloop/rtckit — Go

Server-side libraries for any Go backend: signaling server, the
**secret-safe SFU relay proxy** (keeps the provider App Secret off the
client), the optional recorder, and a room registry.

## Status

**Seeded, not yet ported.** The relay proxy this will contain is already
implemented and *production-verified* in a private codebase (Cloudflare
Realtime: session mint → 201, scoped path guard, feature-gated, secret
never reaches the browser). Porting it here as a clean, dependency-light
`net/http` library — usable via `http.Handler` in any Go server — is the
next Go milestone.

Design intent: zero heavy deps, `http.Handler`-shaped, provider behind an
interface (Cloudflare now, self-hosted mediasoup/LiveKit on fixed boxes
later) — mirroring the `SfuAdapter` seam in `core/`.
