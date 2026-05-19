# Examples

Planned, runnable end-to-end samples (intentionally stubs until the
transports land so they stay honest, not aspirational):

- `next.js/` — a call embedded in a Next.js app, custom UI wired to `RoomEventMap`
- `vanilla/` — no framework: `@elloloop/rtckit-core` + hand-rolled DOM
- `node/` — a Node backend mediating signaling
- `go/` — a Go backend using `github.com/elloloop/rtckit/go`

Each will show the headless model: rtckit emits events, the example owns
every pixel (including a mic-level ring driven by `participantSpeaking`).
