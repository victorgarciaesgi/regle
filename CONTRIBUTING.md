# Regle Contributing Guide

Before submitting your contribution, please make sure to take a moment and read through the following guide:

## Repo Setup

The Regle repo is a monorepo using pnpm workspaces. The package manager used to install and link dependencies must be [pnpm](https://pnpm.io/).

1. Run `npx corepack enable pnpm` to install the correct package manager
2. Run `nvm use`
3. Run `pnpm install`
4. Run `pnpm run build` to build all monorepo packages

Run `pnpm run dev` to have a watch mode for the builds.

### Independant builds

This project uses turborepo. So you can run any command using:

`pnpx turbo build --filter='@regle/core'`

### Playground

You can run a Vue 3 and Nuxt playground using:

-`pnpm run play:vue3` 
-`pnpm run play:nuxt`

### Unit Testing

1. Run
   - `pnpm run test:dev` to run runtime tests in watch mode
   - `pnpm run test:typecheck` to run all the typecheck tests
   - `pnpm run test` to run all the test suite

You can additionally run all TS related typechecking and type unit tests using:

- `pnpm run typecheck`

### UI Testing

Ui testing uses playwright. You can run the tests using:

- `pnpm run ui-tests:run` to run the tests
  - `pnpm run ui-tests:run --headed` to run the server in headed mode
  - `pnpm run ui-tests:run --ui` to run the tests in ui mode
- `pnpm run ui-tests:test` to run the tests and generate a report

### Docs

1. Run `pnpm run docs:dev` to start the docs in dev mode
2. Run `pnpm run docs:build` to ensure docs build correctly, `twoslash` can fail if not done right

## Notes

To reset online playground dependencies cache:

Go to https://www.jsdelivr.com/tools/purge

```
https://cdn.jsdelivr.net/npm/@regle/core@latest/dist/regle-core.d.ts
https://cdn.jsdelivr.net/npm/@regle/rules@latest/dist/regle-rules.d.ts
https://cdn.jsdelivr.net/npm/@regle/schemas@latest/dist/regle-schemas.d.ts
```
