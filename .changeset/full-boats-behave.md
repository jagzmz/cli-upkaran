---
'@cli-upkaran/adapter-filesystem': patch
'@cli-upkaran/adapter-website': patch
'@cli-upkaran/cli': patch
'@cli-upkaran/core': patch
'@cli-upkaran/dataprep-core': patch
'@cli-upkaran/digest': patch
'@cli-upkaran/fetch': patch
---
chore: add scripts for automatic changeset summary updates

- Introduced a script to automatically update changeset summaries based on commit messages.
- Added a Husky hook to trigger the script during commit preparation.
- Created initial changeset files for package updates.
