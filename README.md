# rtckit

**Headless, embeddable real-time calling — composable libraries, not a product.**

1:1 or group calls, standalone or dropped into any interface. rtckit ships
**no UI**. It gives you a typed stream of callbacks — `participantSpeaking`
(0..1 level → animate your own mic ring), `activeSpeakerChanged`,
`connectionQualityChanged`, join/leave/mute — so *you* build exactly the
experience you want. Frontend **and** backend libraries, so any
TypeScript app and any Go backend can plug in the full ecosystem.

Apache-2.0.

## Architecture — two planes

Media **never** flows through your backend. That is the whole reason this
stays cheap and scales.

```
 CONTROL PLANE (Go)                        MEDIA PLANE (never touches Go)
 create/join rooms, auth/tokens,           Browser ⇄ Browser   (≤3, P2P mesh)
 signaling, secret-safe SFU                Browser ⇄ SFU       (>3, Cloudflare /
 negotiation (WHIP/WHEP), recorder                              any future SFU)
 orchestration, presence                   Go brokers the *negotiation* only —
        ▲ any Go server mounts it          never a single media byte.
        │
 Frontend TS/JS: call engine (mesh/SFU policy), device mgmt, signaling
 client → Go, headless event surface, client-side ML (blur / virtual-bg
 via Insertable Streams + MediaPipe — 100% in-browser, zero server cost).
```

Routing media through the backend (MCU) is explicitly **out** — it's the
expensive path. rtckit is SFU/mesh only.

## Why headless + standards-first

The design system, layout, animations, theming are yours. We own the hard
parts and emit events; you own pixels.

The SFU boundary speaks **WHIP/WHEP** (RFC 9725 + WHEP draft — the
standard HTTP WebRTC ingest/egress exchange) wherever the provider
supports it (Cloudflare Realtime does), with a provider-native adapter
only as fallback. Result: **any WHIP/WHEP SFU is a drop-in** — Cloudflare
today, self-hosted mediasoup/LiveKit on fixed boxes later — the provider
is a swappable binding, aligned to a standard, never a foundation.

Room model / presence / "who's speaking" is deliberately *not* a
standard (WebRTC leaves signaling to the app) — so rtckit owns one tight,
**versioned**, codegen-friendly protocol shared across TS + Go.

## Layout

Single polyglot repo on purpose: `protocol/` is one wire contract both
sides must implement bit-identically, so changes stay **atomic** (schema
+ TS + Go + tests in one commit). The **Go module is the repo root**
(`github.com/elloloop/rtckit`) → clean `vX.Y.Z` tags; npm packages
version independently via `package.json`, so the two ecosystems never
collide.

| Path | Package / module | What |
|---|---|---|
| `/` (root) | `github.com/elloloop/rtckit` (Go) | signaling server, secret-safe SFU proxy (WHIP/WHEP + provider adapters), recorder, room registry — any Go backend |
| `core/` | `@elloloop/rtckit-core` | TS, **framework-agnostic**. Signaling protocol, transport policy, mesh/SFU contracts, headless event surface. Zero React, zero org deps. |
| `react/` | `@elloloop/rtckit-react` | *(planned)* thin hooks + **headless** (unstyled) components. Bring your own design system. |
| `protocol/` | — | versioned, language-neutral signaling schema (source of truth; codegen TS + Go from it). |
| `examples/` | — | next.js · node · go · vanilla *(stubs)*. |

## Status — honest

This is an early seed, not a finished SDK.

- ✅ `core/` transport **policy** (1:1/≤3 mesh, >3 SFU, mesh-failure→SFU fallback) — pure, **9/9 unit tests**, zero test-runner/install deps (`node --test`).
- ✅ `core/` contracts: `VideoTransport`/`SfuAdapter` (WHIP/WHEP-shaped) seams, versioned signaling protocol, headless `RoomEventMap`.
- 🔜 `core/` impls: `MeshTransport`, `WhipWhepSfuAdapter` (+ Cloudflare binding), default WS signaling carrier, media (blur/virtual-bg), room/instant-meeting model.
- 🔜 root Go module: port of the already production-verified secret-safe Cloudflare relay proxy + recorder; `react/` bindings.

## Develop / test

No CI in this repo by design — run checks locally:

```bash
cd core && npm test        # tsc + node --test (no jest/vitest, no install needed)
cd core && npm run typecheck
go vet ./... && go test ./...   # once Go packages land
```

Contracts are pure and reviewable; the policy is fully tested; adapters
are contract-tested against fakes; media modules against a fake
`MediaStream`. Everything is independently testable with no browser and
no infra — a hard requirement, not an aspiration.
