import type { RegleRuleDefinition } from '@regle/core';
import { createRule, RegleVuePlugin, useRegle } from '@regle/core';
import { flushPromises, mount } from '@vue/test-utils';
import { defineComponent, nextTick, ref } from 'vue';
import { createRegleComponent } from '../../../../../tests/utils/test.utils';
import { alpha, minLength, required, requiredIf, url } from '../../rules';
import { applyIf } from '../applyIf';
import { isFilled } from '../ruleHelpers';

describe('applyIf helper', () => {
  const testComponent = defineComponent({
    setup() {
      const checkPseudo = ref(true);
      const form = ref({
        email: '',
        count: 0,
        pseudoAsync: '',
      });

      const asyncRule = createRule({
        validator: async (value) => {
          return new Promise<boolean>((resolve) => {
            setTimeout(() => {
              resolve(isFilled(value));
            }, 200);
          });
        },
        message: 'Create rule async',
      });

      const { r$ } = useRegle(form, () => ({
        email: {
          error: applyIf(() => form.value.count === 1, required),
          foo: applyIf(false, alpha),
          $autoDirty: false,
        },
        pseudoAsync: {
          error: applyIf(checkPseudo, asyncRule),
        },
      }));

      return { r$, checkPseudo };
    },
    template: '<div></div>',
  });

  beforeAll(() => {
    vi.useFakeTimers();
  });

  afterAll(() => {
    vi.useRealTimers();
  });

  const { vm } = mount(testComponent, {
    global: {
      plugins: [RegleVuePlugin],
    },
  });

  it('should return empty errors', () => {
    expect(vm.r$.$errors.email).toStrictEqual([]);
  });

  it('should be valid when touching field', async () => {
    vm.r$.email.$touch();
    await nextTick();
    expect(vm.r$.$errors.email).toStrictEqual([]);
    expect(vm.r$.$error).toBe(false);
  });

  it('should correctly keep async handlers', async () => {
    vm.r$.$value.pseudoAsync = 'foo';
    await nextTick();
    await vi.advanceTimersByTimeAsync(200);
    expect(vm.r$.pseudoAsync.$pending).toBe(true);
    await vi.advanceTimersByTimeAsync(200);
    await nextTick();
    await flushPromises();
    expect(vm.r$.pseudoAsync.$error).toBe(false);
    expect(vm.r$.$errors.pseudoAsync).toStrictEqual([]);
  });

  it('should be invalid when touching activating helper', async () => {
    vm.r$.$value.count = 1;
    await nextTick();
    expect(vm.r$.$errors.email).toStrictEqual(['This field is required']);
    expect(vm.r$.$error).toBe(true);
  });

  it('should work correctly with requiredIf rule', async () => {
    const { vm } = createRegleComponent(() => {
      const form = ref({
        name: '',
        applyCondition: false,
        requiredCondition: false,
      });

      return useRegle(form, () => ({
        name: {
          required: applyIf(
            () => form.value.applyCondition,
            requiredIf(() => form.value.requiredCondition)
          ),
        },
      }));
    });

    expect(vm.r$.$errors.name).toStrictEqual([]);
    expect(vm.r$.$error).toBe(false);

    vm.r$.name.$touch();
    await nextTick();

    expect(vm.r$.$errors.name).toStrictEqual([]);
    expect(vm.r$.$error).toBe(false);

    vm.r$.$value.requiredCondition = true;
    await nextTick();

    expect(vm.r$.$errors.name).toStrictEqual([]);
    expect(vm.r$.$error).toBe(false);

    vm.r$.$value.applyCondition = true;
    await nextTick();

    expect(vm.r$.$errors.name).toStrictEqual(['This field is required']);
    expect(vm.r$.$error).toBe(true);

    vm.r$.$value.requiredCondition = false;
    await nextTick();

    expect(vm.r$.$errors.name).toStrictEqual([]);
    expect(vm.r$.$error).toBe(false);

    vm.r$.$value.requiredCondition = true;
    vm.r$.$value.name = 'hello';
    await nextTick();

    expect(vm.r$.$errors.name).toStrictEqual([]);
    expect(vm.r$.$error).toBe(false);
  });

  it('should not add too much params other validators using it', async () => {
    const { vm } = createRegleComponent(() => {
      const form = ref({
        email: '',
        name: '',
        count: 0,
        field: '',
        url: '',
      });

      return useRegle(form, () => ({
        email: {
          error: applyIf(form.value.count === 1, required),
        },
        name: {
          error: applyIf(form.value.count === 1, (value) => required.exec(value)),
        },
        field: {
          error: applyIf(form.value.count === 1, minLength(3)),
        },
        url: {
          url: applyIf(form.value.count === 1, url),
        },
      }));
    });

    expect(vm.r$.email.$rules.error.$params).toStrictEqual([false]);
    expect(vm.r$.name.$rules.error.$params).toStrictEqual([false]);
    expect(vm.r$.field.$rules.error.$params).toStrictEqual([3, false]);
    expect(vm.r$.url.$rules.url.$params).toStrictEqual([false]);

    vm.r$.count.$value = 1;

    await vm.$nextTick();

    expect(vm.r$.email.$rules.error.$params).toStrictEqual([true]);
    expect(vm.r$.name.$rules.error.$params).toStrictEqual([true]);
    expect(vm.r$.field.$rules.error.$params).toStrictEqual([3, true]);
    expect(vm.r$.url.$rules.url.$params).toStrictEqual([true]);
  });

  it('should have correct types', () => {
    expectTypeOf(applyIf(() => true, required)).toEqualTypeOf<
      RegleRuleDefinition<'required', unknown, [condition: boolean], false, boolean, unknown>
    >();

    expectTypeOf(
      applyIf(
        () => true,
        async () => true
      )
    ).toEqualTypeOf<RegleRuleDefinition<'applyIf', unknown, [condition: boolean], true, boolean, unknown>>();

    const metadatarule = applyIf(
      () => true,
      () => ({ $valid: true, foo: 'bar' })
    );
    expectTypeOf(metadatarule).toEqualTypeOf<
      RegleRuleDefinition<
        'applyIf',
        unknown,
        [condition: boolean],
        false,
        {
          $valid: true;
          foo: string;
        },
        unknown,
        unknown
      >
    >();
  });
});
