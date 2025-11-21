/**
 * Regle DevTools
 *
 * This module provides Vue DevTools integration for Regle validation instances.
 * It enables real-time inspection of validation state through the browser's DevTools.
 *
 * @module devtools
 */

// Main exports
export { setupDevtoolsPlugin } from './devtools';
export { RegleVuePlugin } from './plugin';
export { registerRegleInstance } from './registry';

// Types (for advanced usage)
export type { InspectorNodeTag, InspectorTreeNode, InspectorStateItem, InspectorState } from './types';
export type { RegleInstance } from './registry';
