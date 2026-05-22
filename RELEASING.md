# Releasing the npm packages

**Ongoing** releases of the `@elloloop/rtckit-*` TypeScript libraries are
published to npm **only** by CI, using **GitHub OIDC trusted publishing**
(provenance) — no stored npm token, every release provenance-signed. The one
exception is a single **bootstrap publish per package name** (below): npm
(unlike PyPI) requires a package to already exist before a Trusted Publisher
can be configured, so the very first version must be created manually.

## One-time setup (required before the first publish)

These are manual and can only be done by a maintainer — CI cannot do them.

### 1. npmjs.com — bootstrap the package, then register a Trusted Publisher

For **each** package name (`@elloloop/rtckit-core` today; future bindings like
`@elloloop/rtckit-react` later):

- Own/control the `@elloloop` scope (org or user scope) and allow **public**
  scoped packages.
- **Bootstrap (one time): publish an initial version manually** to create the
  package on npm — npm will not let you configure a Trusted Publisher until
  the package exists. From a clean checkout of `main`:

  ```bash
  pnpm install && pnpm build
  cd core && npm publish --access public   # use `npm login` / 2FA OTP
  # creates @elloloop/rtckit-core@0.0.1
  ```

- Now add a **Trusted Publisher** (npmjs.com → the package's *Settings →
  Trusted Publisher*) pointing at:
  - **Repository:** `elloloop/rtckit`
  - **Workflow:** `.github/workflows/release.yml`
  - **Environment:** _(leave blank unless you add one)_
- After this, **never publish locally again** — every release goes through CI
  OIDC. The seed changeset's **0.1.0** becomes the first OIDC/provenance
  release. Do **not** create a long-lived npm automation token or add one to
  GitHub secrets.

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
