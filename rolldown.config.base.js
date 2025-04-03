// Base rolldown configuration for packages
import { defineConfig } from 'rolldown';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Create a base rolldown configuration for a package
 * @param {Object} options Configuration options
 * @param {string} options.packageDir The package directory
 * @param {string} options.input The package entry point (relative to package dir)
 * @param {string[]} options.external External dependencies to exclude from bundling
 * @returns {import('rolldown').RolldownOptions}
 */
export function createConfig(options) {
  const { packageDir, input = 'src/index.ts', external = [] } = options;
  const packagePath = path.resolve(__dirname, packageDir);
  const pkg = JSON.parse(fs.readFileSync(path.join(packagePath, 'package.json'), 'utf-8'));
  
  // Automatically add all dependencies and peerDependencies as external
  const allDependencies = [
    ...Object.keys(pkg.dependencies || {}),
    ...Object.keys(pkg.peerDependencies || {}),
    // Node.js built-ins should be external
    'node:module', 'node:fs', 'node:path', 'node:os', 'node:util', 'node:events', 'node:stream', 'node:child_process', 'node:crypto'
  ];
  
  // Ensure all @cli-upkaran/* packages are external except the current one
  const aiUpkaranExternals = allDependencies
    .filter(dep => dep.startsWith('@cli-upkaran/') && dep !== pkg.name);
  
  const allExternals = [...new Set([...external, ...allDependencies, ...aiUpkaranExternals])];
  
  return defineConfig({
    input: path.join(packagePath, input),
    output: [
      {
        dir: path.join(packagePath, 'dist/cjs'),
        format: 'cjs',
        // preserveModules: true,
        entryFileNames: '[name].cjs',
      },
      {
        dir: path.join(packagePath, 'dist/esm'),
        format: 'esm',
        // preserveModules: true,
        entryFileNames: '[name].js',
      }
    ],
    external: id => allExternals.some(extDep => id === extDep || id.startsWith(`${extDep}/`)),
    // Plugins would go here if we add them later
    // plugins: [],
  });
} 