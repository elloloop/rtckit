# Changesets

This folder is managed by [Changesets](https://github.com/changesets/changesets).

Releases are **Changesets-driven** and published to npm **only** via CI using
GitHub OIDC trusted publishing (provenance) — never from a local machine or a
stored npm token.

## Add a changeset

```bash
pnpm changeset
```

Pick the affected **public** `@elloloop/rtckit-*` package(s) and the bump
type (patch / minor / major), write a short summary, and commit the generated
`.changeset/*.md` file in your PR.

## How a release happens

1. Land a PR that includes a `.changeset/*.md`.
2. The Release workflow opens/updates a **`chore: release packages`** Version
   PR (consumes changesets → bumps versions → writes CHANGELOGs).
3. Merge that Version PR. The next Release run finds no changesets and runs
   `scripts/publish-oidc.mjs`, publishing the non-private packages to npm
   `@latest` via OIDC.

See `CONTRIBUTING` / the repo README for the npm trusted-publisher setup that
must exist before the first publish.
