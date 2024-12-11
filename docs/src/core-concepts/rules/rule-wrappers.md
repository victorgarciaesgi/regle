---
title: Rule wrappers
---

# Rule wrappers

## List of wrappers

### `withMessage`

This tool take your rule as a first argument and your error message as a second. It will define what error to set

``` ts twoslash {3-11}
// @noErrors
import {useRegle, type InlineRuleDeclaration, type Maybe} from '@regle/core';
import {withMessage} from '@regle/rules';

const customRuleInlineWithMetaData = ((value: Maybe<string>) => ({
  $valid: value === 'regle',
  foo: 'bar' as const
})) satisfies InlineRuleDeclaration;


// ---cut---
const {r$} = useRegle({name: ''}, {
  name: {
    // Inline functions can be also written... inline
    customRule1: withMessage((value) => !!value, "Custom Error"),
    customRule2: withMessage(customRuleInlineWithMetaData, "Custom Error"),

    // You can also access current value and metadata with a getter function
    customRule3: withMessage(
      customRuleInlineWithMetaData, 
      ({ $value, foo }) => `Custom Error: ${$value} ${foo}`
//                 ^?
    ), 
  }
})
```

### `withParams`

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

But sometimes, values cannot be tracked properly, so you can use this tool to force dependencies on a rule

``` ts twoslash {7-9}
// @noErrors
import {useRegle} from '@regle/core';
import {ref} from 'vue';
// ---cut---
import {withParams} from '@regle/rules';

const base = ref('foo');

const {r$} = useRegle({name: ''}, {
  name: {
    customRule: withParams((value, param) => value === param, [base]),
    // or
    customRule: withParams((value, param) => value === param, [() => base.value]),
  }
})
```


### `withAsync`

withAsync works the same as `withParams`, but for async rules depending on external values

``` ts twoslash {7}
// @noErrors
import {useRegle} from '@regle/core';
import {ref} from 'vue';
const someAsyncCall = async (param: string) => await Promise.resolve(true);

// ---cut---
import {withAsync} from '@regle/rules';

const base = ref('foo');

const {r$} = useRegle({name: ''}, {
  name: {
    customRule: withAsync(async (value, param) => {
      await someAsyncCall(param)
    }, [base])
  }
})
```

### `withTooltip`

When you want to display messages for your field without necessarely being an error you can use the `tooltip` option.
The aggregated tooltips will be available though `$field.xxx.$tooltips`.

## Chaining wrappers

Rule tools can work with each other and still keeps thing typed

``` ts twoslash {9-14}
// @noErrors
import {useRegle} from '@regle/core';
import {ref} from 'vue';
const someAsyncCall = async (param: string) => await Promise.resolve(true);
// ---cut---
import {withAsync, withMessage} from '@regle/rules';

const base = ref(1);

const { r$ } = useRegle(
  { name: 0 },
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