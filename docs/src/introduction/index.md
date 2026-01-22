---
title: Introduction
---

<script setup>
import QuickUsage from '../parts/components/QuickUsage.vue';
</script>

# Introduction

## What is Regle?

If you've ever built a forms and wrote repetitive validation logic, struggling with complex error states, or losing type safety along the way, Regle is the perfect solution.

Regle is a type-safe, headless form validation library that lets you write validation rules that mirror your data structure. Think of it as the perfect evolution of Vuelidate, but with modern TypeScript support and a more intuitive API.



## Why Choose Regle?

- **🔒 Type Safe**: Full TypeScript inference means autocomplete everywhere and catch errors at compile time
- **🌳 Model-Based**: Your validation tree matches your data model—no mental gymnastics required  
- **🔌 Headless**: Works with any UI framework, CSS library, or design system
- **🔍 Devtools**: Built-in Vue devtools extention for easy debugging and testing.
- **📦 Modular**: Use built-in rules or create custom ones that fit your exact needs
- **⚡ Performance**: Efficient reactivity system that only updates what changed
- **🛠 Developer Experience**: If you've used Vuelidate, you'll feel right at home



## Basic example

Here's a real form that you can copy and use right away:

<!-- @include: @/parts/QuickUsage.md -->

From `r$`, you can build any UI you want. The validation logic is completely separate from your presentation layer.

**Live Result:**

<QuickUsage/>

## What's Next?

Ready to dive deeper? Here's your learning path:

1. **[Installation](/introduction/installation)** - Get Regle set up in your project
2. **[Core Concepts](/core-concepts/)** - Understand how `useRegle` works
3. **[Built-in Rules](/core-concepts/rules/built-in-rules)** - Explore all available validation rules
4. **[Examples](/examples/simple)** - See Regle in action with real-world scenarios

:::tip Coming from Vuelidate?
Regle's API is intentionally similar to Vuelidate's. Check out our [comparison guide](/introduction/comparisons#vuelidate) to see what's changed and what's stayed the same.
:::
