// .github/scripts/publish-with-tag.js
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

const changesetDir = path.join(process.cwd(), '.changeset');
const preJsonPath = path.join(changesetDir, 'pre.json');

let tag = 'latest';
let publishCmd = 'pnpm publish -r --no-git-checks';

try {
  if (fs.existsSync(preJsonPath)) {
    console.log('Pre-release mode detected (', preJsonPath, ')');
    const preJson = JSON.parse(fs.readFileSync(preJsonPath, 'utf-8'));
    if (preJson.tag) {
      tag = preJson.tag;
      console.log('Using dist-tag:', tag);
      publishCmd += ` --tag ${tag}`;
    } else {
      console.warn('pre.json found but tag property is missing. Using default tag.');
    }
  } else {
    console.log('No pre.json found. Publishing with default tag (', tag, ')');
  }

  console.log(`Executing: ${publishCmd}`);
  execSync(publishCmd, { stdio: 'inherit' }); // Inherit stdio to see publish output
  console.log(`Publish command finished for tag: ${tag}`);

} catch (error) {
  console.error('Error during publish script:', error);
  process.exit(1);
} 