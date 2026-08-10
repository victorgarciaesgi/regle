import { describe, expect, it } from 'vitest';
import { isRef, ref } from 'vue';
import { toReactive } from '../utils/toReactive';

describe('toReactive', () => {
  it('forwards property access to the source ref', () => {
    const source = ref({ $dirty: false, name: 'regle' });
    const reactiveStatus = toReactive(source, ref(false));

    expect(reactiveStatus.$dirty).toBe(false);
    expect(reactiveStatus.name).toBe('regle');

    reactiveStatus.$dirty = true;
    expect(source.value.$dirty).toBe(true);
  });

  it('supports Object.defineProperty / Object.hasOwn used by Pinia skipHydrate', () => {
    const source = ref({ $dirty: false, validate: () => true });
    const reactiveStatus = toReactive(source, ref(false));
    const marker = Symbol('pinia:skipHydration');

    expect(() => Object.defineProperty(reactiveStatus, marker, {})).not.toThrow();
    expect(Object.hasOwn(reactiveStatus, marker)).toBe(true);
    expect(marker in reactiveStatus).toBe(true);
    expect(Object.getOwnPropertyDescriptor(reactiveStatus, marker)).toBeDefined();
  });

  it('keeps source properties enumerable after defineProperty markers', () => {
    const source = ref({ $dirty: false, name: 'regle' });
    const reactiveStatus = toReactive(source, ref(false));
    Object.defineProperty(reactiveStatus, Symbol('marker'), {});

    expect(Object.keys(reactiveStatus)).toEqual(expect.arrayContaining(['$dirty', 'name']));
    expect(isRef(source)).toBe(true);
  });
});
