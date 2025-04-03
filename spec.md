# ai-digest/.github/workflows/test.yml

```yml
name: Run Tests

on:
  push:
    branches:
      - main
  pull_request:
    branches:
      - main

jobs:
  test:
    name: Run npm tests
    runs-on: ubuntu-latest

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Set up Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: "npm"

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm test

```

# ai-digest/.gitignore

```
node_modules/
dist/
.DS_Store
*.log
codebase.md
custom_output.md
```

# ai-digest/.nvmrc

```
20
```

# ai-digest/jest.config.js

```js
/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: "node",
  transform: {
    "^.+\\.tsx?$": ["ts-jest", {}],
  },
  moduleDirectories: ["node_modules", "src"],
};
```

# ai-digest/package.json

```json
{
  "name": "ai-digest",
  "version": "1.0.8",
  "description": "CLI tool to aggregate files into a single Markdown file",
  "main": "dist/index.js",
  "bin": {
    "ai-digest": "./dist/index.js"
  },
  "engines": {
    "node": ">=20.0.0"
  },
  "scripts": {
    "build": "tsc",
    "start": "ts-node src/index.ts",
    "prepublishOnly": "npm run build",
    "test": "jest --config jest.config.js",
    "prettier": "prettier --write \"src/**/*\""
  },
  "keywords": [
    "cli",
    "aggregate",
    "markdown"
  ],
  "author": "Stanislav Khromov",
  "license": "MIT",
  "devDependencies": {
    "@types/jest": "^29.5.12",
    "@types/node": "^20",
    "jest": "^29.7.0",
    "prettier": "^3.4.2",
    "ts-jest": "^29.2.2",
    "ts-node": "^10.9.2",
    "typescript": "^5.5.3"
  },
  "dependencies": {
    "commander": "^12.1.0",
    "glob": "^11.0.0",
    "ignore": "^5.3.1",
    "isbinaryfile": "^5.0.2",
    "js-tiktoken": "^1.0.12"
  },
  "homepage": "https://github.com/khromov/ai-digest#readme",
  "repository": {
    "type": "git",
    "url": "git+https://github.com/khromov/ai-digest.git"
  },
  "bugs": {
    "url": "https://github.com/khromov/ai-digest/issues"
  }
}

```

# ai-digest/README.md

```md
# ai-digest

A CLI tool to aggregate your codebase into a single Markdown file for use with Claude Projects or custom ChatGPTs.

## Features

- Aggregates all files in the specified directory and subdirectories
- Ignores common build artifacts and configuration files
- Outputs a single Markdown file containing the whole codebase
- Provides options for whitespace removal and custom ignore patterns

## How to Use

Start by running the CLI tool in your project directory:

\`\`\`bash
npx ai-digest
\`\`\`

This will generate a `codebase.md` file with your codebase.

Once you've generated the Markdown file containing your codebase, you can use it with AI models like ChatGPT and Claude for code analysis and assistance.

### With ChatGPT:
1. Create a Custom GPT
2. Upload the generated Markdown file to the GPT's knowledge base

### With Claude:
1. Create a new Project
2. Add the Markdown file to the Project's knowledge

For best results, re-upload the Markdown file before starting a new chat session to ensure the AI has the most up-to-date version of your codebase.

## Options

- `-i, --input <directory>`: Specify input directory (default: current directory)
- `-o, --output <file>`: Specify output file (default: codebase.md)
- `--no-default-ignores`: Disable default ignore patterns
- `--whitespace-removal`: Enable whitespace removal
- `--show-output-files`: Display a list of files included in the output
- `--ignore-file <file>`: Specify a custom ignore file (default: .aidigestignore)
- `--help`: Show help

## Examples

1. Basic usage:

   \`\`\`bash
   npx ai-digest
   \`\`\`

2. Specify input and output:

   \`\`\`bash
   npx ai-digest -i /path/to/your/project -o project_summary.md
   \`\`\`

3. Enable whitespace removal:

   \`\`\`bash
   npx ai-digest --whitespace-removal
   \`\`\`

4. Show list of included files:

   \`\`\`bash
   npx ai-digest --show-output-files
   \`\`\`

5. Combine multiple options:

   \`\`\`bash
   npx ai-digest -i /path/to/your/project -o project_summary.md --whitespace-removal --show-output-files
   \`\`\`

## Custom Ignore Patterns

ai-digest supports custom ignore patterns using a `.aidigestignore` file in the root directory of your project. This file works similarly to `.gitignore`, allowing you to specify files and directories that should be excluded from the aggregation.

Use the `--show-output-files` flag to see which files are being included, making it easier to identify candidates for exclusion.


## Whitespace Removal

When using the `--whitespace-removal` flag, ai-digest removes excess whitespace from files to reduce the token count when used with AI models. This feature is disabled for whitespace-dependent languages like Python and YAML.

## Binary and SVG File Handling

Binary files and SVGs are included in the output with a note about their file type. This allows AI models to be aware of these files without including their full content.

## Local Development

Run `npm run start` to run the CLI tool on the local project. (Very meta!)

Run `npm test` to run the tests.

To pass flags to the CLI, use the `--` flag, like this: `npm run start -- --whitespace-removal`.

## Deploy New Version

\`\`\`
npm publish
\`\`\`

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.
```

# ai-digest/src/index.test.ts

```ts
import { exec } from "child_process";
import { promisify } from "util";
import path from "path";
import fs from "fs/promises";
import os from "os";

const execAsync = promisify(exec);

const runCLI = async (args: string = "") => {
  const cliPath = path.resolve(__dirname, "index.ts");
  return execAsync(`ts-node ${cliPath} ${args}`);
};

describe("AI Digest CLI", () => {
  afterAll(async () => {
    // Remove the created .md files after all tests complete
    await fs
      .unlink(path.resolve(__dirname, "..", "codebase.md"))
      .catch(() => {});
    await fs
      .unlink(path.resolve(__dirname, "..", "custom_output.md"))
      .catch(() => {});
  });

  it("should generate codebase.md by default", async () => {
    const { stdout } = await runCLI();
    expect(stdout).toMatch(/Files aggregated successfully into .*codebase\.md/);
  }, 10000);

  it("should respect custom output file", async () => {
    const { stdout } = await runCLI("-o custom_output.md");
    expect(stdout).toMatch(
      /Files aggregated successfully into .*custom_output\.md/,
    );
  }, 10000);

  it("should ignore files based on .aidigestignore", async () => {
    const { stdout } = await runCLI();
    expect(stdout).toContain("Files ignored by .aidigestignore:");
  }, 10000);

  it("should remove whitespace when flag is set", async () => {
    const { stdout } = await runCLI("--whitespace-removal");
    expect(stdout).toContain("Whitespace removal enabled");
  }, 10000);

  it("should not remove whitespace for whitespace-dependent files", async () => {
    const { stdout } = await runCLI("--whitespace-removal");
    expect(stdout).toContain(
      "Whitespace removal enabled (except for whitespace-dependent languages)",
    );
  }, 10000);

  it("should disable default ignores when flag is set", async () => {
    const { stdout } = await runCLI("--no-default-ignores");
    expect(stdout).toContain("Default ignore patterns disabled");
  }, 10000);

  it("should include binary files with a note", async () => {
    const { stdout } = await runCLI();
    expect(stdout).toMatch(/Binary and SVG files included: \d+/);
  }, 10000);

  it("should show output files when flag is set", async () => {
    const { stdout } = await runCLI("--show-output-files");
    expect(stdout).toContain("Files included in the output:");
  }, 10000);

  it("should include SVG file with correct type in codebase.md", async () => {
    await runCLI();
    const codebasePath = path.resolve(__dirname, "..", "codebase.md");
    const content = await fs.readFile(codebasePath, "utf-8");

    expect(content).toContain("# test/smiley.svg");
    expect(content).toContain("This is a file of the type: SVG Image");
  }, 10000);

  it("should respect the --input flag", async () => {
    // Create a temporary directory
    const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "ai-digest-test-"));

    try {
      // Create some test files in the temporary directory
      await fs.writeFile(path.join(tempDir, "test1.txt"), "Test content 1");
      await fs.writeFile(
        path.join(tempDir, "test2.js"),
        'console.log("Test content 2");',
      );

      // Create a subdirectory with a file
      const subDir = path.join(tempDir, "subdir");
      await fs.mkdir(subDir);
      await fs.writeFile(
        path.join(subDir, "test3.py"),
        'print("Test content 3")',
      );

      // Run the CLI with the --input flag
      const { stdout } = await runCLI(`--input ${tempDir} --show-output-files`);

      // Check if the output contains only the files we created
      expect(stdout).toContain("test1.txt");
      expect(stdout).toContain("test2.js");
      expect(stdout).toContain("subdir/test3.py");

      // Check if the output doesn't contain files from the project directory
      expect(stdout).not.toContain("package.json");
      expect(stdout).not.toContain("tsconfig.json");

      // Read the generated codebase.md file
      const codebasePath = path.resolve(process.cwd(), "codebase.md");
      const content = await fs.readFile(codebasePath, "utf-8");

      // Verify the content of codebase.md
      expect(content).toContain("# test1.txt");
      expect(content).toContain("Test content 1");
      expect(content).toContain("# test2.js");
      expect(content).toContain('console.log("Test content 2");');
      expect(content).toContain("# subdir/test3.py");
      expect(content).toContain('print("Test content 3")');
    } finally {
      // Clean up: remove the temporary directory and its contents
      await fs.rm(tempDir, { recursive: true, force: true });
    }
  }, 15000); // Increased timeout to 15 seconds due to file operations

  it("should respect custom ignore file", async () => {
    // Create a temporary directory
    const tempDir = await fs.mkdtemp(
      path.join(os.tmpdir(), "ai-digest-custom-ignore-test-"),
    );

    try {
      // Create some test files in the temporary directory
      await fs.writeFile(
        path.join(tempDir, "include.txt"),
        "This file should be included",
      );
      await fs.writeFile(
        path.join(tempDir, "exclude.js"),
        "This file should be excluded",
      );

      // Create a custom ignore file
      await fs.writeFile(path.join(tempDir, "custom.ignore"), "*.js");

      // Run the CLI with the custom ignore file
      const { stdout } = await runCLI(
        `--input ${tempDir} --ignore-file custom.ignore --show-output-files`,
      );

      // Check if the output contains only the files we want to include
      expect(stdout).toContain("include.txt");
      expect(stdout).not.toContain("exclude.js");

      // Check if the custom ignore patterns are mentioned
      expect(stdout).toContain("Ignore patterns from custom.ignore:");
      expect(stdout).toContain("  - *.js");

      // Read the generated codebase.md file
      const codebasePath = path.resolve(process.cwd(), "codebase.md");
      const content = await fs.readFile(codebasePath, "utf-8");

      // Verify the content of codebase.md
      expect(content).toContain("# include.txt");
      expect(content).toContain("This file should be included");
      expect(content).not.toContain("# exclude.js");
      expect(content).not.toContain("This file should be excluded");
    } finally {
      // Clean up: remove the temporary directory and its contents
      await fs.rm(tempDir, { recursive: true, force: true });
    }
  }, 15000);

  it("should sort files in natural path order", async () => {
    // Create a temporary directory
    const tempDir = await fs.mkdtemp(
      path.join(os.tmpdir(), "ai-digest-sort-test-"),
    );

    try {
      // Create test files and directories
      await fs.mkdir(path.join(tempDir, "01-first"));
      await fs.mkdir(path.join(tempDir, "02-second"));
      await fs.mkdir(path.join(tempDir, "10-tenth"));

      await fs.writeFile(
        path.join(tempDir, "01-first", "01-file.txt"),
        "First file",
      );
      await fs.writeFile(
        path.join(tempDir, "01-first", "02-file.txt"),
        "Second file",
      );
      await fs.writeFile(
        path.join(tempDir, "02-second", "01-file.txt"),
        "Third file",
      );
      await fs.writeFile(
        path.join(tempDir, "10-tenth", "01-file.txt"),
        "Fourth file",
      );
      await fs.writeFile(path.join(tempDir, "root-file.txt"), "Root file");

      // Run the CLI with the test directory
      await runCLI(`--input ${tempDir}`);

      // Read the generated codebase.md file
      const codebasePath = path.resolve(process.cwd(), "codebase.md");
      const content = await fs.readFile(codebasePath, "utf-8");

      console.log(content); // Print the content for debugging

      // Define the expected order of file headers
      const expectedOrder = [
        "# 01-first/01-file.txt",
        "# 01-first/02-file.txt",
        "# 02-second/01-file.txt",
        "# 10-tenth/01-file.txt",
        "# root-file.txt",
      ];

      // Check if all expected headers are present and in the correct order
      let lastIndex = -1;
      for (const header of expectedOrder) {
        const currentIndex = content.indexOf(header);
        expect(currentIndex).toBeGreaterThan(lastIndex);
        lastIndex = currentIndex;
      }
    } finally {
      // Clean up: remove the temporary directory and its contents
      await fs.rm(tempDir, { recursive: true, force: true });
    }
  }, 15000);
});

```

# ai-digest/src/index.ts

```ts
#!/usr/bin/env node

import { program } from "commander";
import { promises as fs } from "fs";
import * as fsSync from "fs";
import path from "path";
import { glob } from "glob";
import ignore from "ignore";
import {
  WHITESPACE_DEPENDENT_EXTENSIONS,
  DEFAULT_IGNORES,
  removeWhitespace,
  escapeTripleBackticks,
  createIgnoreFilter,
  estimateTokenCount,
  formatLog,
  isTextFile,
  getFileType,
  shouldTreatAsBinary,
} from "./utils";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB in bytes

async function readIgnoreFile(
  inputDir: string,
  filename: string,
): Promise<string[]> {
  try {
    const filePath = path.join(inputDir, filename);
    const content = await fs.readFile(filePath, "utf-8");
    console.log(formatLog(`Found ${filename} file in ${inputDir}.`, "📄"));
    return content
      .split("\n")
      .filter((line) => line.trim() !== "" && !line.startsWith("#"));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      console.log(formatLog(`No ${filename} file found in ${inputDir}.`, "❓"));
      return [];
    }
    throw error;
  }
}

function displayIncludedFiles(includedFiles: string[]): void {
  console.log(formatLog("Files included in the output:", "📋"));
  includedFiles.forEach((file, index) => {
    console.log(`${index + 1}. ${file}`);
  });
}

function naturalSort(a: string, b: string): number {
  return a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" });
}

async function aggregateFiles(
  inputDir: string,
  outputFile: string,
  useDefaultIgnores: boolean,
  removeWhitespaceFlag: boolean,
  showOutputFiles: boolean,
  ignoreFile: string,
): Promise<void> {
  try {
    const userIgnorePatterns = await readIgnoreFile(inputDir, ignoreFile);
    const defaultIgnore = useDefaultIgnores
      ? ignore().add(DEFAULT_IGNORES)
      : ignore();
    const customIgnore = createIgnoreFilter(userIgnorePatterns, ignoreFile);

    if (useDefaultIgnores) {
      console.log(formatLog("Using default ignore patterns.", "🚫"));
    } else {
      console.log(formatLog("Default ignore patterns disabled.", "✅"));
    }

    if (removeWhitespaceFlag) {
      console.log(
        formatLog(
          "Whitespace removal enabled (except for whitespace-dependent languages).",
          "🧹",
        ),
      );
    } else {
      console.log(formatLog("Whitespace removal disabled.", "📝"));
    }

    const allFiles = await glob("**/*", {
      nodir: true,
      dot: true,
      cwd: inputDir,
    });

    console.log(
      formatLog(
        `Found ${allFiles.length} files in ${inputDir}. Applying filters...`,
        "🔍",
      ),
    );

    let output = "";
    let includedCount = 0;
    let defaultIgnoredCount = 0;
    let customIgnoredCount = 0;
    let binaryAndSvgFileCount = 0;
    let includedFiles: string[] = [];

    // Sort the files in natural path order
    const sortedFiles = allFiles.sort(naturalSort);

    for (const file of sortedFiles) {
      const fullPath = path.join(inputDir, file);
      const relativePath = path.relative(inputDir, fullPath);
      if (
        path.relative(inputDir, outputFile) === relativePath ||
        (useDefaultIgnores && defaultIgnore.ignores(relativePath))
      ) {
        defaultIgnoredCount++;
      } else if (customIgnore.ignores(relativePath)) {
        customIgnoredCount++;
      } else {
        if ((await isTextFile(fullPath)) && !shouldTreatAsBinary(fullPath)) {
          let content = await fs.readFile(fullPath, "utf-8");
          const extension = path.extname(file);

          content = escapeTripleBackticks(content);

          if (
            removeWhitespaceFlag &&
            !WHITESPACE_DEPENDENT_EXTENSIONS.includes(extension)
          ) {
            content = removeWhitespace(content);
          }

          output += `# ${relativePath}\n\n`;
          output += `\`\`\`${extension.slice(1)}\n`;
          output += content;
          output += "\n\`\`\`\n\n";

          includedCount++;
          includedFiles.push(relativePath);
        } else {
          const fileType = getFileType(fullPath);
          output += `# ${relativePath}\n\n`;
          if (fileType === "SVG Image") {
            output += `This is a file of the type: ${fileType}\n\n`;
          } else {
            output += `This is a binary file of the type: ${fileType}\n\n`;
          }

          binaryAndSvgFileCount++;
          includedCount++;
          includedFiles.push(relativePath);
        }
      }
    }

    await fs.mkdir(path.dirname(outputFile), { recursive: true });
    await fs.writeFile(outputFile, output, { flag: "w" });

    const stats = await fs.stat(outputFile);
    const fileSizeInBytes = stats.size;

    if (stats.size !== Buffer.byteLength(output)) {
      throw new Error("File size mismatch after writing");
    }

    console.log(
      formatLog(`Files aggregated successfully into ${outputFile}`, "✅"),
    );
    console.log(formatLog(`Total files found: ${allFiles.length}`, "📚"));
    console.log(formatLog(`Files included in output: ${includedCount}`, "📎"));
    if (useDefaultIgnores) {
      console.log(
        formatLog(
          `Files ignored by default patterns: ${defaultIgnoredCount}`,
          "🚫",
        ),
      );
    }
    if (customIgnoredCount > 0) {
      console.log(
        formatLog(
          `Files ignored by .aidigestignore: ${customIgnoredCount}`,
          "🚫",
        ),
      );
    }
    console.log(
      formatLog(
        `Binary and SVG files included: ${binaryAndSvgFileCount}`,
        "📦",
      ),
    );

    if (fileSizeInBytes > MAX_FILE_SIZE) {
      console.log(
        formatLog(
          `Warning: Output file size (${(fileSizeInBytes / 1024 / 1024).toFixed(2)} MB) exceeds 10 MB.`,
          "⚠️",
        ),
      );
      console.log(
        formatLog(
          "Token count estimation skipped due to large file size.",
          "⚠️",
        ),
      );
      console.log(
        formatLog(
          "Consider adding more files to .aidigestignore to reduce the output size.",
          "💡",
        ),
      );
    } else {
      const tokenCount = estimateTokenCount(output);
      console.log(formatLog(`Estimated token count: ${tokenCount}`, "🔢"));
      console.log(
        formatLog(
          "Note: Token count is an approximation using GPT-4 tokenizer. For ChatGPT, it should be accurate. For Claude, it may be ±20% approximately.",
          "⚠️",
        ),
      );
    }

    if (showOutputFiles) {
      displayIncludedFiles(includedFiles);
    }

    console.log(formatLog(`Done! Wrote code base to ${outputFile}`, "✅"));
  } catch (error) {
    console.error(formatLog("Error aggregating files:", "❌"), error);
    process.exit(1);
  }
}

// Read package.json to get the version
const packageJsonPath = path.join(__dirname, '..', 'package.json');
const packageJson = JSON.parse(fsSync.readFileSync(packageJsonPath, 'utf-8'));

program
  .version(packageJson.version)
  .description("Aggregate files into a single Markdown file")
  .option("-i, --input <directory>", "Input directory", process.cwd())
  .option("-o, --output <file>", "Output file name", "codebase.md")
  .option("--no-default-ignores", "Disable default ignore patterns")
  .option("--whitespace-removal", "Enable whitespace removal")
  .option(
    "--show-output-files",
    "Display a list of files included in the output",
  )
  .option("--ignore-file <file>", "Custom ignore file name", ".aidigestignore")
  .action(async (options) => {
    const inputDir = path.resolve(options.input);
    const outputFile = path.isAbsolute(options.output)
      ? options.output
      : path.join(process.cwd(), options.output);
    await aggregateFiles(
      inputDir,
      outputFile,
      options.defaultIgnores,
      options.whitespaceRemoval,
      options.showOutputFiles,
      options.ignoreFile,
    );
  });

program.parse(process.argv);
```

# ai-digest/src/utils.ts

```ts
import { Ignore } from "ignore";
import { isBinaryFile } from "isbinaryfile";
import { encodingForModel } from "js-tiktoken";
import path from "path";

export const WHITESPACE_DEPENDENT_EXTENSIONS = [
  ".py", // Python
  ".yaml", // YAML
  ".yml", // YAML
  ".jade", // Jade/Pug
  ".haml", // Haml
  ".slim", // Slim
  ".coffee", // CoffeeScript
  ".pug", // Pug
  ".styl", // Stylus
  ".gd", // Godot
];

export const DEFAULT_IGNORES = [
  ".aidigestignore",
  // Node.js
  "node_modules",
  "package-lock.json",
  "npm-debug.log",
  // Yarn
  "yarn.lock",
  "yarn-error.log",
  // pnpm
  "pnpm-lock.yaml",
  // Bun
  "bun.lockb",
  // Deno
  "deno.lock",
  // PHP (Composer)
  "vendor",
  "composer.lock",
  // Python
  "__pycache__",
  "*.pyc",
  "*.pyo",
  "*.pyd",
  ".Python",
  "pip-log.txt",
  "pip-delete-this-directory.txt",
  ".venv",
  "venv",
  "ENV",
  "env",
  // Godot
  ".godot",
  "*.import",
  // Ruby
  "Gemfile.lock",
  ".bundle",
  // Java
  "target",
  "*.class",
  // Gradle
  ".gradle",
  "build",
  // Maven
  "pom.xml.tag",
  "pom.xml.releaseBackup",
  "pom.xml.versionsBackup",
  "pom.xml.next",
  // .NET
  "bin",
  "obj",
  "*.suo",
  "*.user",
  // Go
  "go.sum",
  // Rust
  "Cargo.lock",
  "target",
  // General
  ".git",
  ".svn",
  ".hg",
  ".DS_Store",
  "Thumbs.db",
  // Environment variables
  ".env",
  ".env.local",
  ".env.development.local",
  ".env.test.local",
  ".env.production.local",
  "*.env",
  "*.env.*",
  // Common framework directories
  ".svelte-kit",
  ".next",
  ".nuxt",
  ".vuepress",
  ".cache",
  "dist",
  "tmp",
  // Our output file
  "codebase.md",
  // Turborepo cache folder
  ".turbo",
  ".vercel",
  ".netlify",
  "LICENSE",
];

export function removeWhitespace(val: string): string {
  return val.replace(/\s+/g, " ").trim();
}

export function escapeTripleBackticks(content: string): string {
  return content.replace(/\`\`\`/g, "\\`\\`\\`");
}

export function createIgnoreFilter(
  ignorePatterns: string[],
  ignoreFile: string,
): Ignore {
  const ig = require("ignore")().add(ignorePatterns);
  if (ignorePatterns.length > 0) {
    console.log(`Ignore patterns from ${ignoreFile}:`);
    ignorePatterns.forEach((pattern) => {
      console.log(`  - ${pattern}`);
    });
  } else {
    console.log("No custom ignore patterns found.");
  }
  return ig;
}

export function estimateTokenCount(text: string): number {
  try {
    const enc = encodingForModel("gpt-4o");
    const tokens = enc.encode(text);
    return tokens.length;
  } catch (error) {
    console.error(error);
    return 0;
  }
}

export function formatLog(message: string, emoji: string = ""): string {
  return `${emoji ? emoji + " " : ""}${message}`;
}

export async function isTextFile(filePath: string): Promise<boolean> {
  try {
    const isBinary = await isBinaryFile(filePath);
    return !isBinary && !filePath.toLowerCase().endsWith(".svg");
  } catch (error) {
    console.error(`Error checking if file is binary: ${filePath}`, error);
    return false;
  }
}

export function getFileType(filePath: string): string {
  const extension = path.extname(filePath).toLowerCase();
  switch (extension) {
    case ".jpg":
    case ".jpeg":
    case ".png":
    case ".gif":
    case ".bmp":
    case ".webp":
      return "Image";
    case ".svg":
      return "SVG Image";
    case ".wasm":
      return "WebAssembly";
    case ".pdf":
      return "PDF";
    case ".doc":
    case ".docx":
      return "Word Document";
    case ".xls":
    case ".xlsx":
      return "Excel Spreadsheet";
    case ".ppt":
    case ".pptx":
      return "PowerPoint Presentation";
    case ".zip":
    case ".rar":
    case ".7z":
      return "Compressed Archive";
    case ".exe":
      return "Executable";
    case ".dll":
      return "Dynamic-link Library";
    case ".so":
      return "Shared Object";
    case ".dylib":
      return "Dynamic Library";
    default:
      return "Binary";
  }
}

export function shouldTreatAsBinary(filePath: string): boolean {
  return (
    filePath.toLowerCase().endsWith(".svg") ||
    getFileType(filePath) !== "Binary"
  );
}

```

# ai-digest/test/mascot.jpg

This is a binary file of the type: Image

# ai-digest/test/smiley.svg

This is a file of the type: SVG Image

# ai-digest/test/test-ignore.ts

```ts

```

# ai-digest/tsconfig.json

```json
{
    "compilerOptions": {
      "target": "ES2018",
      "module": "commonjs",
      "outDir": "./dist",
      "rootDir": "./src",
      "strict": true,
      "esModuleInterop": true,
      "skipLibCheck": true,
      "forceConsistentCasingInFileNames": true
    },
    "include": ["src/**/*"],
    "exclude": ["node_modules", "**/*.test.ts"]
  }
  
```

# sitefetch/.gitignore

```
node_modules
foo.txt
*.log
.DS_Store
dist/
```

# sitefetch/.prettierrc

```
{
  "semi": false
}

```

# sitefetch/package.json

```json
{
  "name": "sitefetch",
  "version": "0.0.17",
  "description": "Fetch an entire site and save it as a text file",
  "bin": "./dist/cli.js",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "files": [
    "dist"
  ],
  "type": "module",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1",
    "build": "rm -rf dist && rolldown -c",
    "prepublishOnly": "bun run build"
  },
  "keywords": [],
  "author": "EGOIST <hi@egoist.dev>",
  "license": "MIT",
  "dependencies": {
    "happy-dom": "^16.5.3",
    "cheerio": "^1.0.0",
    "gpt-tokenizer": "^2.8.1",
    "turndown": "^7.2.0",
    "turndown-plugin-gfm": "^1.0.2",
    "micromatch": "^4.0.8"
  },
  "devDependencies": {
    "@mozilla/readability": "^0.5.0",
    "@types/bun": "^1.1.15",
    "@types/micromatch": "^4.0.9",
    "@types/turndown": "^5.0.5",
    "cac": "^6.7.14",
    "p-queue": "^8.0.1",
    "picocolors": "^1.1.1",
    "rolldown": "^1.0.0-beta.1",
    "typescript": "^5.7.3",
    "unplugin-isolated-decl": "^0.10.4"
  }
}

```

# sitefetch/README.md

```md
# sitefetch

Fetch an entire site and save it as a text file (to be used with AI models).

![image](https://github.com/user-attachments/assets/e6877428-0e1c-444a-b7af-2fb21ded8814)

## Install

One-off usage (choose one of the followings):

\`\`\`bash
bunx sitefetch
npx sitefetch
pnpx sitefetch
\`\`\`

Install globally (choose one of the followings):

\`\`\`bash
bun i -g sitefetch
npm i -g sitefetch
pnpm i -g sitefetch
\`\`\`

## Usage

\`\`\`bash
sitefetch https://egoist.dev -o site.txt

# or better concurrency
sitefetch https://egoist.dev -o site.txt --concurrency 10
\`\`\`

### Match specific pages

Use the `-m, --match` flag to specify the pages you want to fetch:

\`\`\`bash
sitefetch https://vite.dev -m "/blog/**" -m "/guide/**"
\`\`\`

The match pattern is tested against the pathname of target pages, powered by micromatch, you can check out all the supported [matching features](https://github.com/micromatch/micromatch#matching-features).

### Content selector

We use [mozilla/readability](https://github.com/mozilla/readability) to extract readable content from the web page, but on some pages it might return irrelevant contents, in this case you can specify a CSS selector so we know where to find the readable content:

\`\`\`sitefetch
sitefetch https://vite.dev --content-selector ".content"
\`\`\`

## Plug

If you like this, please check out my LLM chat app: https://chatwise.app

## API

\`\`\`ts
import { fetchSite } from "sitefetch"

await fetchSite("https://egoist.dev", {
  //...options
})
\`\`\`

Check out options in [types.ts](./src/types.ts).

## License

MIT.

```

# sitefetch/rolldown.config.js

```js
// @ts-check
import fs from "node:fs"
import { defineConfig } from "rolldown"
import { isBuiltin } from "node:module"
import UnpluginIsolatedDecl from "unplugin-isolated-decl/rolldown"

const pkg = JSON.parse(fs.readFileSync("./package.json", "utf8"))

export default defineConfig({
  input: ["src/cli.ts", "src/index.ts"],
  output: {
    dir: "dist",
    format: "esm",
    banner(chunk) {
      if (chunk.fileName === "cli.js") {
        return `#!/usr/bin/env node`
      }
      return ""
    },
  },
  platform: "node",
  external: Object.keys(pkg.dependencies)
    .map((name) => [name, new RegExp(`^${name}/`)])
    .flat(),
  plugins: [
    process.env.NO_DTS
      ? undefined
      : UnpluginIsolatedDecl({ transformer: "typescript" }),
    {
      // make sure every node builtin module is prefixed with node:
      name: "add-node-prefix",
      renderChunk(code) {
        return code.replace(/import (.+) from "(.+)"/g, (m, m1, m2) => {
          if (isBuiltin(m2) && !m2.startsWith("node:")) {
            return `import ${m1} from "node:${m2}"`
          }
          return m
        })
      },
      resolveId(id) {
        if (isBuiltin(id) && !id.startsWith("node:")) {
          return {
            id: `node:${id}`,
            external: true,
          }
        }
      },
    },
  ],
})

```

# sitefetch/shims.d.ts

```ts
declare module "turndown-plugin-gfm"

```

# sitefetch/src/cli.ts

```ts
import path from "node:path"
import fs from "node:fs"
import { cac } from "cac"
import { encode } from "gpt-tokenizer/model/gpt-4o"
import { fetchSite, serializePages } from "./index.ts"
import { logger } from "./logger.ts"
import { ensureArray, formatNumber } from "./utils.ts"
import { version } from "../package.json"

const cli = cac("sitefetch")

cli
  .command("[url]", "Fetch a site")
  .option("-o, --outfile <path>", "Write the fetched site to a text file")
  .option("--concurrency <number>", "Number of concurrent requests", {
    default: 3,
  })
  .option("-m, --match <pattern>", "Only fetch matched pages")
  .option("--content-selector <selector>", "The CSS selector to find content")
  .option("--limit <limit>", "Limit the result to this amount of pages")
  .option("--silent", "Do not print any logs")
  .action(async (url, flags) => {
    if (!url) {
      cli.outputHelp()
      return
    }

    if (flags.silent) {
      logger.setLevel("silent")
    }

    const pages = await fetchSite(url, {
      concurrency: flags.concurrency,
      match: flags.match && ensureArray(flags.match),
      contentSelector: flags.contentSelector,
      limit: flags.limit,
    })

    if (pages.size === 0) {
      logger.warn("No pages found")
      return
    }

    const pagesArr = [...pages.values()]

    const totalTokenCount = pagesArr.reduce(
      (acc, page) => acc + encode(page.content).length,
      0
    )

    logger.info(
      `Total token count for ${pages.size} pages: ${formatNumber(
        totalTokenCount
      )}`
    )

    if (flags.outfile) {
      const output = serializePages(
        pages,
        flags.outfile.endsWith(".json") ? "json" : "text"
      )
      fs.mkdirSync(path.dirname(flags.outfile), { recursive: true })
      fs.writeFileSync(flags.outfile, output, "utf8")
    } else {
      console.log(serializePages(pages, "text"))
    }
  })

cli.version(version)
cli.help()
cli.parse()

```

# sitefetch/src/index.ts

```ts
import Queue from "p-queue"
import { Window } from "happy-dom"
import { Readability } from "@mozilla/readability"
import c from "picocolors"
import { toMarkdown } from "./to-markdown.ts"
import { logger } from "./logger.ts"
import { load } from "cheerio"
import { matchPath } from "./utils.ts"
import type { Options, FetchSiteResult } from "./types.ts"

export async function fetchSite(
  url: string,
  options: Options
): Promise<FetchSiteResult> {
  const fetcher = new Fetcher(options)

  return fetcher.fetchSite(url)
}

class Fetcher {
  #pages: FetchSiteResult = new Map()
  #fetched: Set<string> = new Set()
  #queue: Queue

  constructor(public options: Options) {
    const concurrency = options.concurrency || 3
    this.#queue = new Queue({ concurrency })
  }

  #limitReached() {
    return this.options.limit && this.#pages.size >= this.options.limit
  }

  #getContentSelector(pathname: string) {
    if (typeof this.options.contentSelector === "function")
      return this.options.contentSelector({ pathname })

    return this.options.contentSelector
  }

  async fetchSite(url: string) {
    logger.info(
      `Started fetching ${c.green(url)} with a concurrency of ${
        this.#queue.concurrency
      }`
    )

    await this.#fetchPage(url, {
      skipMatch: true,
    })

    await this.#queue.onIdle()

    return this.#pages
  }

  async #fetchPage(
    url: string,
    options: {
      skipMatch?: boolean
    }
  ) {
    const { host, pathname } = new URL(url)

    if (this.#fetched.has(pathname) || this.#limitReached()) {
      return
    }

    this.#fetched.add(pathname)

    // return if not matched
    // we don't need to extract content for this page
    if (
      !options.skipMatch &&
      this.options.match &&
      !matchPath(pathname, this.options.match)
    ) {
      return
    }

    logger.info(`Fetching ${c.green(url)}`)

    const res = await (this.options.fetch || fetch)(url, {
      headers: {
        "user-agent": "Sitefetch (https://github.com/egoist/sitefetch)",
      },
    })

    if (!res.ok) {
      logger.warn(`Failed to fetch ${url}: ${res.statusText}`)
      return
    }

    if (this.#limitReached()) {
      return
    }

    const contentType = res.headers.get("content-type")

    if (!contentType?.includes("text/html")) {
      logger.warn(`Not a HTML page: ${url}`)
      return
    }

    const resUrl = new URL(res.url)

    // redirected to other site, ignore
    if (resUrl.host !== host) {
      logger.warn(`Redirected from ${host} to ${resUrl.host}`)
      return
    }
    const extraUrls: string[] = []

    const $ = load(await res.text())
    $("script,style,link,img,video").remove()

    $("a").each((_, el) => {
      const href = $(el).attr("href")

      if (!href) {
        return
      }

      try {
        const thisUrl = new URL(href, url)
        if (thisUrl.host !== host) {
          return
        }

        extraUrls.push(thisUrl.href)
      } catch {
        logger.warn(`Failed to parse URL: ${href}`)
      }
    })

    if (extraUrls.length > 0) {
      for (const url of extraUrls) {
        this.#queue.add(() =>
          this.#fetchPage(url, { ...options, skipMatch: false })
        )
      }
    }

    const window = new Window({
      url,
      settings: {
        disableJavaScriptFileLoading: true,
        disableJavaScriptEvaluation: true,
        disableCSSFileLoading: true,
      },
    })

    const pageTitle = $("title").text()
    const contentSelector = this.#getContentSelector(pathname)
    const html = contentSelector
      ? $(contentSelector).prop("outerHTML")
      : $.html()

    if (!html) {
      logger.warn(`No readable content on ${pathname}`)
      return
    }

    window.document.write(html)

    await window.happyDOM.waitUntilComplete()

    const article = new Readability(window.document as any).parse()

    await window.happyDOM.close()

    if (!article) {
      return
    }

    const content = toMarkdown(article.content)

    this.#pages.set(pathname, {
      title: article.title || pageTitle,
      url,
      content,
    })
  }
}

export function serializePages(
  pages: FetchSiteResult,
  format: "json" | "text"
): string {
  if (format === "json") {
    return JSON.stringify([...pages.values()])
  }

  return [...pages.values()]
    .map((page) =>
      `<page>
  <title>${page.title}</title>
  <url>${page.url}</url>
  <content>${page.content}</content>
</page>`.trim()
    )
    .join("\n\n")
}

```

# sitefetch/src/logger.ts

```ts
import c from "picocolors"

type LoggerLevel = "silent" | "warn"

class Logger {
  private level?: LoggerLevel

  setLevel(level: LoggerLevel): void {
    this.level = level
  }

  info(...args: any[]): void {
    if (this.level === "silent") return
    console.log(c.cyan("INFO"), ...args)
  }

  warn(...args: any[]): void {
    if (this.level === "silent") return
    console.warn(c.yellow("WARN"), ...args)
  }
}

export const logger: Logger = new Logger()

```

# sitefetch/src/to-markdown.ts

```ts
import Turndown from "turndown"
import { gfm } from "turndown-plugin-gfm"

const turndown = new Turndown()
turndown.use(gfm)

export function toMarkdown(html: string): string {
  return turndown.turndown(html)
}

```

# sitefetch/src/types.ts

```ts
export type Options = {
  /** How many requests can be made at the same time */
  concurrency?: number

  /**
   * Match pathname by specific patterns, powered by micromatch
   * Only pages matched by this will be fetched
   */
  match?: string[]

  /**
   * The CSS selector to find content
   */
  contentSelector?:
    | string
    | ((ctx: { pathname: string }) => string | void | undefined)

  /**
   * Limit the result to this amount of pages
   */
  limit?: number

  /**
   * A custom function to fetch URL
   */
  fetch?: (url: string, init: RequestInit) => Promise<Response>
}

export type Page = {
  title: string
  url: string
  content: string
}

export type FetchSiteResult = Map<string, Page>

```

# sitefetch/src/utils.ts

```ts
import micromatch from "micromatch"

// xK or xM
export function formatNumber(num: number): string {
  return num > 1000000
    ? `${(num / 1000000).toFixed(1)}M`
    : num > 1000
    ? `${(num / 1000).toFixed(1)}K`
    : num.toString()
}

export function matchPath(path: string, pattern: string | string[]): boolean {
  return micromatch.isMatch(path, pattern)
}

export function ensureArray<T>(input: T | T[]): T[] {
  return Array.isArray(input) ? input : [input]
}

```

# sitefetch/tsconfig.json

```json
{
    "compilerOptions": {
      // Enable latest features
      "lib": ["ESNext"],
      "target": "ESNext",
      "module": "ESNext",
      "moduleDetection": "force",
      "jsx": "react-jsx",
      "isolatedDeclarations": true,
      "declaration": true,
  
      // Bundler mode
      "moduleResolution": "bundler",
      "allowImportingTsExtensions": true,
      "verbatimModuleSyntax": true,
      "noEmit": true,
  
      // Best practices
      "strict": true,
      "skipLibCheck": true,
      "noFallthroughCasesInSwitch": true,
  
      // Some stricter flags
      "noUnusedLocals": true,
      "noUnusedParameters": true,
      "noPropertyAccessFromIndexSignature": true
    }
  }
```

Use the above code only as a reference for generating new code !!!

###########

Okay, let's undertake this comprehensive task. We will create a highly detailed specification for `@cli-upkaran` as a general AI Toolkit CLI, followed by the corresponding initial code structure and stubs for the monorepo.

---

**Project Specification: @cli-upkaran (General AI Toolkit)**

**Version:** 1.0 (Draft)

**Date:** October 26, 2023

**1. Vision & Introduction**

`@cli-upkaran` (Upkaran: Hindi/Sanskrit for "tool" or "instrument") is envisioned as a **unified command-line interface (CLI) toolkit and extensible platform for a wide range of AI-related tasks**. It aims to provide developers and researchers with a consistent, powerful, and user-friendly environment for interacting with AI models, processing data, and managing AI workflows.

Beyond its initial capabilities in advanced data preparation (gathering from filesystems/websites, transforming, formatting for LLMs), `@cli-upkaran` is designed as a **pluggable command system**. This allows it, or the community, to seamlessly integrate diverse functionalities such as text generation, model interaction, sentiment analysis, fine-tuning initiation, vector database operations, and more, all accessible under the single `cli-upkaran` command.

Key principles guiding the project are:

*   **Unified Interface:** A single entry point (`cli-upkaran`) for all integrated tools.
*   **Extensibility:** A robust plugin system focused on adding new *commands*.
*   **Modularity:** Clear separation of concerns between the core CLI, command implementations, and shared libraries (like data preparation utilities).
*   **User Experience:** Both direct command execution for power users/scripting and an intuitive, interactive mode with vibrant visual feedback for ease of use and discovery.
*   **Developer Experience:** A well-structured monorepo with clear interfaces and shared tooling for contributors.
*   **Scalability (where applicable):** Incorporating efficient processing techniques like streaming for data-intensive commands (e.g., data preparation).

**2. Core Concepts (General Toolkit)**

*   **CLI Application (`@cli-upkaran/cli`):** The main user-facing package and entry point (`npx cli-upkaran`). Responsible for parsing initial arguments, identifying the target command, loading the appropriate command plugin/module, providing shared UI elements (prompts, spinners, colored output), and managing the interactive mode.
*   **Command:** A distinct unit of functionality addressable via the CLI (e.g., `digest`, `fetch`, `generate`, `analyze`). Each command handles specific arguments and options and performs a defined task.
*   **Command Plugin:** A module (typically an npm package or local file) that defines and implements one or more commands. These plugins are discovered and loaded by the CLI core.
    *   **Interface:** Must export a specific structure or function (e.g., `registerCommands`) that the CLI can use to understand the command(s) provided (name, description, options definition, handler function).
*   **Command Handler:** The function within a command plugin that contains the main logic for executing that command. It receives parsed arguments and options from the CLI.
*   **Core Utilities (`@cli-upkaran/core`):** A package containing truly universal functionalities shared across *all* potential commands and the CLI itself. This includes:
    *   Base configuration loading logic (e.g., from common files or environment variables).
    *   Shared logging setup and utilities (`chalk`).
    *   The command plugin discovery and loading mechanism.
    *   Core type definitions (e.g., `CommandDefinition`, `CommandHandler`, `PluginRegistration`).
    *   Shared error classes.
    *   Highly generic utility functions.
*   **Subsystem Libraries (e.g., `@cli-upkaran/dataprep-core`):** Dedicated packages containing shared logic and types specific to a *subset* of commands or a particular domain (like data preparation). These are used *by* specific command plugins but are not part of the universal core.

**3. Architecture (Monorepo)**

The project will utilize a monorepo structure managed by `pnpm` workspaces.

*   **`cli-upkaran/` (Root)**
    *   `pnpm-workspace.yaml`: Defines the workspace packages.
    *   `package.json`: Root dependencies (mostly devDependencies like TypeScript, Jest, Prettier, ESLint), workspace-wide scripts.
    *   `tsconfig.base.json`: Shared base TypeScript configuration inherited by packages.
    *   `.gitignore`, `README.md`, etc.
*   **`packages/`**
    *   **`core` (`@cli-upkaran/core`)**:
        *   **Purpose:** Universal utilities, types, plugin loading.
        *   **Key Files:** `config.ts`, `logger.ts`, `plugin-loader.ts`, `types.ts`, `error.ts`, `utils.ts`.
        *   **Dependencies:** `chalk`.
    *   **`cli` (`@cli-upkaran/cli`)**:
        *   **Purpose:** Main entry point, command routing, argument parsing, interactive mode, shared UI.
        *   **Key Files:** `index.ts` (main entry), `commands.ts` (command registration/routing), `interactive.ts`, `ui/` (prompt wrappers, spinners), `utils/` (CLI-specific utils).
        *   **Dependencies:** `@cli-upkaran/core`, `commander` (or `cac`), `@clack/prompts`, `ora`.
    *   **`dataprep-core` (`@cli-upkaran/dataprep-core`)**:
        *   **Purpose:** Shared logic and types *specifically* for data preparation commands (`digest`, `fetch`).
        *   **Key Files:** `content-item.ts`, `adapters.ts` (Adapter interface), `transformers.ts` (Transformer interface), `formatters.ts` (Formatter interface), `pipeline.ts` (Streaming pipeline logic), `ignore.ts` (Ignore/match utils), `token-estimator.ts`.
        *   **Dependencies:** `@cli-upkaran/core`, `js-tiktoken`, `ignore`, `micromatch`.
    *   **`command-digest` (`@cli-upkaran/command-digest`)**:
        *   **Purpose:** Implements the `digest` command plugin.
        *   **Key Files:** `index.ts` (registers command with CLI), `digest.ts` (main handler logic), `options.ts` (command-specific options definition).
        *   **Dependencies:** `@cli-upkaran/core`, `@cli-upkaran/dataprep-core`, `@cli-upkaran/adapter-filesystem`.
    *   **`command-fetch` (`@cli-upkaran/command-fetch`)**:
        *   **Purpose:** Implements the `fetch` command plugin.
        *   **Key Files:** `index.ts` (registers command with CLI), `fetch.ts` (main handler logic), `options.ts`.
        *   **Dependencies:** `@cli-upkaran/core`, `@cli-upkaran/dataprep-core`, `@cli-upkaran/adapter-website`.
    *   **`adapter-filesystem` (`@cli-upkaran/adapter-filesystem`)**:
        *   **Purpose:** Data preparation adapter for local files. Implements `Adapter` interface from `dataprep-core`.
        *   **Key Files:** `index.ts` (adapter implementation), `utils.ts`.
        *   **Dependencies:** `@cli-upkaran/core`, `@cli-upkaran/dataprep-core`, `glob`, `isbinaryfile`.
    *   **`adapter-website` (`@cli-upkaran/adapter-website`)**:
        *   **Purpose:** Data preparation adapter for websites. Implements `Adapter` interface from `dataprep-core`.
        *   **Key Files:** `index.ts` (adapter implementation, includes Readability logic), `sitemap.ts`, `readability.ts`, `utils.ts`.
        *   **Dependencies:** `@cli-upkaran/core`, `@cli-upkaran/dataprep-core`, `node-fetch` (or native), `p-queue`, `fast-xml-parser`, `@mozilla/readability`, `turndown`, `turndown-plugin-gfm`, `cheerio`.
    *   **`(Future) command-*`:** Other command plugins following the same pattern.
    *   **`(Future) transformer-*`:** Plugins providing data preparation transformers.
    *   **`(Future) formatter-*`:** Plugins providing data preparation formatters.
    *   **`(Future) adapter-*`:** Plugins providing data preparation adapters.

**4. CLI Interface (`npx cli-upkaran ...`)**

*   **Invocation:** `npx cli-upkaran [global_options] <command> [command_options_and_args]`
*   **Interactive Mode:** `npx cli-upkaran` (no command specified)

**4.1. Global Options**

These options are processed by the main `cli` package before routing to a command.

*   `-V, --version`: Display the version number of `@cli-upkaran/cli`.
*   `-h, --help`: Display global help or help for a specific `<command>` if provided.
*   `--verbose`: Enable more detailed logging output across all modules.
*   `--no-color`: Disable colored output.
*   `--config <path>`: (Future) Path to a global configuration file.

**4.2. Command Structure**

Each command plugin defines:

*   **Name:** The string used to invoke the command (e.g., `digest`, `fetch`).
*   **Description:** A brief explanation shown in help messages.
*   **Arguments:** Positional arguments the command accepts.
*   **Options:** Flags (`--option`) specific to the command.
*   **Handler Function:** The async function executed when the command is invoked, receiving parsed arguments and options.

**4.3. Initial Built-in Commands**

*   **`digest`:** (Defined in `@cli-upkaran/command-digest`)
    *   **Description:** Aggregates and processes local files into a single output, suitable for AI context.
    *   **Usage:** `npx cli-upkaran digest [<input_directory>] [options]`
    *   **Arguments & Options:** *See detailed specification in previous response (Section 4.1, digest command). All options related to input dir, output, format (markdown/json), match, ignore, gitignore, defaults, whitespace, transforms, plugins (for dataprep), showing files.*
    *   **Handler:** Uses `@cli-upkaran/dataprep-core` pipeline logic, configured with `@cli-upkaran/adapter-filesystem`.
*   **`fetch`:** (Defined in `@cli-upkaran/command-fetch`)
    *   **Description:** Fetches and processes content from websites (via crawling or sitemap) into a single output.
    *   **Usage:** `npx cli-upkaran fetch <url_or_sitemap_path> [options]`
    *   **Arguments & Options:** *See detailed specification in previous response (Section 4.1, fetch command). All options related to URL, output, format (markdown/json/text), adapter (dataprep), sitemap, match, selector, concurrency, limit, crawling, auth, transforms, plugins (for dataprep), showing URLs.*
    *   **Handler:** Uses `@cli-upkaran/dataprep-core` pipeline logic, configured with `@cli-upkaran/adapter-website` (or other loaded website adapters).

**4.4. Interactive Mode (`npx cli-upkaran`)**

Managed by `@cli-upkaran/cli`.

1.  **Display Welcome:** Show a vibrant welcome message.
2.  **Command Selection:** Prompt user to choose from a list of *all available* commands (discovered from built-in definitions and loaded command plugins). Use `@clack/prompts` `select`.
3.  **Delegate to Command:** Once a command is selected, the interactive mode essentially delegates to that command package's specific interactive configuration flow (if the command package implements one) or prompts for its required arguments and options using `@clack/prompts` based on the command's definition.
4.  **Configuration:** Guide the user through setting the selected command's specific arguments and options using appropriate prompts (text, confirm, select, multiselect, password).
5.  **Confirmation:** Show a summary of the command and options selected. Ask for confirmation.
6.  **Execution:** Run the command handler with the collected configuration. Display progress using `ora` spinners with context-aware text.
7.  **Completion:** Display success or error summary using `chalk`.

**5. Plugin System (Commands)**

Managed by `@cli-upkaran/core` and utilized by `@cli-upkaran/cli`.

*   **Plugin Definition (`core/src/types.ts`):**
    ```typescript
    import { Command } from 'commander'; // Or relevant type from cac

    // Interface for the object defining a single command
    export interface CommandDefinition {
      name: string;
      description: string;
      aliases?: string[];
      // Function to configure options/args using commander/cac instance
      configure?: (command: Command) => void;
      // The function that executes the command's logic
      handler: (options: any, command: Command) => Promise<void>;
    }

    // Interface for the object returned by a plugin's registration function
    export interface CommandPlugin {
      type: 'command';
      commands: CommandDefinition[]; // A plugin can provide multiple related commands
    }

    // Type for the registration function exported by a plugin module
    export type RegisterCommandsFn = (cliOptions?: any) => CommandPlugin | CommandPlugin[];
    ```
*   **Discovery (`core/src/plugin-loader.ts`):**
    *   Looks for plugins specified via CLI flag (`--plugin <name_or_path>`) or eventually a config file.
    *   Potentially searches for packages matching a naming convention (e.g., `@cli-upkaran/command-*`) in `node_modules`.
*   **Loading (`core/src/plugin-loader.ts`):**
    *   Uses dynamic `import()` to load the plugin module's entry point.
    *   Checks for an exported `registerCommands` (or similar conventional name) function.
*   **Registration (`cli/src/commands.ts`):**
    *   The CLI calls the `loadPlugins` function from `core`.
    *   For each loaded `CommandPlugin`, it iterates through the `commands` array.
    *   For each `CommandDefinition`, it uses the `commander`/`cac` API to:
        *   Define the command (`cli.command(name)`).
        *   Set description, aliases.
        *   Call the command's `configure` function to add its specific options/arguments.
        *   Set the command's action/handler to call the `handler` function.

**6. Data Preparation Subsystem (`@cli-upkaran/dataprep-core`, Adapters, Transformers, Formatters)**

This subsystem is *used by* commands like `digest` and `fetch` but is separate from the core CLI/plugin mechanism.

*   **`ContentItem`:** Defined in `dataprep-core`. Structure as detailed previously.
*   **Adapter Interface (`dataprep-core/src/adapters.ts`):** Requires `getStream(source, options): AsyncIterable<ContentItem>`. Implemented by `adapter-filesystem`, `adapter-website`, etc.
*   **Transformer Interface (`dataprep-core/src/transformers.ts`):** Requires `name: string` and `transform(item, context): Promise<ContentItem | null> | ContentItem | null`. Used by the pipeline.
*   **Formatter Interface (`dataprep-core/src/formatters.ts`):** Requires `name: string` and `format(items: AsyncIterable<ContentItem>, outputStream: WritableStream, options?: any): Promise<void>`. Implemented by formatters for `markdown`, `json`, `text`.
*   **Pipeline (`dataprep-core/src/pipeline.ts`):** Contains functions to construct and run the streaming pipeline: `adapter.getStream() -> transformStreamWrapper -> formatter.format()`. Handles stream events and errors within the data prep flow.
*   **Plugins (Data Prep):** Commands like `digest` or `fetch` might implement their *own* mechanism (using `--plugin` or specific flags) to load dataprep-specific plugins (adapters, transformers, formatters) and make them available to the `dataprep-core` pipeline they configure. This keeps the main CLI plugin system focused on commands.

**7. Visual Design & UX (CLI)**

*   **Colors:** Use `chalk` extensively for semantic coloring (info, success, warning, error, prompts, headers). Aim for a vibrant but professional look compatible with light/dark themes.
*   **Interactivity:** Use `@clack/prompts` for all interactive elements (select, confirm, text, multiselect, password) ensuring a smooth, modern feel.
*   **Feedback:** Use `ora` for spinners during long operations, providing clear context messages (e.g., "Fetching...", "Processing file X...").
*   **Layout:** Use whitespace, indentation, and potentially light use of box drawing characters (via libraries like `boxen`) in summaries or help messages for clarity.
*   **Consistency:** Ensure terminology, prompt phrasing, and output formatting are consistent across all commands.

**8. Technical Details**

*   **Runtime:** Node.js >= 20.x
*   **Package Manager:** `pnpm` (required for workspaces)
*   **Language:** TypeScript (strict, target ES2022 or later)
*   **Module System:** ES Modules (configure `tsconfig.json` and `package.json` accordingly)
*   **Testing:** Jest or Vitest for unit, integration, and potentially end-to-end tests (using `child_process` to run the CLI). Aim for high test coverage, especially for core utilities and data prep logic.
*   **Linting/Formatting:** ESLint + Prettier.

**9. Future Enhancements**

*   Global configuration file support.
*   More built-in commands (AI interactions, etc.).
*   Sophisticated caching mechanisms.
*   More adapters, transformers, formatters (built-in or plugins).
*   Enhanced interactive mode (more context, better defaults).
*   Schema validation for configurations and plugin interfaces.

---

**Initial Code Structure and Stubs**

```bash
# 1. Setup Monorepo Root
mkdir cli-upkaran
cd cli-upkaran
pnpm init
echo "packages:
  - 'packages/*'
" > pnpm-workspace.yaml
mkdir packages

# Create tsconfig.base.json (example)
echo '{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "lib": ["ES2022"],
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "declaration": true,
    "sourceMap": true,
    "composite": true // Important for project references
  },
  "exclude": ["node_modules", "dist"]
}' > tsconfig.base.json

# Update root package.json (add scripts, devDependencies)
# Example devDependencies: typescript, @types/node, jest, ts-jest, prettier, eslint, etc.
# Example script: "build": "pnpm -r run build"

# 2. Create Core Package
mkdir packages/core
cd packages/core
pnpm init --yes
# Add dependencies: chalk
# Add devDependencies: @types/node
echo '{ "extends": "../../tsconfig.base.json", "compilerOptions": { "outDir": "./dist", "rootDir": "./src" }, "include": ["src/**/*"], "references": [] }' > tsconfig.json
mkdir src
touch src/index.ts src/types.ts src/logger.ts src/plugin-loader.ts src/config.ts src/error.ts src/utils.ts
# --- Add initial interface/function stubs in core files ---
# src/types.ts
export interface CommandDefinition { /* ... */ }
export interface CommandPlugin { /* ... */ }
export type RegisterCommandsFn = (cliOptions?: any) => CommandPlugin | CommandPlugin[];
# src/plugin-loader.ts
export async function loadCommandPlugins(pluginPathsOrNames: string[]): Promise<CommandPlugin[]> { console.log("TODO: Load plugins", pluginPathsOrNames); return []; }
# src/logger.ts
import chalk from 'chalk';
export const logger = { info: console.log, warn: (...args: any[]) => console.warn(chalk.yellow('WARN:'), ...args), error: (...args: any[]) => console.error(chalk.red('ERROR:'), ...args) };
export {}; // Make it a module
cd ../..

# 3. Create CLI Package
mkdir packages/cli
cd packages/cli
pnpm init --yes
# Add dependencies: @cli-upkaran/core, commander, @clack/prompts, ora, chalk
# Add devDependencies: @types/node, @types/ora
# Add bin entry to package.json: "bin": { "cli-upkaran": "./dist/index.js" }
echo '{ "extends": "../../tsconfig.base.json", "compilerOptions": { "outDir": "./dist", "rootDir": "./src" }, "include": ["src/**/*"], "references": [{"path": "../core"}] }' > tsconfig.json
mkdir src src/ui src/utils
touch src/index.ts src/commands.ts src/interactive.ts src/ui/prompts.ts src/ui/spinners.ts
# --- Add initial CLI structure ---
# src/index.ts
#!/usr/bin/env node
import { Command } from 'commander';
import { registerCommands } from './commands';
// import { runInteractive } from './interactive';
import { logger } from '@cli-upkaran/core'; // Assuming core exports logger

async function main() {
  const program = new Command();
  program
    .name("cli-upkaran")
    .version("0.0.1") // Read from package.json
    .description("A Unified Toolkit for AI Tasks");

  // TODO: Load core config, setup global options (--verbose, --no-color)

  await registerCommands(program); // Register built-in and plugin commands

  // If no command provided, potentially launch interactive mode
  // if (!process.argv.slice(2).length || process.argv[2] === 'interactive') {
  //   await runInteractive(program);
  // } else {
     await program.parseAsync(process.argv);
  // }
}

main().catch(err => {
  logger.error(err.message || err);
  // console.error(err); // More detailed stack
  process.exit(1);
});

# src/commands.ts
import { Command } from 'commander';
import { loadCommandPlugins, CommandPlugin, CommandDefinition } from '@cli-upkaran/core';
// Import built-in command registration functions
import { registerDigestCommand } from '@cli-upkaran/command-digest';
import { registerFetchCommand } from '@cli-upkaran/command-fetch';

function addCommand(program: Command, def: CommandDefinition) {
    const cmd = program.command(def.name);
    if (def.description) cmd.description(def.description);
    if (def.aliases) cmd.aliases(def.aliases);
    if (def.configure) def.configure(cmd); // Let the command define its options/args
    cmd.action(async (options, commandInstance) => { // Pass options and command instance
        await def.handler(options, commandInstance);
    });
}

export async function registerCommands(program: Command) {
    // 1. Register built-in commands explicitly
    registerDigestCommand(program);
    registerFetchCommand(program);

    // 2. Discover and register plugin commands
    // TODO: Get plugin paths/names from CLI args or config
    const pluginPaths: string[] = [];
    const loadedPlugins: CommandPlugin[] = await loadCommandPlugins(pluginPaths);

    loadedPlugins.forEach(plugin => {
        if (plugin.type === 'command' && plugin.commands) {
            plugin.commands.forEach(cmdDef => {
                 addCommand(program, cmdDef);
            });
        }
    });
}


cd ../..

# 4. Create DataPrep Core Package
mkdir packages/dataprep-core
cd packages/dataprep-core
pnpm init --yes
# Add dependencies: @cli-upkaran/core, js-tiktoken, ignore, micromatch
# Add devDependencies: @types/node
echo '{ "extends": "../../tsconfig.base.json", "compilerOptions": { "outDir": "./dist", "rootDir": "./src" }, "include": ["src/**/*"], "references": [{"path": "../core"}] }' > tsconfig.json
mkdir src
touch src/index.ts src/content-item.ts src/adapters.ts src/transformers.ts src/formatters.ts src/pipeline.ts src/ignore.ts src/token-estimator.ts
# --- Add initial interface stubs ---
# src/content-item.ts
export interface ContentItem { id: string; source: string; adapter: string; type: 'text' | 'binary' | /*...*/; content: string | null; metadata?: Record<string, any>; }
# src/adapters.ts
import { ContentItem } from './content-item';
export interface AdapterOptions { match?: string | string[]; [key: string]: any; }
export interface Adapter { getStream(source: string, options: AdapterOptions): AsyncIterable<ContentItem>; }
# (Define Transformer, Formatter interfaces similarly)
cd ../..

# 5. Create Command Packages (digest, fetch)
# Example for command-digest:
mkdir packages/command-digest
cd packages/command-digest
pnpm init --yes
# Add dependencies: @cli-upkaran/core, @cli-upkaran/dataprep-core, @cli-upkaran/adapter-filesystem, commander
# Add devDependencies: @types/node
echo '{ "extends": "../../tsconfig.base.json", "compilerOptions": { "outDir": "./dist", "rootDir": "./src" }, "include": ["src/**/*"], "references": [{"path": "../core"}, {"path": "../dataprep-core"}, {"path": "../adapter-filesystem"}] }' > tsconfig.json
mkdir src
touch src/index.ts src/digest.ts src/options.ts
# --- Add initial command registration structure ---
# src/index.ts
import type { Command } from 'commander';
import type { CommandDefinition } from '@cli-upkaran/core';
import { runDigest } from './digest';
import { configureDigestOptions } from './options';

const digestCommand: CommandDefinition = {
    name: 'digest',
    description: 'Aggregates and processes local files.',
    configure: configureDigestOptions, // Function to add options specific to digest
    handler: async (options: any, command: Command) => {
        // Command instance might be useful for args
        const inputDir = command.args[0] || '.'; // Example: get argument
        await runDigest(inputDir, options);
    }
};

// Function called by CLI to register this command
export function registerDigestCommand(program: Command) {
     // Helper needed in CLI or core to add command definition easily
     // For now, manually structure it:
     const cmd = program.command(digestCommand.name);
     cmd.description(digestCommand.description);
     cmd.argument('[input_directory]', 'Input directory path (default: .)');
     if(digestCommand.configure) digestCommand.configure(cmd);
     cmd.action(digestCommand.handler);
}

# src/options.ts
import type { Command } from 'commander';
export function configureDigestOptions(command: Command) {
    command
        .option('-o, --output <file>', 'Output file path', 'codebase.md')
        .option('--format <markdown|json>', 'Output format', 'markdown')
        // ... add all other digest options ...
        .option('--use-gitignore', 'Use .gitignore rules', true)
        .option('--no-default-ignores', 'Disable default ignores');
}

# src/digest.ts
import { logger } from '@cli-upkaran/core';
// import { runPipeline } from '@cli-upkaran/dataprep-core';
// import { createFileSystemAdapter } from '@cli-upkaran/adapter-filesystem';
// import { createMarkdownFormatter, createJsonFormatter } from './formatters'; // Needs formatters

export async function runDigest(inputDir: string, options: any) {
    logger.info(`Starting digest command for directory: ${inputDir}`);
    logger.info(`Options: ${JSON.stringify(options)}`);
    // TODO:
    // 1. Combine ignore patterns (default, gitignore, file, cli)
    // 2. Instantiate FileSystem Adapter with options
    // 3. Select Formatter based on options.format
    // 4. Select Transformers based on options.transform
    // 5. Create output stream (file or stdout)
    // 6. Run the dataprep pipeline: runPipeline(adapter, transformers, formatter, outputStream)
    // 7. Show summary (included/excluded files if requested)
    logger.warn("Digest logic not implemented yet.");
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate work
    logger.info("Digest command finished (stub).");
}

cd ../..
# Repeat similar steps for command-fetch

# 6. Create Adapter Packages (filesystem, website)
# Example for adapter-filesystem:
mkdir packages/adapter-filesystem
cd packages/adapter-filesystem
pnpm init --yes
# Add dependencies: @cli-upkaran/core, @cli-upkaran/dataprep-core, glob, isbinaryfile
# Add devDependencies: @types/node, @types/glob, @types/isbinaryfile
echo '{ "extends": "../../tsconfig.base.json", "compilerOptions": { "outDir": "./dist", "rootDir": "./src" }, "include": ["src/**/*"], "references": [{"path": "../core"}, {"path": "../dataprep-core"}] }' > tsconfig.json
mkdir src
touch src/index.ts src/utils.ts
# --- Add initial adapter structure ---
# src/index.ts
import { Adapter, AdapterOptions, ContentItem } from '@cli-upkaran/dataprep-core';
import { logger } from '@cli-upkaran/core';

class FileSystemAdapter implements Adapter {
    async *getStream(source: string, options: AdapterOptions): AsyncIterable<ContentItem> {
        logger.info(`[FS Adapter] Starting stream for source: ${source}`);
        logger.info(`[FS Adapter] Options: ${JSON.stringify(options)}`);
        // TODO: Implement glob/readdir traversal
        // TODO: Apply ignore/match filtering
        // TODO: Read files, check binary, create ContentItem
        // TODO: Yield ContentItem objects
        yield { // Example placeholder yield
            id: 'stub.txt',
            source: source,
            adapter: 'filesystem',
            type: 'text',
            content: 'Stub content',
            metadata: { filePath: 'stub.txt' }
        };
        logger.warn("[FS Adapter] File system streaming not fully implemented.");
    }
}

// Factory function maybe?
export function createFileSystemAdapter(): Adapter {
    return new FileSystemAdapter();
}

cd ../..
# Repeat similar steps for adapter-website

# 7. Final Steps
# - Install all dependencies: pnpm install
# - Configure build scripts in root and package package.json files
# - Configure linting/prettier
# - Start implementing the // TODO sections

```

This detailed specification and code structure provide a comprehensive starting point for building `@cli-upkaran` as a versatile AI toolkit CLI, addressing the expanded vision while retaining the detailed data preparation capabilities. Remember to fill in the `// TODO:` sections and add robust error handling and tests.