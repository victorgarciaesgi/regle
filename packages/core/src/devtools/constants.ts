export const COLORS = {
  ERROR: {
    text: 0xffffff,
    bg: 0xef4444,
  },
  INVALID: {
    text: 0xffffff,
    bg: 0xff8c00,
  },
  CORRECT: {
    text: 0xffffff,
    bg: 0x10b981,
  },
  VALID: {
    text: 0xffffff,
    bg: 0x047857,
  },
  PENDING: {
    text: 0xffffff,
    bg: 0xf59e0b,
  },
  DIRTY: {
    text: 0x1f2937,
    bg: 0xfef3c7,
  },
  COMPONENT: {
    text: 0xffffff,
    bg: 0x6366f1,
  },
  PRISTINE: {
    text: 0x111827,
    bg: 0xffffff,
  },
  INACTIVE: {
    text: 0x000000,
    bg: 0xb0b6be,
  },
  OPTIONAL: {
    text: 0x000000,
    bg: 0xb0b6be,
  },
  DISABLED: {
    text: 0xef4444,
    bg: 0xe5e7eb,
  },
} as const;

export const TOOLTIP_LABELS_FIELDS = {
  PRISTINE: 'Field is not touched yet',
  DIRTY: 'Field have been touched',
  ERROR: 'Field has errors',
  CORRECT: 'Field is dirty and all actives rules are valid',
  VALID: 'Field rules are all valid',
  PENDING: 'Field is pending',
  INACTIVE: 'Field is inactive',
  OPTIONAL: 'Field is not required',
  DISABLED: 'Validation reactivity is paused by the disabled modifier',
} as const;

export const TOOLTIP_LABELS_NESTED = {
  DIRTY: 'All nested fields have been touched',
  ERROR: 'Some nested fields have errors',
  CORRECT: 'All nested fields are correct',
  PENDING: 'Some nested fields are pending',
} as const;

export const TOOLTIP_LABELS_RULES = {
  INACTIVE: 'The rule is not active',
  INVALID: 'Rule is invalid',
  VALID: 'Rule is valid',
  PENDING: 'Rule validator is pending',
} as const;

export const PRIORITY_KEYS = {
  ROOT: ['$invalid', '$dirty', '$error', '$pending', '$valid', '$ready'],
  FIELD: ['$value', '$invalid', '$dirty', '$error', '$pending', '$errors'],
} as const;

export const INSPECTOR_IDS = {
  INSPECTOR: 'regle-inspector',
  COMPONENTS: 'components',
  TIMELINE: 'regle-timeline',
} as const;
