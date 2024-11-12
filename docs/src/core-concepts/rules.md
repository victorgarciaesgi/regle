---
title: Rules
---


# Rules

Rules are the core concept of Regle (and also it's name 🙄).

A rule is a function (inline or created with the `createRule` helper) that receive the matching value and return either a boolean or an object with a $valid property. If the validation passes, return true or an object containing at least `{ $valid: boolean }`, false otherwise.


## Simple inline rule

``` ts twoslash
import type { Maybe, InlineRuleDeclaration } from '@regle/core';

const customRuleInline = ((value: Maybe<string>) => value === 'regle') satisfies InlineRuleDeclaration

const customRuleInlineAsync = (async (value: Maybe<string>) => new Promise((resolve) => resolve(value === 'regle'))) satisfies InlineRuleDeclaration;

const customRuleInlineWithMetaData = ((value: Maybe<string>) => {
  return {
    $valid: value === 'regle',
    foo: 'bar'
  }
}) satisfies InlineRuleDeclaration;
```

Inline rules are then usable with a set of tools from `@regle/rules`

### `withMessage`

This tool take your rule as a first argument and your error message as a second. It will define what error to set

``` ts twoslash
// @noErrors
import {useRegle, type InlineRuleDeclaration, type Maybe} from '@regle/core';
import {withMessage} from '@regle/rules';

const customRuleInlineWithMetaData = ((value: Maybe<string>) => {
  return {
    $valid: value === 'regle',
    foo: 'bar' as const
  }
}) satisfies InlineRuleDeclaration;

const {regle} = useRegle({name: ''}, {
  name: {
    customRule: withMessage(customRuleInlineWithMetaData, "Custom Error"),
    // You can also access current value and metadata with a getter function
    customRule: withMessage(
      customRuleInlineWithMetaData, 
      (value, {foo}) => `Custom Error: ${value} ${foo}`
//              ^?
    ), 
    
  }
})
```


- `withParams`
- `withAsync`

