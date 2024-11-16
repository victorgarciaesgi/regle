import type { DefaultTheme } from 'vitepress';
import { defineConfig } from 'vitepress';
import { transformerTwoslash } from '@shikijs/vitepress-twoslash';

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
  markdown: {
    codeTransformers: [transformerTwoslash({})],
    theme: 'vitesse-dark',
  },
  srcDir: './src',
});
