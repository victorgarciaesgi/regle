import type { Maybe } from '@regle/core';
import { createRule, useRegle } from '@regle/core';
import { applyIf, isFilled, pipe } from '@regle/rules';
import { computed } from 'vue';
import { createRegleComponent } from '../../../utils/test.utils';
import { timeout } from '../../../utils';

/**
 * Regression: `pipe( applyIf(condA, asyncA), applyIf(condB, asyncB) )` on a collection
 * field where the FIRST applyIf is NOT applied. The skipped-but-still-debounced first
 * rule flips `mappedResults`, which re-parses the second rule through its reactive
 * `$params` and re-invokes its debounced validator. Before the `debounce` fix, the
 * re-invocation orphaned the promise `$validate` was awaiting and it never settled.
 */
describe('pipe(two applyIf) field $validate, first rule not applied', () => {
  function asyncA() {
    return createRule({
      async validator(value: Maybe<string>) {
        if (!isFilled(value)) return true;
        await timeout(40);
        return value.length >= 3;
      },
      message: 'Too short',
    });
  }
  function asyncB() {
    return createRule({
      async validator(value: Maybe<string>) {
        if (!isFilled(value)) return true;
        await timeout(40);
        return value === 'valid';
      },
      message: 'Invalid value',
    });
  }

  function watchdog<T>(p: Promise<T>, ms = 1500): Promise<T> {
    let t: ReturnType<typeof setTimeout> | undefined;

    const timeoutPromise = new Promise<never>((_, reject) => {
      t = setTimeout(() => reject(new Error('TIMED OUT: $validate never settled')), ms);
    });

    return Promise.race([p.finally(() => t && clearTimeout(t)), timeoutPromise]);
  }

  function makeForm(condA: boolean) {
    return useRegle({ items: [{ a: condA, b: true, name: '' }] }, () => ({
      items: {
        $each: (item) => ({
          name: pipe(
            applyIf(
              computed(() => !!(item.value as any)?.a),
              asyncA()
            ),
            applyIf(
              computed(() => !!(item.value as any)?.b),
              asyncB()
            )
          ),
        }),
      },
    }));
  }

  it('settles when the first applyIf is NOT applied', async () => {
    const { vm } = createRegleComponent(() => makeForm(false));
    const field = () => vm.r$.items.$each[0].name;

    field().$value = 'valid';
    await vm.$nextTick();
    await timeout(50); // inside the 200ms window

    const result = await watchdog(field().$validate());
    expect(result.valid).toBe(true);
  });
});
