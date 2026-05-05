import { saveAs } from 'file-saver';
import JSZip from 'jszip';
import type { ReplStore } from '@vue/repl';

import index from './template/index.html?raw';
import main from './template/main.js?raw';
import pkg from './template/package.json?raw';
import config from './template/vite.config.js?raw';
import readme from './template/README.md?raw';

export async function downloadProject(store: ReplStore) {
  if (!confirm('Download project as a zip file?')) {
    return;
  }

  const zip = new JSZip();

  zip.file('index.html', index);
  zip.file('package.json', pkg.replace(`"vue": "latest"`, `"vue": "${store.vueVersion || 'latest'}"`));
  zip.file('vite.config.js', config);
  zip.file('README.md', readme);

  const src = zip.folder('src')!;
  src.file('main.js', main);

  const files = store.getFiles();
  for (const filename in files) {
    const content = files[filename];
    if (filename === 'import-map.json' || filename === 'tsconfig.json') {
      zip.file(filename, content);
    } else {
      src.file(filename, content);
    }
  }

  const blob = await zip.generateAsync({ type: 'blob' });
  saveAs(blob, 'regle-project.zip');
}
