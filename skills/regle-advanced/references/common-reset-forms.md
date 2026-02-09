# Reset Forms

`$reset` is available on every field and on the root `r$`.

## Options

```ts
r$.$reset();                                    // Reset validation state only, set current value as new initial
r$.$reset({ toInitialState: true });            // Reset validation + state to initial value
r$.$reset({ toOriginalState: true });           // Reset validation + state to original (unmutated) value
r$.$reset({ toState: { email: 'a@b.com' } });  // Reset validation + state to given value
r$.$reset({ clearExternalErrors: true });       // Clear external errors
```

| Option | Type | Description |
|--------|------|-------------|
| `toInitialState` | `boolean` | Reset to initial state (may have been mutated by previous `$reset` calls) |
| `toOriginalState` | `boolean` | Reset to original unmutated state from initialization |
| `toState` | `TState \| () => TState` | Reset to a specific state. Also sets it as new initial state |
| `clearExternalErrors` | `boolean` | Clear `$externalErrors` |

**Note**: `toInitialState` does not work if the state is a `reactive` object (use `ref` instead).

## Example

```vue
<template>
  <input v-model="r$.$value.email" placeholder="Email" />

  <button @click="r$.$reset()">Reset validation only</button>
  <button @click="r$.$reset({ toInitialState: true })">Reset to initial</button>
  <button @click="r$.$reset({ toOriginalState: true })">Reset to original</button>
  <button @click="r$.$reset({ toState: { email: 'test@test.com' } })">
    Reset to custom state
  </button>
</template>
```

## Field-level reset

Reset individual fields:

```ts
r$.email.$reset();
r$.email.$reset({ toInitialState: true });
```
