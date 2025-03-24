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


Regle \ʁɛɡl\ (French word for 'rule' ) is a headless model-based form validation library for Vue 3.

It's heavily inspired by Vuelidate and aims to replace it in modern apps.


## 📚 Documentation

[![Documentation](https://raw.githubusercontent.com/victorgarciaesgi/regle/refs/heads/main/.github/images/redirectDoc.svg)](https://reglejs.dev/)

## 🎮 Play with it

### Playground

<a target='_blank' href="https://play.vuejs.org/#eNqlVW1r2zAQ/iuHKcSB1IJtn7K0dBuBbYxutP1oBq5zTtTIkqeXpMHzf99JihO3a0vH8sFId88999zppLTJh6bJNg6TaTIzpeaNBYPWNee55HWjtIVWY9VBpVUNIwKO3h894Axe4VIg9IAL7besVPoBUOMvxzUuJlBz+Q3l0q4mgHXBxaNA7QQaH5nLUklDYmxhEc6ARKStLGqcwmi0j/XLbnzEtvqkI2gvKg2xE2hzCRBDW+L5S8n0uEzfjaGbePw+QRsX0OUyZirMTpZQOVlariQYd1tzm45jkr2MTSE4JVgUtvB6im3BLeiT7CQ4SFM6pgoBeAVpMO3DI4ESmAm1TH145mVTXu9jzH8Hv5/UHM3l8pnQIPwQmz0dC7/ByQVWXOLCQztAYfCxnG2hZTqaa620oaZPQjEYtiGB704uZywOEI0ObSzWjaBaaQcwW705/4xCKAgnM2O09yjyiOIWxfmlP54Zi5tg57JxFjantVqgOMuTff8chp7kCRB7iSslFqjJfbNrEHbKhYMmL4ssLrL5PJzIKuWxQTmoalBGTzpd465H5Mk+FqBtg6WjKgMZEzzys5BgUMg8zM0rKwlH9Hwpvftfa+nj/qOYW2ctjfdFKXi5Jo4450RyHRYzFgEEn7HBSSeTJF7507posjujJL0rYZjyvcPkCd2qmDlPBs+Ft+fJytrGTBnbbreZk816mZWqZgPYhc9kLFtw+gTzqTdndIWz+o7Yw+0dcIcX5RXkAfcEe7Af6ftxp0qtoftR8eWjOomz4QL198a/EA/rLegKbL8Gm9UOD1rLFZbrJ+x35j5K/6HRoN5Qlw4+W+gl0pF49/z6Eu9pfXDSrJHuF51XSHfbeY0R9pEeApI9wAW1X8Kx0VNxY+b3FqXpi/JCQzcCPk/ov+HTC6Uf5b7N3h262P0BRcsoCg=="><img width="170" src="https://raw.githubusercontent.com/victorgarciaesgi/regle/master/.github/images/vue-sfc-play.png" /></a>

| Simple demo  | Advanced Demo |
| ------------- | ------------- |
|[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/~/github.com/victorgarciaesgi/regle-examples/tree/main/examples/simple-example?file=examples/simple-example/src/App.vue&configPath=examples/simple-example)  | [![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/~/github.com/victorgarciaesgi/regle-examples/tree/main/examples/advanced-example?file=examples/advanced-example/src/App.vue&configPath=examples/advanced-example)  |

## 🧰 Features
- ✅ 100% type inference
- 📖 Model based validation
- 💀 Headless
- 🪗 Extensible
- 🛒 Collection validation
- Standard Schemas spec support
  - 🦸‍♂️ [Zod](https://zod.dev/)
  - 🤖 [Valibot](https://valibot.dev/)
  - 🚢 [ArkType](https://arktype.io)  🚧


## 🫶 Credits

- [Johannes Lacourly](https://www.behance.net/johanneslaf7dc) for designing logo and banners 🪄
- [Martins Zeltins](https://github.com/martinszeltins) who helped me identify a lot of bugs, find new features and contributed to docs.
- [Vuelidate](https://vuelidate-next.netlify.app) Which I loved and used for 8 years, and is my main inspiration for creating Regle


## Basic example

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
- <img src="https://raw.githubusercontent.com/victorgarciaesgi/regle/master/.github/images/icons/nuxt.svg" alt='nuxt'/> Nuxt 3.1+
- <img src="https://raw.githubusercontent.com/victorgarciaesgi/regle/master/.github/images/icons/pinia.svg" alt='pinia'/> Pinia 2.2.5+
- Standard Schemas
  - 🦸‍♂️ Zod 3.24+
  - 🤖 Valibot 1.0+
  - 🚢 Arktype 2.0.0+


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
