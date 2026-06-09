export default defineAppConfig({
  docus: {
    locale: 'en',
  },

  seo: {
    title: 'Regle',
    titleTemplate: '%s - Regle',
    description: 'Headless model-based form validation library for Vue.js',
  },

  header: {
    title: 'Regle',
    logo: {
      light: '/logo.png',
      dark: '/logo-reversed.png',
      alt: 'Regle logo',
    },
  },

  navigation: {
    sub: 'header',
  },

  github: {
    url: 'https://github.com/victorgarciaesgi/regle',
    branch: 'main',
    rootDir: 'docs',
  },

  socials: {
    x: 'https://x.com/desnoth_dev',
    bluesky: 'https://bsky.app/profile/vicflix.dev',
    github: 'https://github.com/victorgarciaesgi/regle',
  },

  toc: {
    title: 'On this page',
  },

  ui: {
    colors: {
      primary: 'regle',
      neutral: 'slate',
    },
  },
});
