# Typing Rules Schema

## `inferRules`

When defining rules in a separate `computed`, you may lose autocompletion. Use `inferRules` to preserve it:

```ts
import { inferRules, useRegle } from '@regle/core';

const form = ref({ name: '' });

const rules = computed(() =>
  inferRules(form, {
    name: { required },  // Full autocompletion here
  })
);

const { r$ } = useRegle(form, rules);
```

### Nested properties

Chain `inferRules` for nested objects:

```ts
const form = ref({ name: { firstName: '', lastName: '' } });

const nameRules = computed(() =>
  inferRules(form.value.name, {
    firstName: { required },
    lastName: { required },
  })
);

const rules = computed(() =>
  inferRules(form, {
    name: nameRules.value,
  })
);

const { r$ } = useRegle(form, rules);
```

### Single field

`inferRules` also accepts plain values:

```ts
const firstNameRules = computed(() =>
  inferRules(form.value.name.firstName, {
    required,
  })
);
```

## `RegleComputedRules`

Explicit typing without `inferRules` (use `satisfies` for type safety + inference):

```ts
import { useRegle, type RegleComputedRules } from '@regle/core';

const form = ref({ name: '' });

const rules = computed(() => ({
  name: { required: () => true },
} satisfies RegleComputedRules<typeof form>));

const { r$ } = useRegle(form, rules);
```

## Inline getter syntax

If you don't need a separate computed:

```ts
const min = ref(1);

useRegle({ name: '' }, () => ({
  name: { minLength: minLength(min.value) },
}));
```

## With global config

`defineRegleConfig` returns a scoped `inferRules` that autocompletes custom rules:

```ts
const { useRegle, inferRules } = defineRegleConfig({
  rules: () => ({ customRule: withMessage(required, 'Custom') }),
});

// inferRules now autocompletes customRule
```

## Zod/Valibot `inferSchema`

Schema packages export their own `inferSchema`:

```ts
import { inferSchema } from '@regle/schemas';
```
