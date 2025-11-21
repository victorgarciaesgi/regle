import { setupDevtoolsPlugin as setupDevtoolsPluginApi } from '@vue/devtools-api';
import type { App } from 'vue';
import { regleDevtoolsRegistry, watchRegleInstance } from './registry';

interface InspectorNodeTag {
  label: string;
  textColor: number;
  backgroundColor: number;
}

// Helper to check if a value is a function/method
function isMethod(value: unknown): boolean {
  return typeof value === 'function';
}

// Helper to extract public properties (excluding methods and private properties)
function extractPublicProperties(obj: any, depth = 0): any {
  // Prevent infinite recursion
  if (depth > 10) return obj;

  // Handle primitives and arrays
  if (obj === null || obj === undefined || typeof obj !== 'object' || Array.isArray(obj)) {
    return obj;
  }

  const result: Record<string, any> = {};

  for (const key in obj) {
    // Skip private properties (starting with _) and methods
    // Keep $ properties as they are Regle's public API
    if (key.startsWith('_') || isMethod(obj[key])) {
      continue;
    }

    const value = obj[key];

    // Handle nested objects recursively (but not too deep)
    if (value && typeof value === 'object' && !Array.isArray(value) && depth < 3) {
      result[key] = extractPublicProperties(value, depth + 1);
    } else {
      result[key] = value;
    }
  }

  return result;
}

export function setupDevtoolsPlugin(app: App) {
  setupDevtoolsPluginApi(
    {
      id: 'regle-devtools',
      label: 'Regle',
      logo: 'https://reglejs.dev/logo_main.png',
      packageName: '@regle/core',
      homepage: 'https://reglejs.dev',
      componentStateTypes: ['Regle'],
      app,
    },
    (api) => {
      // Add custom inspector for Regle validation states
      api.addInspector({
        id: 'regle-inspector',
        label: 'Regle',
        icon: 'rule',
        treeFilterPlaceholder: 'Search Regle instances...',
      });

      // Add timeline layer for validation events
      api.addTimelineLayer({
        id: 'regle-timeline',
        label: 'Regle Events',
        color: 0x4c51bf,
      });

      // Track which instances have watchers set up
      const watchedInstances = new Set<string>();

      // Set up watchers for all instances
      const setupWatchers = () => {
        const instances = regleDevtoolsRegistry.getAll();

        instances.forEach((instance) => {
          const { r$, id } = instance;

          // Skip if already watching this instance
          if (watchedInstances.has(id)) return;

          // Watch for changes in validation state
          watchRegleInstance(id, r$ as any, () => {
            // Refresh the inspector when state changes
            api.sendInspectorState('regle-inspector');
            api.sendInspectorTree('regle-inspector');
          });

          watchedInstances.add(id);
        });
      };

      // Setup watchers for existing instances
      setupWatchers();

      // Listen for new instances being added/removed
      regleDevtoolsRegistry.onInstancesChange(() => {
        // Clean up tracking for removed instances
        const currentIds = new Set(regleDevtoolsRegistry.getAll().map((i) => i.id));
        for (const id of watchedInstances) {
          if (!currentIds.has(id)) {
            watchedInstances.delete(id);
          }
        }

        // Refresh the tree when instances change
        api.sendInspectorTree('regle-inspector');

        // Setup watchers for any new instances
        setupWatchers();
      });

      // Inspect validation trees
      api.on.getInspectorTree((payload) => {
        if (payload.inspectorId === 'regle-inspector') {
          const instances = regleDevtoolsRegistry.getAll();

          payload.rootNodes = instances.map((instance) => {
            const { r$, id, name, componentName } = instance;
            const isValid = !r$.$invalid;
            const hasErrors = r$.$error;

            const tags: InspectorNodeTag[] = [];

            if (hasErrors) {
              tags.push({
                label: 'error',
                textColor: 0xffffff,
                backgroundColor: 0xef4444,
              });
            } else if (isValid && r$.$dirty) {
              tags.push({
                label: 'valid',
                textColor: 0xffffff,
                backgroundColor: 0x10b981,
              });
            } else if (r$.$pending) {
              tags.push({
                label: 'pending',
                textColor: 0xffffff,
                backgroundColor: 0xf59e0b,
              });
            }

            if (componentName) {
              tags.push({
                label: componentName,
                textColor: 0x1f2937,
                backgroundColor: 0xe5e7eb,
              });
            }

            // Build children for fields
            const children: any[] = [];

            if (r$.$fields && typeof r$.$fields === 'object') {
              Object.entries(r$.$fields).forEach(([fieldName, fieldStatus]: [string, any]) => {
                if (fieldStatus && typeof fieldStatus === 'object') {
                  const fieldTags: InspectorNodeTag[] = [];

                  // Add status tags for fields
                  if (fieldStatus.$error) {
                    fieldTags.push({
                      label: 'error',
                      textColor: 0xffffff,
                      backgroundColor: 0xef4444,
                    });
                  } else if (!fieldStatus.$invalid && fieldStatus.$dirty) {
                    fieldTags.push({
                      label: 'valid',
                      textColor: 0xffffff,
                      backgroundColor: 0x10b981,
                    });
                  }

                  if (fieldStatus.$pending) {
                    fieldTags.push({
                      label: 'pending',
                      textColor: 0xffffff,
                      backgroundColor: 0xf59e0b,
                    });
                  }

                  if (fieldStatus.$dirty) {
                    fieldTags.push({
                      label: 'dirty',
                      textColor: 0x1f2937,
                      backgroundColor: 0xfef3c7,
                    });
                  }

                  children.push({
                    id: `${id}:field:${fieldName}`,
                    label: fieldName,
                    tags: fieldTags,
                  });
                }
              });
            }

            return {
              id,
              label: name,
              tags,
              children: children.length > 0 ? children : undefined,
            };
          });
        }
      });

      // Inspect validation state details
      api.on.getInspectorState((payload) => {
        if (payload.inspectorId === 'regle-inspector') {
          const nodeId = payload.nodeId;

          // Check if this is a field node or root node
          const isFieldNode = nodeId.includes(':field:');

          // Helper to convert object to inspector state format
          const toStateArray = (obj: any, keys: string[]): any[] => {
            return keys
              .filter((key) => key in obj && !isMethod(obj[key]))
              .map((key) => ({
                key,
                value: obj[key],
                editable: false,
              }));
          };

          // Helper to get remaining properties not in the priority list
          const getRemainingProperties = (obj: any, excludeKeys: string[]): any[] => {
            return Object.entries(obj)
              .filter(
                ([key]) =>
                  !excludeKeys.includes(key) && !key.startsWith('_') && key.startsWith('$') && !isMethod(obj[key])
              )
              .map(([key, value]) => ({
                key,
                value: value,
                editable: false,
              }));
          };

          if (isFieldNode) {
            // Extract instance ID and field name from node ID
            const [instanceId, , fieldName] = nodeId.split(':');
            const instance = regleDevtoolsRegistry.get(instanceId);

            if (!instance || !instance.r$.$fields) return;

            const fieldStatus = instance.r$.$fields[fieldName];
            if (!fieldStatus) return;

            const fieldStatusAny = fieldStatus as any;

            // Priority properties for fields
            const priorityKeys = ['$value', '$invalid', '$dirty', '$error', '$pending', '$errors'];
            const priorityProperties = toStateArray(fieldStatusAny, priorityKeys);

            // Get remaining properties
            const remainingProperties = getRemainingProperties(fieldStatusAny, [...priorityKeys, '$rules', '$fields']);

            // Show rules separately
            const rulesSection: any[] = [];
            if (fieldStatusAny.$rules && typeof fieldStatusAny.$rules === 'object') {
              Object.entries(fieldStatusAny.$rules).forEach(([ruleName, ruleStatus]: [string, any]) => {
                if (ruleStatus && typeof ruleStatus === 'object') {
                  const ruleProps = extractPublicProperties(ruleStatus);
                  rulesSection.push({
                    key: ruleName,
                    value: ruleProps,
                    editable: false,
                  });
                }
              });
            }

            const state: any = {};

            if (priorityProperties.length > 0) {
              state['State'] = priorityProperties;
            }

            if (remainingProperties.length > 0) {
              state['Other Properties'] = remainingProperties;
            }

            if (rulesSection.length > 0) {
              state['Rules'] = rulesSection;
            }

            payload.state = state;
          } else {
            // Root instance node
            const instance = regleDevtoolsRegistry.get(nodeId);

            if (!instance) return;

            const { r$ } = instance;

            // Priority properties for root
            const priorityKeys = ['$invalid', '$dirty', '$error', '$pending', '$valid', '$ready'];
            const priorityProperties = toStateArray(r$ as any, priorityKeys);

            // Get remaining properties (excluding $fields)
            const remainingProperties = getRemainingProperties(r$ as any, [...priorityKeys, '$fields']);

            const state: any = {};

            if (priorityProperties.length > 0) {
              state['State'] = priorityProperties;
            }

            if (remainingProperties.length > 0) {
              state['Other Properties'] = remainingProperties;
            }

            payload.state = state;
          }
        }
      });
    }
  );
}
