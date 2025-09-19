import type { $InternalRegleResult, RegleStandardSchema } from '../../../types';
import { flatErrors } from '../useErrors';

export function createStandardSchema(validateFn: (value: any) => Promise<$InternalRegleResult>): RegleStandardSchema {
  return {
    '~standard': {
      version: 1,
      vendor: 'regle',
      validate: async (value: any) => {
        const { valid, data, errors } = await validateFn(value);
        if (valid) {
          return { value: data, issues: [] };
        }
        return { issues: flatErrors(errors, { includePath: true }) };
      },
    } as const,
  };
}
