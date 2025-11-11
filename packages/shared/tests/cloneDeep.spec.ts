import { describe, it, expect } from 'vitest';
import { cloneDeep } from '../utils/cloneDeep';

describe('cloneDeep', () => {
  it('should clone primitives', () => {
    expect(cloneDeep(1)).toBe(1);
    expect(cloneDeep('hello')).toBe('hello');
    expect(cloneDeep(true)).toBe(true);
    expect(cloneDeep(false)).toBe(false);
    expect(cloneDeep(null)).toBe(null);
    expect(cloneDeep(undefined)).toBe(undefined);
  });

  it('should clone arrays', () => {
    const original = [1, 2, 3];
    const cloned = cloneDeep(original);

    expect(cloned).toEqual(original);
    expect(cloned).not.toBe(original);
    expect(cloned[0]).toBe(original[0]);
  });

  it('should deep clone nested arrays', () => {
    const original = [
      [1, 2],
      [3, 4],
    ];
    const cloned = cloneDeep(original);

    expect(cloned).toEqual(original);
    expect(cloned).not.toBe(original);
    expect(cloned[0]).not.toBe(original[0]);
  });

  it('should clone objects', () => {
    const original = { a: 1, b: 2 };
    const cloned = cloneDeep(original);

    expect(cloned).toEqual(original);
    expect(cloned).not.toBe(original);
  });

  it('should deep clone nested objects', () => {
    const original = { a: { b: { c: 1 } } };
    const cloned = cloneDeep(original);

    expect(cloned).toEqual(original);
    expect(cloned).not.toBe(original);
    expect(cloned.a).not.toBe(original.a);
    expect(cloned.a.b).not.toBe(original.a.b);
  });

  it('should clone Date objects', () => {
    const original = new Date('2023-01-01');
    const cloned = cloneDeep(original);

    expect(cloned).toEqual(original);
    expect(cloned).not.toBe(original);
    expect(cloned.getTime()).toBe(original.getTime());
  });

  it('should clone RegExp objects', () => {
    const original = /test/gi;
    const cloned = cloneDeep(original);

    expect(cloned).toEqual(original);
    expect(cloned).not.toBe(original);
    expect(cloned.source).toBe(original.source);
    expect(cloned.flags).toBe(original.flags);
  });

  it('should deep clone Map with nested objects', () => {
    const original = new Map([
      ['a', { x: 1 }],
      ['b', { y: 2 }],
    ]);
    const cloned = cloneDeep(original);

    expect(cloned.get('a')).toEqual(original.get('a'));
    expect(cloned.get('a')).not.toBe(original.get('a'));
    expect(cloned.get('b')).toEqual(original.get('b'));
    expect(cloned.get('b')).not.toBe(original.get('b'));
  });

  it('should handle complex nested structures', () => {
    const original = {
      a: [1, 2, { b: 3 }],
      c: {
        d: new Date('2023-01-01'),
        e: new Set([1, 2, 3]),
        f: new Map([['key', 'value']]),
      },
    };
    const cloned = cloneDeep(original);

    expect(cloned).toEqual(original);
    expect(cloned).not.toBe(original);
    expect(cloned.a).not.toBe(original.a);
    expect(cloned.a[2]).not.toBe(original.a[2]);
    expect(cloned.c.d).not.toBe(original.c.d);
    expect(cloned.c.e).not.toBe(original.c.e);
    expect(cloned.c.f).not.toBe(original.c.f);
  });

  it('should preserve function references (functions are not cloned)', () => {
    const func = () => 'test';
    const original = { a: func };
    const cloned = cloneDeep(original);

    expect(cloned.a).toBe(original.a);
  });

  it('should handle empty structures', () => {
    expect(cloneDeep({})).toEqual({});
    expect(cloneDeep([])).toEqual([]);
    expect(cloneDeep(new Set())).toEqual(new Set());
    expect(cloneDeep(new Map())).toEqual(new Map());
  });

  it('should handle arrays with mixed types', () => {
    const original = [1, 'string', true, null, { a: 1 }, [2, 3]];
    const cloned = cloneDeep(original);

    expect(cloned).toEqual(original);
    expect(cloned).not.toBe(original);
    expect(cloned[4]).not.toBe(original[4]);
    expect(cloned[5]).not.toBe(original[5]);
  });
});
