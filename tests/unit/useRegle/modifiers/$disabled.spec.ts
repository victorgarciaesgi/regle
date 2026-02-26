import { useRegle } from '@regle/core';
import { required } from '@regle/rules';
import { inferSchema, useRegleSchema } from '@regle/schemas';
import { nextTick, ref } from 'vue';
import { z } from 'zod/v3';
import { createRegleComponent } from '../../../utils/test.utils';
import { shouldBeErrorField, shouldBeInvalidField, shouldBeValidField } from '../../../utils/validations.utils';

describe('$disabled', () => {
  it('should stop watchers for useRegle while keeping the instance defined', async () => {
    function regleFixture() {
      const disabled = ref(true);
      const form = ref({ name: '' });

      return {
        disabled,
        ...useRegle(form, { name: { required } }, { disabled }),
      };
    }

    const { vm } = createRegleComponent(regleFixture);
    await nextTick();

    expect(vm.r$).toBeDefined();
    expect(vm.r$.name).toBeDefined();
    shouldBeInvalidField(vm.r$.name);

    vm.r$.$value.name = 'foo';
    await nextTick();

    // Disabled means watchers are stopped: value changes, status does not.
    expect(vm.r$.name.$value).toBe('foo');
    shouldBeInvalidField(vm.r$.name);

    vm.disabled = false;
    await nextTick();

    vm.r$.name.$touch();
    await nextTick();

    shouldBeValidField(vm.r$.name, false);
  });

  it('should be false by default for useRegle', async () => {
    function regleFixture() {
      const form = ref({ name: '' });

      return {
        ...useRegle(form, { name: { required } }),
      };
    }

    const { vm } = createRegleComponent(regleFixture);
    await nextTick();

    shouldBeInvalidField(vm.r$.name);

    vm.r$.$value.name = 'foo';
    await nextTick();

    shouldBeValidField(vm.r$.name, false);
  });

  it('should handle disabled transitions false -> true -> false for useRegle', async () => {
    function regleFixture() {
      const disabled = ref(false);
      const form = ref({ name: '' });

      return {
        disabled,
        ...useRegle(form, { name: { required } }, { disabled }),
      };
    }

    const { vm } = createRegleComponent(regleFixture);
    await nextTick();

    shouldBeInvalidField(vm.r$.name);

    vm.r$.$value.name = 'foo';
    await nextTick();

    shouldBeValidField(vm.r$.name, false);

    vm.disabled = true;
    await nextTick();

    vm.r$.$value.name = '';
    await nextTick();

    expect(vm.r$.name.$value).toBe('');
    shouldBeValidField(vm.r$.name, false);

    vm.disabled = false;
    await nextTick();

    vm.r$.name.$touch();
    await nextTick();

    shouldBeErrorField(vm.r$.name);
  });

  it('should stop watchers for useRegleSchema while keeping the instance defined', async () => {
    function schemaFixture() {
      const disabled = ref(true);
      const form = ref({ name: '' });
      const schema = z.object({ name: z.string().min(1) });

      return {
        disabled,
        ...useRegleSchema(form, inferSchema(form, schema), { disabled }),
      };
    }

    const { vm } = createRegleComponent(schemaFixture);
    await nextTick();

    expect(vm.r$).toBeDefined();
    expect(vm.r$.name).toBeDefined();
    shouldBeInvalidField(vm.r$.name);

    vm.r$.$value.name = 'foo';
    await nextTick();

    expect(vm.r$.name.$value).toBe('foo');
    shouldBeInvalidField(vm.r$.name);

    vm.disabled = false;
    await nextTick();

    vm.r$.name.$touch();
    await nextTick();

    shouldBeValidField(vm.r$.name, false);
  });

  it('should be false by default for useRegleSchema', async () => {
    function schemaFixture() {
      const form = ref({ name: '' });
      const schema = z.object({ name: z.string().min(1) });

      return {
        ...useRegleSchema(form, inferSchema(form, schema)),
      };
    }

    const { vm } = createRegleComponent(schemaFixture);
    await nextTick();

    shouldBeInvalidField(vm.r$.name);

    vm.r$.$value.name = 'foo';
    await nextTick();

    shouldBeValidField(vm.r$.name);
  });

  it('should handle disabled transitions false -> true -> false for useRegleSchema', async () => {
    function schemaFixture() {
      const disabled = ref(false);
      const form = ref({ name: '' });
      const schema = z.object({ name: z.string().min(1) });

      return {
        disabled,
        ...useRegleSchema(form, inferSchema(form, schema), { disabled }),
      };
    }

    const { vm } = createRegleComponent(schemaFixture);
    await nextTick();

    shouldBeInvalidField(vm.r$.name);

    vm.r$.$value.name = 'foo';
    await nextTick();

    shouldBeValidField(vm.r$.name);

    vm.disabled = true;
    await nextTick();

    vm.r$.$value.name = '';
    await nextTick();

    expect(vm.r$.name.$value).toBe('');
    shouldBeValidField(vm.r$.name, false);

    vm.disabled = false;
    await nextTick();

    vm.r$.name.$touch();
    await nextTick();

    shouldBeErrorField(vm.r$.name);
  });

  it('should stop watchers for a single-field useRegle call', async () => {
    function singleFieldFixture() {
      const disabled = ref(true);
      const value = ref('');

      return {
        disabled,
        ...useRegle(value, { required }, { disabled }),
      };
    }

    const { vm } = createRegleComponent(singleFieldFixture);
    await nextTick();

    expect(vm.r$).toBeDefined();
    shouldBeInvalidField(vm.r$);

    vm.r$.$value = 'foo';
    await nextTick();

    expect(vm.r$.$value).toBe('foo');
    shouldBeInvalidField(vm.r$);

    vm.disabled = false;
    await nextTick();

    vm.r$.$touch();
    await nextTick();

    shouldBeValidField(vm.r$, false);

    vm.r$.$value = '';
    await nextTick();

    shouldBeErrorField(vm.r$);
  });

  it('should be false by default for single-field useRegle', async () => {
    function singleFieldFixture() {
      const value = ref('');

      return {
        ...useRegle(value, { required }),
      };
    }

    const { vm } = createRegleComponent(singleFieldFixture);
    await nextTick();

    shouldBeInvalidField(vm.r$);

    vm.r$.$value = 'foo';
    await nextTick();

    shouldBeValidField(vm.r$, false);
  });

  it('should handle disabled transitions false -> true -> false for single-field useRegle', async () => {
    function singleFieldFixture() {
      const disabled = ref(false);
      const value = ref('');

      return {
        disabled,
        ...useRegle(value, { required }, { disabled }),
      };
    }

    const { vm } = createRegleComponent(singleFieldFixture);
    await nextTick();

    shouldBeInvalidField(vm.r$);

    vm.r$.$value = 'foo';
    await nextTick();

    shouldBeValidField(vm.r$, false);

    vm.disabled = true;
    await nextTick();

    vm.r$.$value = '';
    await nextTick();

    expect(vm.r$.$value).toBe('');
    shouldBeValidField(vm.r$, false);

    vm.disabled = false;
    await nextTick();

    vm.r$.$touch();
    await nextTick();

    shouldBeErrorField(vm.r$);
  });
});
