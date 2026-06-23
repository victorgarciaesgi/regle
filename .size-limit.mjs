/** @type {import('size-limit').Config} */
export default [
  {
    name: '@regle/core production entry',
    path: 'packages/core/dist/regle-core.min.js',
    limit: '25 kB',
    gzip: true,
  },
  {
    name: '@regle/rules production entry',
    path: 'packages/rules/dist/regle-rules.min.js',
    limit: '7 kB',
    gzip: true,
  },
  {
    name: '@regle/core consumer (useRegle)',
    path: 'scripts/size-limit-consumer/dist/core/**/*.js',
    limit: '41 kB',
    gzip: true,
  },
  {
    name: '@regle/rules consumer (useRegle + required)',
    path: 'scripts/size-limit-consumer/dist/rules/**/*.js',
    limit: '46 kB',
    gzip: true,
  },
];
