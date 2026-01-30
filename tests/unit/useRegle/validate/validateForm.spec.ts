import {
  useCollectScope,
  type InferRegleValidationResult,
  type MaybeOutput,
  type RegleRoot,
  type RegleStatus,
  type SuperCompatibleRegleRoot,
} from '@regle/core';
import { nextTick, unref, type MaybeRef } from 'vue';
import { createRegleComponent } from '../../../utils/test.utils';
import { simpleNestedStateWithMixedValidation } from './fixtures';

/**
 * Validate a form and scroll to the first error if it exists.
 *
 * @param r$ - The Regle root instance.
 * @param [options] - The options for the validation.
 * @returns The validation result and the type safe data.
 *
 * @usage
 * ```ts
 * const {valid, data} = await validateForm(r$); // Validate the form and scroll to the first error if it exists.
 *
 * const {valid, data} = await validateForm(r$, {formId: 'my-form-id'}); // Scoped to a form container
 * ```
 *
 * @link https://reglejs.dev/core-concepts/type-safe-output
 *
 */
async function validateForm<TRegle extends SuperCompatibleRegleRoot>(
  r$: MaybeRef<TRegle>
): Promise<InferRegleValidationResult<TRegle>> {
  const regle = unref(r$) as unknown as RegleRoot<any, any, any, any> | RegleStatus<any, any, any>;
  try {
    const { valid, data, errors, issues } = await regle.$validate();
    await nextTick();
    const isDomValid = true;

    if (!valid || !isDomValid) {
      return { valid: false, data, issues, errors } as InferRegleValidationResult<TRegle>;
    }

    return { valid: true, data, errors, issues } as InferRegleValidationResult<TRegle>;
  } catch {
    return {
      valid: false,
      data: regle.$value,
      errors: {},
      issues: {},
    } as unknown as InferRegleValidationResult<TRegle>;
  }
}

describe('validateForm', () => {
  it('should validate a form', async () => {
    const { vm } = createRegleComponent(simpleNestedStateWithMixedValidation);
    const { valid, data } = await validateForm(vm.r$);
    if (valid) {
      expectTypeOf(data).toEqualTypeOf<{
        email: string;
        date?: Date | undefined;
        maybeUndefined?: number | undefined;
        user: {
          lastName?: string | undefined;
          firstName: string;
        };
        file: File;
        contacts: {
          name: string;
        }[];
        collection: {
          name: string;
        }[];
        address: {
          street?: string | undefined;
          city?: string | undefined;
        };
        booleanField: boolean;
      }>();
    } else {
      expectTypeOf(data).toEqualTypeOf<{
        email?: MaybeOutput<string>;
        date?: MaybeOutput<Date>;
        maybeUndefined?: MaybeOutput<number>;
        user?: {
          firstName?: MaybeOutput<string>;
          lastName?: MaybeOutput<string>;
        };
        file?: MaybeOutput<File>;
        contacts?: {
          name?: MaybeOutput<string>;
        }[];
        collection?: {
          name?: MaybeOutput<string>;
        }[];
        address?: {
          street?: MaybeOutput<string>;
          city?: MaybeOutput<string>;
        };
        booleanField?: MaybeOutput<boolean>;
      }>();
    }
  });

  it('should accept scoped regle root', async () => {
    const { r$ } = useCollectScope<{ email: string }[]>();

    const { valid, data } = await validateForm(r$);
    if (valid) {
      expectTypeOf(data).toEqualTypeOf<{ email: string }[]>();
    } else {
      expectTypeOf(data).toEqualTypeOf<{ email?: MaybeOutput<string> }[]>();
    }
  });
});
