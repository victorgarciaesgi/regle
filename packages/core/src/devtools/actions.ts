import { INSPECTOR_IDS } from './constants';
import { regleDevtoolsRegistry } from './registry';
import { resolveFieldByPath } from './state-builder';
import type { DevtoolsV6PluginAPI } from './types';
import { parseFieldNodeId } from './utils';
import type { DevToolsV6PluginAPIHookPayloads } from '@vue/devtools-kit';

export function handleValidateAction(nodeId: string, api: DevtoolsV6PluginAPI) {
  if (nodeId.includes(':rule:')) {
    return;
  }

  const fieldInfo = parseFieldNodeId(nodeId);
  if (fieldInfo) {
    const { instanceId, fieldName } = fieldInfo;
    const instance = regleDevtoolsRegistry.get(instanceId);

    if (instance && instance.r$.$fields) {
      const fieldStatus = resolveFieldByPath(instance.r$.$fields, fieldName);
      if (fieldStatus && typeof fieldStatus.$validate === 'function') {
        fieldStatus.$validate();
      }
    }
  } else {
    const instance = regleDevtoolsRegistry.get(nodeId);

    if (instance && typeof instance.r$.$validate === 'function') {
      instance.r$.$validate();
    }
  }

  emitInspectorState(api);
}

export async function handleResetAction(nodeId: string, api: DevtoolsV6PluginAPI, resetState = false) {
  const fieldInfo = parseFieldNodeId(nodeId);

  if (fieldInfo) {
    const { instanceId, fieldName } = fieldInfo;
    const instance = regleDevtoolsRegistry.get(instanceId);

    if (instance && instance.r$.$fields) {
      const fieldStatus = resolveFieldByPath(instance.r$.$fields, fieldName);
      if (fieldStatus && typeof fieldStatus.$reset === 'function') {
        fieldStatus.$reset({ toOriginalState: resetState });
      }
    }
  } else {
    const instance = regleDevtoolsRegistry.get(nodeId);

    if (instance && typeof instance.r$.$reset === 'function') {
      instance.r$.$reset({ toOriginalState: resetState });
    }
  }
}

export function handleEditInspectorState(payload: DevToolsV6PluginAPIHookPayloads['editInspectorState']) {
  const { nodeId, path, state } = payload;

  if (!path.includes('$value')) {
    return;
  }

  const fieldInfo = parseFieldNodeId(nodeId);
  if (!fieldInfo) {
    return;
  }

  const [instanceId, _, fieldPath] = nodeId?.split(':');
  const instance = regleDevtoolsRegistry.get(instanceId);

  if (instance && instance.r$.$fields) {
    const fieldStatus = resolveFieldByPath(instance.r$.$fields, fieldPath);

    if (fieldStatus && '$value' in fieldStatus) {
      fieldStatus.$value = state.value;
    }
  }
}

export async function emitInspectorState(api: DevtoolsV6PluginAPI) {
  api.sendInspectorState(INSPECTOR_IDS.INSPECTOR);
  api.sendInspectorTree(INSPECTOR_IDS.INSPECTOR);
}
