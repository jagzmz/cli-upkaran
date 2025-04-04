# @cli-upkaran/core

## 0.0.2-latest.2

### Patch Changes

- e1e74c0: feat: enhance CLI toolkit with new adapters and core functionalities

  - Introduced `@cli-upkaran/adapter-filesystem` for local file processing.
  - Added `@cli-upkaran/adapter-website` for fetching and processing web content.
  - Created core packages: `@cli-upkaran/core` and `@cli-upkaran/dataprep-core` for shared utilities and data preparation logic.
  - Established main CLI entry point with `@cli-upkaran/cli` for command execution and plugin management.
  - Updated README files across packages to reflect new features and usage instructions.
  - Changed versioning strategy to "latest" for pre-release tagging.

## 0.0.2-beta.1

### Patch Changes

- 8d7c8d6:

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
