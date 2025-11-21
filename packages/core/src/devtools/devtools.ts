import { setupDevtoolsPlugin as setupDevtoolsPluginApi } from '@vue/devtools-api';
import type { App } from 'vue';
import { regleDevtoolsRegistry, watchRegleInstance } from './registry';
import { COLORS, INSPECTOR_IDS } from './constants';
import { buildInspectorTree } from './tree-builder';
import { buildInspectorState } from './state-builder';

/**
 * Setup the Regle DevTools plugin
 * Integrates with Vue DevTools to provide inspection of validation instances
 */
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
      // Register custom inspector
      api.addInspector({
        id: INSPECTOR_IDS.INSPECTOR,
        label: 'Regle',
        icon: 'rule',
        treeFilterPlaceholder: 'Search Regle instances...',
        nodeActions: [
          {
            icon: 'check_circle',
            tooltip: 'Validate (with `$validate`)',
            action: (nodeId) => {
              handleValidateAction(nodeId, api);
            },
          },
          {
            icon: 'refresh',
            tooltip: 'Reset validation state (with `$reset`)',
            action: (nodeId) => {
              handleResetAction(nodeId, api);
            },
          },
          {
            icon: 'restore',
            tooltip: 'Restore to initial state (with `$reset`)',
            action: (nodeId) => {
              handleResetAction(nodeId, api, true);
            },
          },
        ],
      });

      // Register timeline layer
      api.addTimelineLayer({
        id: INSPECTOR_IDS.TIMELINE,
        label: 'Regle Events',
        color: COLORS.TIMELINE,
      });

      // Setup reactive watchers for all instances
      setupInstanceWatchers(api);

      // Handle tree view updates
      api.on.getInspectorTree((payload) => {
        if (payload.inspectorId === INSPECTOR_IDS.INSPECTOR) {
          const instances = regleDevtoolsRegistry.getAll();
          payload.rootNodes = buildInspectorTree(instances);
        }
      });

      // Handle state view updates
      api.on.getInspectorState((payload) => {
        if (payload.inspectorId === INSPECTOR_IDS.INSPECTOR) {
          const state = buildInspectorState(payload.nodeId, (id) => regleDevtoolsRegistry.get(id));

          if (state) {
            payload.state = state;
          }
        }
      });
    }
  );
}

/**
 * Resolve a field by path (supports nested fields and collections)
 */
function resolveFieldByPath(fields: any, path: string): any {
  if (!fields || !path) return null;

  const segments = path.match(/[^.\[\]]+/g);
  if (!segments) return null;

  let current = fields;

  for (const segment of segments) {
    if (!current) return null;

    const index = parseInt(segment, 10);
    if (!isNaN(index)) {
      // Array index
      if (current.$each && Array.isArray(current.$each)) {
        current = current.$each[index];
      } else {
        return null;
      }
    } else {
      // Property name
      if (current.$fields && current.$fields[segment]) {
        current = current.$fields[segment];
      } else if (current[segment]) {
        current = current[segment];
      } else {
        return null;
      }
    }
  }

  return current;
}

/**
 * Handle validate action for an instance or field
 */
function handleValidateAction(nodeId: string, api: any) {
  const isFieldNode = nodeId.includes(':field:');

  if (isFieldNode) {
    // Validate specific field (may be nested or collection item)
    const [instanceId, , fieldPath] = nodeId.split(':');
    const instance = regleDevtoolsRegistry.get(instanceId);

    if (instance && instance.r$.$fields) {
      const fieldStatus = resolveFieldByPath(instance.r$.$fields, fieldPath);
      if (fieldStatus && typeof fieldStatus.$validate === 'function') {
        fieldStatus.$validate();
      }
    }
  } else {
    // Validate entire instance
    const instance = regleDevtoolsRegistry.get(nodeId);

    if (instance && typeof instance.r$.$validate === 'function') {
      instance.r$.$validate();
    }
  }

  // Refresh DevTools after a short delay to show updated state
  setTimeout(() => {
    api.sendInspectorState(INSPECTOR_IDS.INSPECTOR);
    api.sendInspectorTree(INSPECTOR_IDS.INSPECTOR);
  }, 100);
}

/**
 * Handle reset action for an instance or field
 */
function handleResetAction(nodeId: string, api: any, resetState = false) {
  const isFieldNode = nodeId.includes(':field:');

  if (isFieldNode) {
    // Reset specific field (may be nested or collection item)
    const [instanceId, , fieldPath] = nodeId.split(':');
    const instance = regleDevtoolsRegistry.get(instanceId);

    if (instance && instance.r$.$fields) {
      const fieldStatus = resolveFieldByPath(instance.r$.$fields, fieldPath);
      if (fieldStatus && typeof fieldStatus.$reset === 'function') {
        fieldStatus.$reset({ toInitialState: resetState });
      }
    }
  } else {
    // Reset entire instance
    const instance = regleDevtoolsRegistry.get(nodeId);

    if (instance && typeof instance.r$.$reset === 'function') {
      instance.r$.$reset({ toInitialState: resetState });
    }
  }

  // Refresh DevTools after a short delay to show updated state
  setTimeout(() => {
    api.sendInspectorState(INSPECTOR_IDS.INSPECTOR);
    api.sendInspectorTree(INSPECTOR_IDS.INSPECTOR);
  }, 100);
}

/**
 * Setup watchers for all Regle instances to trigger devtools updates
 */
function setupInstanceWatchers(api: any) {
  const watchedInstances = new Set<string>();

  const setupWatchers = () => {
    const instances = regleDevtoolsRegistry.getAll();

    instances.forEach((instance) => {
      const { r$, id } = instance;

      // Skip if already watching this instance
      if (watchedInstances.has(id)) return;

      // Watch for changes in validation state
      watchRegleInstance(id, r$ as any, () => {
        // Refresh the inspector when state changes
        api.sendInspectorState(INSPECTOR_IDS.INSPECTOR);
        api.sendInspectorTree(INSPECTOR_IDS.INSPECTOR);
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
    api.sendInspectorTree(INSPECTOR_IDS.INSPECTOR);

    // Setup watchers for any new instances
    setupWatchers();
  });
}
