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
    <a href="https://codecov.io/github/victorgarciaesgi/regle"><img src="https://codecov.io/github/victorgarciaesgi/regle/graph/badge.svg?token=T5UV4714PB"/></a>
    <a href="https://www.npmjs.com/package/@regle/core"><img alt="npm download" src="https://img.shields.io/npm/dm/@regle/core.svg"/></a>
    <a href="https://www.npmjs.com/package/@regle/core"><img alt="npm download" src="https://img.shields.io/npm/dt/@regle/core.svg"/></a>
   
  </p>

# Regle


Regle \ʁɛɡl\ (French word for 'rule' ) is a type-safe model-based form validation library for Vue 3.

It's heavily inspired by Vuelidate.


## 📚 Documentation

[![Documentation](https://raw.githubusercontent.com/victorgarciaesgi/regle/refs/heads/main/.github/images/redirectDoc.svg)](https://reglejs.dev/)

## 🎮 Play with it

### Playground

<a target='_blank' href="https://play.vuejs.org/#eNqlVW1r2zAQ/iuHKcSB1IJtn7K0dBuBbYxutP1oBq5zTtTIkqeXpMHzf99JihO3a0vH8sFId88999zppLTJh6bJNg6TaTIzpeaNBYPWNee55HWjtIVWY9VBpVUNIwKO3h894Axe4VIg9IAL7besVPoBUOMvxzUuJlBz+Q3l0q4mgHXBxaNA7QQaH5nLUklDYmxhEc6ARKStLGqcwmi0j/XLbnzEtvqkI2gvKg2xE2hzCRBDW+L5S8n0uEzfjaGbePw+QRsX0OUyZirMTpZQOVlariQYd1tzm45jkl4GGifsBBaFLbygYltwC/okO9kUgpMV0zGVCMArSCN4TxAplMBMqGXq4zMvnDJ7H2P+O/j9pPZoLpfPhAbph9js6Vj4DU4usOISFx7aAQqDj+VsCy3T0VxrpQ21fRKqwbANCXx/cjljcYRoeGhjsW4EFUs7gNnqzflnFEJBOJsZo71HkUcUtyjOL/0BzVjcBDuXjbOwOa3VAsVZnuwb6DD0JE+A2EtcKbFATe6bXYOwUy4cNXlZZHGRzefhRFYpjw3KQVWDMnrS6Rp3PSJP9rEAbRssHVUZyJjgkZ+FBINC5mFyXllJOKLnS+nd/1pLH/cfxdw6a2nAL0rByzVxxEknkuuwmLEIIPiMDU46mSTx0p/WRZPdGSXpZQnDlO8dJk/oXsXMeTJ4MLw9T1bWNmbK2Ha7zZxs1susVDUbwC58JmPZgtMnmE+9OaNLnNV3xB7u74A7vCmvIA+4J9iD/UjfjztVag3dj4ovH9VJnA0XqL83/o14WG9BV2D7NdisdnjQWq6wXD9hvzP3UfoPeihQb6hLB58t9BLpSLx7fn2J97Q+OGnWSPeLziuku+28xgj7SA8ByR7ggtov4djoqbgx83uL0vRFeaGhGwGfJ/Tv8OmF0o9y32bvDl3s/gDzVyko"><img width="170" src="https://raw.githubusercontent.com/victorgarciaesgi/regle/master/.github/images/vue-sfc-play.png" /></a>

| Simple demo  | Advanced Demo |
| ------------- | ------------- |
|[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/~/github.com/victorgarciaesgi/regle-examples/tree/main/examples/simple-example?file=examples/simple-example/src/App.vue&configPath=examples/simple-example)  | [![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/~/github.com/victorgarciaesgi/regle-examples/tree/main/examples/advanced-example?file=examples/advanced-example/src/App.vue&configPath=examples/advanced-example)  |

## 🧰 Features
- ✅ 100% type inference
- 📖 Model based validation
- 💀 Headless
- 🪗 Extensible
- 🛒 Collection validation
- 🦸‍♂️ [Zod](https://zod.dev/) support
- 🤖 [Valibot](https://valibot.dev/) support

## 🫶 Credits

- [Johannes Lacourly](https://www.behance.net/johanneslaf7dc) for designing logo and banners 🪄
- [Martins Zeltins](https://github.com/martinszeltins) who helped me identify a lot of bugs, find new features and contributed to docs.
- [Vuelidate](https://vuelidate-next.netlify.app) Which I loved and used for 8 years, and is my main inspiration for creating Regle


## Example

```vue
<template>
  <input 
    v-model='r$.$value.email' 
    :class="{ error: r$.$fields.email.$error }" 
    placeholder='Type your email'
  />

  <ul>
    <li v-for="error of r$.$errors.email" :key='error'>
      {{ error }}
    </li>
  </ul>
</template>

<script setup lang='ts'>
import { useRegle } from '@regle/core';
import { required, minLength, email } from '@regle/rules';

const { r$ } = useRegle({ email: '' }, {
  email: { required, minLength: minLength(4), email }
})
</script>
```


## Compatibility:


- <img src="https://raw.githubusercontent.com/victorgarciaesgi/regle/master/.github/images/icons/vue.svg" alt='vue'/> Vue 3.3+
- <img src="https://raw.githubusercontent.com/victorgarciaesgi/regle/master/.github/images/icons/nuxt.svg" alt='nuxt'/> Nuxt 3
- <img src="https://raw.githubusercontent.com/victorgarciaesgi/regle/master/.github/images/icons/pinia.svg" alt='pinia'/> Pinia
- 🦸‍♂️ Zod
- 🤖 Valibot


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
