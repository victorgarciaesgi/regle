# Regle

Typescript first model-based validation library for Vue 3

[npm-version-src]: https://img.shields.io/npm/v/@regle/core.svg
[npm-version-href]: https://www.npmjs.com/package/@regle/core
[npm-downloads-src]: https://img.shields.io/npm/dm/@regle/core.svg
[npm-total-downloads-src]: https://img.shields.io/npm/dt/@regle/core.svg
[npm-downloads-href]: https://www.npmjs.com/package/@regle/core

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![npm downloads][npm-total-downloads-src]][npm-downloads-href]
<img src='https://img.shields.io/npm/l/@regle/core.svg'>

> ⚠️ Project is still in development, do not use it in production


# Documentation

TODO

# Play with it

TODO


# Compatibility:

- Vue 3
- Nuxt 3
- Pinia

# Roadmap

- [x] async rules
- [x] resetForm
- [x] validateForm typesafe
- [x] Deep nested rules
- [x] Collection validation
- [x] `applyIf` helper (like requiredIf for any validator)
- [x] Async with params (need deps array) (withAsync)
- [x] Options (lazy, rewardEarly, autoDirty)
- [x] Regex helper
- [x] Additional rules and "and" helper
- [ ] "or" and "not" helper
- [ ] Dates built-in validators
- [ ] withExternalErrors
- [ ] Zod support
- [ ] Typed plugin system (like scrollToError)
- [ ] Readme
- [ ] TS docs
- [ ] Documentation site
- [ ] Logo

# Quick start

```bash
yarn add @regle/core @regle/validators
# or
npm install @regle/core @regle/validators
# or
pnpm install @regle/core @regle/validators
```

```vue
<template>
    <input v-model="form.email" placeholder="email" />
    <ul>
      <li v-for="error of errors.email" :key="error">{{ error }}</li>
    </ul>

    <input v-model="form.password" placeholder="password"/>
    <ul>
      <li v-for="error of errors.password" :key="error">{{ error }}</li>
    </ul>

    <input v-model="form.confirmPassword" placeholder="password"/>
    <ul>
      <li v-for="error of errors.confirmPassword" :key="error">{{ error }}</li>
    </ul>


    <button type="submit" @click="submit">Submit</button>
</template>

<script setup lang='ts'>
import {useRegle} from '@regle/core';
import {email, required, minLength, sameAs} from '@regle/validators';

const form = ref({
  email: '',
  password: '',
  confirmPassword: '',
})

const {errors} = useRegle(form, () => {
  email: {
    email,
    required,
  },
  password: {
    required,
    minLength: minLength(8),
  },
  confirmPassword: {
    required,
    sameAs: withMessage(sameAs(form.value.password), 'Confirm password must be same as password')
  }
})

</script>
```





## Development

1. Clone this repository
2. Install dependencies using `pnpm i`
3. Build project for local tests `pnpm run test`
4. Start dev playground `pnpm run dev`
5. Build project for deploy `pnpm run build`

## 📑 License

[MIT License](./LICENSE)
