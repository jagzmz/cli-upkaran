// Default ignore patterns specifically for the 'digest' command
// Based on common build artifacts, logs, and sensitive files.

export const DEFAULT_IGNORES: string[] = [
  // Version Control
  '.git',
  '.svn',
  '.hg',

  // Node.js
  'node_modules',
  'package-lock.json',
  'npm-debug.log*',
  'yarn.lock',
  'yarn-error.log',
  'pnpm-lock.yaml',
  'bun.lockb',

  // Deno
  'deno.lock',

  // Python
  '__pycache__',
  '*.pyc',
  '*.pyo',
  '*.pyd',
  '.Python',
  'build/',
  'develop-eggs/',
  'dist/',
  'downloads/',
  'eggs/',
  '.eggs/',
  'lib/',
  'lib64/',
  'parts/',
  'sdist/',
  'var/',
  'wheels/',
  'share/python-wheels/',
  '*.egg-info/',
  '.installed.cfg',
  '*.egg',
  'MANIFEST',
  '.env',
  '.venv',
  'env/',
  'venv/',
  'ENV/',
  'env.bak/',
  'venv.bak/',
  '.hypothesis/',
  '.pytest_cache/',
  'cover/',
  'htmlcov/',
  '.tox/',
  '.nox/',
  '.coverage',
  '.coverage.*',
  '.cache',
  'nosetests.xml',
  'coverage.xml',
  '*.cover',
  '*.log',
  '*.pot',
  '*.pyt',

  // Compiled files / Build outputs
  'dist',
  'build',
  'out',
  'target',
  'bin',
  'obj',
  '.next',
  '.nuxt',
  '.svelte-kit',
  '.vercel',
  '.netlify',
  '.serverless',
  '.aws-sam',
  '.terraform',

  // OS Generated Files
  '.DS_Store',
  'Thumbs.db',
  '._*', // Resource fork files on macOS

  // IDE / Editor Files
  '.vscode',
  '.idea',
  '*.sublime-workspace',
  '*.sublime-project',
  '.project',
  '.classpath',
  '.cproject',
  '.settings',
  '*.tmproj',
  '*.esproj',
  'nbproject/',
  '.directory', // KDE Dolphin folder settings

  // Log files
  '*.log',
  'logs',
  '*.log.*',

  // Temp files
  '*.tmp',
  '*.temp',
  '*.swp',
  '*~',

  // Secrets / Environment Variables
  '.env',
  '.env.*',
  '!*.env.example', // Often committed as examples
  '*.pem',
  '*.key',
  'credentials*',
  'secrets*',

  // Cache Folders
  '.cache',
  '.turbo',

  // Test reports
  'coverage',
  'junit.xml',
  'report*.xml',
  'test-results',

  // ai-upkaran output files (prevent self-inclusion)
  'codebase.md',
  '*.ai-upkaran.json', // Potential future output format
];
