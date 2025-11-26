import type { RegleSchemaCollectionStatus, RegleSchemaFieldStatus, RegleSchemaStatus } from './types';

declare module '@regle/core' {
  export interface NarrowVariantExtracts {
    'regle-schemas-status': RegleSchemaStatus<any, any>;
    'regle-schemas-collection-status': RegleSchemaCollectionStatus<any, any>;
  }
  interface NarrowVariantFieldExtracts<T extends unknown> {
    'regle-schemas-field-status': RegleSchemaFieldStatus<T, any>;
  }
}

export {};
