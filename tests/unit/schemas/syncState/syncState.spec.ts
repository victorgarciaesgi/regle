import { createRegleComponent } from '../../../utils/test.utils';
import { shouldBeInvalidField } from '../../../utils/validations.utils';
import { zodRegleTransform } from './fixtures/zod.fixture';

describe.each([['zod', zodRegleTransform]])('%s - syncState', (name, schemaRegle) => {
  it('should update state correctly on valid submit', async () => {
    const { vm } = createRegleComponent(() => schemaRegle({ syncState: { onValidate: true } }));
    expect(vm.r$.$value).toStrictEqual({ noValidationValue: 'foo' });

    shouldBeInvalidField(vm.r$);

    vm.r$.$value.noChange = 'foo';
    vm.r$.$value.withDefault = undefined as any;
    vm.r$.$value.withCatch = 0 as any;
    vm.r$.$value.withTransform = 'foo';
    await vm.$nextTick();

    expect(vm.r$.$value).toStrictEqual({
      noValidationValue: 'foo',
      noChange: 'foo',
      withDefault: undefined,
      withCatch: 0,
      withTransform: 'foo',
    });

    await vm.r$.$validate();
    await vm.$nextTick();

    expect(vm.r$.$value).toStrictEqual({
      noValidationValue: 'foo',
      noChange: 'foo',
      withDefault: 'default value',
      withCatch: 'catch',
      withTransform: 'transform: foo',
    });
  });

  it('should update state correctly on valid submit', async () => {
    const { vm } = createRegleComponent(() => schemaRegle({ syncState: { onUpdate: true } }));
    expect(vm.r$.$value).toStrictEqual({ noValidationValue: 'foo' });

    shouldBeInvalidField(vm.r$);

    vm.r$.$value.noChange = 'foo';
    vm.r$.$value.withDefault = undefined as any;
    vm.r$.$value.withCatch = 0 as any;
    vm.r$.$value.withTransform = 'foo';
    await vm.$nextTick();

    expect(vm.r$.$value).toStrictEqual({
      noValidationValue: 'foo',
      noChange: 'foo',
      withDefault: 'default value',
      withCatch: 'catch',
      withTransform: 'transform: foo',
    });
  });
});
