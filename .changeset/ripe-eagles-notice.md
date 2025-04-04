---
'@cli-upkaran/adapter-filesystem': patch
'@cli-upkaran/adapter-website': patch
'@cli-upkaran/cli': patch
'@cli-upkaran/core': patch
'@cli-upkaran/dataprep-core': patch
'@cli-upkaran/digest': patch
'@cli-upkaran/fetch': patch
---
chore: remove unused tsx dependency and clean up pnpm-lock.yaml

- Removed the  dependency from  as it is no longer needed.
- Cleaned up the  file by removing the associated package entries for  that were previously linked to workspace packages.
