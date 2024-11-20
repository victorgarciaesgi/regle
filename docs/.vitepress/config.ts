import type { DefaultTheme } from 'vitepress';
import { defineConfig } from 'vitepress';
import { transformerTwoslash } from '@shikijs/vitepress-twoslash';
import { groupIconMdPlugin, groupIconVitePlugin } from 'vitepress-plugin-group-icons';

const Nav: DefaultTheme.NavItemWithLink[] = [
  { text: 'Getting Started', link: '/introduction/' },
  { text: 'Core concepts', link: '/core-concepts/' },
];

const CoreConcepts: (DefaultTheme.NavItemWithLink | DefaultTheme.NavItemChildren)[] = [
  { text: 'useRegle', link: '/core-concepts/' },
  {
    text: 'Rules',
    items: [
      { text: 'Inline rules', link: '/core-concepts/rules/' },
      {
        text: 'Advanced rules',
        link: '/core-concepts/rules/advanced-rules',
      },
      {
        text: 'Built-in rules',
        link: '/core-concepts/rules/built-in-rules',
      },
    ],
  },
  { text: 'Validation properties', link: '/core-concepts/validation-properties' },
  { text: 'Rules properties', link: '/core-concepts/rules-properties' },
  { text: 'Displaying errors', link: '/core-concepts/displaying-errors' },
  { text: 'Type safe output', link: '/core-concepts/type-safe-output' },
  { text: 'Modifiers', link: '/core-concepts/modifiers' },
  { text: 'Global configuration', link: '/core-concepts/global-config' },
];

const AdvancedUsage: (DefaultTheme.NavItemWithLink | DefaultTheme.NavItemChildren)[] = [
  {
    text: 'Collections',
    link: '/advanced-usage/collections',
  },
  { text: 'Usage with Pinia', link: '/advanced-usage/usage-with-pinia' },
  { text: 'Using metadata from rules', link: '/advanced-usage/rule-metadata' },
  { text: 'Rules operators', link: '/advanced-usage/rules-operators' },
  { text: 'Validation helpers', link: '/advanced-usage/validations-helpers' },
  { text: 'Typing props', link: '/advanced-usage/typing-props' },
  { text: 'Usage with Zod', link: '/advanced-usage/usage-with-zod/' },
];

const Examples: DefaultTheme.NavItemWithLink[] = [{ text: 'Base example', link: '/examples/base' }];

export default defineConfig({
  title: 'Regle',
  description: 'Typescript-first model-based form validation library for Vue 3',
  themeConfig: {
    logo: {
      dark: '/logo-reversed.png',
      light: '/logo.png',
    },
    nav: Nav,
    search: {
      provider: 'algolia',
      options: {
        indexName: 'regle',
        appId: '1ELQQKBPXN',
        apiKey: '5f6ac82c6d47d8a3d7fdd93dcf430d05',
      },
    },
    outline: 'deep',
    sidebar: [
      {
        text: 'Introduction',
        items: [
          { text: 'Getting Started', link: '/introduction/' },
          { text: 'Integrations', link: '/introduction/integrations' },
        ],
      },
      {
        text: 'Core concepts',
        items: CoreConcepts,
      },
      {
        text: 'Advanced Usage',
        items: AdvancedUsage,
      },
      {
        text: 'Example',
        items: Examples,
      },
    ],
    socialLinks: [{ icon: 'github', link: 'https://github.com/victorgarciaesgi/regle' }],
    footer: {
      message: 'Released under the MIT License. Logo by Johannes Lacourly',
      copyright: 'Copyright © 2023-present Victor Garcia',
    },
  },
  head: [
    ['meta', { name: 'viewport', content: 'width=device-width, initial-scale=1, maximum-scale=1' }],
    ['meta', { name: 'theme-color', content: '#00bb7f' }],
    [
      'meta',
      {
        name: 'keywords',
        content:
          'vue forms, vue validation library, vue forms typescript, vue model validation, vue zod, vue typescript forms',
      },
    ],
    ['meta', { property: 'og:url', content: 'https://regle.vercel.app/' }],
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:title', content: 'Regle' }],
    [
      'meta',
      {
        property: 'og:description',
        content: 'Typescript-first model-based form validation library for Vue 3',
      },
    ],
    [
      'meta',
      {
        property: 'og:image',
        content: 'https://regle.vercel.app/regle-github-banner.png',
      },
    ],
    ['meta', { name: 'twitter:site', content: '@regle' }],
    ['meta', { name: 'twitter:card', content: 'summary' }],
  ],
  markdown: {
    codeTransformers: [transformerTwoslash({})],
    theme: 'vitesse-dark',
    config(md) {
      md.use(groupIconMdPlugin);
    },
  },
  vite: {
    plugins: [groupIconVitePlugin() as any],
  },
  srcDir: './src',
});
