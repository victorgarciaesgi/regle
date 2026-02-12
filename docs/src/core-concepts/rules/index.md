---
title: Rules
description: Rules are the building blocks of validation in Regle. Learn how to create reusable and inline rules.
---

# Rules

Rules are the core building block of Regle (and also its name).

A rule takes a value (and optional parameters) as input and returns a validation result as output.

The **result** can be either:

- A `boolean`
- An object containing at least `{ $valid: boolean }` (allowing you to attach [metadata](/advanced-usage/rule-metadata))

## Reusable rules with `createRule`

The recommended way to write rules in Regle is with `createRule`. It provides a structured definition that includes the validator logic, an error message, and optional configuration — all in one place.

```ts
import { createRule, type Maybe } from '@regle/core';
import { isFilled } from '@regle/rules';

export const mustBe = createRule({
  validator(value: Maybe<string>, expected: string) {
    if (isFilled(value)) {
      return value === expected;
    }
    return true;
  },
  message: ({ $params: [expected] }) => `The value must be '${expected}'`,
});

// Rule can now accept reactive parameters
const expected = ref('foo');

const { r$ } = useRegle({ name: '' }, {
  name: {
    mustBe: mustBe(expected),
    // or
    mustBe: mustBe(() => expected.value),
  },
});
```

Rules created with `createRule` can accept reactive parameters, return custom metadata, run async logic, and more.

:::tip
Head to the [Reusable rules](/core-concepts/rules/reusable-rules) page for the full guide on `createRule`, including parameters, reactivity, async rules, and metadata.
:::

## Inline rules

For quick, one-off validations, you can write rules directly as inline functions. The function receives the current field value as its first argument.

Simple rule:

```ts
const { r$ } = useRegle({ name: '' }, {
  name: {
    simpleRule: (value) => value === 'regle',
  },
})
```

Async rule:

```ts
const { r$ } = useRegle({ name: '' }, {
  name: {
    asyncRule: async (value) => await someAsyncCall(),
  },
})
```

Rule with metadata:

```ts
const { r$ } = useRegle({ name: '' }, {
  name: {
    metadataRule: (value) => ({
      $valid: value === 'regle',
      foo: 'bar',
    }),
  },
})
```

## Adding error messages

Any rule — inline or reusable — can be wrapped with the `withMessage` helper to associate an error message with it.

```ts
import { withMessage } from '@regle/rules';

const { r$ } = useRegle({ name: '' }, {
  name: {
    foo: withMessage((value: Maybe<string>) => value === 'foo', "Value must be 'foo'"),
  },
})
```

:::tip
Learn more about `withMessage` and other wrappers in the [Rule wrappers](/core-concepts/rules/rule-wrappers) section.
:::

## Handling `optional` and `required` rules

In Regle (borrowed from Vuelidate), all rules are **optional by default**. This means a rule will only run when the field has a value.

The only exceptions are:

- `required`
- `checked`
- `literal`

This separation keeps the validation logic clean: you define *how* a field should be validated independently from *whether* it's mandatory.

When writing custom rules, follow the same convention by checking if the value is filled before validating:

```ts
import { isFilled } from '@regle/rules';

const { r$ } = useRegle({ name: '' }, {
  name: {
    mustBeFoo: (value) => {
      return isFilled(value) && value === 'foo';
    },
  },
})
```
