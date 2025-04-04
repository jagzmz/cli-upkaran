---
'@cli-upkaran/adapter-filesystem': patch
'@cli-upkaran/adapter-website': patch
'@cli-upkaran/cli': patch
'@cli-upkaran/core': patch
'@cli-upkaran/dataprep-core': patch
'@cli-upkaran/digest': patch
'@cli-upkaran/fetch': patch
---

 
feat: enhance CLI toolkit with new adapters and core functionalities

- Introduced `@cli-upkaran/adapter-filesystem` for local file processing.
- Added `@cli-upkaran/adapter-website` for fetching and processing web content.
- Created core packages: `@cli-upkaran/core` and `@cli-upkaran/dataprep-core` for shared utilities and data preparation logic.
- Established main CLI entry point with `@cli-upkaran/cli` for command execution and plugin management.
- Updated README files across packages to reflect new features and usage instructions.
- Changed versioning strategy to "latest" for pre-release tagging.
