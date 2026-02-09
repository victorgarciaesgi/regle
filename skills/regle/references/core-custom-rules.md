# Custom Rules

## Inline rules

Simple functions that receive the value:

```ts
const { r$ } = useRegle({ name: '' }, {
  name: {
    // Sync rule
    mustBeFoo: (value) => value === 'foo',
    // Async rule
    asyncCheck: async (value) => await someAsyncCall(value),
    // Rule with metadata
    withMeta: (value) => ({
      $valid: value === 'regle',
      foo: 'bar',
    }),
  },
});
```

### Handling optional vs required

All rules are optional by default -- they only run if the value is filled. Use `isFilled` from `@regle/rules` to check:

```ts
import { isFilled } from '@regle/rules';

const mustBeFoo = (value) => {
  return isFilled(value) && value === 'foo';
};
```

Add `required` separately to enforce the field is filled.

## `createRule`

For reusable rules with messages, parameters, and type safety:

```ts
import { createRule } from '@regle/core';
import { isFilled } from '@regle/rules';

export const myRequired = createRule({
  validator: (value: unknown) => isFilled(value),
  message: 'This field is required',
});
```

### Available options

| Option | Type | Required | Description |
|--------|------|----------|-------------|
| `validator` | `(value, ...params?) => boolean \| { $valid: boolean, ... }` | Yes | Validation function |
| `message` | `string \| string[] \| (metadata) => string \| string[]` | Yes | Error message(s) |
| `type` | `string` | No | Rule type (for shared targets like `required`/`requiredIf`) |
| `active` | `boolean \| (metadata) => boolean` | No | Dynamic on/off state |
| `async` | `boolean` | No | Force async mode |
| `tooltip` | `string \| string[] \| (metadata) => string \| string[]` | No | Non-error messages via `$tooltips` |

### Reactive parameters

Parameters are automatically reactive:

```ts
export const minAge = createRule({
  validator: (value: Maybe<number>, min: number) => {
    return isFilled(value) && value >= min;
  },
  message: ({ $params: [min] }) => `Must be at least ${min}`,
});

// Usage -- accepts plain value, ref, or getter
const min = ref(18);
useRegle({ age: 0 }, {
  age: {
    minAge: minAge(18),
    minAge: minAge(min),
    minAge: minAge(() => min.value),
  },
});
```

### Active property

Control when a rule is active:

```ts
const conditionalRequired = createRule({
  validator(value: unknown, condition: boolean) {
    if (condition) return isFilled(value);
    return true;
  },
  message: 'This field is required',
  active({ $params: [condition] }) {
    return condition;
  },
});
```

```vue
<template>
  <label>
    Name <span v-if="r$.name.$rules.conditionalRequired.$active">(required)</span>
  </label>
</template>
```

## Async rules

Async rules update `$pending` state:

```ts
const asyncEmail = createRule({
  async validator(value: Maybe<string>) {
    if (!isFilled(value)) return true;
    return await checkEmailExists(value);
  },
  message: 'Email already exists',
});
```

Async rules are debounced by 200ms by default. Override with `$debounce` modifier.

## Metadata

Return extra data from the validator:

```ts
const withApiResult = createRule({
  async validator(value: Maybe<string>) {
    const result = await apiCall(value);
    return { $valid: result.valid, suggestion: result.suggestion };
  },
  message({ suggestion }) {
    return `Invalid. Did you mean: ${suggestion}?`;
  },
});
```
