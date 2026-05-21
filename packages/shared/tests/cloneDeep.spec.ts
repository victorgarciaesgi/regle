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

  it('should clone RegExp with multiline, sticky and unicode flags', () => {
    const multiline = /test/m;
    const clonedMultiline = cloneDeep(multiline);
    expect(clonedMultiline.multiline).toBe(true);
    expect(clonedMultiline.flags).toBe('m');

    const sticky = /test/y;
    const clonedSticky = cloneDeep(sticky);
    expect(clonedSticky.sticky).toBe(true);
    expect(clonedSticky.flags).toBe('y');

    const unicode = /test/u;
    const clonedUnicode = cloneDeep(unicode);
    expect(clonedUnicode.unicode).toBe(true);
    expect(clonedUnicode.flags).toBe('u');
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

  it('should clone an object with 20+ sibling keys', () => {
    const original: Record<string, { value: number }> = {};
    for (let i = 0; i < 25; i++) {
      original[`key${i}`] = { value: i };
    }
    const cloned = cloneDeep(original);

    expect(cloned).toEqual(original);
    expect(cloned).not.toBe(original);

    // Depth is tracked per-branch, so every sibling is cloned regardless of count
    for (let i = 0; i < 25; i++) {
      expect(cloned[`key${i}`]).toEqual(original[`key${i}`]);
      expect(cloned[`key${i}`]).not.toBe(original[`key${i}`]);
    }
  });

  it('should deep clone nested keys down to a depth of 20', () => {
    const maxDepth = 25;
    // Build a chain where the node at nesting level n is reached via n `.child` hops
    const nodes: Array<{ level: number; child?: any }> = Array.from({ length: maxDepth + 1 });
    nodes[maxDepth] = { level: maxDepth };
    for (let i = maxDepth - 1; i >= 0; i--) {
      nodes[i] = { level: i, child: nodes[i + 1] };
    }
    const original = nodes[0];

    const getAtLevel = (obj: any, level: number) => {
      let node = obj;
      for (let i = 0; i < level; i++) node = node.child;
      return node;
    };

    const cloned = cloneDeep(original);

    // Levels 0 through 20 are cloned (new references)
    for (let level = 0; level <= 20; level++) {
      expect(getAtLevel(cloned, level)).toEqual(getAtLevel(original, level));
      expect(getAtLevel(cloned, level)).not.toBe(getAtLevel(original, level));
    }
  });

  it('should return the original reference at depth 21 instead of cloning', () => {
    const maxDepth = 25;
    const nodes: Array<{ level: number; child?: any }> = Array.from({ length: maxDepth + 1 });
    nodes[maxDepth] = { level: maxDepth };
    for (let i = maxDepth - 1; i >= 0; i--) {
      nodes[i] = { level: i, child: nodes[i + 1] };
    }
    const original = nodes[0];

    const getAtLevel = (obj: any, level: number) => {
      let node = obj;
      for (let i = 0; i < level; i++) node = node.child;
      return node;
    };

    const cloned = cloneDeep(original);

    // The node at level 21 exceeds the depth limit, so the reference is returned as-is
    expect(getAtLevel(cloned, 21)).toBe(getAtLevel(original, 21));
  });
});
