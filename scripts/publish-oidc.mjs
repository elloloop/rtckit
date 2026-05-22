import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

// Publishes every NON-private workspace package to npm using GitHub Actions
// OIDC "trusted publishing" — no long-lived npm token is ever stored. The
// GitHub OIDC token is exchanged for a short-lived, per-package npm token at
// publish time, and packages are published with provenance. This script is
// generic: it discovers public packages via `pnpm ls -r` and skips anything
// marked `"private": true`.
//
// Prerequisite (one-time, on npmjs.com): each package name must have a
// Trusted Publisher registered pointing at this repo + the Release workflow.
// Until that exists npm will reject the token exchange.

function getPackageNpmToken(pkgName, githubOidcToken) {
  const encodedPkg = pkgName.replace('@', '%40').replace('/', '%2f');
  const npmResponse = execSync(`curl -sS -f -X POST "https://registry.npmjs.org/-/npm/v1/oidc/token/exchange/package/${encodedPkg}" -H "Authorization: Bearer ${githubOidcToken}"`).toString();

  return JSON.parse(npmResponse).token;
}

function withPackageNpmrc(npmToken, callback) {
  const npmrcPath = path.join(process.cwd(), '.npmrc.tmp');
  fs.writeFileSync(npmrcPath, `//registry.npmjs.org/:_authToken=${npmToken}\n`);

  try {
    callback(npmrcPath);
  } finally {
    fs.rmSync(npmrcPath, { force: true });
  }
}

async function publish() {
  const tag = 'latest';
  console.log('📦 Starting OIDC publish (latest)...');

  // 1. Find all public packages in the workspace
  const packagesStr = execSync('pnpm ls -r --depth -1 --json').toString();
  const allPackages = JSON.parse(packagesStr);
  const publicPackages = allPackages.filter(pkg => !pkg.private);

  if (publicPackages.length === 0) {
    console.log('✅ No public packages found.');
    return;
  }

  // 2. Get the base OIDC token from the environment
  const idTokenUrl = process.env.ACTIONS_ID_TOKEN_REQUEST_URL;
  const idToken = process.env.ACTIONS_ID_TOKEN_REQUEST_TOKEN;

  if (!idTokenUrl || !idToken) {
    throw new Error('Missing GITHUB_ACTIONS OIDC environment variables.');
  }

  const oidcResponse = execSync(`curl -sS -f "${idTokenUrl}&audience=npm:registry.npmjs.org" -H "Authorization: Bearer ${idToken}"`).toString();
  const githubOidcToken = JSON.parse(oidcResponse).value;

  // 3. Check and publish each package
  for (const pkg of publicPackages) {
    const pkgName = pkg.name;
    const pkgVersion = pkg.version;
    const pkgPath = pkg.path;

    console.log(`\n🔍 Checking ${pkgName}@${pkgVersion}...`);

    // Check if version is already published
    let isPublished = false;
    let distTags = {};
    try {
      const publishedVersionsStr = execSync(`npm info ${pkgName} versions --json`, { stdio: ['pipe', 'pipe', 'ignore'] }).toString();
      const publishedVersions = JSON.parse(publishedVersionsStr);
      if (publishedVersions.includes(pkgVersion)) {
        isPublished = true;
      }

      const distTagsStr = execSync(`npm info ${pkgName} dist-tags --json`, { stdio: ['pipe', 'pipe', 'ignore'] }).toString();
      distTags = JSON.parse(distTagsStr);
    } catch (err) {
      // 404 means the package has never been published before
      console.log(`ℹ️  ${pkgName} not found on npm. Publishing first version.`);
    }

    if (isPublished) {
      if (distTags[tag] === pkgVersion) {
        console.log(`⏭️  ${pkgName}@${pkgVersion} is already published with tag ${tag}. Skipping.`);
        continue;
      }

      console.log(`🏷️  ${pkgName}@${pkgVersion} is already published. Moving ${tag} tag from ${distTags[tag] ?? 'unset'} to ${pkgVersion}.`);

      try {
        const npmToken = getPackageNpmToken(pkgName, githubOidcToken);

        withPackageNpmrc(npmToken, npmrcPath => {
          execSync(`npm dist-tag add ${pkgName}@${pkgVersion} ${tag} --userconfig ${npmrcPath}`, {
            stdio: 'inherit'
          });
        });

        console.log(`✅ Successfully tagged ${pkgName}@${pkgVersion} as ${tag}`);
      } catch (err) {
        console.error(`❌ Failed to tag ${pkgName}@${pkgVersion} as ${tag}:`, err.message);
      }
      continue;
    }

    console.log(`🔐 Fetching npm token for ${pkgName}...`);

    try {
      const npmToken = getPackageNpmToken(pkgName, githubOidcToken);

      console.log(`🚀 Publishing ${pkgName}@${pkgVersion}...`);

      withPackageNpmrc(npmToken, npmrcPath => {
        execSync(`npm publish --userconfig ${npmrcPath} --tag ${tag} --access public --provenance`, {
          cwd: pkgPath,
          stdio: 'inherit'
        });
      });

      console.log(`✅ Successfully published ${pkgName}`);
    } catch (err) {
      console.error(`❌ Failed to publish ${pkgName}:`, err.message);
      // We continue to other packages even if one fails
    }
  }
}

publish().catch(err => {
  console.error(err);
  process.exit(1);
});
