# cli-upkaran

## 0.0.3

### Patch Changes

- 2680480: updated @cli-upkaran/cli references from to cli-upkaran
- Updated dependencies [2680480]
  - @cli-upkaran/core@0.0.3

## 0.0.2

### Patch Changes

- 8d7c8d6:
- c71578e: fix issue with resolving packages which had version tag
- c08a3e5: chore: add scripts for automatic changeset summary updates

  - Introduced a script to automatically update changeset summaries based on commit messages.
  - Added a Husky hook to trigger the script during commit preparation.
  - Created initial changeset files for package updates.

- c08a3e5: Initial release
- 0bd8600: chore: remove unused tsx dependency and clean up pnpm-lock.yaml

  - Removed the dependency from as it is no longer needed.
  - Cleaned up the file by removing the associated package entries for that were previously linked to workspace packages.

- bdb51ae:
- 3057488: chore: refactor package.json and update release workflow documentation

  - Changed the package name in `package.json` from "@cli-upkaran/root" to "cli-upkaran-root".
  - Updated the author information in `package.json`.
  - Removed the `tsx` dependency from `package.json` and the associated script command.
  - Revised the release workflow documentation to clarify the automated changeset generation process and the use of the `prepare-commit-msg` Git hook.

- 9187068: fix: correct duplicate argument in installPluginGlobally call
- e1e74c0: feat: enhance CLI toolkit with new adapters and core functionalities

  - Introduced `@cli-upkaran/adapter-filesystem` for local file processing.
  - Added `@cli-upkaran/adapter-website` for fetching and processing web content.
  - Created core packages: `@cli-upkaran/core` and `@cli-upkaran/dataprep-core` for shared utilities and data preparation logic.
  - Established main CLI entry point with `cli-upkaran` for command execution and plugin management.
  - Updated README files across packages to reflect new features and usage instructions.
  - Changed versioning strategy to "latest" for pre-release tagging.

- a35d5a7: refactor: enhance plugin installation function with base name verification
- 60d5485: chore: update changeset summary for package updates

  - Revised the changeset summary to reflect recent updates across multiple packages, ensuring accurate documentation of changes.

- 7eae1c4: chore: update CI workflow and release documentation

  - Removed the version specification for pnpm in the CI workflow to use the default latest version.
  - Enhanced the release workflow documentation to clarify the day-to-day development process, including automated summary generation for changesets.

- 916eafa: chore: add changeset for package updates

  - Created a new changeset file documenting patch updates for multiple packages including adapter-filesystem, adapter-website, cli, core, dataprep-core, digest, and fetch.

- Updated dependencies [8d7c8d6]
- Updated dependencies [c08a3e5]
- Updated dependencies [c08a3e5]
- Updated dependencies [0bd8600]
- Updated dependencies [bdb51ae]
- Updated dependencies [3057488]
- Updated dependencies [e1e74c0]
- Updated dependencies [60d5485]
- Updated dependencies [7eae1c4]
- Updated dependencies [916eafa]
  - @cli-upkaran/core@0.0.2

## 0.0.2-latest.5

### Patch Changes

- e1e74c0: feat: enhance CLI toolkit with new adapters and core functionalities

  - Introduced `@cli-upkaran/adapter-filesystem` for local file processing.
  - Added `@cli-upkaran/adapter-website` for fetching and processing web content.
  - Created core packages: `@cli-upkaran/core` and `@cli-upkaran/dataprep-core` for shared utilities and data preparation logic.
  - Established main CLI entry point with `cli-upkaran` for command execution and plugin management.
  - Updated README files across packages to reflect new features and usage instructions.
  - Changed versioning strategy to "latest" for pre-release tagging.

- Updated dependencies [e1e74c0]
  - @cli-upkaran/core@0.0.2-latest.2

## 0.0.2-beta.4

### Patch Changes

- 9187068: fix: correct duplicate argument in installPluginGlobally call

## 0.0.2-beta.3

### Patch Changes

- a35d5a7: refactor: enhance plugin installation function with base name verification

## 0.0.2-beta.2

### Patch Changes

- c71578e: fix issue with resolving packages which had version tag

## 0.0.2-beta.1

### Patch Changes

- 8d7c8d6:
- Updated dependencies [8d7c8d6]
  - @cli-upkaran/core@0.0.2-beta.1

## 0.0.2-beta.0

### Patch Changes

- c08a3e5: chore: add scripts for automatic changeset summary updates

  - Introduced a script to automatically update changeset summaries based on commit messages.
  - Added a Husky hook to trigger the script during commit preparation.
  - Created initial changeset files for package updates.

- c08a3e5: Initial release
- 0bd8600: chore: remove unused tsx dependency and clean up pnpm-lock.yaml

  - Removed the dependency from as it is no longer needed.
  - Cleaned up the file by removing the associated package entries for that were previously linked to workspace packages.

- bdb51ae:
- 3057488: chore: refactor package.json and update release workflow documentation

  - Changed the package name in `package.json` from "@cli-upkaran/root" to "cli-upkaran-root".
  - Updated the author information in `package.json`.
  - Removed the `tsx` dependency from `package.json` and the associated script command.
  - Revised the release workflow documentation to clarify the automated changeset generation process and the use of the `prepare-commit-msg` Git hook.

- 60d5485: chore: update changeset summary for package updates

  - Revised the changeset summary to reflect recent updates across multiple packages, ensuring accurate documentation of changes.

- 7eae1c4: chore: update CI workflow and release documentation

  - Removed the version specification for pnpm in the CI workflow to use the default latest version.
  - Enhanced the release workflow documentation to clarify the day-to-day development process, including automated summary generation for changesets.

- 916eafa: chore: add changeset for package updates

  - Created a new changeset file documenting patch updates for multiple packages including adapter-filesystem, adapter-website, cli, core, dataprep-core, digest, and fetch.

- Updated dependencies [c08a3e5]
- Updated dependencies [c08a3e5]
- Updated dependencies [0bd8600]
- Updated dependencies [bdb51ae]
- Updated dependencies [3057488]
- Updated dependencies [60d5485]
- Updated dependencies [7eae1c4]
- Updated dependencies [916eafa]
  - @cli-upkaran/core@0.0.2-beta.0
