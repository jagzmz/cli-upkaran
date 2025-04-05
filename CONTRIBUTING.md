# Contributing to cli-upkaran

Thank you for considering contributing to `cli-upkaran`! We welcome any help to make this tool better.

## How Can I Contribute?

### Reporting Bugs

-   Ensure the bug was not already reported by searching on GitHub under [Issues](https://github.com/mahesh-hegde/cli-upkaran/issues).
-   If you're unable to find an open issue addressing the problem, [open a new one](https://github.com/mahesh-hegde/cli-upkaran/issues/new). Be sure to include a **title and clear description**, as much relevant information as possible, and a **code sample or an executable test case** demonstrating the expected behavior that is not occurring.

### Suggesting Enhancements

-   Open a new issue, clearly describing the enhancement you have in mind. Explain why this enhancement would be useful.

### Pull Requests

1.  Fork the repository and create your branch from `main`.
2.  If you've added code that should be tested, add tests.
3.  Ensure the test suite passes (`pnpm test` in the root or relevant package).
4.  Make sure your code lints (`pnpm lint`).
5.  Issue that pull request!

## Development Setup

1.  Clone the repository: `git clone https://github.com/mahesh-hegde/cli-upkaran.git`
2.  Navigate to the project directory: `cd cli-upkaran`
3.  Install dependencies: `pnpm install`
4.  Build all packages: `pnpm build`

Now you can run the CLI locally using `pnpm exec cli-upkaran <command>` from the root directory.

## Code Style

Please follow the existing code style. We use Prettier and ESLint to enforce consistency. Run `pnpm lint` and `pnpm format` before committing.

## Any questions?

Feel free to open an issue if you have questions about contributing. 