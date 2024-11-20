---
# https://vitepress.dev/reference/default-theme-home-page
layout: home

hero:
  name: "Regle"
  text: "TS-first form validation library for Vue.js"
  tagline: "Type safe, intuitive API and Zod compatible.

  The best way to handle your forms in Vue 3"
  image:
    dark: /logo-reglejs-favicon-reversed.svg
    light: /logo-reglejs-favicon.svg
    alt: Regle logo
  actions:
    - theme: brand
      text: Get Started
      link: /introduction
    - theme: alt
      text: Examples
      link: /examples/base.md

features:
  - icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" width="200px" height="200px" viewBox="0 0 512 512"><rect fill="#3178c6" height="512" rx="50" width="512"/><rect fill="#3178c6" height="512" rx="50" width="512"/><path clip-rule="evenodd" d="m316.939 407.424v50.061c8.138 4.172 17.763 7.3 28.875 9.386s22.823 3.129 35.135 3.129c11.999 0 23.397-1.147 34.196-3.442 10.799-2.294 20.268-6.075 28.406-11.342 8.138-5.266 14.581-12.15 19.328-20.65s7.121-19.007 7.121-31.522c0-9.074-1.356-17.026-4.069-23.857s-6.625-12.906-11.738-18.225c-5.112-5.319-11.242-10.091-18.389-14.315s-15.207-8.213-24.18-11.967c-6.573-2.712-12.468-5.345-17.685-7.9-5.217-2.556-9.651-5.163-13.303-7.822-3.652-2.66-6.469-5.476-8.451-8.448-1.982-2.973-2.974-6.336-2.974-10.091 0-3.441.887-6.544 2.661-9.308s4.278-5.136 7.512-7.118c3.235-1.981 7.199-3.52 11.894-4.615 4.696-1.095 9.912-1.642 15.651-1.642 4.173 0 8.581.313 13.224.938 4.643.626 9.312 1.591 14.008 2.894 4.695 1.304 9.259 2.947 13.694 4.928 4.434 1.982 8.529 4.276 12.285 6.884v-46.776c-7.616-2.92-15.937-5.084-24.962-6.492s-19.381-2.112-31.066-2.112c-11.895 0-23.163 1.278-33.805 3.833s-20.006 6.544-28.093 11.967c-8.086 5.424-14.476 12.333-19.171 20.729-4.695 8.395-7.043 18.433-7.043 30.114 0 14.914 4.304 27.638 12.912 38.172 8.607 10.533 21.675 19.45 39.204 26.751 6.886 2.816 13.303 5.579 19.25 8.291s11.086 5.528 15.415 8.448c4.33 2.92 7.747 6.101 10.252 9.543 2.504 3.441 3.756 7.352 3.756 11.733 0 3.233-.783 6.231-2.348 8.995s-3.939 5.162-7.121 7.196-7.147 3.624-11.894 4.771c-4.748 1.148-10.303 1.721-16.668 1.721-10.851 0-21.597-1.903-32.24-5.71-10.642-3.806-20.502-9.516-29.579-17.13zm-84.159-123.342h64.22v-41.082h-179v41.082h63.906v182.918h50.874z" fill="#fff" fill-rule="evenodd"/><script xmlns=""/></svg>
    title: Type Safe
    details: All types are inferred, providing a pleasant developer experience.
  - icon: <svg width="800px" height="800px" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M16 4C14 4 11 5 11 9C11 13 11 15 11 18C11 21 6 23 6 23C6 23 11 25 11 28C11 31 11 35 11 39C11 43 14 44 16 44" stroke="#048d62" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><path d="M32 4C34 4 37 5 37 9C37 13 37 15 37 18C37 21 42 23 42 23C42 23 37 25 37 28C37 31 37 35 37 39C37 43 34 44 32 44" stroke="#048d62" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg>
    title:  Model based
    details: You can focus on your validations, not on your DOM.
  - icon: <svg xmlns="http://www.w3.org/2000/svg" width="200px" height="200px" xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true" role="img" class="iconify iconify--twemoji" preserveAspectRatio="xMidYMid meet" viewBox="0.5 0.99 34.62 34.51"><path fill="#C1694F" d="M4.048 29.644c-.811-.558-1.541-4.073-.936-4.404c.738-.402.686.835 2.255 2.362c1.569 1.528 6.47.913 7.708 1.326c1.363.455-6.385 2.533-9.027.716z"></path><path fill="#D99E82" d="M5.367 27.603C4 22 4.655 18.919 5.433 16.861C6.8 13.24 16.699 5.169 23.8 2.637C25.678 1.967 31.62 1 35 1c.589 2.332-1.174 6.717-1.62 7.518c-1.009 1.81-3.564 4.273-8.646 9.482c-.252.258-5.119-.46-5.376-.191c-.283.296 4.044 1.579 3.755 1.889c-.738.79-1.495 1.624-2.268 2.507c-.172.196-8.311-.923-8.484-.722c-.232.27 7.501 1.862 7.266 2.14c-.645.765-1.299 1.564-1.959 2.397c-1.725 2.178-12.301 1.583-12.301 1.583z"></path><path fill="#C1694F" d="M19.15 12.787c1.588.966 5.331 1.943 8.316 2.422c1.898-1.937 3.299-3.378 4.302-4.529c-2.259-.49-5.742-1.3-7.487-2.087l-.816-.403l-4.872 4.17l.557.427z"></path><path fill="#662113" d="M35.088 1.514A3.85 3.85 0 0 0 35 1c-.378 0-.792.014-1.225.036c-3.438.178-8.307 1.006-9.975 1.601c-.345.123-.702.27-1.059.418c-.478.198-.964.416-1.459.654c.356 1.481 1.126 3.144 1.807 4.013a72.185 72.185 0 0 0-4.836 4.115C12.598 17.085 8.232 22.709 5.248 27.079c.04.174.076.344.12.524c0 0 .219.012.589.026c1.482-2.288 5.703-8.239 13.194-14.841a91.61 91.61 0 0 1 5.13-4.195c1.745.787 5.228 1.597 7.487 2.087c.322-.369.606-.712.849-1.028c.316-.412.569-.785.763-1.134c.415-.746 1.969-4.594 1.708-7.004z"></path><path fill="#C1694F" d="M35 1c-.369 0-.751-.003-1.138-.008c-3.915 1.874-7.509 4.194-10.772 6.73c-.68-.87-1.451-2.532-1.807-4.013a42.574 42.574 0 0 0-4.484 2.539c.309 1.911.852 4.377 1.455 5.589C6.827 22.441.638 34.605.553 34.776a.5.5 0 0 0 .895.448c.119-.238 12.144-23.883 33.659-33.72A7.693 7.693 0 0 0 35 1z"></path></svg>
    title: Light
    details: 0 dependencies, ~6kb size, only the necessary.
  - icon: <svg xmlns="http://www.w3.org/2000/svg" width="1.27em" height="1em" viewBox="0 0 256 203"><defs><filter id="logosZod0" width="105.2%" height="106.5%" x="-2.2%" y="-2.8%" filterUnits="objectBoundingBox"><feOffset dx="1" dy="1" in="SourceAlpha" result="shadowOffsetOuter1"/><feGaussianBlur in="shadowOffsetOuter1" result="shadowBlurOuter1" stdDeviation="2"/><feColorMatrix in="shadowBlurOuter1" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.36 0"/></filter><path id="logosZod1" fill="#000" d="M200.42 0H53.63L0 53.355l121.76 146.624l9.714-10.9L252 53.857zm-5.362 12.562l39.84 41.6l-112.8 126.558L17 54.162l41.815-41.6z"/></defs><g transform="translate(2 1.51)"><path fill="#18253f" d="M58.816 12.522h136.278l39.933 41.691l-112.989 126.553L16.957 54.213z"/><path fill="#274d82" d="M149.427 150.875H96.013l-24.124-29.534l68.364-.002l.002-4.19h39.078z"/><path fill="#274d82" d="M223.56 42.323L76.178 127.414l-19.226-24.052l114.099-65.877l-2.096-3.631l30.391-17.546zm-78.964-29.759L33.93 76.457L16.719 54.972l74.095-42.779z"/><use filter="url(#logosZod0)" href="#logosZod1"/><use fill="#3068b7" href="#logosZod1"/></g></svg>
    title: Zod support
    details: Use Zod schemas to control your validations
---

