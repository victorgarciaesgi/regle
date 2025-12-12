import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import {
  docs,
  getCategories,
  getDocById,
  getDocsByCategory,
  getRulesFromDocs,
  getHelpersFromDocs,
  searchDocs,
  getApiPackages,
  getApiByPackage,
  getApiByName,
  searchApi,
} from './docs-data.js';
import { version } from '../package.json';

const categories = getCategories();

const server = new McpServer({
  name: 'regle-mcp-server',
  version,
  icons: [{ src: 'https://reglejs.dev/logo_main.png' }],
  title: 'Regle MCP Server',
  websiteUrl: 'https://reglejs.dev',
});

server.registerTool(
  'regle-list-docs',
  {
    title: 'List all available Regle documentation pages',
    inputSchema: z.object({
      category: z.string().optional().describe('Filter by category (e.g., "rules", "core-concepts", "introduction")'),
    }),
  },
  async ({ category }) => {
    const filteredDocs = category ? getDocsByCategory(category) : docs;
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(
            {
              message: 'Available Regle documentation pages',
              category: category || 'all',
              count: filteredDocs.length,
              docs: filteredDocs.map((doc) => ({
                id: doc.id,
                title: doc.title,
              })),
            },
            null,
            2
          ),
        },
      ],
    };
  }
);

server.registerTool(
  'regle-get-doc',
  {
    title: 'Get the full content of a specific Regle documentation page',
    inputSchema: z.object({
      id: z.string().describe('The documentation page ID (e.g., "core-concepts-rules-built-in-rules")'),
    }),
  },
  async ({ id }) => {
    const doc = getDocById(id);

    if (!doc) {
      const availableIds = docs.map((d) => d.id);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                error: 'Documentation page not found',
                requestedId: id,
                availableIds,
              },
              null,
              2
            ),
          },
        ],
        isError: true,
      };
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(
            {
              id: doc.id,
              title: doc.title,
              category: doc.category,
              path: doc.path,
              content: doc.content,
            },
            null,
            2
          ),
        },
      ],
    };
  }
);

server.registerTool(
  'regle-search-docs',
  {
    title: 'Search Regle documentation for specific topics, rules, or concepts',
    inputSchema: z.object({
      query: z.string().describe('Search query (e.g., "required", "async validation", "useRegle")'),
      limit: z.number().optional().default(5).describe('Maximum number of results to return'),
    }),
  },
  async ({ query, limit }) => {
    const results = searchDocs(query).slice(0, limit);

    if (results.length === 0) {
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                query,
                resultCount: 0,
                results: [],
                suggestions: categories,
              },
              null,
              2
            ),
          },
        ],
      };
    }

    const formattedResults = results.map((doc) => ({
      id: doc.id,
      title: doc.title,
      category: doc.category,
      preview: doc.content.substring(0, 300) + '...',
    }));

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({ query, resultCount: results.length, results: formattedResults }, null, 2),
        },
      ],
    };
  }
);

server.registerTool(
  'regle-get-rules-reference',
  {
    title: 'Get a quick reference of all built-in validation rules in Regle',
    inputSchema: z.object({}),
  },
  async () => {
    const rules = getRulesFromDocs();

    if (rules.length === 0) {
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({ error: 'Built-in rules documentation not found' }, null, 2),
          },
        ],
        isError: true,
      };
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(
            {
              title: 'Built-in Rules',
              package: '@regle/rules',
              count: rules.length,
              rules: rules.map((r) => ({ name: r.name, description: r.description })),
              usageExample: `import { useRegle } from '@regle/core';
import { required, email, minLength } from '@regle/rules';

const { r$ } = useRegle(
  { email: '', password: '' },
  {
    email: { required, email },
    password: { required, minLength: minLength(8) }
  }
);`,
              fullDocId: 'core-concepts-rules-built-in-rules',
            },
            null,
            2
          ),
        },
      ],
    };
  }
);

server.registerTool(
  'regle-get-validation-properties',
  {
    title: 'Get documentation on all validation properties available on r$ and field objects',
    inputSchema: z.object({}),
  },
  async () => {
    const doc = getDocById('core-concepts-validation-properties');

    if (!doc) {
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({ error: 'Validation properties documentation not found' }, null, 2),
          },
        ],
        isError: true,
      };
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(
            {
              id: doc.id,
              title: doc.title,
              category: doc.category,
              content: doc.content,
            },
            null,
            2
          ),
        },
      ],
    };
  }
);

server.registerTool(
  'regle-get-helpers-reference',
  {
    title: 'Get a reference of all validation helper utilities available in Regle',
    inputSchema: z.object({}),
  },
  async () => {
    const helpers = getHelpersFromDocs();

    if (helpers.length === 0) {
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({ error: 'Validation helpers documentation not found' }, null, 2),
          },
        ],
        isError: true,
      };
    }

    const guards = helpers.filter((h) => h.category === 'guard');
    const operations = helpers.filter((h) => h.category === 'operation');
    const coerces = helpers.filter((h) => h.category === 'coerce');

    const formatHelpers = (list: typeof guards) => list.map((h) => ({ name: h.name, description: h.description }));

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(
            {
              title: 'Validation Helpers',
              package: '@regle/rules',
              totalCount: helpers.length,
              categories: {
                guards: {
                  description: 'Runtime and Type Guards',
                  helpers: formatHelpers(guards),
                },
                operations: {
                  description: 'Operations Utils',
                  helpers: formatHelpers(operations),
                },
                coerces: {
                  description: 'Coerce Utils',
                  helpers: formatHelpers(coerces),
                },
              },
              usageExample: `import { createRule, type Maybe } from '@regle/core';
import { isFilled, getSize } from '@regle/rules';

const rule = createRule({
  validator(value: Maybe<string>) {
    if (isFilled(value)) {
      return getSize(value) > 6;
    }
    return true;
  },
  message: 'Error'
});`,
              fullDocId: 'core-concepts-rules-validations-helpers',
            },
            null,
            2
          ),
        },
      ],
    };
  }
);

server.registerTool(
  'regle-get-useregle-guide',
  {
    title: 'Get a comprehensive guide on how to use the useRegle composable',
    inputSchema: z.object({}),
  },
  async () => {
    const doc = getDocById('core-concepts-index');

    if (!doc) {
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({ error: 'useRegle guide not found' }, null, 2),
          },
        ],
        isError: true,
      };
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(
            {
              id: doc.id,
              title: doc.title,
              category: doc.category,
              content: doc.content,
            },
            null,
            2
          ),
        },
      ],
    };
  }
);

const apiPackages = getApiPackages();

server.registerTool(
  'regle-get-api-reference',
  {
    title: 'Get API reference for Regle packages with full metadata (parameters, return types, examples)',
    inputSchema: z.object({
      package: z
        .string()
        .optional()
        .describe('Package name (e.g., "@regle/core", "@regle/rules", "@regle/schemas", "@regle/nuxt")'),
      name: z.string().optional().describe('Specific function/export name to look up (e.g., "useRegle", "required")'),
      search: z.string().optional().describe('Search query to find exports by name or description'),
    }),
  },
  async ({ package: packageName, name, search }) => {
    // If searching by name
    if (name) {
      const apiItem = getApiByName(name, packageName);
      if (!apiItem) {
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                {
                  error: `API export "${name}" not found`,
                  availablePackages: apiPackages,
                },
                null,
                2
              ),
            },
          ],
          isError: true,
        };
      }

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                name: apiItem.name,
                kind: apiItem.kind,
                description: apiItem.description,
                parameters: apiItem.parameters,
                returnType: apiItem.returnType,
                example: apiItem.example,
                tags: apiItem.tags,
              },
              null,
              2
            ),
          },
        ],
      };
    }

    // If searching
    if (search) {
      const results = searchApi(search);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                query: search,
                resultCount: results.length,
                results: results.map((r) => ({
                  name: r.name,
                  package: r.package,
                  kind: r.kind,
                  description: r.description.substring(0, 200) + (r.description.length > 200 ? '...' : ''),
                })),
              },
              null,
              2
            ),
          },
        ],
      };
    }

    // If listing a specific package
    if (packageName) {
      const apis = getApiByPackage(packageName);
      if (apis.length === 0) {
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                {
                  error: `Package "${packageName}" not found or has no exports`,
                  availablePackages: apiPackages,
                },
                null,
                2
              ),
            },
          ],
          isError: true,
        };
      }

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                package: packageName,
                exportCount: apis.length,
                exports: apis.map((a) => ({
                  name: a.name,
                  kind: a.kind,
                  description: a.description.substring(0, 150) + (a.description.length > 150 ? '...' : ''),
                  hasExample: !!a.example,
                  parameterCount: a.parameters.length,
                })),
              },
              null,
              2
            ),
          },
        ],
      };
    }

    // Default: list all packages with their export counts
    const packageSummary = apiPackages.map((pkg) => ({
      package: pkg,
      exportCount: getApiByPackage(pkg).length,
    }));

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(
            {
              message: 'Available Regle API packages',
              packages: packageSummary,
              usage:
                'Use "package" to list exports, "name" to get specific export details, or "search" to find exports',
            },
            null,
            2
          ),
        },
      ],
    };
  }
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Regle MCP Server running on stdio');
}

main().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
