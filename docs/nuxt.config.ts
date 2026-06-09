import { fileURLToPath } from 'node:url';

export default defineNuxtConfig({
  extends: ['docus'],

  modules: ['nuxt-content-twoslash', '@nuxtjs/algolia'],

  site: {
    url: process.env.NUXT_SITE_URL || 'https://reglejs.dev',
    name: 'Regle',
  },

  llms: {
    domain: 'https://reglejs.dev',
    title: 'Regle',
    description: 'Headless model-based form validation library for Vue.js',
    full: {
      title: 'Regle',
      description:
        'Regle is a headless form validation library made for Vue.js. Regle brings type safety and great DX to forms.',
    },
  },

  algolia: {
    apiKey: '5f6ac82c6d47d8a3d7fdd93dcf430d05',
    applicationId: '1ELQQKBPXN',
    docSearch: {
      indexName: 'regle',
    },
  },

  twoslash: {
    injectNuxtTypes: true,
  },

  alias: {
    '@regle/core': fileURLToPath(new URL('../packages/core/src', import.meta.url)),
    '@regle/rules': fileURLToPath(new URL('../packages/rules/src', import.meta.url)),
    '@regle/schemas': fileURLToPath(new URL('../packages/schemas/src', import.meta.url)),
  },

  vite: {
    optimizeDeps: {
      include: ['@regle/core', '@regle/rules', '@regle/schemas'],
    },
  },

  app: {
    head: {
      meta: [
        { name: 'theme-color', content: '#00bb7f' },
        { name: 'author', content: 'Victor Garcia' },
        {
          name: 'keywords',
          content:
            'vue forms, vue form library, vue validation library, vue forms typescript, vue model validation, vue zod, vue typescript forms, regle, reglejs, regle vue, regle vue forms, regle vue form',
        },
        { property: 'og:type', content: 'website' },
        { property: 'og:site_name', content: 'Regle' },
        { name: 'twitter:site', content: '@regle' },
        { name: 'twitter:domain', content: 'reglejs.dev' },
        { name: 'twitter:card', content: 'summary_large_image' },
      ],
      link: [
        { rel: 'icon', href: '/favicon.ico', sizes: '48x48' },
        { rel: 'icon', href: '/favicon.svg', sizes: 'any', type: 'image/svg+xml' },
        { rel: 'mask-icon', href: '/logo-reglejs-favicon.svg', color: '#ffffff' },
        { rel: 'apple-touch-icon', href: '/apple-touch-icon.png', sizes: '180x180' },
      ],
      script: [
        {
          defer: true,
          src: 'https://cloud.umami.is/script.js',
          'data-website-id': 'b891ca9d-441a-44e0-ba1b-a35bea61fb35',
        },
        {
          async: true,
          src: 'https://media.bitterbrains.com/main.js?from=REGLE&type=top',
        },
      ],
    },
  },

  compatibilityDate: '2025-01-01',
});
