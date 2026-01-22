---
title: Rules
---

# Rules

Rules are the core concept of Regle (and also it's name 🙄).

A rule is created using either:

- An inline function
- `createRule`

A rule takes the value (and optional parameters) as input and returns a result as output.

The **result** can either be:

- `boolean`
- An object containing at least the `{ $valid: boolean }` property.

The boolean represents the result of the validation.

:::tip
You can jump directly to the [createRule section](/core-concepts/rules/reusable-rules) to see more advanced features.
:::

## Inline rules

You can write inline rules as simple functions that receive the value being evaluated as a parameter. Use the `InlineRuleDeclaration` type helper for enhanced type safety.

Simple rule
```ts
const { r$ } = useRegle({name: ''}, {
  name: {
    simpleRule: (value) => value === 'regle'
  }
})
```

Async rule
``` ts
const { r$ } = useRegle({name: ''}, {
  name: {
    asyncRule: async (value) => await someAsyncCall()
  }
})
```

Rule with metadata

```ts
const { r$ } = useRegle({name: ''}, {
  name: {
    metadataRule: (value) => ({
      $valid: value === 'regle',
      foo: 'bar'
    })
  }
})

```

## Adding error messages

Any rule can be wrapped with the `withMessage` helper to provide error messages.

```ts
const { r$ } = useRegle({name: ''}, {
  name: {
    foo: withMessage((value: Maybe<string>) => value === "foo", "Value must be 'foo'"),
  }
})
```

:::tip
You can read more informations on wrappers [here](/core-concepts/rules/rule-wrappers)
:::

## Handling `optional` and `required` rules

In the **Regle** pattern (borrowed from Vuelidate), all rules are by default optional.

That means they will only run if a value is defined.

To enforce a required field, you just have to add the `required` validator or any of it's variations.

This allow to separate the core rule logic of how a field should look and whether or not it's required.

It will also output better errors.


It's advised to keep this logic in mind when writing custom rules.


```ts
import {isFilled} from '@regle/rules'

const { r$ } = useRegle({name: ''}, {
  name: {
    mustBeFoo: (value) => {
      return isFilled(value) && value === 'foo'
    }
  }
})
```
