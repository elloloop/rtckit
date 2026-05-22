# @elloloop/rtckit-core

**Headless, framework-agnostic real-time calling core.** Part of
[rtckit](https://github.com/elloloop/rtckit) — composable libraries for 1:1
and group calls. Zero React, zero UI, zero runtime dependencies: you get a
typed signaling protocol, transport-selection policy (mesh ↔ SFU), media /
transport contracts, and a headless event surface. Bring your own UI.

```bash
npm install @elloloop/rtckit-core
```

```ts
import {
  decideTransport,
  PROTOCOL_VERSION,
  isSignalType,
} from '@elloloop/rtckit-core'
```

Dual ESM/CJS with type declarations. Published to npm with provenance via
GitHub OIDC trusted publishing.

Apache-2.0.
