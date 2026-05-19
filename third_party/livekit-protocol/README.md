# third_party/livekit-protocol

**Vendored, unmodified copy of [livekit/protocol](https://github.com/livekit/protocol).**

- **Upstream:** https://github.com/livekit/protocol
- **Commit:** `d0b708548748d8ee51e03cfba0cd55e427afc7af`
- **Vendored:** 2026-05-20
- **License:** Apache-2.0 (preserved as `LICENSE`; see `NOTICE` for upstream notices)
- **Files:** 39 `.proto` files under `protobufs/`

## Why this is here

**Reference material**, not rtckit's protocol. We study LiveKit's proven wire
surface — room service RPCs, signaling messages, egress, ingress, SIP, agents —
to inform the design of our own protos in [`protocol/`](../../protocol/).

This vendoring is **deliberately separate** from our own `protocol/` directory
so the line stays clear:

- `third_party/livekit-protocol/` — upstream's protocol, unmodified, Apache-2.0
  reference. We read from it; we do not ship a divergent fork of it.
- `protocol/` — **rtckit's own** protos, in our namespace, designed informed by
  the upstream above.

## License compliance

All files in this directory are **unmodified** upstream Apache-2.0 content.
Copyright notices and the upstream LICENSE/NOTICE are preserved. If you modify
anything here, follow Apache-2.0 §4 (state your changes prominently) — but we
deliberately don't modify; modifications belong in our own `protocol/`.

## Refreshing

To re-sync to a newer upstream commit:

```bash
TMP=$(mktemp -d); git clone --depth 1 https://github.com/livekit/protocol "$TMP/lk"
cp -R "$TMP/lk/protobufs"/* protobufs/
cp "$TMP/lk/LICENSE" "$TMP/lk/NOTICE" .  # if either changed
# Update the commit + date above
```
