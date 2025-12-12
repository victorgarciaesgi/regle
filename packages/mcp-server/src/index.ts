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
} from './docs-data.js';

const categories = getCategories();

const server = new McpServer({
  name: 'regle-mcp-server',
  version: '1.0.0',
});

server.registerTool(
  'list-docs',
  {
    title: 'List all available Regle documentation pages',
    inputSchema: z.object({
      category: z.string().optional().describe('Filter by category (e.g., "rules", "core-concepts", "introduction")'),
    }),
  },
  async ({ category }) => {
    const filteredDocs = category ? getDocsByCategory(category) : docs;
    return {
      structuredContent: {
        docs: filteredDocs.map((doc) => ({
          id: doc.id,
          title: doc.title,
        })),
      },
      content: [
        {
          type: 'text',
          text: `Here is the list of all available Regle documentation pages:`,
        },
      ],
    };
  }
);

server.registerTool(
  'get-doc',
  {
    title: 'Get the full content of a specific Regle documentation page',
    inputSchema: z.object({
      id: z.string().describe('The documentation page ID (e.g., "core-concepts-rules-built-in-rules")'),
    }),
  },
  async ({ id }) => {
    const doc = getDocById(id);

    if (!doc) {
      const availableIds = docs.map((d) => d.id).join(', ');
      return {
        content: [{ type: 'text', text: `Documentation page not found: ${id}\n\nAvailable IDs: ${availableIds}` }],
        isError: true,
      };
    }

    return {
      content: [
        {
          type: 'text',
          text: `# ${doc.title}\n\nCategory: ${doc.category}\nPath: ${doc.path}\n\n---\n\n${doc.content}`,
        },
      ],
    };
  }
);

server.registerTool(
  'search-docs',
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
            text: `No documentation found for: "${query}"\n\nTry searching for: ${categories.join(', ')}`,
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
  'get-rules-reference',
  {
    title: 'Get a quick reference of all built-in validation rules in Regle',
    inputSchema: z.object({}),
  },
  async () => {
    const rules = getRulesFromDocs();

    if (rules.length === 0) {
      return {
        content: [{ type: 'text', text: 'Built-in rules documentation not found' }],
        isError: true,
      };
    }

    const rulesList = rules.map((r) => `- \`${r.name}\`: ${r.description}`).join('\n');

    return {
      content: [
        {
          type: 'text',
          text: `# Built-in Rules

All rules are available from \`@regle/rules\`.

## Available Rules (${rules.length})

${rulesList}

## Usage Example

\`\`\`typescript
import { useRegle } from '@regle/core';
import { required, email, minLength } from '@regle/rules';

const { r$ } = useRegle(
  { email: '', password: '' },
  {
    email: { required, email },
    password: { required, minLength: minLength(8) }
  }
);
\`\`\`

Use \`get-doc\` with id \`core-concepts-rules-built-in-rules\` for full documentation.`,
        },
      ],
    };
  }
);

server.registerTool(
  'get-validation-properties',
  {
    title: 'Get documentation on all validation properties available on r$ and field objects',
    inputSchema: z.object({}),
  },
  async () => {
    const doc = getDocById('core-concepts-validation-properties');

    if (!doc) {
      return {
        content: [{ type: 'text', text: 'Validation properties documentation not found' }],
        isError: true,
      };
    }

    return {
      content: [{ type: 'text', text: `# ${doc.title}\n\n${doc.content}` }],
    };
  }
);

server.registerTool(
  'get-helpers-reference',
  {
    title: 'Get a reference of all validation helper utilities available in Regle',
    inputSchema: z.object({}),
  },
  async () => {
    const helpers = getHelpersFromDocs();

    if (helpers.length === 0) {
      return {
        content: [{ type: 'text', text: 'Validation helpers documentation not found' }],
        isError: true,
      };
    }

    const guards = helpers.filter((h) => h.category === 'guard');
    const operations = helpers.filter((h) => h.category === 'operation');
    const coerces = helpers.filter((h) => h.category === 'coerce');

    const formatHelpers = (helpers: typeof guards) =>
      helpers.map((h) => `- \`${h.name}\`: ${h.description}`).join('\n');

    return {
      content: [
        {
          type: 'text',
          text: `# Validation Helpers

All helpers are available from \`@regle/rules\`.

## Runtime and Type Guards

${formatHelpers(guards)}

## Operations Utils

${formatHelpers(operations)}

## Coerce Utils

${formatHelpers(coerces)}

## Usage Example

\`\`\`typescript
import { createRule } from '@regle/core';
import { isFilled, getSize } from '@regle/rules';

const rule = createRule({
  validator(value: unknown) {
    if (isFilled(value)) {
      return getSize(value) > 6;
    }
    return true;
  },
  message: 'Error'
});
\`\`\`

Use \`get-doc\` with id \`core-concepts-rules-validations-helpers\` for full documentation.`,
        },
      ],
    };
  }
);

server.registerTool(
  'get-useregle-guide',
  {
    title: 'Get a comprehensive guide on how to use the useRegle composable',
    inputSchema: z.object({}),
  },
  async () => {
    const doc = getDocById('core-concepts-index');

    if (!doc) {
      return {
        content: [{ type: 'text', text: 'useRegle guide not found' }],
        isError: true,
      };
    }

    return {
      content: [{ type: 'text', text: `# ${doc.title}\n\n${doc.content}` }],
    };
  }
);

// ============================================================================
// Start Server
// ============================================================================
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Regle MCP Server running on stdio');
}

main().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
