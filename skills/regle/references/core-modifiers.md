# Modifiers

Modifiers control validation behavior. They can be applied globally (third argument of `useRegle`) or per-field.

## Deep modifiers (third argument)

```ts
const { r$ } = useRegle({}, {}, {
  autoDirty: true,
  lazy: false,
  silent: false,
  rewardEarly: false,
});
```

| Modifier | Type | Default | Description |
|----------|------|---------|-------------|
| `autoDirty` | `boolean` | `true` | Automatically set dirty state on value change |
| `immediateDirty` | `boolean` | `false` | Set dirty to `true` on init |
| `silent` | `boolean` | `false` | Only show errors after manual `$touch` or `$validate` |
| `lazy` | `boolean` | `false` | Only run rules when the field is dirty |
| `rewardEarly` | `boolean` | `false` | Once valid, stay valid until `$validate` (reward-early-punish-late). Disables `autoDirty` |
| `externalErrors` | `RegleExternalErrorTree` | -- | Server-side errors. See server errors reference |
| `clearExternalErrorsOnChange` | `boolean` | `true` | Clear external errors on value change |

### Validation groups

Group fields together for combined status:

```ts
const { r$ } = useRegle(
  { email: '', user: { firstName: '' } },
  {
    email: { required },
    user: { firstName: { required } },
  },
  {
    validationGroups: (fields) => ({
      group1: [fields.email, fields.user.firstName],
    }),
  }
);

// Access: r$.$groups.group1.$invalid, r$.$groups.group1.$errors, etc.
```

## Per-field modifiers

Per-field modifiers are prefixed with `$` inside the rules object:

```ts
const { r$ } = useRegle({ name: '' }, {
  name: {
    required,
    $autoDirty: false,
    $lazy: true,
    $silent: false,
    $rewardEarly: true,
    $debounce: 300,       // ms before rule execution
    $immediateDirty: false,
  },
});
```

| Modifier | Type | Description |
|----------|------|-------------|
| `$autoDirty` | `boolean` | Override global `autoDirty` |
| `$lazy` | `boolean` | Override global `lazy` |
| `$silent` | `boolean` | Override global `silent` |
| `$rewardEarly` | `boolean` | Override global `rewardEarly` |
| `$immediateDirty` | `boolean` | Override global `immediateDirty` |
| `$debounce` | `number` | Debounce rule execution (ms). Async rules default to 200ms |
| `$isEdited` | `(current, initial, defaultFn) => boolean` | Custom `$edited` comparison |

## Array-specific modifier

```ts
const { r$ } = useRegle({ collection: [] }, {
  collection: {
    $deepCompare: true, // Enable deep compare for $edited (default: false)
    $each: { name: { required } },
  },
});
```
