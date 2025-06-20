---
title: Cheat Sheet
---

# Regle Cheat Sheet

Quick reference for common Regle patterns and usage scenarios.

## Basic Setup

```ts
import { useRegle } from '@regle/core'
import { required, email, minLength } from '@regle/rules'

const { r$ } = useRegle(
  { name: '', email: '' },        
  {                               
    name: { required, minLength: minLength(2) },
    email: { required, email }
  }
)
```

## Essential Properties

| Property | Description | Example |
|----------|-------------|---------|
| `r$.$value` | Form data (reactive) | `r$.$value.email` |
| `r$.$correct` | Form is dirty and valid | `<button :disabled="!r$.$correct">` |
| `r$.$invalid` | Form is invalid | `v-if="r$.$invalid"` |
| `r$.$errors` | All error messages | `r$.$errors.email` |
| `r$.x.$error` | Field has errors | `v-if="r$.email.$error"` |
| `r$.x.$correct` | Field is dirty and valid | `v-if="r$.email.$correct"` |
| `r$.x.$dirty` | Field was touched | `v-if="r$.email.$dirty"` |
| `r$.$validate()` | Validate form | `await r$.$validate()` |
| `r$.$reset()` | Reset form | `r$.$reset()` |

## Common Rules

```ts
import { 
  required, email, minLength, maxLength,
  numeric, between, url, regex,
  alphaNum, alpha, sameAs
} from '@regle/rules'

const rules = {
  // Basic validation
  name: { required, minLength: minLength(2) },
  email: { required, email },
  age: { required, numeric, between: between(18, 99) },
  
  // String validation
  username: { required, alphaNum, minLength: minLength(3) },
  website: { url },
  description: { maxLength: maxLength(500) },
  
  // Custom patterns
  phone: { regex: regex(/^\+?[\d\s-()]+$/) },
  
  // Password confirmation
  password: { required, minLength: minLength(8) },
  confirmPassword: { 
    required, 
    sameAs: sameAs(() => r$.$value.password) 
  }
}
```

## Field Patterns

### Basic Field with Error Display

```vue
<template>
  <div>
    <input v-model="r$.$value.email" type="email" />
    <span v-for="error of r$.email.$errors" class="error">
      {{ error }}
    </span>
  </div>
</template>
```

### Field with Visual States
```vue
<template>
  <input 
    v-model="r$.$value.email"
    :class="{
      'error': r$.email.$error,
      'correct': r$.email.$correct,
    }"
  />
</template>
```

### Optional Field with Conditional Validation


```ts
import {inferRules} from '@regle/core';

const rules = computed(() => inferRules(state, {
  phone: {
    // Only validate if field has content
    ...(r$?.$value?.phone ? {
      minLength: minLength(10),
      regex: regex(/^\+?[\d\s-()]+$/)
    } : {})
  }
}))
```

## Custom Error Messages

```ts
import { withMessage } from '@regle/rules'

const rules = {
  email: { 
    required: withMessage(required, 'Email is required'),
    email: withMessage(email, 'Please enter a valid email address')
  },
  password: {
    minLength: withMessage(
      minLength(8), 
      ({ $params: [min] }) => `Password must be at least ${min} characters`
    )
  }
}
```


## Form Submission

```ts
function handleSubmit() {
  // Validate entire form
  const {valid, data} = await r$.$validate()
  
  if (!valid) {
    console.log('Form has errors')
    return
  }
  
  // Submit data
  try {
    await submitForm(data)
    r$.$reset() // Reset form after success
  } catch (error) {
    // Handle submission error
  }
}
```

## Collections (Arrays)

```ts
const { r$ } = useRegle(
  { users: [{ name: '', email: '' }] },
  {
    users: {
      $each: {
        name: { required },
        email: { required, email }
      }
    }
  }
)

// Access array validation
r$.users.$each[0].name.$error
```

## Nested Objects

```ts
const { r$ } = useRegle(
  { 
    user: { 
      profile: { name: '', bio: '' },
      contact: { email: '', phone: '' }
    }
  },
  {
    user: {
      profile: {
        name: { required },
        bio: { maxLength: maxLength(200) }
      },
      contact: {
        email: { required, email },
        phone: { required }
      }
    }
  }
)

// Access nested validation
r$.user.profile.name.$error
```

## Global Configuration

```ts
import { defineRegleConfig } from '@regle/core'

// Set up global defaults
const { useRegle: useCustomRegle } = defineRegleConfig({
  rules: () => ({
    required: withMessage(required, 'You need to provide a value'),
    minLength: withMessage(minLength, ({ $value, $params: [max] }) => {
      return `Minimum length is ${max}. Current length: ${$value?.length}`;
    })
  })
  modifiers: {
    autoDirty: true,
    rewardEarly: true
  }
})
```

## Schema Integration (Zod)

```ts
import { z } from 'zod'
import { useRegleSchema } from '@regle/schemas'

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  age: z.number().min(18)
})

const { r$ } = useRegleSchema({
  name: '',
  email: '',
  age: 0
}, schema)
```


### TypeScript Errors?
```ts
import { inferRules } from '@regle/core'

// ✅ Use inferRules for better type inference
const rules = computed(() => {
  return inferRules(state, {
    name: { required }
  })
})
```
