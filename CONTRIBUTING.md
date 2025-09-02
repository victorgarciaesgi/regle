# Regle Contributing Guide

Before submitting your contribution, please make sure to take a moment and read through the following guide:

## Repo Setup

The Regle repo is a monorepo using pnpm workspaces. The package manager used to install and link dependencies must be [pnpm](https://pnpm.io/).

1. Run `npx corepack install` to install the correct package manager
2. Run `pnpm install`
3. Run `pnpm run build` to build all monorepo packages

Run `pnpm run dev` to have a watch mode for the builds.


### Independant builds

This project uses turborepo. So you can run any command using:

`pnpx turbo build --filter='@regle/core'`

### Testing

1. Run
   - `pnpm run test:dev` to run runtime tests in watch mode
   - `pnpm run test:dts` to run all the typecheck tests
   - `pnpm run test` to run all the test suite

In any project in the `playground` folder to test new features.

### Docs

1. Run `pnpm build`
2. Run `pnpm run docs:dev` to start the docs in dev mode
3. Run `pnpm run docs:build` to ensure docs build correctly, `twoslash` can fail if not done right


## Notes

To reset online playground dependencies cache:

Go to https://www.jsdelivr.com/tools/purge

```
https://cdn.jsdelivr.net/npm/@regle/core/dist
https://cdn.jsdelivr.net/npm/@regle/rules/dist
https://cdn.jsdelivr.net/npm/@regle/schemas/dist
```