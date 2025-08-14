# Regle Contributing Guide

Before submitting your contribution, please make sure to take a moment and read through the following guide:

## Repo Setup

The Regle repo is a monorepo using pnpm workspaces. The package manager used to install and link dependencies must be [pnpm](https://pnpm.io/).

1. Run `npx corepack install` to install the correct package manager
1. Run `pnpm install` in `regle`'s root folder
2. Run `pnpm run build` to build all monorepo packages

- after this, you can use `pnpm run dev` to rebuild packages as you modify code

3. Run
   - `pnpm run test:dev` to run runtime tests in watch mode
   - `pnpm run test:dts` to run all the typecheck tests
   - `pnpm run test` to run all the test suite

In any project in the `playground` folder to test new features.

### Docs

1. Run `pnpm build` in `regle`'s root folder
2. Run `pnpm run docs:dev` to start the docs in dev mode
3. Run `pnpm run docs:build` to ensure docs build correctly, `twoslash` can fail if not done right
