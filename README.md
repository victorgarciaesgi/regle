[npm-version-src]: https://img.shields.io/npm/v/@regle/core.svg
[npm-version-href]: https://www.npmjs.com/package/@regle/core
[npm-downloads-src]: https://img.shields.io/npm/dm/@regle/core.svg
[npm-total-downloads-src]: https://img.shields.io/npm/dt/@regle/core.svg
[npm-downloads-href]: https://www.npmjs.com/package/@regle/core
<p align="center">
  <img src="https://raw.githubusercontent.com/victorgarciaesgi/regle/master/.github/images/regle-github-banner.png"
    alt="regle cover" />
</p>

<p align='center'>
    <a href="https://www.npmjs.com/package/@regle/core"><img alt="npm version" src="https://img.shields.io/npm/v/@regle/core.svg"/></a>
    <a href="https://www.npmjs.com/package/@regle/core"><img alt="npm download" src="https://img.shields.io/npm/dm/@regle/core.svg"/></a>
    <a href="https://www.npmjs.com/package/@regle/core"><img alt="npm download" src="https://img.shields.io/npm/dt/@regle/core.svg"/></a>
    <img src='https://img.shields.io/npm/l/@regle/core.svg'/>
  </p>

# Regle


Regle \ʁɛɡl\ (French word for 'rule' ) is a Typescript-first model-based form validation library for Vue 3.
It's heavily inspired by Vuelidate.



> ⚠️ Project is still in development, do not use it in production
> API or function names can still change


## 📚 Documentation

[![Documentation](https://raw.githubusercontent.com/victorgarciaesgi/regle/refs/heads/main/.github/images/redirectDoc.svg)](https://regle.vercel.app/)

## 🧰 Features
- ✅ Typescript first
- 🤖 100% type inference
- 📖 Model based validation
- 🪗 Extensible
- 🦸‍♂️ [Zod](https://zod.dev/) support
- 🪶 Light (~6kb gzip)
- 🛒 Collection validation

## 🎮 Play with it

TODO


## Compatibility:


- <img src="https://raw.githubusercontent.com/victorgarciaesgi/regle/master/.github/images/icons/vue.svg" alt='vue'/> Vue 3.1+
- <img src="https://raw.githubusercontent.com/victorgarciaesgi/regle/master/.github/images/icons/nuxt.svg" alt='nuxt'/> Nuxt 3
- <img src="https://raw.githubusercontent.com/victorgarciaesgi/regle/master/.github/images/icons/pinia.svg" alt='pinia'/> Pinia


## ☑️ Roadmap

- [x] Async rules
- [x] resetAll
- [x] parse typesafe
- [x] Deep nested rules
- [x] Collection validation
- [x] `applyIf` helper (like requiredIf for any rule)
- [x] Async with params (need deps array) (withAsync)
- [x] Options (lazy, rewardEarly, autoDirty)
- [x] Regex helper
- [x] Additional rules and "and" helper
- [x] "or" and "not" helper
- [x] externalErrors
- [x] Dates built-in rule
- [x] Usable Metadata
- [x] Zod support
- [x] Per field validation option (lazy, debounce, etc...)
- [x] Logo
- [x] $silentErrors
- [x] Validation groups
- [x] Nuxt Module
- [x] Documentation
- [x] `$extractDirtyFields`
- [ ] External errors with zod types
- [ ] Unit tests (in progress)
- [ ] E2E tests (in progress)
- [ ] Examples
- [ ] `withErrorType`
- [ ] `Valibot` support
- [ ] `Yup` support
- [ ] Issue template
- [ ] TS docs

## 🤔 Maybe in roadmap

- [ ] Typed plugin system (like scrollToError)

## ⬇️ Quick install

```bash
pnpm install @regle/core @regle/rules
# or
yarn add @regle/core @regle/rules
# or
npm install @regle/core @regle/rules
```



## 📑 License

[MIT License](./LICENSE)
