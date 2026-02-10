import { useRegle, type MaybeOutput } from '@regle/core';
import { dateBefore, minLength, required } from '@regle/rules';
import type { StandardSchemaV1 } from '@standard-schema/spec';
import { createRegleComponent } from '../../utils/test.utils';

describe('standard schema', () => {
  function simpleValidation() {
    return useRegle(
      {
        level0: {
          level1: { name: '' },
          level2: '',
        },
        collection: [{ name: '' }],
        testDate: null as Date | null,
        testFile: null as File | null,
      },
      {
        level0: {
          level1: { name: { required } },
          level2: { minLength: minLength(3) },
        },
        collection: {
          $each: {
            name: { required },
          },
        },
        testDate: { required, dateBefore: dateBefore(new Date(2000, 1, 1), { allowEqual: false }) },
        testFile: {},
      }
    );
  }
  it('should be able to validate', () => {
    const { vm } = createRegleComponent(simpleValidation);

    type InputData = StandardSchemaV1.InferInput<typeof vm.r$>;
    type OutputData = StandardSchemaV1.InferOutput<typeof vm.r$>;

    expectTypeOf<InputData>().toEqualTypeOf<{
      level0: {
        level1: { name: string };
        level2: string;
      };
      collection: { name: string }[];
      testDate: Date | null;
      testFile: File | null;
    }>();

    expectTypeOf<OutputData>().toEqualTypeOf<{
      level0: {
        level1: { name: string };
        level2?: MaybeOutput<string>;
      };
      collection: { name: string }[];
      testDate: Date;
      testFile?: MaybeOutput<File>;
    }>();
  });
});
