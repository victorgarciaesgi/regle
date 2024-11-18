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
  { text: 'Usage with Zod', link: '/advanced-usage/usage-with-zod/' },
];

const Rules: DefaultTheme.NavItemWithLink[] = [{ text: 'required', link: '/rules/required' }];

export default defineConfig({
  title: 'Regle',
  description: 'A reactive and declarative vue form library',
  themeConfig: {
    logo: {
      dark: '/logo-reversed.png',
      light: '/logo.png',
    },
    nav: Nav,
    search: {
      provider: 'local',
      // options: {
      //   indexName: 'regle',
      //   appId: 'G5JKVPJTYU',
      //   apiKey: 'a58d2d77b3755f50b110c8aef5740682',
      // },
    },
    sidebar: [
      {
        text: 'Introduction',
        items: [{ text: 'Getting Started', link: '/introduction/' }],
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
        text: 'Built-in rules',
        items: Rules,
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
    ['meta', { property: 'og:url', content: 'https://regle.vercel.app/' }],
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:title', content: 'Regle' }],
    [
      'meta',
      {
        property: 'og:description',
        content: 'Typescript-first model-based validation library for Vue 3',
      },
    ],
    [
      'meta',
      {
        property: 'og:image',
        content:
          'https://raw.githubusercontent.com/victorgarciaesgi/regle/master/.github/images/regle-github-banner.png',
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
    plugins: [groupIconVitePlugin()],
  },
  srcDir: './src',
});
