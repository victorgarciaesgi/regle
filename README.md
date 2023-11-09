# Regle



Regle \ʁɛɡl\ (French word for 'rule' ) is a Typescript first model-based validation library for Vue 3.
It's heavily inspired by Vuelidate.

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
> API or function names can still change


# Improvements from Vuelidate

- 100% type safety
- Made for Vue 3 and composition API first 
- Collection validation ($each is back without performance issues)
- Global config
- Async rules with params
- Easier rule declaration

# What is not planned or reimplemented differently from Vuelidate

- Validation groups
- Nested validation collection


# Documentation

TODO

# Play with it

TODO


# Compatibility:

- Vue 3
- Nuxt 3
- Pinia




# Roadmap

- [x] Async rules
- [x] resetForm
- [x] validateForm typesafe
- [x] Deep nested rules
- [x] Collection validation
- [x] `applyIf` helper (like requiredIf for any validator)
- [x] Async with params (need deps array) (withAsync)
- [x] Options (lazy, rewardEarly, autoDirty)
- [x] Regex helper
- [x] Additional rules and "and" helper
- [x] "or" and "not" helper
- [x] externalErrors
- [x] Dates built-in validators
- [ ] Usable async data in messages
- [ ] Per field validation option (lazy etc...)
- [ ] Unit tests
- [ ] E2E tests
- [ ] Readme
- [ ] TS docs
- [ ] Documentation site
- [ ] Logo
- [ ] Zod support
- [ ] Nested component collection (? need poll)
- [ ] Typed plugin system ? (like scrollToError)

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

type MyForm = {
  email?: string,
  password?: string,
  confirmPassword?: string
}

const form = ref<MyForm>({
  email: undefined,
  password: undefined,
  confirmPassword: undefined,
})

const {$errors, validateForm} = useRegle(form, () => ({
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
    sameAs: withMessage(sameAs(() => form.value.password), 'Confirm password must be same as password')
  }
}));



function submit() {
  const result = await validateForm();
  if (result) {
    console.log(result.email); // email: string
    //          ^ type safe form result based on your validators
  }
}

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
