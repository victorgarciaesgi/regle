import { useRegle, type Maybe } from '@regle/core';
import { minLength, required, email } from '@regle/rules';
import { nextTick, ref } from 'vue';
import { createRegleComponent } from '../../../utils/test.utils';

describe('Large forms performance', () => {
  it('should handle a form with 100 fields efficiently', async () => {
    const FIELD_COUNT = 100;

    function largeFormValidation() {
      const formData: Record<string, string> = {};
      const rules: Record<string, { required: typeof required; minLength: ReturnType<typeof minLength> }> = {};

      for (let i = 0; i < FIELD_COUNT; i++) {
        formData[`field${i}`] = '';
        rules[`field${i}`] = {
          required,
          minLength: minLength(3),
        };
      }

      const form = ref(formData);
      return useRegle(form, rules);
    }

    const startTime = performance.now();
    const { vm } = createRegleComponent(largeFormValidation);
    const initTime = performance.now() - startTime;

    expect(initTime).toBeLessThan(500);

    expect(Object.keys(vm.r$.$fields).length).toBe(FIELD_COUNT);

    const validateStart = performance.now();
    await vm.r$.$validate();
    const validateTime = performance.now() - validateStart;

    expect(validateTime).toBeLessThan(200);

    expect(vm.r$.$error).toBe(true);

    const updateStart = performance.now();
    for (let i = 0; i < FIELD_COUNT; i++) {
      vm.r$.$value[`field${i}`] = `value${i}`;
    }
    await nextTick();
    const updateTime = performance.now() - updateStart;

    expect(updateTime).toBeLessThan(500);

    const resetStart = performance.now();
    vm.r$.$reset({ toInitialState: true });
    await nextTick();
    const resetTime = performance.now() - resetStart;

    expect(resetTime).toBeLessThan(200);
  });

  it('should handle deeply nested form structures', async () => {
    function deeplyNestedFormValidation() {
      const form = ref({
        level1: {
          level2: {
            level3: {
              level4: {
                level5: {
                  value: '',
                },
              },
            },
          },
        },
      });

      return useRegle(form, {
        level1: {
          level2: {
            level3: {
              level4: {
                level5: {
                  value: { required, minLength: minLength(5) },
                },
              },
            },
          },
        },
      });
    }

    const startTime = performance.now();
    const { vm } = createRegleComponent(deeplyNestedFormValidation);
    const initTime = performance.now() - startTime;

    expect(initTime).toBeLessThan(100);

    expect(vm.r$.level1.level2.level3.level4.level5.value.$invalid).toBe(true);

    vm.r$.$value.level1.level2.level3.level4.level5.value = 'hello';
    await nextTick();

    expect(vm.r$.level1.level2.level3.level4.level5.value.$invalid).toBe(false);
  });

  it('should handle fields with many validation rules', async () => {
    function manyRulesValidation() {
      const form = ref({
        email: '',
      });

      return useRegle(form, {
        email: {
          required,
          email,
          minLength: minLength(5),
          hasAt: (value: Maybe<string>) => !value || value.includes('@'),
          hasDot: (value: Maybe<string>) => !value || value.includes('.'),
          notTest: (value: Maybe<string>) => !value || !value.includes('test'),
          notExample: (value: Maybe<string>) => !value || !value.includes('example'),
          maxWords: (value: Maybe<string>) => !value || value.split(' ').length <= 3,
        },
      });
    }

    const { vm } = createRegleComponent(manyRulesValidation);

    expect(Object.keys(vm.r$.email.$rules).length).toBe(8);

    vm.r$.$value.email = 'x';
    await nextTick();
    vm.r$.$touch();

    expect(vm.r$.email.$errors.length).toBeGreaterThan(0);

    vm.r$.$value.email = 'valid@domain.com';
    await nextTick();

    expect(vm.r$.email.$invalid).toBe(false);
  });
});
