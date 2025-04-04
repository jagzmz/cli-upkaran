# Release Workflow Documentation

This document outlines the versioning, changelog generation, and release process for the `cli-upkaran` project, utilizing `changesets` and GitHub Actions.

## Tools Used

*   **pnpm:** Package manager, handling monorepo workspaces.
*   **Changesets:** A tool for managing versioning and changelogs, especially suited for monorepos. It separates the intent to release from the actual release process.
*   **GitHub Actions:** Automation platform used for CI checks and release orchestration.
*   **Conventional Commits:** While not strictly enforced by Changesets, the generated commit messages by the release action follow this convention.

## Core Concepts

*   **Changeset Files:** Small markdown files (`.changeset/*.md`) created by developers to signify a change that requires a version bump and changelog entry. Each file includes which packages are affected, the SemVer bump type (patch, minor, major), and a summary of the changes.
*   **Pre-Release Mode:** A state managed by Changesets (`.changeset/pre.json`) to handle alpha, beta, or rc releases.
*   **Automated Release Action:** A GitHub Action (`.github/workflows/release.yml`) triggers on pushes to `main`, consumes changeset files, versions packages, updates changelogs, publishes to npm (conditionally), commits changes, and tags the release.

## Branching Strategy

*   `main`: The primary branch representing the latest stable or pre-release state.
*   **Feature Branches:** All development happens on short-lived feature branches (e.g., `feat/add-widget`, `fix/login-bug`) branched off `main`.
*   Pull Requests (PRs): Feature branches are merged into `main` via Pull Requests after code review and CI checks pass.

## Day-to-Day Development Workflow (with Automated Summary)

This is the standard process for contributing code that should be included in a future release. It leverages a Git hook (`prepare-commit-msg`) to automatically populate the changeset summary from your commit message.

1.  **Branch:** Create a feature branch from the latest `main`:
    ```bash
    git checkout main
    git pull origin main
    git checkout -b feat/my-new-feature
    ```
2.  **Code:** Make your code changes across one or more packages.
3.  **Stage Code Changes:** Add your modified code files:
    ```bash
    git add src/ my-code.ts
    ```
4.  **Create Changeset (Summary Optional):** Run the Changesets CLI tool:
    ```bash
    pnpm changeset add
    # Or just: pnpm changeset
    ```
    *   The tool will detect the packages changed compared to `main`.
    *   Follow the prompts:
        *   Select the package(s) affected by your change using the spacebar and arrow keys.
        *   Choose the appropriate SemVer bump type (`patch`, `minor`, `major`) for **each** selected package based on the changes made.
        *   When prompted for a summary, you can just **press Enter to leave it blank**. The Git hook will populate it later.
    *   This creates a new file like `.changeset/random-name.md` with an empty summary section after the `---`.
5.  **Stage Changeset File:** Add the newly created **empty** changeset file:
    ```bash
    git add .changeset/random-name.md
    ```
6.  **Commit with Detailed Message:** Run `git commit`. Your configured Git editor will open.
    *   Write a clear and descriptive commit message. Following Conventional Commits format is recommended (e.g., `feat(scope): subject\n\nbody`). The subject line and body (if provided) will be used for the changeset summary.
    *   Save and close the editor.
7.  **Hook Execution (Automatic):**
    *   The `prepare-commit-msg` Git hook (configured via Husky) triggers automatically.
    *   It runs the script `.github/scripts/prepare-changeset-summary.js`.
    *   The script reads the commit message you just wrote.
    *   It finds the staged `.changeset/*.md` file.
    *   It writes your commit message subject and body into the summary section of the changeset file.
    *   It re-stages (`git add`) the updated changeset file.
8.  **Commit Finalized:** The `git commit` process completes, now including the changeset file with the summary automatically populated from your commit message.
9.  **Push & PR:** Push your branch and create a Pull Request targeting `main`.

## Automated Release Process (Stable)

This process runs automatically when PRs containing changeset files are merged into `main`:

1.  **Trigger:** A push occurs on the `main` branch.
2.  **CI Checks:** The `ci.yml` workflow runs lint/test/build checks (on the push event).
3.  **Release Workflow:** The `release.yml` workflow runs.
4.  **Changesets Action (`changesets/action@v1`):**
    *   Checks for files in the `.changeset` directory.
    *   **If no changeset files exist:** The action finishes silently. No release occurs.
    *   **If changeset files exist:**
        *   The action runs the `version` command specified in the workflow (`pnpm run version:ci`, which executes `changeset version`). This consumes all `.changeset/*.md` files, calculates the correct version bumps for each package, updates their `package.json` files, and updates/creates `CHANGELOG.md` files.
        *   The action runs the `publish` command specified (`pnpm run release:publish`, which executes `node ./.github/scripts/publish-with-tag.js`).
        *   The `publish-with-tag.js` script checks if `.changeset/pre.json` exists. For a stable release, it does not.
        *   The script executes `pnpm publish -r --no-git-checks --tag latest`, publishing the packages to npm with the `latest` dist-tag.
        *   If publishing succeeds, the action commits the modified `package.json` and `CHANGELOG.md` files with the message `chore: update versions and changelogs for release`.
        *   The action pushes the commit and associated git tags (e.g., `my-package@1.2.3`) to the `main` branch.

## Pre-Release Workflow (Alpha, Beta, RC)

Use this workflow when you want to publish experimental versions before a final stable release.

1.  **Enter Pre-Release Mode:**
    *   Decide on a pre-release tag (e.g., `beta`, `alpha`).
    *   Run the command **manually** on your local machine:
        ```bash
        pnpm changeset pre enter <tag>
        # Example:
        pnpm changeset pre enter beta
        ```
    *   This creates/updates the `.changeset/pre.json` file.
    *   **Commit and push this file to `main`** (or merge a PR containing it).

2.  **Development During Pre-Release:**
    *   Follow the exact same **Day-to-Day Development Workflow** described above (create branches, code, run `pnpm changeset`, commit, merge PRs).
    *   When adding changesets, choose the bump type (`patch`, `minor`, `major`) based on the change's significance relative to the *last stable release* or the *start* of the pre-release line.

3.  **Automated Pre-Release Publishing:**
    *   **Trigger:** A push occurs on the `main` branch while `.changeset/pre.json` exists.
    *   **CI Checks & Release Workflow:** Run as usual.
    *   **Changesets Action (`changesets/action@v1`):**
        *   Detects changeset files.
        *   Runs `pnpm run version:ci` (`changeset version`). It sees `pre.json` and calculates the next pre-release version (e.g., bumps a `minor` change from `1.2.0` to `1.3.0-beta.0`, or increments an existing pre-release like `1.3.0-beta.0` to `1.3.0-beta.1`). Updates `package.json` and `CHANGELOG.md`.
        *   Runs `pnpm run release:publish` (`node ./.github/scripts/publish-with-tag.js`).
        *   The `publish-with-tag.js` script finds `.changeset/pre.json` and reads the `tag` value (e.g., `beta`).
        *   The script executes `pnpm publish -r --no-git-checks --tag <tag>` (e.g., `pnpm publish -r --no-git-checks --tag beta`). This publishes to npm using the specified dist-tag, preventing it from becoming the default `latest`.
        *   The action commits version/changelog changes and pushes the commit and pre-release git tags (e.g., `my-package@1.3.0-beta.0`) to `main`.

4.  **Exit Pre-Release Mode:**
    *   When ready to release the stable version, run the command **manually**:
        ```bash
        pnpm changeset pre exit
        ```
    *   This removes the `.changeset/pre.json` file.
    *   **Commit and push this removal to `main`** (or merge a PR containing it).

5.  **Release Stable Version:**
    *   The push that removed `pre.json` (or the next push to `main` after that) triggers the `release.yml` workflow.
    *   The Changesets Action runs `changeset version`. It no longer sees `pre.json`. It consumes any remaining changeset files (or just uses the information from the pre-release versions) to determine the final stable version number (e.g., `1.3.0`).
    *   The `publish-with-tag.js` script runs, doesn't find `pre.json`, and executes `pnpm publish -r --no-git-checks --tag latest`.
    *   The final version bumps, changelogs, and stable git tags are pushed to `main`.

## Important Notes

*   **NPM Token:** The automated publishing requires an `NPM_TOKEN` secret to be configured in the GitHub repository settings (Settings > Secrets and variables > Actions). Without it, the `release.yml` action will create Pull Requests instead of publishing.
*   **`publish-with-tag.js`:** This script is essential for ensuring pre-releases are published with the correct npm dist-tag.
*   **Manual Steps:** Entering and exiting pre-release mode (`pnpm changeset pre enter/exit`) are manual steps that need to be committed.
*   **Build Step:** If your packages need to be built *before* publishing, uncomment and adjust the build step in `release.yml`. 