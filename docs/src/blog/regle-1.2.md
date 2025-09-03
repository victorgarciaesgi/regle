---
title: Welcome Regle 1.2
description: Discover the new version of Regle
ogImage: /blog/regle-1.2-features.png
author:
  name: Victor Garcia
date: 2025-05-10
sidebar: false
outline:
  level: 2
---


# Welcome Regle `1.2` 👋

<br/>

![regle 1.2 banner](/blog/regle-1.2-banner.png)


Regle is beginning to gain some serious traction recently. Since I released Regle `1.1`, I've seen the number of stars and views on the documentation continualy increasing.

Thanks to the <a  href="https://github.com/victorgarciaesgi/regle"><img style="display:inline; vertical-align: middle" src="https://img.shields.io/github/stars/victorgarciaesgi/regle"/></a> stargazers so far, and <a  href="https://www.npmjs.com/package/@regle/core"><img style="display:inline; vertical-align: middle" alt="npm download" src="https://img.shields.io/npm/dt/@regle/core.svg"/></a> downloads!

It's really rewarding to see people use and love something you spent time on, and I hope I can reach more people.

Having more and more people on your library also bring a lot of pressure.   
Of course I still don't have as many users as other libraries or `Vuelidate`, but you feel like you cannot disappoint the people using it from the early stages.  

I personnaly am extremely cautious about updates and tests, as Regle is used in some complex forms at my company [Malt](https://malt.fr) <span data-title='malt'></span>.



## What's new in this version

First of all a little disclaimer, this update contains necessary 🚨 **breaking changes** to fixed some inconsistent or wrong behaviour introduced in previous versions.

I know this is not following semver, but this wasn't enough to justify releasing a `2.0`.

Sorry in advance to everyone impacted by this, even thought the changes are minimal and should impact only a zero to a fraction of the users.

- You can check the [releases notes here](https://github.com/victorgarciaesgi/regle/releases/tag/v1.2.0)


## 💅 Infer state type from rules

Following this [feature request](https://github.com/victorgarciaesgi/regle/issues/104), I implemented a way to create your state type from the rules declaration.

As Regle is state first, this can be confusing for people coming from schemas libraries like **Zod** or **Valibot**.

This feature brings multiple helpers to create your state type from your rules.

### `InferInput`

This type can infer a state interface from any rules object or ref.

```ts
import { type InferInput} from '@regle/core';
import { required, string, numeric, type } from '@regle/rules';

const rules = {
  firstName: { required, string },
  count: { numeric },
  enforceType: { required, type: type<'FOO' | 'BAR'>()}
}

type State = InferInput<typeof rules>;

```

### `refineRules`

In Regle, rules can depend on the state, this helps declare dynamic rules without having cylcic types problems.  


```ts
import { refineRules, type InferInput} from '@regle/core';
import { required, string, sameAs } from '@regle/rules';

const rules = refineRules({
  password: { required, string },
}, 
 (state) => ({
   confirmPassword: { required, sameAs: sameAs(() => state.value.password) }
 })
)

type State = InferInput<typeof rules>;
```



:::info
You can check the [full docs here](/typescript/infer-state-from-rules)
:::


## 🧩 Brand new Nuxt module <span data-title='nuxt'></span>

While existing, the `@regle/nuxt` was really lacking features and wasn't bringing anything valuable.

Fellowing this [feature request](https://github.com/victorgarciaesgi/regle/issues/117), this updates will finally take advantages of Nuxt awesome module system.

The idea is to enable the injection of your global configuration into Nuxt auto-imports.


:::code-group

```ts [nuxt.config.ts]
export default defineNuxtConfig({
  modules: ['@regle/nuxt'],
  regle: {
    setupFile: '~/regle-config.ts'
  }
})
```

```ts [regle-config.ts]
import { defineRegleNuxtPlugin } from '@regle/nuxt/setup';
import { defineRegleConfig } from '@regle/core';
import { required, withMessage } from '@regle/rules';

export default defineRegleNuxtPlugin(() => {
  return defineRegleConfig({
    rules: () => {
      const {t} = useI18n();

      return {
        required: withMessage(required, t('general.required')),
        customRule: myCustomRule,
      }
    },
  });
});

```
:::

This will inject composables to your auto-imports and `#imports`, loaded with your custom error messages and rules.


```vue [app.vue] {2}
<script setup lang="ts">
import { useRegle } from '#imports';
import { required, minLength, email } from '@regle/rules';

const { r$ } = useRegle({ name: '', email: '' }, {
  name: { required, minLength: minLength(4) },
  email: { email },
});

</script>
```


## 🔄 `syncState` option in `@regle/schemas`

Schemas libraries (Zod, Valibot etc..) allow to patch the state with defaults or transforms.

Until now this was not applied to the Regle state. 

`useRegleSchema` now add a `syncState` option allowing the parsed schema to be applied.

```ts
type RegleSchemaBehaviourOptions = {
  syncState?: {
    /**
     * Applies every transform on every update to the state
     */
    onUpdate?: boolean;
    /**
     * Applies every transform only when calling `$validate`
     */
    onValidate?: boolean;
  };
};
```

Usage: 

```ts
const { r$ } = useRegleSchema(
  state,
  z.object({
    firstName: z.string().min(1).catch('Victor'),
    lastName: z.string().transform((value) => `Transformed ${value}`),
  }),
  { syncState: { onValidate: true } }
);
```


## 🤫 `silent` modifier

When I created Regle, I tried to match as much as possible how **Vuelidate** behaved.

Unfortunetly, my implementation of `autoDirty` was wrong. It was a different behaviour of the one in Vuelidate.

This updates introduce a breaking change, changing `autoDirty` to only affect the `$dirty` state.

The old behaviour is migrated to a new modifier: `silent`.


## Full details

### 🚨 Breaking Changes

- Fixed spelling errors in docs and rule metadata by [@jeremyworboys](https://github.com/jeremyworboys) in [#110](https://github.com/victorgarciaesgi/regle/issues/110 )
- Replaced `autoDirty` with `silent`, `autoDirty` now match Vuelidate behaviour in [#67](https://github.com/victorgarciaesgi/regle/issues/67)
- `dateBefore`, `dateAfter` and `dateBetween` now allow equals by default

### 🚀 Features

- Add hexadecimal rule by [@jeremyworboys](https://github.com/jeremyworboys) in [#111](https://github.com/victorgarciaesgi/regle/issues/111) 
- Add comparison options date rules by [@jeremyworboys](https://github.com/jeremyworboys) in [#109](https://github.com/victorgarciaesgi/regle/issues/109)
- Rules first typing: `InferInput` type and `refineRules` helper by @victorgarciaesgi in [#112](https://github.com/victorgarciaesgi/regle/issues/112 )
- `setupFile` option in Nuxt module #117 by @victorgarciaesgi in [#117](https://github.com/victorgarciaesgi/regle/issues/117)
- Support scoped validation in `@regle/schemas` #115 by @victorgarciaesgi in [#115](https://github.com/victorgarciaesgi/regle/issues/115 )
- `syncState` options to apply schema transforms and default to state in `@regle/schemas` [#114](https://github.com/victorgarciaesgi/regle/issues/114) and [#120](https://github.com/victorgarciaesgi/regle/issues)
- `asRecord` option to support named keys in `useCollectScope` [#105](https://github.com/victorgarciaesgi/regle/issues/105)
- Added `$deepCompare` modifier to enable `$edited` to work on array of nested objects [#122](https://github.com/victorgarciaesgi/regle/issues/122)

Big thanks to a new contributor [@jeremyworboys](https://github.com/jeremyworboys) who submitted 3 great PRs!

[Check the full changelog here](https://github.com/victorgarciaesgi/regle/releases/tag/v1.2.0)
