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

<a target='_blank' href="https://play.vuejs.org/#eNqlVW1r2zAQ/iuHKcSB1IZtn7K0dBuBbYxutP1oBq59dtTIkqeXpMHzf99JihO3a0vH8sFId88999zppHTRh7ZNNhajebTQhWKtAY3GtsBzUZ9lkdFZdJ4J1rRSGegUVj1USjYwoaDJ+6MHrMYrrDnCALhQbpsWUj0AKvxlmcJyBg0T31DUZjUDbHLGHwUqy1G7yEwUUmgSZnKDcAYkIu5E3uAcJpN9rFv20yO2Uyc9QQdRsY+dQZcJgBDaEc9fSubHZfxuCv3M4fcJurCAPhMhU653ooDKisIwKUDb24aZeBqS7GVscs4oQZmb3OnJtzkzoE6SE+8gTfGUKgRgFcTetA8PBJJjwmUdu/DEyaa8zpem7jv6/aTmKCbqZ0K98ENs8nQs/AYrSqyYwNJBe0Cu8bGcba5EPFkqJZWmps98Mei3PoHrTiYWaRgmGh3aGGxaTrXSDmCxenP+GTmX4E9mkdLeocjD81vk55fueBZp2Hg7E601sDltZImchnLfP4u+J1kExF7gSvISFblvdi3CTlp/0ORNA4sNbC4PI7JKOqxXDrIalTGQzte4GxD+EoR2dZ239FSlJ0s5C/ypTzAqZOnn5pWV+CN6vpTB/a+1DHH/UcytNYbG+6LgrFgTR5hzIrn2i0UaAARfpKOTjmZRuPKnTd4md1oKemP8MGV7Bz0tdKtC5iwaPRfOnkUrY1o9T9PtdptY0a7rpJBNOoJduEzapCWjjzefOnNCVzhp7ojd394Rt39RXkHucU+we/uRfhh3qtRouh8Vqx/VSZwt46i+t+6FeFhvTldg+9XbjLJ40FqssFg/Yb/T90H6D4Ua1Ya6dPCZXNVIR+Lcy+tLvKf1wUmzRrpfdF4h3W3rNAbYR3oISPYI59V+8cdGT8WNXt4bFHooygn13fD4LKL/hk8vlH6U+zZ5d+hi/weq8ivs"><img width="170" src="https://raw.githubusercontent.com/victorgarciaesgi/regle/master/.github/images/vue-sfc-play.png" /></a>

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
