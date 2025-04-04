---
'@cli-upkaran/adapter-filesystem': patch
'@cli-upkaran/adapter-website': patch
'@cli-upkaran/cli': patch
'@cli-upkaran/core': patch
'@cli-upkaran/dataprep-core': patch
'@cli-upkaran/digest': patch
'@cli-upkaran/fetch': patch
---
chore: refactor package.json and update release workflow documentation

- Changed the package name in `package.json` from "@cli-upkaran/root" to "cli-upkaran-root".
- Updated the author information in `package.json`.
- Removed the `tsx` dependency from `package.json` and the associated script command.
- Revised the release workflow documentation to clarify the automated changeset generation process and the use of the `prepare-commit-msg` Git hook.
