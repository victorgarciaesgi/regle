import { useRegle } from '@regle/core';
import { simpleNestedStateWithMixedValidation } from '../../../fixtures';
import { createRegleComponent } from '../../../utils/test.utils';
import { minLength } from '@regle/rules';
import { addDays } from 'date-fns';

describe('$edited', () => {
  it('should be true when value is not the same as initial one', async () => {
    const { vm } = createRegleComponent(simpleNestedStateWithMixedValidation);

    vm.r$.$value.email = 'edited';
    await vm.$nextTick();

    expect(vm.r$.email.$edited).toBe(true);
    expect(vm.r$.$anyEdited).toBe(true);

    vm.r$.$value.email = '';
    await vm.$nextTick();

    expect(vm.r$.email.$edited).toBe(false);
    expect(vm.r$.$anyEdited).toBe(false);

    // shouldn't be considered as a Date
    vm.r$.$value.email = 'test 1';
    await vm.$nextTick();
    vm.r$.$reset();
    await vm.$nextTick();

    expect(vm.r$.email.$edited).toBe(false);
    expect(vm.r$.$anyEdited).toBe(false);

    vm.r$.$value.email = 'test 2';
    await vm.$nextTick();

    expect(vm.r$.email.$edited).toBe(true);
    expect(vm.r$.$anyEdited).toBe(true);

    vm.r$.$value.email = 'test 1';
    await vm.$nextTick();

    expect(vm.r$.email.$edited).toBe(false);
    expect(vm.r$.$anyEdited).toBe(false);

    // nested

    vm.r$.$value.user.firstName = 'new value';
    await vm.$nextTick();

    expect(vm.r$.user.$edited).toBe(false);
    expect(vm.r$.user.firstName.$edited).toBe(true);
    expect(vm.r$.$anyEdited).toBe(true);
    expect(vm.r$.user.$anyEdited).toBe(true);

    vm.r$.$reset();
    await vm.$nextTick();

    expect(vm.r$.user.$edited).toBe(false);
    expect(vm.r$.user.firstName.$edited).toBe(false);
    expect(vm.r$.$anyEdited).toBe(false);
    expect(vm.r$.user.$anyEdited).toBe(false);

    vm.r$.$value.user.firstName = 'edited';
    await vm.$nextTick();

    expect(vm.r$.user.$edited).toBe(false);
    expect(vm.r$.user.firstName.$edited).toBe(true);
    expect(vm.r$.$anyEdited).toBe(true);
    expect(vm.r$.user.$anyEdited).toBe(true);

    vm.r$.$value.user.firstName = 'new value';
    await vm.$nextTick();

    expect(vm.r$.user.$edited).toBe(false);
    expect(vm.r$.user.firstName.$edited).toBe(false);
    expect(vm.r$.$anyEdited).toBe(false);
    expect(vm.r$.user.$anyEdited).toBe(false);

    // collections

    vm.r$.$value.contacts[0].name = 'new value';
    await vm.$nextTick();

    expect(vm.r$.contacts.$each[0].name.$edited).toBe(true);
    expect(vm.r$.contacts.$edited).toBe(true);
    expect(vm.r$.$anyEdited).toBe(true);
    expect(vm.r$.contacts.$anyEdited).toBe(true);

    vm.r$.$reset();
    await vm.$nextTick();

    expect(vm.r$.contacts.$each[0].name.$edited).toBe(false);
    expect(vm.r$.contacts.$edited).toBe(false);
    expect(vm.r$.$anyEdited).toBe(false);
    expect(vm.r$.contacts.$anyEdited).toBe(false);

    vm.r$.$value.contacts[0].name = 'edited';
    await vm.$nextTick();

    expect(vm.r$.contacts.$each[0].name.$edited).toBe(true);
    expect(vm.r$.contacts.$edited).toBe(true);
    expect(vm.r$.$anyEdited).toBe(true);
    expect(vm.r$.contacts.$anyEdited).toBe(true);

    vm.r$.$value.contacts.push({ name: '' });
    await vm.$nextTick();
    vm.r$.contacts.$touch();
    await vm.$nextTick();

    expect(vm.r$.contacts.$each[0].name.$edited).toBe(true);
    expect(vm.r$.contacts.$each[1].name.$edited).toBe(false);
    expect(vm.r$.contacts.$edited).toBe(false);
    expect(vm.r$.$anyEdited).toBe(true);
    expect(vm.r$.contacts.$anyEdited).toBe(true);

    vm.r$.$reset();
    await vm.$nextTick();

    expect(vm.r$.contacts.$each[0].name.$edited).toBe(false);
    expect(vm.r$.contacts.$each[1].name.$edited).toBe(false);
    expect(vm.r$.contacts.$edited).toBe(false);
    expect(vm.r$.$anyEdited).toBe(false);
    expect(vm.r$.contacts.$anyEdited).toBe(false);

    vm.r$.$value.contacts[1].name = 'edited';
    await vm.$nextTick();

    expect(vm.r$.contacts.$each[0].name.$edited).toBe(false);
    expect(vm.r$.contacts.$each[1].name.$edited).toBe(true);
    expect(vm.r$.contacts.$edited).toBe(false);
    expect(vm.r$.$anyEdited).toBe(true);
    expect(vm.r$.contacts.$anyEdited).toBe(true);

    vm.r$.$value.contacts.splice(0, 1);
    await vm.$nextTick();

    expect(vm.r$.contacts.$each[0].name.$edited).toBe(true);
    expect(vm.r$.contacts.$edited).toBe(true);
    expect(vm.r$.$anyEdited).toBe(true);
    expect(vm.r$.contacts.$anyEdited).toBe(true);
  });

  it('should correctly compare other data types', async () => {
    function regleWithOtherValues() {
      return useRegle({ date: new Date(), file: undefined as File | undefined }, {});
    }

    const { vm } = createRegleComponent(regleWithOtherValues);

    expect(vm.r$.date.$edited).toBe(false);
    expect(vm.r$.date.$anyEdited).toBe(false);
    expect(vm.r$.file.$edited).toBe(false);
    expect(vm.r$.file.$anyEdited).toBe(false);

    vm.r$.$value.date = addDays(new Date(), 1);
    vm.r$.$value.file = new File([], 'file');
    await vm.$nextTick();

    expect(vm.r$.date.$edited).toBe(true);
    expect(vm.r$.date.$anyEdited).toBe(true);

    expect(vm.r$.file.$edited).toBe(true);
    expect(vm.r$.file.$anyEdited).toBe(true);
  });

  it('should correctly compare array of primitives', async () => {
    function regleWithPrimitivesArray() {
      return useRegle(
        { collection: [] as string[] },
        {
          collection: {
            minLength: minLength(1),
          },
        }
      );
    }

    const { vm } = createRegleComponent(regleWithPrimitivesArray);

    expect(vm.r$.collection.$edited).toBe(false);
    expect(vm.r$.collection.$anyEdited).toBe(false);

    vm.r$.$value.collection.push('foo');
    await vm.$nextTick();

    expect(vm.r$.collection.$edited).toBe(true);
    expect(vm.r$.collection.$anyEdited).toBe(true);

    vm.r$.$value.collection.splice(0, 1);
    await vm.$nextTick();

    expect(vm.r$.collection.$edited).toBe(false);
    expect(vm.r$.collection.$anyEdited).toBe(false);

    vm.r$.$value.collection.push('foo');
    vm.r$.$reset();

    await vm.$nextTick();

    expect(vm.r$.collection.$edited).toBe(false);
    expect(vm.r$.collection.$anyEdited).toBe(false);

    vm.r$.$value.collection.push('bar');
    await vm.$nextTick();

    expect(vm.r$.collection.$edited).toBe(true);
    expect(vm.r$.collection.$anyEdited).toBe(true);

    vm.r$.$value.collection.splice(1, 1);
    await vm.$nextTick();

    expect(vm.r$.collection.$edited).toBe(false);
    expect(vm.r$.collection.$anyEdited).toBe(false);
  });

  it('should correctly compare array of objects with $deepCompare', async () => {
    function regleWithDeepCompare() {
      return useRegle(
        { collection: [] as { id: number; name: string }[] },
        {
          collection: {
            $deepCompare: true,
            minLength: minLength(1),
          },
        }
      );
    }

    const { vm } = createRegleComponent(regleWithDeepCompare);

    expect(vm.r$.collection.$edited).toBe(false);
    expect(vm.r$.collection.$anyEdited).toBe(false);

    vm.r$.$value.collection.push({ id: 1, name: 'foo' });
    await vm.$nextTick();

    expect(vm.r$.collection.$edited).toBe(true);
    expect(vm.r$.collection.$anyEdited).toBe(true);

    vm.r$.$value.collection.splice(0, 1);
    await vm.$nextTick();

    expect(vm.r$.collection.$edited).toBe(false);
    expect(vm.r$.collection.$anyEdited).toBe(false);

    vm.r$.$value.collection.push({ id: 1, name: 'foo' });
    vm.r$.$reset();

    await vm.$nextTick();

    expect(vm.r$.collection.$edited).toBe(false);
    expect(vm.r$.collection.$anyEdited).toBe(false);

    vm.r$.$value.collection.push({ id: 2, name: 'foo2' });
    await vm.$nextTick();

    expect(vm.r$.collection.$self.$edited).toBe(true);
    expect(vm.r$.collection.$edited).toBe(false);
    expect(vm.r$.collection.$each[0].$edited).toBe(false);
    expect(vm.r$.collection.$anyEdited).toBe(true);

    vm.r$.$value.collection.splice(1, 1);
    await vm.$nextTick();

    expect(vm.r$.collection.$edited).toBe(false);
    expect(vm.r$.collection.$anyEdited).toBe(false);
  });
});
