---
title: Rule wrappers
---

# Rule wrappers

Rule wrappers let you customize or upgrade your rules by injecting or replacing some properties.

## Built-in wrappers

### `withMessage`

The withMessage wrapper lets you associate an error message with a rule. Pass your rule as the first argument and the error message as the second.

``` ts twoslash {5-13}
// @noErrors
import { useRegle, type InlineRuleDeclaration, type Maybe } from '@regle/core';

const customRuleInlineWithMetaData = ((value: Maybe<string>) => ({
  $valid: value === 'regle',
  foo: 'bar' as const
})) satisfies InlineRuleDeclaration;


// ---cut---
import { withMessage } from '@regle/rules';

const { r$ } = useRegle({ name: '' }, {
  name: {
    // Inline functions can be also written... inline
    customRule1: withMessage((value) => !!value, "Custom Error"),
    customRule2: withMessage(customRuleInlineWithMetaData, "Custom Error"),

    // You can also access the current value and metadata with a getter function
    customRule3: withMessage(
      customRuleInlineWithMetaData, 
      ({ $value, foo }) => `Custom Error: ${$value} ${foo}`
//                 ^?
    ), 
  }
})
```

Every error can be accessed in the `r$` object. In either `$errors` (if the field is dirty) or `$silentErrors` properties.

In this case:

- `r$.$errors.name`
- `r$.$fields.name.$errors`

### `withParams`

The withParams wrapper allows your rule to depend on external parameters, such as a reactive property in your component or store.

By default, useRegle observes changes automatically when rules are defined using getter functions or computed properties.


```ts
/** Non reactive rules */
useRegle({}, { /* rules */})
```

⬇️

```ts
useRegle({}, () => ({ /* rules */ }))
// or
const rules = computed(() => ({/* rules */ }))

useRegle({}, rules)
```

However, sometimes dependencies cannot be tracked automatically, use `withParams` to manually define them:

``` ts twoslash {7-9}
// @noErrors
import { useRegle } from '@regle/core';
import { ref } from 'vue';
// ---cut---
import { withParams } from '@regle/rules';

const base = ref('foo');

const { r$ } = useRegle({ name: '' }, {
  name: {
    customRule: withParams((value, param) => value === param, [base]),
    // or
    customRule: withParams((value, param) => value === param, [() => base.value]),
  }
})
```


### `withAsync`

`withAsync` works like `withParams`, but is specifically designed for async rules that depend on external values.

``` ts twoslash {7}
// @noErrors
import { useRegle } from '@regle/core';
import { ref } from 'vue';
const someAsyncCall = async (param: string) => await Promise.resolve(true);

// ---cut---
import { withAsync } from '@regle/rules';

const base = ref('foo');

const { r$ } = useRegle({ name: '' }, {
  name: {
    customRule: withAsync(async (value, param) => {
      await someAsyncCall(param)
    }, [base])
  }
})
```

### `withTooltip`

The `withTooltip` wrapper allows you to display additional messages for your field that aren’t necessarily errors. 

Tooltips are aggregated and accessible via `$fields.xxx.$tooltips`.


## Chaining wrappers

You can combine multiple wrappers to create more powerful and flexible rules while keeping everything typed correctly.

``` ts twoslash {9-14}
// @noErrors
import { useRegle } from '@regle/core';
import { ref } from 'vue';
const someAsyncCall = async (param: string) => await Promise.resolve(true);
// ---cut---
import { withAsync, withMessage } from '@regle/rules';

const base = ref(1);

const { r$ } = useRegle({ name: '' },
  {
    name: {
      customRule: withMessage(
        withAsync(
          async (value, param) => await someAsyncCall(param),
          [base]
        ),
        ({ $params: [param] }) => `Custom error: ${value} != ${param}`
        //              ^?
      ),
    },
  }
);
```
