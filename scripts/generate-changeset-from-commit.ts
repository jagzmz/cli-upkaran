import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

function getChangedPackages(baseRef = 'HEAD~1'): string[] {
  console.log(
    `[changeset:from-commit] Finding changed packages against ${baseRef}...`,
  );
  const diffOutput = execSync(`git diff --name-only ${baseRef} HEAD`, {
    encoding: 'utf-8',
  });
  const changedFiles = diffOutput.split('\n').filter(Boolean);

  // More robust detection: find the top-level dir under packages/
  const changedPkgDirs = new Set<string>();

  for (const file of changedFiles) {
    if (file.startsWith('packages/')) {
      // Extract the first directory component after packages/
      // Example: packages/cli/src/index.ts -> cli
      // Example: packages/core/package.json -> core
      const parts = file.split('/');
      if (parts.length >= 2) {
        const dirName = parts[1];
        changedPkgDirs.add(dirName);
      }
    }
    // Consider if root changes should affect specific packages, e.g.,
    // if (file === 'pnpm-lock.yaml') { /* add all packages? */ }
  }

  // Map directory names to actual package names from package.json
  const actualPkgNames = new Set<string>();
  const pkgsDir = path.join(process.cwd(), 'packages');

  // Filter pkgDirs to only those that actually exist (sanity check)
  const existingPkgDirs = fs
    .readdirSync(pkgsDir, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name);

  for (const dirName of changedPkgDirs) {
    if (!existingPkgDirs.includes(dirName)) {
      console.warn(
        `[changeset:from-commit] Changed dir '${dirName}' not found under '${pkgsDir}'. Skipping.`,
      );
      continue;
    }
    const pkgJsonPath = path.join(pkgsDir, dirName, 'package.json');
    try {
      const pkgJson = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf-8'));
      actualPkgNames.add(pkgJson.name);
    } catch (error) {
      console.error(
        `[changeset:from-commit] Error reading package.json for ${dirName}:`,
        error,
      );
    }
  }

  const result = Array.from(actualPkgNames);
  console.log(
    `[changeset:from-commit] Detected changes in packages: ${result.join(', ') || 'None'}`,
  );
  return result;
}

getChangedPackages();
