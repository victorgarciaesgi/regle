import { useRegle, type Maybe } from '@regle/core';
import { minLength, required } from '@regle/rules';
import { nextTick, ref } from 'vue';
import { createRegleComponent } from '../../../utils/test.utils';

describe('Collection scaling performance', () => {
  it('should handle collections with 100+ items', async () => {
    const ITEM_COUNT = 100;

    function largeCollectionValidation() {
      const items: { name: string; email: string }[] = [];
      for (let i = 0; i < ITEM_COUNT; i++) {
        items.push({ name: `name${i}`, email: `email${i}@test.com` });
      }

      const form = ref({ items });

      return useRegle(form, {
        items: {
          $each: {
            name: { required, minLength: minLength(2) },
            email: { required },
          },
        },
      });
    }

    const startTime = performance.now();
    const { vm } = createRegleComponent(largeCollectionValidation);
    const initTime = performance.now() - startTime;

    expect(initTime).toBeLessThan(1000);

    expect(vm.r$.$value.items.length).toBe(ITEM_COUNT);
    expect(vm.r$.items.$each.length).toBe(ITEM_COUNT);

    expect(vm.r$.items.$invalid).toBe(false);

    const validateStart = performance.now();
    await vm.r$.$validate();
    const validateTime = performance.now() - validateStart;

    expect(validateTime).toBeLessThan(500);
  });

  it('should handle nested collections efficiently', async () => {
    const OUTER_COUNT = 20;
    const INNER_COUNT = 10;

    function nestedCollectionValidation() {
      const items: { name: string; children: { value: string }[] }[] = [];

      for (let i = 0; i < OUTER_COUNT; i++) {
        const children: { value: string }[] = [];
        for (let j = 0; j < INNER_COUNT; j++) {
          children.push({ value: `value${i}-${j}` });
        }
        items.push({ name: `parent${i}`, children });
      }

      const form = ref({ items });

      return useRegle(form, {
        items: {
          $each: {
            name: { required },
            children: {
              $each: {
                value: { required, minLength: minLength(3) },
              },
            },
          },
        },
      });
    }

    const startTime = performance.now();
    const { vm } = createRegleComponent(nestedCollectionValidation);
    const initTime = performance.now() - startTime;

    expect(initTime).toBeLessThan(2000);

    expect(vm.r$.$value.items.length).toBe(OUTER_COUNT);
    expect(vm.r$.$value.items[0].children.length).toBe(INNER_COUNT);

    const deepField = vm.r$.items.$each[0].children.$each[0].value;
    expect(deepField.$invalid).toBe(false);
  });

  it('should handle collection operations efficiently', async () => {
    function collectionOpsValidation() {
      const items = Array.from({ length: 50 }, (_, i) => ({ name: `item${i}` }));
      const form = ref({ items });

      return useRegle(form, {
        items: {
          $each: {
            name: { required },
          },
        },
      });
    }

    const { vm } = createRegleComponent(collectionOpsValidation);

    const spliceStart = performance.now();
    vm.r$.$value.items.splice(25, 10, { name: 'new1' }, { name: 'new2' });
    await nextTick();
    const spliceTime = performance.now() - spliceStart;

    expect(spliceTime).toBeLessThan(200);
    expect(vm.r$.$value.items.length).toBe(42); // 50 - 10 + 2

    const unshiftStart = performance.now();
    for (let i = 0; i < 10; i++) {
      vm.r$.$value.items.unshift({ name: `unshifted${i}` });
    }
    await nextTick();
    const unshiftTime = performance.now() - unshiftStart;

    expect(unshiftTime).toBeLessThan(300);
    expect(vm.r$.$value.items.length).toBe(52);

    const reverseStart = performance.now();
    vm.r$.$value.items.reverse();
    await nextTick();
    const reverseTime = performance.now() - reverseStart;

    expect(reverseTime).toBeLessThan(200);
  });

  it('should validate collection items independently', async () => {
    const validatorCalls: number[] = [];

    function isolatedValidation() {
      const items = Array.from({ length: 10 }, (_, i) => ({ name: `item${i}` }));
      const form = ref({ items });

      return useRegle(form, {
        items: {
          $each: {
            name: {
              trackingRule: (value: Maybe<string>) => {
                validatorCalls.push(Date.now());
                return !!value;
              },
            },
          },
        },
      });
    }

    const { vm } = createRegleComponent(isolatedValidation);

    validatorCalls.length = 0;

    vm.r$.$value.items[5].name = 'modified';
    await nextTick();

    expect(validatorCalls.length).toBeLessThanOrEqual(10);
  });

  it('should handle large primitive array collections', async () => {
    const ITEM_COUNT = 100;

    function primitiveCollectionValidation() {
      const items = Array.from({ length: ITEM_COUNT }, (_, i) => `value${i}`);
      const form = ref({ items });

      return useRegle(form, {
        items: {
          $each: {
            required,
            minLength: minLength(3),
          },
        },
      });
    }

    const startTime = performance.now();
    const { vm } = createRegleComponent(primitiveCollectionValidation);
    const initTime = performance.now() - startTime;

    expect(initTime).toBeLessThan(1000);
    expect(vm.r$.$value.items.length).toBe(ITEM_COUNT);

    vm.r$.$value.items[50] = 'newvalue';
    await nextTick();

    expect(vm.r$.$value.items[50]).toBe('newvalue');
  });
});
