import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import type { Result } from '@modelcontextprotocol/sdk/types.js';
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

function jsonResponse(data: unknown) {
  return {
    content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }],
  } satisfies Result;
}

function errorResponse(error: string, extra?: Record<string, unknown>) {
  return {
    ...jsonResponse({ error, ...extra }),
    isError: true,
  } satisfies Result;
}

const server = new McpServer({
  name: 'regle-mcp-server',
  version,
  icons: [{ src: 'https://reglejs.dev/logo_main.png' }],
  title: 'Regle MCP Server',
  websiteUrl: 'https://reglejs.dev',
});

server.registerTool(
  'regle-list-documentation',
  {
    title: 'List all available Regle documentation pages',
    inputSchema: z.object({
      category: z.string().optional().describe('Filter by category (e.g., "rules", "core-concepts", "introduction")'),
    }),
  },
  async ({ category }) => {
    const filteredDocs = category ? getDocsByCategory(category) : docs;
    return jsonResponse({
      message: 'Available Regle documentation pages',
      category: category || 'all',
      count: filteredDocs.length,
      docs: filteredDocs.map((doc) => ({
        id: doc.id,
        title: doc.title,
      })),
    });
  }
);

server.registerTool(
  'regle-get-documentation',
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
      return errorResponse('Documentation page not found', {
        requestedId: id,
        availableIds,
      });
    }

    return jsonResponse({
      id: doc.id,
      title: doc.title,
      category: doc.category,
      path: doc.path,
      content: doc.content,
    });
  }
);

server.registerTool(
  'regle-get-usage-guide',
  {
    title: 'Get a comprehensive guide on how to use the useRegle composable',
    inputSchema: z.object({}),
  },
  async () => {
    const doc = getDocById('core-concepts-index');

    if (!doc) {
      return errorResponse('useRegle guide not found');
    }

    return jsonResponse({
      id: doc.id,
      title: doc.title,
      category: doc.category,
      content: doc.content,
    });
  }
);

server.registerTool(
  'regle-get-vuelidate-migration-guide',
  {
    title: 'Get a guide on how to migrate from Vuelidate to Regle',
    inputSchema: z.object({}),
  },
  async () => {
    const doc = getDocById('introduction-migrate-from-vuelidate');

    if (!doc) {
      return errorResponse('Vuelidate migration guide not found');
    }

    return jsonResponse({
      id: doc.id,
      title: doc.title,
      category: doc.category,
      content: doc.content,
    });
  }
);

const categories = getCategories();

server.registerTool(
  'regle-search-documentation',
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
      return jsonResponse({
        query,
        resultCount: 0,
        results: [],
        suggestions: categories,
      });
    }

    const formattedResults = results.map((doc) => ({
      id: doc.id,
      title: doc.title,
      category: doc.category,
      preview: doc.content.substring(0, 300) + '...',
    }));

    return jsonResponse({ query, resultCount: results.length, results: formattedResults });
  }
);

server.registerTool(
  'regle-list-rules',
  {
    title: 'Get a quick reference of all built-in validation rules in Regle',
    inputSchema: z.object({}),
  },
  async () => {
    const rules = getRulesFromDocs();

    if (rules.length === 0) {
      return errorResponse('Built-in rules documentation not found');
    }

    return jsonResponse({
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
    });
  }
);

server.registerTool(
  'regle-get-rule-reference',
  {
    title: 'Get details about a specific built-in validation rule',
    inputSchema: z.object({
      name: z.string().describe('The rule name (e.g., "required", "email", "minLength")'),
    }),
  },
  async ({ name }) => {
    const rule = getApiByName(name);

    if (!rule) {
      const allRules = getRulesFromDocs();
      return errorResponse(`Rule "${name}" not found`, {
        availableRules: allRules.map((r) => r.name),
      });
    }

    return jsonResponse({
      name: rule.name,
      description: rule.description,
      package: '@regle/rules',
      usageExample: rule.example,
      fullDocId: 'core-concepts-rules-built-in-rules',
    });
  }
);

server.registerTool(
  'regle-list-validation-properties',
  {
    title: 'Get documentation on all validation properties available on r$ and field objects',
    inputSchema: z.object({}),
  },
  async () => {
    const doc = getDocById('core-concepts-validation-properties');

    if (!doc) {
      return errorResponse('Validation properties documentation not found');
    }

    return jsonResponse({
      id: doc.id,
      title: doc.title,
      category: doc.category,
      content: doc.content,
    });
  }
);

server.registerTool(
  'regle-list-helpers',
  {
    title: 'Get a reference of all validation helper utilities available in Regle',
    inputSchema: z.object({}),
  },
  async () => {
    const helpers = getHelpersFromDocs();

    if (helpers.length === 0) {
      return errorResponse('Validation helpers documentation not found');
    }

    const guards = helpers.filter((h) => h.category === 'guard');
    const operations = helpers.filter((h) => h.category === 'operation');
    const coerces = helpers.filter((h) => h.category === 'coerce');

    const formatHelpers = (list: typeof guards) => list.map((h) => ({ name: h.name, description: h.description }));

    return jsonResponse({
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
    });
  }
);

server.registerTool(
  'regle-get-helper-reference',
  {
    title: 'Get details about a specific validation helper utility',
    inputSchema: z.object({
      name: z.string().describe('The helper name (e.g., "isFilled", "getSize", "toNumber")'),
    }),
  },
  async ({ name }) => {
    const helper = getApiByName(name);

    if (!helper) {
      const allHelpers = getHelpersFromDocs();
      return errorResponse(`Helper "${name}" not found`, {
        availableHelpers: allHelpers.map((h) => h.name),
      });
    }

    return jsonResponse({
      name: helper.name,
      description: helper.description,
      category: helper.tags,
      package: '@regle/rules',
      usageExample: helper.example,
      fullDocId: 'core-concepts-rules-validations-helpers',
    });
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
    if (name) {
      const apiItem = getApiByName(name, packageName);
      if (!apiItem) {
        return errorResponse(`API export "${name}" not found`, {
          availablePackages: apiPackages,
        });
      }

      return jsonResponse({
        name: apiItem.name,
        kind: apiItem.kind,
        description: apiItem.description,
        parameters: apiItem.parameters,
        returnType: apiItem.returnType,
        example: apiItem.example,
        tags: apiItem.tags,
      });
    }

    if (search) {
      const results = searchApi(search);
      return jsonResponse({
        query: search,
        resultCount: results.length,
        results: results.map((r) => ({
          name: r.name,
          package: r.package,
          kind: r.kind,
          description: r.description.substring(0, 200) + (r.description.length > 200 ? '...' : ''),
        })),
      });
    }

    if (packageName) {
      const apis = getApiByPackage(packageName);
      if (apis.length === 0) {
        return errorResponse(`Package "${packageName}" not found or has no exports`, {
          availablePackages: apiPackages,
        });
      }

      return jsonResponse({
        package: packageName,
        exportCount: apis.length,
        exports: apis.map((a) => ({
          name: a.name,
          kind: a.kind,
          description: a.description.substring(0, 150) + (a.description.length > 150 ? '...' : ''),
          hasExample: !!a.example,
          parameterCount: a.parameters.length,
        })),
      });
    }

    const packageSummary = apiPackages.map((pkg) => ({
      package: pkg,
      exportCount: getApiByPackage(pkg).length,
    }));

    return jsonResponse({
      message: 'Available Regle API packages',
      packages: packageSummary,
      usage: 'Use "package" to list exports, "name" to get specific export details, or "search" to find exports',
    });
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
