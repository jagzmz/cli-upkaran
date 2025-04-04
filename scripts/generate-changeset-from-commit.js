import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

// --- Configuration ---
// Map Conventional Commit types to Changeset bump types
// You might need to adjust this based on your conventions
const bumpTypeMap = {
  feat: 'minor',
  fix: 'patch',
  perf: 'patch',
  revert: 'patch',
  // Add other types if needed (e.g., chore, docs, style, refactor, test, build, ci)
  // If a type isn't listed, it might be skipped or default to patch (see logic below)
};
// --- End Configuration ---

function getChangedPackages(baseRef = 'HEAD~1') {
  console.log(
    `[changeset:from-commit] Finding changed packages against ${baseRef}...`,
  );
  const diffOutput = execSync(`git diff --name-only ${baseRef} HEAD`, {
    encoding: 'utf-8',
  });
  const changedFiles = diffOutput.split('\n').filter(Boolean);

  // Assuming a standard monorepo structure like packages/pkg-name
  // Adjust the regex/logic if your structure is different
  const packageRegex = /^packages\/([^/]+)\//;
  const changedPkgNames = new Set();

  for (const file of changedFiles) {
    const match = file.match(packageRegex);
    if (match && match[1]) {
      // You might need to map directory name back to actual package name from package.json
      // For simplicity, assuming directory name is usable or mapping isn't needed here
      // Or lookup package.json name based on path
      changedPkgNames.add(match[1]); // Example: add 'cli', 'core'
    }
    // Handle changes in the root if necessary
    // else if (!file.includes('/')) { /* Maybe root changes affect something? */ }
  }

  // VERY IMPORTANT: We need the *actual package names* as defined in their package.json files
  // for changesets to work correctly. Let's read them.
  const actualPkgNames = new Set();
  const pkgsDir = path.join(process.cwd(), 'packages');
  const pkgDirs = fs
    .readdirSync(pkgsDir, { withFileTypes: true })
    .filter(
      (dirent) => dirent.isDirectory() && changedPkgNames.has(dirent.name),
    )
    .map((dirent) => dirent.name);

  for (const dirName of pkgDirs) {
    const pkgJsonPath = path.join(pkgsDir, dirName, 'package.json');
    try {
      const pkgJson = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf-8'));
      if (pkgJson.name) {
        actualPkgNames.add(pkgJson.name); // Add @cli-upkaran/core etc.
      }
    } catch (e) {
      console.warn(
        `[changeset:from-commit] Warning: Could not read package.json for changed package in dir ${dirName}`,
      );
    }
  }

  const result = Array.from(actualPkgNames);
  console.log(
    `[changeset:from-commit] Detected changes in packages: ${result.join(', ') || 'None'}`,
  );
  return result;
}

function getCommitDetails(ref = 'HEAD') {
  console.log(`[changeset:from-commit] Getting commit details for ${ref}...`);
  const message = execSync(`git log -1 --pretty=%B ${ref}`, {
    encoding: 'utf-8',
  }).trim();
  const lines = message.split('\n');
  const subjectLine = lines[0] || '';
  const body = lines.slice(2).join('\n').trim();

  // Basic Conventional Commit parsing
  const match = subjectLine.match(/^(\w+)(?:\(([^)]+)\))?(!)?:\s*(.*)$/);
  let type = null;
  let scope = null;
  let subject = subjectLine; // Default to full line if no conventional structure

  if (match) {
    type = match[1];
    scope = match[2] || null;
    // subject = match[4]; // Use the part after the type/scope
    // Let's use the full subject line for the summary for now, it's often more descriptive
  }

  console.log(
    `[changeset:from-commit] Commit type: ${type}, Subject: ${subject}`,
  );
  return { type, scope, subject, body, message };
}

function createChangesetFile(packages, bumpType, summary) {
  console.log(`[changeset:from-commit] Creating changeset file...`);
  const changesetDir = path.join(process.cwd(), '.changeset');
  if (!fs.existsSync(changesetDir)) {
    console.log(`[changeset:from-commit] Creating directory: ${changesetDir}`);
    fs.mkdirSync(changesetDir);
  }

  const frontmatter = packages.map((pkg) => `'${pkg}': ${bumpType}`).join('\n');
  const content = `---
${frontmatter}
---

${summary.trim()}\n`;

  // Generate a somewhat unique filename
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = path.join(changesetDir, `commit-${timestamp}.md`);

  fs.writeFileSync(filename, content, 'utf-8');
  console.log(`[changeset:from-commit] Created: ${filename}`);

  // Stage the new file
  execSync(`git add "${filename}"`);
  console.log(`[changeset:from-commit] Staged: ${filename}`);
}

// --- Main Script Logic ---
try {
  const commit = getCommitDetails();
  const changedPackages = getChangedPackages();

  if (changedPackages.length === 0) {
    console.log(
      '[changeset:from-commit] No packages changed in the last commit. Skipping changeset generation.',
    );
    process.exit(0);
  }

  const bumpType = bumpTypeMap[commit.type || ''] || 'patch'; // Default to patch if type unknown/missing
  console.log(`[changeset:from-commit] Determined bump type: ${bumpType}`);

  let summary = commit.subject;
  if (commit.body) {
    summary += `\n\n${commit.body}`;
  }

  createChangesetFile(changedPackages, bumpType, summary);

  // Amend the previous commit to include the changeset
  console.log(
    '[changeset:from-commit] Amending previous commit to include changeset...',
  );
  execSync(`git commit --amend --no-edit`);
  console.log('[changeset:from-commit] Commit amended successfully.');
} catch (error) {
  console.error('[changeset:from-commit] Error executing script:', error);
  process.exit(1);
}
