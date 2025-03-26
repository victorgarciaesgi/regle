---
title: Comparison with other form libraries
---


# Comparison with other form libraries


## Vuelidate

Vuelidate is the primary point of comparison for Regle. As a long-time user of Vuelidate, I was inspired to create Regle after the project was discontinued.

Both libraries share a similar API and developer experience (DX), including:
- Data-based validation
- Unified reactivity
- Simple declaration

Regle builds upon these features and adds several improvements:
- 100% type safety
- Autocomplete
- Zod/Valibot support (with more integrations planned)
- Global config
- Improved API in some areas, such as rules declaration, `$each`, `validationGroups`, `$validate`

## VeeValidate

VeeValidate is primarily focused on being component-centric. It now also offers Composition API helpers.

Its API is less declarative compared to Regle, making it challenging to handle large forms or manage form state within a Pinia store.

While VeeValidate supports typed schemas using libraries like Zod, Yup, or Valibot, this comes at the cost of losing some of VeeValidate's native features. In contrast, when using Zod with Regle, you retain all the features available in the default @regle/rules, ensuring a consistent developer experience.


## Tanstack Forms

I love Tanstack products and what he's doing is so great for the JS community, specially making their tools framework agnostic.

As for Tanstack Forms, I feel the API for Vue keeps too much syntax logic from the React counterpart. 
It doesn't take advantage of the Vue composition API enough.

Tanstack forms also relies on DOM components, Regle doesn't.

You can compare the [Regle playground](https://play.vuejs.org/#eNqlVW1r2zAQ/iuHKcSB1IZtn7K0dBuBbYxutP1oBq59dtTIkqeXpMHzf99JihO3a0vH8sFId88999zppHTRh7ZNNhajebTQhWKtAY3GtsBzUZ9lkdFZdJ4J1rRSGegUVj1USjYwoaDJ+6MHrMYrrDnCALhQbpsWUj0AKvxlmcJyBg0T31DUZjUDbHLGHwUqy1G7yEwUUmgSZnKDcAYkIu5E3uAcJpN9rFv20yO2Uyc9QQdRsY+dQZcJgBDaEc9fSubHZfxuCv3M4fcJurCAPhMhU653ooDKisIwKUDb24aZeBqS7GVscs4oQZmb3OnJtzkzoE6SE+8gTfGUKgRgFcTetA8PBJJjwmUdu/DEyaa8zpem7jv6/aTmKCbqZ0K98ENs8nQs/AYrSqyYwNJBe0Cu8bGcba5EPFkqJZWmps98Mei3PoHrTiYWaRgmGh3aGGxaTrXSDmCxenP+GTmX4E9mkdLeocjD81vk55fueBZp2Hg7E601sDltZImchnLfP4u+J1kExF7gSvISFblvdi3CTlp/0ORNA4sNbC4PI7JKOqxXDrIalTGQzte4GxD+EoR2dZ239FSlJ0s5C/ypTzAqZOnn5pWV+CN6vpTB/a+1DHH/UcytNYbG+6LgrFgTR5hzIrn2i0UaAARfpKOTjmZRuPKnTd4md1oKemP8MGV7Bz0tdKtC5iwaPRfOnkUrY1o9T9PtdptY0a7rpJBNOoJduEzapCWjjzefOnNCVzhp7ojd394Rt39RXkHucU+we/uRfhh3qtRouh8Vqx/VSZwt46i+t+6FeFhvTldg+9XbjLJ40FqssFg/Yb/T90H6D4Ua1Ya6dPCZXNVIR+Lcy+tLvKf1wUmzRrpfdF4h3W3rNAbYR3oISPYI59V+8cdGT8WNXt4bFHooygn13fD4LKL/hk8vlH6U+zZ5d+hi/weq8ivs) and the [Tanstack Forms Vue playground](https://tanstack.com/form/latest/docs/framework/vue/examples/simple?panel=code) to see that Regle is much more readable and uses way less code to do the same thing.

## Formkit & VueForms

Formkit and VueForms is centered around DOM components.
Regle is headless and data-driven, so you can work with your state anywhere you want.

Working exclusively with a data-driven model enables stronger type safety and a better developer experience.
