import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildApiMetadata, type PackageApi } from './build-api-metadata.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

interface DocPage {
  id: string;
  title: string;
  category: string;
  path: string;
  content: string;
}

interface DocsData {
  docs: DocPage[];
  api: PackageApi;
}

/**
 * Parse frontmatter from markdown content
 */
function parseFrontmatter(content: string): { title: string; content: string } {
  const frontmatterRegex = /^---\n([\s\S]*?)\n---\n/;
  const match = content.match(frontmatterRegex);

  let title = '';
  let cleanContent = content;

  if (match) {
    const frontmatter = match[1];
    const titleMatch = frontmatter.match(/title:\s*(.+)/);
    if (titleMatch) {
      title = titleMatch[1].trim();
    }
    cleanContent = content.replace(frontmatterRegex, '');
  }

  return { title, content: cleanContent };
}

/**
 * Remove script blocks and any remaining `<script` fragments from markdown.
 */
function stripScriptTags(content: string): string {
  // Allow optional whitespace before `>` in closing tags (e.g. `</script >`).
  const blockPattern = /<script\b[^>]*>[\s\S]*?<\/script\s*>/gi;
  const openingTagPattern = /<script\b[^>]*>/gi;
  const closingTagPattern = /<\/script\s*>/gi;
  const scriptFragmentPattern = /<script/gi;

  let result = content;
  let previous = '';

  while (result !== previous) {
    previous = result;
    result = result.replace(blockPattern, '');
  }

  previous = '';
  while (result !== previous) {
    previous = result;
    result = result.replace(openingTagPattern, '');
  }

  previous = '';
  while (result !== previous) {
    previous = result;
    result = result.replace(closingTagPattern, '');
  }

  previous = '';
  while (result !== previous) {
    previous = result;
    result = result.replace(scriptFragmentPattern, '');
  }

  return result;
}

/**
 * Clean markdown content for AI consumption
 */
function cleanMarkdownContent(content: string): string {
  return (
    stripScriptTags(content)
      // Remove Vue component tags like <QuickUsage/>
      .replaceAll(/<[A-Z][a-zA-Z]*\s*\/>/g, '')
      // Remove includes
      .replaceAll(/<!--\s*@include:.*-->/g, '')
      // Remove twoslash annotations
      .replaceAll(/\/\/\s*@\w+.*$/gm, '')
      // Remove ^| cursor position markers
      .replaceAll(/\/\/\s*\^.*/gm, '')
      // Clean up multiple blank lines
      .replaceAll(/\n{3,}/g, '\n\n')
      .trim()
  );
}

/**
 * Get category from file path
 */
function getCategoryFromPath(filePath: string): string {
  const parts = filePath.split('/');
  if (parts.includes('introduction')) return 'introduction';
  if (parts.includes('core-concepts')) {
    if (parts.includes('rules')) return 'rules';
    return 'core-concepts';
  }
  if (parts.includes('common-usage')) return 'common-usage';
  if (parts.includes('advanced-usage')) return 'advanced-usage';
  if (parts.includes('typescript')) return 'typescript';
  if (parts.includes('integrations')) return 'integrations';
  if (parts.includes('examples')) return 'examples';
  if (parts.includes('troubleshooting')) return 'troubleshooting';
  return 'general';
}

/**
 * Generate a readable ID from file path
 */
function generateId(filePath: string): string {
  return filePath.replace(/\.md$/, '').replace(/\//g, '-').replace(/^-/, '');
}

/**
 * Recursively find all markdown files in a directory
 */
function findMarkdownFiles(dir: string, baseDir: string = dir): string[] {
  const files: string[] = [];

  if (!fs.existsSync(dir)) {
    return files;
  }

  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (['assets', 'public', 'parts', 'blog'].includes(entry.name)) {
        continue;
      }
      files.push(...findMarkdownFiles(fullPath, baseDir));
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      const relativePath = path.relative(baseDir, fullPath);
      files.push(relativePath);
    }
  }

  return files;
}

/**
 * Build docs data and write to JSON
 */
function buildDocsData(): void {
  const docsDir = path.resolve(__dirname, '../../../docs/src');
  const outputPath = path.resolve(__dirname, '../src/generated/docs-data.json');
  const outputDir = path.dirname(outputPath);

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const docPages: DocPage[] = [];
  const markdownFiles = findMarkdownFiles(docsDir);

  for (const file of markdownFiles) {
    const fullPath = path.join(docsDir, file);
    const rawContent = fs.readFileSync(fullPath, 'utf-8');
    const { title, content } = parseFrontmatter(rawContent);
    const cleanContent = cleanMarkdownContent(content);

    if (cleanContent.length < 50) {
      continue;
    }

    docPages.push({
      id: generateId(file),
      title: title || file.replace(/\.md$/, '').split('/').pop() || file,
      category: getCategoryFromPath(file),
      path: file,
      content: cleanContent,
    });
  }

  // Build API metadata
  console.info('Building API metadata...');
  const apiMetadata = buildApiMetadata();

  // Log stats
  for (const [pkg, apis] of Object.entries(apiMetadata)) {
    console.info(`  ${pkg}: ${apis.length} exports`);
  }

  const docsData: DocsData = {
    docs: docPages,
    api: apiMetadata,
  };

  fs.writeFileSync(outputPath, JSON.stringify(docsData, null, 2));
  console.info(
    `Generated docs-data.json with ${docPages.length} docs and API metadata for ${Object.keys(apiMetadata).length} packages`
  );
}

buildDocsData();
