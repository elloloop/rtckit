# rtckit

**Headless, embeddable real-time calling — composable libraries, not a product.**

1:1 or group calls, standalone or dropped into any interface. rtckit ships
**no UI**. It gives you a typed stream of callbacks — `participantSpeaking`
(0..1 level → animate your own mic ring), `activeSpeakerChanged`,
`connectionQualityChanged`, join/leave/mute — so *you* build exactly the
experience you want. Frontend **and** backend libraries, so any
TypeScript app and any Go backend can plug in the full ecosystem.

Apache-2.0.

## Why headless

Every WebRTC product bakes in its own UI. rtckit deliberately doesn't:
the design system, layout, animations, and theming are yours. We own the
hard parts — signaling, transport selection, NAT/relay, media — and emit
events; you own pixels. Provider (Cloudflare today, self-hosted SFU on
fixed boxes later) is a swappable binding, never a foundation.

## Layout

| Dir | Package / module | What |
|---|---|---|
| `core/` | `@elloloop/rtckit-core` | TS, **framework-agnostic**. Signaling protocol, transport policy, mesh/SFU contracts, headless event surface. Zero React, zero org deps. |
| `react/` | `@elloloop/rtckit-react` | *(planned)* thin hooks + **headless** (unstyled) components. Bring your own design system. |
| `go/` | `github.com/elloloop/rtckit/go` | *(seeded)* signaling server, secret-safe SFU relay proxy, recorder, room registry — for any Go backend. |
| `protocol/` | — | versioned, language-neutral signaling schema (source of truth so JS ⇄ Go interop is exact). |
| `examples/` | — | next.js · node · go · vanilla *(stubs)*. |

## Status — honest

This is an early seed, not a finished SDK.

- ✅ `core/` transport **policy** (1:1/≤3 mesh, >3 SFU, mesh-failure→SFU fallback) — pure, **9/9 unit tests**, zero test-runner/install deps (`node --test`).
- ✅ `core/` contracts: `VideoTransport`/`SfuAdapter` seams, versioned signaling protocol, and the **headless `RoomEventMap`** (the callback surface above).
- 🔜 `core/` impls: `MeshTransport`, `CloudflareSfuAdapter`, default WS signaling carrier, media (background blur/virtual-bg via Insertable Streams), room/instant-meeting model.
- 🔜 `react/` bindings; `go/` port of the (already production-verified) secret-safe Cloudflare relay proxy + recorder.

## Develop / test

No CI in this repo by design — run checks locally:

```bash
cd core && npm test        # tsc + node --test (no jest/vitest, no install needed)
cd core && npm run typecheck
```

Contracts are pure and reviewable; the policy is fully tested; adapters
will be contract-tested against fakes; media modules against a fake
`MediaStream`. Everything is independently testable with no browser and
no infra — that is a hard requirement, not an aspiration.
