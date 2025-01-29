---
# https://vitepress.dev/reference/default-theme-home-page
layout: home
title: Regle - Type safe form validation library for Vue.js
titleTemplate: :title

hero:
  name: "Regle"
  text: "Type safe form validation for Vue.js"
  tagline: "Typescript first, model-based and intuitive API.\nThe perfect evolution of Vuelidate."
  image:
    dark: /logo-reglejs-favicon-reversed.svg
    light: /logo-reglejs-favicon.svg
    alt: Regle logo
  actions:
    - theme: brand
      text: Get Started
      link: /introduction
    - theme: alt
      text: Playground
      link: /examples/playground

features:
  - icon: 
     src: /typescript.svg
     alt: typescript logo
    title: Type Safe
    details: All types are inferred, providing a pleasant developer experience.
  - icon: 
     src: /model-based.svg
     alt: model-based icon 
    title:  Model based
    details: You can focus on your validations, not on your DOM.
  - title: Extensible
    icon: 🪗
    details: Extend validation schema with your own properties.
  - title: Zod & Valibot support
    icon: 
      src: /zod-valibot.png
      alt: zod-valibot icon
    details: Use Zod or Valibot to control your validations.
---

