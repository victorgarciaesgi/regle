---
title: Rules
---


# Rules

Rules are the core concept of Regle (and also it's name 🙄).

A rule is a function (inline or created with the `createRule` helper) that receive the matching value and return either a boolean or an object with a $valid property. If the validation passes, return true or an object containing at least `{ $valid: boolean }`, false otherwise.

:::tip
You can jump directly into the [createRule section](/core-concepts/rules/advanced-rules) to see more advanced features
:::

## Inline rules

You can write inline rules like simple function receiving the value you're evaluating as a parameter. Help yourself with the `InlineRuleDeclaration` type helper

``` ts twoslash
// @noErrors
import type { Maybe, InlineRuleDeclaration } from '@regle/core';

const customRuleInline = ((value: Maybe<string>) => value === 'regle') satisfies InlineRuleDeclaration

/** Async rule that will activate the $pending state of your field  */
const customRuleInlineAsync = (async (value: Maybe<string>) => {
  await someAsyncCall();
  return value === 'regle'
}) satisfies InlineRuleDeclaration;

/** You can return any data from your rule as long as the $valid property is present  */
const customRuleInlineWithMetaData = ((value: Maybe<string>) => ({
  $valid: value === 'regle',
  foo: 'bar'
})) satisfies InlineRuleDeclaration;
```

Inline rules are then usable with a set of tools from `@regle/rules`

### `withMessage`

This tool take your rule as a first argument and your error message as a second. It will define what error to set

``` ts twoslash
// @noErrors
import {useRegle, type InlineRuleDeclaration, type Maybe} from '@regle/core';
import {withMessage} from '@regle/rules';

const customRuleInlineWithMetaData = ((value: Maybe<string>) => ({
  $valid: value === 'regle',
  foo: 'bar' as const
})) satisfies InlineRuleDeclaration;

const {regle} = useRegle({name: ''}, {
  name: {
    customRule1: withMessage((value) => !!value, "Custom Error"),
    customRule2: withMessage(customRuleInlineWithMetaData, "Custom Error"),

    // You can also access current value and metadata with a getter function
    customRule3: withMessage(
      customRuleInlineWithMetaData, 
      (value, {foo}) => `Custom Error: ${value} ${foo}`
//              ^?
    ), 
    
  }
})
```

###  `withParams`

You rule result can sometimes depends on an other part of your component or store. 
For this, `useRegle` can already observe the changes by changing the rule object to a getter function or a computed.


```ts
useRegle({}, { /* rules */})
```

⬇️

```ts
useRegle({}, () => ({ /* rules */ }))
// or
const rules = computed(() => ({/* rules */ }))
useRegle({}, rules)
```

But sometimes, values cannot be tracked properly, so you can use this tool to force a dependency on a rule

``` ts twoslash
// @noErrors
import {useRegle, type InlineRuleDeclaration, type Maybe} from '@regle/core';
import {withParams} from '@regle/rules';
import {ref} from 'vue';

const base = ref('foo');

const {regle} = useRegle({name: ''}, {
  name: {
    customRule: withParams((value) => value === base.value, [base]),
    // or
    customRule: withParams((value) => value === base.value, [() => base.value]),
  }
})
```


### `withAsync`

withAsync works the same as `withParams`, but for async rules depending on external values

``` ts twoslash
// @noErrors
import {useRegle, type InlineRuleDeclaration, type Maybe} from '@regle/core';
import {withAsync} from '@regle/rules';
import {ref} from 'vue';

const base = ref('foo');

const {regle} = useRegle({name: ''}, {
  name: {
    customRule: withAsync(async (value) => new Promise<boolean>((resolve) => resolve(value === base.value)), [base]),
  }
})
```


### Chaining helpers

Rule tools can work with each other and still keeps thing typed

``` ts twoslash
// @noErrors
import {useRegle, type InlineRuleDeclaration, type Maybe} from '@regle/core';
import {withAsync, withMessage} from '@regle/rules';
import {ref} from 'vue';

const base = ref(1);

const { regle } = useRegle(
  { name: 0 },
  {
    name: {
      customRule: withMessage(
        withAsync(
          async (value) => new Promise<boolean>((resolve) => resolve(value === base.value)),
          [base]
        ),
        (value, { $params: [base] }) => `Custom error: ${value} != ${base}`
        //                   ^?
      ),
    },
  }
);
```