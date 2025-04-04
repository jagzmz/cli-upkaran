import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

const commitMsgFile = process.argv[2];
const commitSource = process.argv[3]; // e.g., 'message', 'template', 'merge', 'squash', 'commit'

// Only run for standard commits (message, template, or editing an existing commit)
// Avoid running for merges, squashes etc. unless specifically desired
if (!commitSource || commitSource === 'message' || commitSource === 'template' || commitSource === 'commit') {
  console.log(`[prepare-changeset] Commit source '${commitSource}', processing...`);

  try {
    // 1. Find staged changeset files (expecting exactly one)
    const stagedChangesets = execSync(
      'git diff --cached --name-only --diff-filter=A -- .changeset/*.md',
      { encoding: 'utf-8' }
    ).trim().split('\n').filter(Boolean); // Get Added+Staged .md files

    if (stagedChangesets.length === 0) {
      console.log('[prepare-changeset] No staged changeset file found. Skipping summary update.');
      process.exit(0); // Exit cleanly
    }

    if (stagedChangesets.length > 1) {
      console.warn(`[prepare-changeset] Warning: Found ${stagedChangesets.length} staged changeset files. Updating only the first one: ${stagedChangesets[0]}`);
    }

    const changesetFilePath = path.resolve(process.cwd(), stagedChangesets[0]);
    console.log(`[prepare-changeset] Found staged changeset: ${changesetFilePath}`);

    // 2. Read the commit message
    const message = fs.readFileSync(commitMsgFile, 'utf-8').trim();

    // 3. Extract subject and body (simple approach)
    const lines = message.split('\n').filter(line => !line.startsWith('#')); // Ignore comment lines
    const subject = lines[0] || '';
    const body = lines.slice(2).join('\n').trim(); // Assumes blank line after subject

    let summary = subject;
    if (body) {
      summary += `\n\n${body}`;
    }

    if (!summary) {
        console.warn('[prepare-changeset] Commit message seems empty. Skipping summary update.');
        process.exit(0);
    }

    // 4. Read the changeset file content
    const changesetContent = fs.readFileSync(changesetFilePath, 'utf-8');

    // 5. Find the end of the frontmatter
    const frontmatterEndIndex = changesetContent.lastIndexOf('---\n');
    if (frontmatterEndIndex === -1) {
        console.error(`[prepare-changeset] Error: Could not find frontmatter end in ${changesetFilePath}`);
        process.exit(1); // Exit with error
    }

    // 6. Construct the new content
    const frontmatter = changesetContent.substring(0, frontmatterEndIndex + 4); // Include the ending ---
    const newContent = `${frontmatter}${summary}\n`; // Add summary and a trailing newline

    // 7. Write the new content back to the changeset file
    fs.writeFileSync(changesetFilePath, newContent, 'utf-8');
    console.log(`[prepare-changeset] Updated summary in ${changesetFilePath}`);

    // 8. **** Re-stage the modified file ****
    execSync(`git add "${changesetFilePath}"`);
    console.log(`[prepare-changeset] Re-staged updated file: ${changesetFilePath}`);
    const status = execSync('git status --short', { encoding: 'utf-8' });
    console.log('[prepare-changeset] Git status after re-staging:\n', status);

  } catch (error) {
    console.error('[prepare-changeset] Error:', error);
    process.exit(1); // Exit with error code if script fails
  }
} else {
  console.log(`[prepare-changeset] Commit source '${commitSource}', skipping summary update.`);
  process.exit(0); // Exit cleanly for non-applicable commit types
} 