import { useRegle, type InferSafeOutput, type InferValidOutput, type MaybeOutput } from '@regle/core';
import { email, minLength, required } from '@regle/rules';
import { mount } from '@vue/test-utils';
import { defineComponent, ref, toRef } from 'vue';
import { createRegleComponent } from '../../../utils/test.utils';
import { simpleNestedStateWithMixedValidation } from './fixtures';

describe('$validate', () => {
  it('should have a deep safe form if the result is true', async () => {
    const { vm } = createRegleComponent(simpleNestedStateWithMixedValidation);

    const { valid, data } = await vm.r$.$validate();

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
          name?: MaybeOutput<string>;
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

    // InferSafeOutput type

    expectTypeOf<InferSafeOutput<typeof vm.r$>>().toEqualTypeOf<{
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
        name?: MaybeOutput<string>;
      }[];
      address: {
        street?: string | undefined;
        city?: string | undefined;
      };
      booleanField: boolean;
    }>();

    expectTypeOf<InferValidOutput<typeof vm.r$>>().toEqualTypeOf<{
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
        name?: MaybeOutput<string>;
      }[];
      address: {
        street?: string | undefined;
        city?: string | undefined;
      };
      booleanField: boolean;
    }>();

    const { r$ } = useRegle(
      { name: '', email: '' },
      {
        name: { required, minLength: minLength(4) },
        email: { email },
      }
    );

    const result = await r$.$validate();
    if (result.valid) {
      expectTypeOf(result.data.name).toEqualTypeOf<string>();
      expectTypeOf(result.data.email).toEqualTypeOf<string | undefined>();
    }
  });

  it.skipIf(process.env.VUE_VERSION === '3.4')('should work with race conditions on value update', async () => {
    const ChildComponent = defineComponent({
      template: `<div>
        <input id="email" type="text" :value="modelValue" @input="$emit('update:modelValue', $event.target.value)" />
      </div>`,
      props: { modelValue: { type: String, required: true } },
      emits: ['update:modelValue'],
      setup(props, { expose }) {
        const modelValue = toRef(props, 'modelValue');
        const { r$ } = useRegle(modelValue, { email });

        expose({ r$ });
        return { r$ };
      },
    });

    let confirmResolve: ((value: boolean | PromiseLike<boolean>) => void) | null = null;

    function waitUntilEventHappens() {
      return new Promise((resolve) => {
        confirmResolve = resolve;
      });
    }

    const testComponent = defineComponent({
      template: `<div>
        <ChildComponent ref="childRef" v-model="emailModel" @update:model-value="updateEmail" />
      </div>`,
      components: { ChildComponent },
      setup() {
        const childRef = ref<InstanceType<typeof ChildComponent>>();
        const emailModel = ref('');
        const isMailValid = ref(false);

        async function updateEmail() {
          if (!childRef.value) return;

          const { valid } = await childRef.value.r$.$validate();
          isMailValid.value = valid;
          confirmResolve?.(valid);
        }

        return { updateEmail, childRef, emailModel, isMailValid };
      },
    });
    const wrapper = mount(testComponent);

    const emailInput = wrapper.find('#email');
    await emailInput.setValue('test');
    await waitUntilEventHappens();
    expect(wrapper.vm.isMailValid).toBe(false);

    await emailInput.setValue('test@test.com');
    await waitUntilEventHappens();
    expect(wrapper.vm.isMailValid).toBe(true);
  });
});
