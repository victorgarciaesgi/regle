---
title: Welcome Regle 1.2
description: Discover the new version of Regle
ogImage: /blog/regle-1.2-features.png
author:
  name: Victor Garcia
date: 2025-05-10
sidebar: false
---


# Welcome Regle `1.2` 👋

<br/>

![regle 1.2 banner](/blog/regle-1.2-banner.png)


Regle is beginning to gain some serious traction recently. Since I released Regle `1.1`, I've seen the number of stars and views on the documentation continualy increasing.

Thanks to the <img style="display:inline; vertical-align: middle" src="https://img.shields.io/github/stars/victorgarciaesgi/regle"/> stargazers so far!

It's really rewarding to see people use and love something you spent time on, and I hope I can reach more people.

Having more and more people on your library also bring a lot of pressure.   
Of course I still don't have as many users as other libraries or `Vuelidate`, but you feel like you cannot disappoint the people using it from the early stages.  

I personnaly am extremly cautious about updates and tests, as Regle is used in some complex forms at my company [Malt](https://malt.fr) <span data-title='malt'></span>.



## What's new in this version

First of all a little disclaimer, this update contains necessary **breaking changes** to fixed some inconsistent or wrong behaviour introduced in previous versions.

I know this is not following semver, but this wasn't enough to justify releasing a `2.0`.

Sorry in advance to everyone impacted by this, even thought the changes are minimal and should impact only a fraction of the users.

- You can check the [releases notes here](https://github.com/victorgarciaesgi/regle/releases/tag/v1.2.0)


## 💅 Infer state type from rules

Following this [feature request](https://github.com/victorgarciaesgi/regle/issues/104), I implemented a way to create your state type from the rules declaration.

As Regle is state first, this can be confusing for people coming from schemas libraries like **Zod** or **Valibot**.

This feature brings multiple helpers to create your state type from your rules.

### `InferInput`

This type can infer a state interface from any rules object or ref.

```ts twoslash
import {ref} from 'vue';
// ---cut---
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


```ts twoslash
import {ref} from 'vue';
// ---cut---
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

### `defineRules`

This is a function helper that simply returns the rule object while checking the structure matches a rule tree.

```ts twoslash
import {ref} from 'vue';
// ---cut---
import { defineRules, type InferInput} from '@regle/core';
import { required, string, numeric, type } from '@regle/rules';

const rules = defineRules({
  firstName: { required, string },
  count: { numeric },
  enforceType: { required, type: type<'FOO' | 'BAR'>()}
})

type State = InferInput<typeof rules>;

```

:::info
You can check the [full docs here](/typescript/infer-state-from-rules)
:::