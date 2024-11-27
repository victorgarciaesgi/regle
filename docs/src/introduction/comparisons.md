---
title: Comparison with other form libraries
---


# Comparison with other form libraries


## Vuelidate

Vuelidate is the main comparison point. I was a long time user, but the project being abandonned made me want to write Regle.

They share a similar API and DX like: 
- data based validation
- unified reactivity
- simple declaration

Regle have this, but also adds:
- 100% type safety
- Autocomplete
- Zod support (more to come)
- Global config
- Improved api on some areas (rules declaration, `$each`, `validationGroups`, `$parse`)

## VeeValidate

VeeValidate is at first centered around components. It now provides a composition api helper.

The API is not as declarative as Regle. It makes it difficult to work with a big form, or to manage your form in a Pinia store.

The typed schemas only works with libraries like Zod, Yup or Validbot. But they also remove some features from VeeValidate. 
By using Zod in Regle, it keeps the same features as the default `@regle/rules`

## Formkit

Formkit is centered around DOM components.
Regle is headless and data-based, so you can work with your state anywhere you want.

Working only with a data-based model allow for stronger type safety and better DX.