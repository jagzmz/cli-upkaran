// Using .cjs because root package.json doesn't have "type": "module"
// eslint-disable-next-line no-undef
module.exports = {
  root: true, // Important: prevents ESLint from looking further up the directory tree
  parser: '@typescript-eslint/parser',
  plugins: [
    '@typescript-eslint', // Use TypeScript specific rules
    'prettier', // Runs Prettier as an ESLint rule
  ],
  extends: [
    'eslint:recommended', // Base ESLint recommendations
    'plugin:@typescript-eslint/recommended', // Recommended rules for TypeScript
    'prettier', // Disables ESLint rules that conflict with Prettier (uses eslint-config-prettier)
    'plugin:prettier/recommended', // Enables eslint-plugin-prettier and displays prettier errors as ESLint errors. Make sure this is always the last configuration in the extends array.
  ],
  env: {
    node: true, // Enable Node.js global variables and Node.js scoping.
    es2022: true, // Add globals for ES2022, also sets ecmaVersion parser option
  },
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: ['./packages/*/tsconfig.json', './tsconfig.base.json'], // Optional: Link to tsconfigs for type-aware linting (can slow down linting)
  },
  ignorePatterns: [
    'node_modules/',
    'dist/',
    '.turbo/',
    'coverage/',
    '*.log',
    '.DS_Store',
    '**/__mocks__/',
    '**/__tests__/', // Often test files have less strict requirements
    '*.test.ts',
    '*.spec.ts',
    'jest.config.js',
    '.eslintrc.cjs', // Ignore this file itself
    '.prettierrc.json',
    'pnpm-lock.yaml',
    'README.md',
    'spec.md',
    'packages/adapter-website/src/readability.js', // Ignore bundled JS if any
  ],
  rules: {
    // --- Prettier --- Ensures Prettier rules are treated as errors
    'prettier/prettier': 'error',
    
    // --- General Best Practices ---
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off', // Allow console in dev
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'eqeqeq': ['error', 'always'], // Enforce === and !==
    'no-unused-vars': 'off', // Disable base rule, use TypeScript version
    'no-redeclare': 'off', // Disable base rule, use TypeScript version

    // --- TypeScript Specific Rules ---
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }], // Warn about unused vars, allow underscore prefix
    '@typescript-eslint/no-explicit-any': 'warn', // Warn instead of error for 'any'
    '@typescript-eslint/explicit-module-boundary-types': 'off', // Optional: enforce return types
    '@typescript-eslint/no-redeclare': ['error'], // Prevent redeclaring variables
    '@typescript-eslint/no-non-null-assertion': 'warn', // Be careful with `!` non-null assertions

    // Add any project-specific rules here
  },
}; 