# CLAUDE.md

## How I expect you to write code

**No shortcuts. "Simple" never means "sloppy."** A small diff that hardcodes,
duplicates, or skips a test isn't simpler — it's deferred cost.

1. **Fix causes, not symptoms.** Find the root cause before fixing. If you're
   applying a workaround, say so explicitly and explain why. Never swallow an
   exception or silence an error to make a problem disappear.

2. **Think about consequences.** Before changing shared or widely-used code,
   trace its callers and the invariants they rely on. A fix that's locally
   correct but breaks something elsewhere — now or later — is not a fix.

3. **SOLID, sensibly.** One responsibility per class/widget/function. Separate
   pure logic from I/O so it can be tested. Inject dependencies that cross a
   boundary so they're mockable. Don't add abstractions for things that don't
   cross a boundary.

4. **DRY about knowledge, not appearance.** Don't duplicate a rule or decision.
   Code that merely looks similar but changes for different reasons stays
   separate. When unsure, prefer duplication over a premature/wrong abstraction.

5. **No hardcoded values.** No magic numbers or strings inline — give them
   names. Environment/tenant/feature-specific values go in typed config in
   application code, never scattered literals, never the database.

6. **Readable & maintainable.** Clear names, short flat functions, early
   returns over deep nesting. Comments explain *why*, not *what*. Match the
   existing style of the file you're editing.

7. **Testable, and prove it.** Ship a test for behavior you add or change. If
   something is hard to test, that's a design smell — restructure until it
   isn't. "Works but can't be tested" means it isn't done.

A change is done only when: the cause (not a symptom) is fixed, no new hardcoded
values, a test covers it, and the analyzer/formatter are clean.

## Project facts

> Keep these current as the repo evolves; only write what you've confirmed.

- **Setup:** `cd core && npm install` (TS core; only devDep is `typescript`). Go module root has no deps yet (`go.mod` is empty besides `go 1.23`).
- **Analyze/lint:** `cd core && npm run typecheck` (`tsc --noEmit`); `go vet ./...`. No ESLint or golangci-lint configured.
- **Test (all):** `cd core && npm test` (`tsc -p tsconfig.test.json` then `node --test "dist-test/**/*.test.js"`, zero test-runner deps); `go vet ./... && go test ./...` once Go packages land.
- **Test (single):** `cd core && tsc -p tsconfig.test.json && node --test dist-test/<path>.test.js`; Go: `go test -run TestName ./...`.
- **Format:** none configured (no Prettier/ESLint/gofmt config). Use `gofmt` for Go; match existing TS style.
- **Run an app:** no runnable app yet — `examples/` (next.js · node · go · vanilla) are stubs and the root Go signaling server is not yet ported.
- **Repo layout:** `core/` (`@elloloop/rtckit-core` TS, framework-agnostic signaling/transport/events); `protocol/` (versioned wire schema, source of truth); `examples/` (stubs); `third_party/livekit-protocol/` (vendored reference protos); repo root is the Go module `github.com/elloloop/rtckit`.
- **State management / data layer:** transport policy is pure logic (`core/src/transport/policy.ts`); `VideoTransport`/`SfuAdapter` (WHIP/WHEP-shaped) are mockable seams in `types.ts`; headless `RoomEventMap` event surface in `core/src/events.ts`. Signaling protocol source of truth is `core/src/signaling/protocol.ts` (`PROTOCOL_VERSION = 1`). Media never flows through the Go backend (SFU/mesh only, no MCU).
- **Generated / do-not-hand-edit:** `third_party/livekit-protocol/` is a vendored, unmodified upstream copy — refresh via its README script, never hand-edit. `core/dist/` and `core/dist-test/` are build outputs (gitignored).
- **Gotchas:** protocol changes must stay atomic across schema + TS + Go + tests in one commit; no CI by design (run checks locally); TS core uses CommonJS deliberately so the pure core is testable via `node --test` with no test-runner; npm packages version via `package.json` while the Go module versions via repo-root `vX.Y.Z` tags.
