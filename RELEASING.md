# Releasing the npm packages

The `@elloloop/rtckit-*` TypeScript libraries are published to npm **only** by
CI, using **GitHub OIDC trusted publishing** (provenance) — never from a local
machine and never with a stored npm token. This is a deliberate supply-chain
choice: no long-lived secret, and every release is provenance-signed.

## One-time setup (required before the first publish)

These are manual and can only be done by a maintainer — CI cannot do them.

### 1. npmjs.com — register a Trusted Publisher per package

For **each** package name (`@elloloop/rtckit-core` today; future bindings like
`@elloloop/rtckit-react` later):

- Own/control the `@elloloop` scope (org or user scope) and allow **public**
  scoped packages.
- Add a **Trusted Publisher** (npmjs.com → package *Settings → Trusted
  Publisher*, or the account/org "Trusted Publishers" page) pointing at:
  - **Repository:** `elloloop/rtckit`
  - **Workflow:** `.github/workflows/release.yml`
  - **Environment:** _(leave blank unless you add one)_
- npm lets you **pre-register** a trusted publisher for a package name that
  does not exist yet — so no bootstrap token publish is needed.
- Do **not** create an npm automation/granular token or add one to GitHub
  secrets. Trusted publishing is tokenless by design.

### 2. GitHub — repo settings

`elloloop/rtckit` → **Settings → Actions → General → Workflow permissions**:

- **Read and write permissions**
- **Allow GitHub Actions to create and approve pull requests**

(The publish job uses `id-token: write` for OIDC — declared in the workflow,
no secret required.)

## Day-to-day release flow (Changesets-driven)

1. In a PR, add a changeset: `pnpm changeset` → pick the affected public
   package(s) + bump type, write a summary, commit the `.changeset/*.md`.
2. Land the PR. The **Release** workflow opens/updates a
   **`chore: release packages`** Version PR (consumes changesets → bumps
   versions → writes CHANGELOGs).
3. Merge the Version PR. The next Release run finds no changesets and runs
   `scripts/publish-oidc.mjs`, publishing the non-private packages to npm
   `@latest` with provenance.
4. Verify: `npm view @elloloop/rtckit-core dist-tags --json`.

## Local checks

```bash
make ci                 # turbo: typecheck · test · build
pnpm changeset status   # what will be released
cd core && npm pack --dry-run   # inspect the tarball
```

`scripts/publish-oidc.mjs` discovers workspace packages via `pnpm ls -r` and
skips anything `"private": true`, so only the intended public libraries ship.
