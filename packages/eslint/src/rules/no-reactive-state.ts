import { ESLintUtils } from '@typescript-eslint/utils';

const createRule = ESLintUtils.RuleCreator((name) => `https://reglejs.dev/eslint/${name}`);

type MessageIds = 'no-reactive-state';

export const noReactiveState = createRule<[], MessageIds>({
  name: 'no-reactive-state',
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow passing reactive() state to useRegle. Use ref() or plain objects instead.',
    },
    messages: {
      'no-reactive-state': 'Do not pass reactive() state to useRegle. Use ref() or a plain object instead.',
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    const reactiveVariables = new Set<string>();

    return {
      // Track variables initialized with reactive()
      VariableDeclarator(node) {
        if (
          node.init &&
          node.init.type === 'CallExpression' &&
          node.init.callee.type === 'Identifier' &&
          node.init.callee.name === 'reactive' &&
          node.id.type === 'Identifier'
        ) {
          reactiveVariables.add(node.id.name);
        }
      },

      // Check useRegle calls
      CallExpression(node) {
        if (node.callee.type === 'Identifier' && node.callee.name === 'useRegle' && node.arguments.length > 0) {
          const firstArg = node.arguments[0];

          // Check if first argument is a reactive variable
          if (firstArg.type === 'Identifier' && reactiveVariables.has(firstArg.name)) {
            context.report({
              node: firstArg,
              messageId: 'no-reactive-state',
            });
          }
        }
      },
    };
  },
});
