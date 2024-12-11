---
title: Rules
---

# Rules

Rules are the core concept of Regle (and also it's name 🙄).

A rule is created using either:

- An inline function
- `createRule`

The rule take the value (and parameters if there is) as input, and will return the result as output.

The **result** can either be:

- `boolean`
- An object containing at least the `{$valid: boolean}` property.

The boolean represent the result of the validation.

:::tip
You can jump directly into the [createRule section](/core-concepts/rules/reusable-rules) to see more advanced features
:::

## Inline rules

You can write inline rules like simple function receiving the value you're evaluating as a parameter. Help yourself with the `InlineRuleDeclaration` type helper

``` ts twoslash
// @noErrors
const someAsyncCall = async () => await Promise.resolve(true);
// ---cut---
import type { Maybe, InlineRuleDeclaration } from '@regle/core';

const customRuleInline = (value: Maybe<string>) => value === 'regle';

/** Async rule that will activate the $pending state of your field  */
const customRuleInlineAsync = async (value: Maybe<string>) => {
  return await someAsyncCall();
};

/** You can return any data from your rule as long as the $valid property is present  */
const customRuleInlineWithMetaData = ((value: Maybe<string>) => ({
  $valid: value === 'regle',
  foo: 'bar'
})) satisfies InlineRuleDeclaration;
```

