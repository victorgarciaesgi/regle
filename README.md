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


Regle \ʁɛɡl\ (French word for 'rule' ) is a Typescript-first model-based form validation library for Vue 3.
It's heavily inspired by Vuelidate.


## 📚 Documentation

[![Documentation](https://raw.githubusercontent.com/victorgarciaesgi/regle/refs/heads/main/.github/images/redirectDoc.svg)](https://reglejs.dev/)

## 🎮 Play with it

| Simple demo  | Advanced Demo |
| ------------- | ------------- |
| [![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/~/github.com/victorgarciaesgi/regle-examples/tree/main/examples/simple-example?file=examples/simple-example/src/App.vue&configPath=examples/simple-example)  | [![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/~/github.com/victorgarciaesgi/regle-examples/tree/main/examples/advanced-example?file=examples/advanced-example/src/App.vue&configPath=examples/advanced-example)  |

## 🧰 Features
- ✅ Typescript first
- 🤖 100% type inference
- 📖 Model based validation
- 🪗 Extensible
- 🛒 Collection validation
- 🦸‍♂️ [Zod](https://zod.dev/) support
- 🤖 [Valibot](https://valibot.dev/) support
- 🪶 Light(~7kb gzip) and 0 dependencies

## 🫶 Credits

- [Johannes Lacourly](https://www.behance.net/johanneslaf7dc) for designing logo and banners 🪄
- [Martins Zeltins](https://github.com/martinszeltins) who helped me identify a lot of bugs, find new features and contributed to docs.


## Example

```vue
<template>
  <input 
    v-model='r$.$value.email' 
    :class="{ error: r$.$fields.email.$error }" 
    placeholder='Type your email'
  />

  <ul>
    <li v-for="error of r$.$fields.email.$errors" :key='error'>
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
