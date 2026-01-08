import { defineRegleConfig, markStatic, useRegle, type isEditedHandlerFn, type MaybeInput } from '@regle/core';
import { required } from '@regle/rules';
import { Decimal } from 'decimal.js';
import { nextTick } from 'vue';

describe('isEdited global override', () => {
  it('replace the default $edited handler', async () => {
    const isEditedHandler = vi
      .fn<isEditedHandlerFn>()
      .mockImplementation((currentValue, initialValue, defaultHandlerFn) => {
        if (currentValue instanceof Decimal && initialValue instanceof Decimal) {
          return currentValue.toNearest(0.01).toString() !== initialValue.toNearest(0.01).toString();
        }
        return defaultHandlerFn(currentValue, initialValue);
      });

    const { useRegle: useCustomRegle } = defineRegleConfig({
      overrides: {
        isEdited: isEditedHandler,
      },
    });

    const { r$ } = useCustomRegle(
      { decimal: markStatic(new Decimal(1)) },
      {
        decimal: {
          required,
        },
      }
    );

    expect(isEditedHandler).not.toHaveBeenCalled();
    expect(r$.decimal.$edited).toBe(false);

    r$.decimal.$value = markStatic(new Decimal(2));
    await nextTick();

    expect(isEditedHandler).toHaveBeenCalledWith(r$.$value.decimal, r$.$initialValue.decimal, expect.any(Function));
    expect(r$.decimal.$edited).toBe(true);

    r$.decimal.$value = markStatic(new Decimal(1));
    await nextTick();

    expect(isEditedHandler).toHaveBeenCalledWith(r$.$value.decimal, r$.$initialValue.decimal, expect.any(Function));
    expect(r$.decimal.$edited).toBe(false);
  });

  it('should work with the field modifier', async () => {
    const isEditedHandler = vi
      .fn<isEditedHandlerFn<Decimal>>()
      .mockImplementation(
        (
          currentValue: MaybeInput<Decimal>,
          initialValue: MaybeInput<Decimal>,
          defaultHandlerFn: (currentValue: unknown, initialValue: unknown) => boolean
        ) => {
          if (currentValue != null && initialValue != null) {
            return currentValue.toNearest(0.01).toString() !== initialValue.toNearest(0.01).toString();
          }
          return defaultHandlerFn(currentValue, initialValue);
        }
      );

    const { r$ } = useRegle(
      { decimal: markStatic(new Decimal(1)) },
      {
        decimal: {
          required,
          $isEdited: isEditedHandler,
        },
      }
    );

    expect(isEditedHandler).not.toHaveBeenCalled();
    expect(r$.decimal.$edited).toBe(false);

    r$.decimal.$value = markStatic(new Decimal(2));
    await nextTick();

    expect(isEditedHandler).toHaveBeenCalledWith(r$.$value.decimal, r$.$initialValue.decimal, expect.any(Function));
    expect(r$.decimal.$edited).toBe(true);

    r$.decimal.$value = markStatic(new Decimal(1));
    await nextTick();

    expect(isEditedHandler).toHaveBeenCalledWith(r$.$value.decimal, r$.$initialValue.decimal, expect.any(Function));
    expect(r$.decimal.$edited).toBe(false);
  });
});
