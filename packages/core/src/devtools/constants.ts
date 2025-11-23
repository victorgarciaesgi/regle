export const COLORS = {
  ERROR: {
    text: 0xffffff,
    bg: 0xef4444,
  },
  INVALID: {
    text: 0xffffff,
    bg: 0xff8c00,
  },
  VALID: {
    text: 0xffffff,
    bg: 0x10b981,
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
} as const;

export const PRIORITY_KEYS = {
  ROOT: ['$invalid', '$dirty', '$error', '$pending', '$valid', '$ready'],
  FIELD: ['$value', '$invalid', '$dirty', '$error', '$pending', '$errors'],
} as const;

export const INSPECTOR_IDS = {
  INSPECTOR: 'regle-inspector',
  TIMELINE: 'regle-timeline',
} as const;
