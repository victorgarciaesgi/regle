import docsData from './generated/docs-data.json' with { type: 'json' };

export interface DocPage {
  id: string;
  title: string;
  category: string;
  path: string;
  content: string;
}

export interface RuleInfo {
  name: string;
  description: string;
}

export interface HelperInfo {
  name: string;
  description: string;
  category: 'guard' | 'operation' | 'coerce';
}

export interface WrapperInfo {
  name: string;
  description: string;
}

// Export the loaded docs data
export const docs: DocPage[] = docsData as DocPage[];

/**
 * Get all unique categories from docs
 */
export function getCategories(): string[] {
  return [...new Set(docs.map((doc) => doc.category))];
}

/**
 * Search docs by query string
 */
export function searchDocs(query: string): DocPage[] {
  const lowerQuery = query.toLowerCase();
  return docs.filter(
    (doc) =>
      doc.title.toLowerCase().includes(lowerQuery) ||
      doc.content.toLowerCase().includes(lowerQuery) ||
      doc.category.toLowerCase().includes(lowerQuery)
  );
}

/**
 * Get docs by category
 */
export function getDocsByCategory(category: string): DocPage[] {
  return docs.filter((doc) => doc.category === category);
}

/**
 * Get a single doc by ID
 */
export function getDocById(id: string): DocPage | undefined {
  return docs.find((doc) => doc.id === id);
}

/**
 * Extract built-in rules from the docs
 */
export function getRulesFromDocs(): RuleInfo[] {
  const rulesDoc = getDocById('core-concepts-rules-built-in-rules');
  if (!rulesDoc) return [];

  const rules: RuleInfo[] = [];
  const sections = rulesDoc.content.split(/^## `/gm);

  for (const section of sections.slice(1)) {
    const nameMatch = section.match(/^(\w+)`/);
    if (nameMatch) {
      const name = nameMatch[1];
      // Get first paragraph after the heading as description
      const lines = section.split('\n').slice(1);
      let description = '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('_') && !trimmed.startsWith('```') && !trimmed.startsWith('import')) {
          description = trimmed;
          break;
        }
      }

      rules.push({ name, description });
    }
  }

  return rules;
}

/**
 * Extract validation helpers from the docs
 */
export function getHelpersFromDocs(): HelperInfo[] {
  const helpersDoc = getDocById('core-concepts-rules-validations-helpers');
  if (!helpersDoc) return [];

  const helpers: HelperInfo[] = [];
  const content = helpersDoc.content;

  // Define helpers with their categories based on doc structure
  const helperDefs: Array<{ name: string; category: HelperInfo['category'] }> = [
    { name: 'isFilled', category: 'guard' },
    { name: 'isEmpty', category: 'guard' },
    { name: 'isNumber', category: 'guard' },
    { name: 'isDate', category: 'guard' },
    { name: 'getSize', category: 'operation' },
    { name: 'matchRegex', category: 'operation' },
    { name: 'toNumber', category: 'coerce' },
    { name: 'toDate', category: 'coerce' },
  ];

  for (const def of helperDefs) {
    const regex = new RegExp(`### \`${def.name}\`\\n\\n([^#]+)`, 's');
    const match = content.match(regex);
    if (match) {
      // Get first meaningful line as description
      const lines = match[1].split('\n');
      let description = '';
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('_') && !trimmed.startsWith('```')) {
          description = trimmed;
          break;
        }
      }
      helpers.push({ name: def.name, description, category: def.category });
    }
  }

  return helpers;
}

/**
 * Extract rule wrappers from the docs
 */
export function getWrappersFromDocs(): WrapperInfo[] {
  const wrappersDoc = getDocById('core-concepts-rules-rule-wrappers');
  if (!wrappersDoc) return [];

  const wrappers: WrapperInfo[] = [];
  const content = wrappersDoc.content;

  const wrapperNames = ['withMessage', 'withParams', 'withAsync', 'withTooltip'];

  for (const name of wrapperNames) {
    const regex = new RegExp(`### \`${name}\`\\n\\n([^#]+)`, 's');
    const match = content.match(regex);
    if (match) {
      const lines = match[1].split('\n');
      let description = '';
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('```')) {
          description = trimmed;
          break;
        }
      }
      wrappers.push({ name, description });
    }
  }

  return wrappers;
}
