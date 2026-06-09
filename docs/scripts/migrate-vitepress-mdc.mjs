#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const contentDir = path.resolve(__dirname, '../content');

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, files);
    else if (entry.name.endsWith('.md')) files.push(full);
  }
  return files;
}

function convertCodeGroups(content) {
  const lines = content.split('\n');
  const out = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    const groupMatch = line.match(/^:::+\s*code-group\s*$/);
    if (groupMatch) {
      out.push('::tabs');
      i++;
      while (i < lines.length && !/^:::+\s*$/.test(lines[i])) {
        const fence = lines[i];
        const fenceMatch = fence.match(/^```(\S*)(?:\s+\[([^\]]+)\])?/);
        if (fenceMatch) {
          const lang = fenceMatch[1] || 'text';
          const label = fenceMatch[2] || lang;
          out.push(`:::tabs-item{label="${label}"}`);
          out.push('```' + lang);
          i++;
          while (i < lines.length && !lines[i].startsWith('```')) {
            out.push(lines[i]);
            i++;
          }
          if (i < lines.length) {
            out.push(lines[i]);
            i++;
          }
          out.push(':::');
        } else {
          out.push(lines[i]);
          i++;
        }
      }
      if (i < lines.length && /^:::+\s*$/.test(lines[i])) i++;
      out.push('::');
      continue;
    }
    out.push(line);
    i++;
  }
  return out.join('\n');
}

function convertFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');

  // Frontmatter tweaks
  content = content.replace(/^sidebar:\s*false\s*$/m, 'navigation: false');
  content = content.replace(/^editLink:\s*false\s*$/m, '');
  content = content.replace(/^outline:\s*false\s*$/m, '');
  content = content.replace(/^aside:\s*false\s*$/m, '');

  // VitePress containers -> MDC (triple to double colon for top-level)
  const containerMap = {
    tip: 'tip',
    warning: 'warning',
    info: 'note',
    caution: 'caution',
    danger: 'caution',
    details: 'collapsible',
  };

  for (const [from, to] of Object.entries(containerMap)) {
    content = content.replace(new RegExp(`^:::${from}\\s*$`, 'gm'), `::${to}`);
    content = content.replace(new RegExp(`^:::${from}\\s+(.+)$`, 'gm'), `::${to}{$1}`);
  }

  // Close containers: standalone ::: becomes ::
  content = content.replace(/^:::\s*$/gm, '::');

  content = convertCodeGroups(content);

  // Remove vitepress layout home frontmatter keys
  content = content.replace(/^layout:\s*home\s*$/m, '');
  content = content.replace(/^titleTemplate:.*$/m, '');
  content = content.replace(/^hero:[\s\S]*?(?=^features:|^---|\n#)/m, '');
  content = content.replace(/^features:[\s\S]*?(?=^---|\n#)/m, '');

  // Strip script setup imports of relative vue paths (components are auto-imported)
  content = content.replace(
    /import\s+(\w+)\s+from\s+['"]\.\.\/(?:parts\/components\/|core-concepts\/rules\/components\/)[^'"]+['"];?\n/g,
    ''
  );
  content = content.replace(/import\s+(\w+)\s+from\s+['"]\.\.\/\.\.\/parts\/components\/[^'"]+['"];?\n/g, '');

  fs.writeFileSync(filePath, content);
}

for (const file of walk(contentDir)) {
  convertFile(file);
  console.log('converted', path.relative(contentDir, file));
}
