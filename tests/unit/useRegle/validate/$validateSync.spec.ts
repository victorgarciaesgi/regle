import { useRegle } from '@regle/core';
import { email, minLength, required, withAsync, atLeastOne } from '@regle/rules';
import { nextTick } from 'vue';
import { createRegleComponent } from '../../../utils/test.utils';

describe('$validateSync', () => {
  describe('basic synchronous validation', () => {
    it('should return false when form is invalid', () => {
      function regleComposable() {
        return useRegle(
          { name: '', email: '' },
          {
            name: { required },
            email: { required, email },
          }
        );
      }

      const { vm } = createRegleComponent(regleComposable);

      const result = vm.r$.$validateSync();

      expect(result).toBe(false);
      expect(vm.r$.$invalid).toBe(true);
    });

    it('should return true when form is valid', () => {
      function regleComposable() {
        return useRegle(
          { name: 'John', email: 'john@test.com' },
          {
            name: { required },
            email: { required, email },
          }
        );
      }

      const { vm } = createRegleComponent(regleComposable);

      const result = vm.r$.$validateSync();

      expect(result).toBe(true);
      expect(vm.r$.$invalid).toBe(false);
    });

    it('should touch fields like $validate', () => {
      function regleComposable() {
        return useRegle(
          { name: '', email: '' },
          {
            name: { required },
            email: { required },
          },
          { lazy: true }
        );
      }

      const { vm } = createRegleComponent(regleComposable);

      expect(vm.r$.$dirty).toBe(false);
      expect(vm.r$.name.$dirty).toBe(false);
      expect(vm.r$.email.$dirty).toBe(false);

      vm.r$.$validateSync();

      expect(vm.r$.$dirty).toBe(true);
      expect(vm.r$.name.$dirty).toBe(true);
      expect(vm.r$.email.$dirty).toBe(true);
    });

    it('should validate after values are updated and reactivity settles', async () => {
      function regleComposable() {
        return useRegle(
          { name: '', email: '' },
          {
            name: { required },
            email: { required, email },
          }
        );
      }

      const { vm } = createRegleComponent(regleComposable);

      expect(vm.r$.$validateSync()).toBe(false);

      vm.r$.$value.name = 'John';
      vm.r$.$value.email = 'john@test.com';

      await nextTick();

      expect(vm.r$.$validateSync()).toBe(true);
    });
  });

  describe('with async rules', () => {
    it('should return true for async rules (skips async validation)', () => {
      const asyncMock = vi.fn(async () => false);

      function regleComposable() {
        return useRegle(
          { email: 'test@test.com' },
          {
            email: {
              asyncCheck: withAsync(asyncMock),
            },
          },
          { lazy: true }
        );
      }

      const { vm } = createRegleComponent(regleComposable);

      const result = vm.r$.$validateSync();

      expect(result).toBe(true);
      expect(asyncMock).not.toHaveBeenCalled();
    });

    it('should validate sync rules while skipping async rules', () => {
      const asyncMock = vi.fn(async () => false);

      function regleComposable() {
        return useRegle(
          { name: '', email: 'test@test.com' },
          {
            name: { required },
            email: {
              asyncCheck: withAsync(asyncMock),
            },
          },
          { lazy: true }
        );
      }

      const { vm } = createRegleComponent(regleComposable);

      // Should fail because name is required (sync rule)
      const result = vm.r$.$validateSync();

      expect(result).toBe(false);
      expect(asyncMock).not.toHaveBeenCalled();
    });
  });

  describe('with nested objects', () => {
    it('should validate nested object fields', async () => {
      function regleComposable() {
        return useRegle(
          {
            user: {
              firstName: '',
              lastName: '',
            },
          },
          {
            user: {
              firstName: { required },
              lastName: { required },
            },
          }
        );
      }

      const { vm } = createRegleComponent(regleComposable);

      expect(vm.r$.$validateSync()).toBe(false);

      vm.r$.$value.user.firstName = 'John';
      vm.r$.$value.user.lastName = 'Doe';
      await nextTick();

      expect(vm.r$.$validateSync()).toBe(true);
    });

    it('should validate deeply nested objects', async () => {
      function regleComposable() {
        return useRegle(
          {
            level1: {
              level2: {
                name: '',
              },
            },
          },
          {
            level1: {
              level2: {
                name: { required },
              },
            },
          }
        );
      }

      const { vm } = createRegleComponent(regleComposable);

      expect(vm.r$.$validateSync()).toBe(false);

      vm.r$.$value.level1.level2.name = 'Value';
      await nextTick();

      expect(vm.r$.$validateSync()).toBe(true);
    });
  });

  describe('with collections', () => {
    it('should validate collection items', async () => {
      function regleComposable() {
        return useRegle(
          {
            contacts: [{ name: '' }, { name: '' }],
          },
          {
            contacts: {
              $each: {
                name: { required },
              },
            },
          }
        );
      }

      const { vm } = createRegleComponent(regleComposable);

      expect(vm.r$.$validateSync()).toBe(false);

      vm.r$.$value.contacts[0].name = 'Alice';
      vm.r$.$value.contacts[1].name = 'Bob';
      await nextTick();

      expect(vm.r$.$validateSync()).toBe(true);
    });

    it('should validate empty collections', () => {
      function regleComposable() {
        return useRegle(
          {
            items: [] as { value: string }[],
          },
          {
            items: {
              $each: {
                value: { required },
              },
            },
          }
        );
      }

      const { vm } = createRegleComponent(regleComposable);

      expect(vm.r$.$validateSync()).toBe(true);
    });

    it('should validate collection with items', async () => {
      function regleComposable() {
        return useRegle(
          {
            items: [{ value: '' }] as { value: string }[],
          },
          {
            items: {
              $each: {
                value: { required },
              },
            },
          }
        );
      }

      const { vm } = createRegleComponent(regleComposable);

      expect(vm.r$.$validateSync()).toBe(false);

      vm.r$.$value.items[0].value = 'test';
      await nextTick();

      expect(vm.r$.$validateSync()).toBe(true);
    });
  });

  describe('with object $self validation and sync rules', () => {
    it('should return false when $self validation fails', () => {
      function regleComposable() {
        return useRegle(
          { user: {} },
          {
            user: { $self: { required, atLeastOne } },
          }
        );
      }

      const { vm } = createRegleComponent(regleComposable);

      const result = vm.r$.$validateSync();
      expect(result).toBe(false);
    });

    it('should return true when $self validation passes', () => {
      function regleComposable() {
        return useRegle(
          { user: { firstName: 'John', lastName: 'Doe' } },
          {
            user: { $self: { required, atLeastOne } },
          }
        );
      }

      const { vm } = createRegleComponent(regleComposable);

      const result = vm.r$.$validateSync();
      expect(result).toBe(true);
    });

    it('should return true when $self validation passes and sync rules pass', () => {
      function regleComposable() {
        return useRegle(
          { user: { firstName: 'John', lastName: 'Doe' } },
          {
            user: { $self: { required, atLeastOne }, firstName: { required, minLength: minLength(6) } },
          }
        );
      }

      const { vm } = createRegleComponent(regleComposable);

      const result = vm.r$.$validateSync();
      expect(result).toBe(false);

      vm.r$.$value.user.firstName = 'JohnJohn';

      expect(vm.r$.$validateSync()).toBe(true);
    });
  });

  describe('error handling', () => {
    it('should return false when validation has edge cases', () => {
      function regleComposable() {
        return useRegle(
          { value: null as string | null },
          {
            value: {
              customRule: (value: any) => {
                if (value === null) {
                  return false;
                }
                return value.toString().length > 0;
              },
            },
          }
        );
      }

      const { vm } = createRegleComponent(regleComposable);

      const result = vm.r$.$validateSync();
      expect(result).toBe(false);
    });
  });

  describe('field-level $validateSync', () => {
    it('should validate individual fields synchronously', async () => {
      function regleComposable() {
        return useRegle(
          { name: '', email: '' },
          {
            name: { required },
            email: { required },
          }
        );
      }

      const { vm } = createRegleComponent(regleComposable);

      expect(vm.r$.name.$validateSync()).toBe(false);
      expect(vm.r$.email.$validateSync()).toBe(false);

      vm.r$.$value.name = 'John';
      await nextTick();

      expect(vm.r$.name.$validateSync()).toBe(true);
      expect(vm.r$.email.$validateSync()).toBe(false);
    });

    it('should validate nested field synchronously', async () => {
      function regleComposable() {
        return useRegle(
          { user: { firstName: '', lastName: '' } },
          {
            user: {
              firstName: { required },
              lastName: { required },
            },
          }
        );
      }

      const { vm } = createRegleComponent(regleComposable);

      expect(vm.r$.user.$validateSync()).toBe(false);
      expect(vm.r$.user.firstName.$validateSync()).toBe(false);

      vm.r$.$value.user.firstName = 'John';
      await nextTick();

      expect(vm.r$.user.firstName.$validateSync()).toBe(true);
      expect(vm.r$.user.$validateSync()).toBe(false); // lastName still invalid

      vm.r$.$value.user.lastName = 'Doe';
      await nextTick();

      expect(vm.r$.user.$validateSync()).toBe(true);
    });
  });

  describe('with multiple rules per field', () => {
    it('should validate all sync rules on a field', () => {
      function regleComposable() {
        return useRegle(
          { email: 'a' },
          {
            email: { required, email, minLength: minLength(5) },
          }
        );
      }

      const { vm } = createRegleComponent(regleComposable);

      const result = vm.r$.$validateSync();

      expect(result).toBe(false);
    });

    it('should pass when all sync rules pass', () => {
      function regleComposable() {
        return useRegle(
          { email: 'test@example.com' },
          {
            email: { required, email, minLength: minLength(5) },
          }
        );
      }

      const { vm } = createRegleComponent(regleComposable);

      const result = vm.r$.$validateSync();

      expect(result).toBe(true);
    });
  });
});
