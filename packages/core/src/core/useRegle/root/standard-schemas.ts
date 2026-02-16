import type { StandardSchemaV1 } from '@standard-schema/spec';
import type { $InternalRegleResult } from '../../../types';
import { flatErrors } from '../useErrors';

export function createStandardSchema(
  validateFn: (value: any, overrideSchemaMode?: boolean) => Promise<$InternalRegleResult>
): StandardSchemaV1 {
  return {
    '~standard': {
      version: 1,
      vendor: 'regle',
      validate: async (value: any) => {
        const { valid, data, errors } = await validateFn(value, true);
        if (valid) {
          return { value: data, issues: [] };
        }
        return { issues: flatErrors(errors, { includePath: true }) };
      },
    } as const,
  };
}
