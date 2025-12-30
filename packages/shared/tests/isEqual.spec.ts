import { describe, it, expect } from 'vitest';
import { isEqual } from '../utils/isEqual';

describe('isEqual', () => {
  describe('primitive values', () => {
    it('should return true for identical primitives', () => {
      expect(isEqual(1, 1)).toBe(true);
      expect(isEqual('hello', 'hello')).toBe(true);
      expect(isEqual(true, true)).toBe(true);
      expect(isEqual(false, false)).toBe(true);
      expect(isEqual(null, null)).toBe(true);
      expect(isEqual(undefined, undefined)).toBe(true);
    });

    it('should return false for different primitives', () => {
      expect(isEqual(1, 2)).toBe(false);
      expect(isEqual('hello', 'world')).toBe(false);
      expect(isEqual(true, false)).toBe(false);
      expect(isEqual(null, undefined)).toBe(false);
    });

    it('should handle NaN correctly', () => {
      expect(isEqual(NaN, NaN)).toBe(true);
      expect(isEqual(NaN, 1)).toBe(false);
      expect(isEqual(1, NaN)).toBe(false);
    });
  });

  describe('arrays', () => {
    it('should return true for identical arrays', () => {
      expect(isEqual([1, 2, 3], [1, 2, 3])).toBe(true);
      expect(isEqual([], [])).toBe(true);
      expect(isEqual(['a', 'b'], ['a', 'b'])).toBe(true);
    });

    it('should return false for arrays with different lengths', () => {
      expect(isEqual([1, 2], [1, 2, 3])).toBe(false);
      expect(isEqual([1, 2, 3], [1, 2])).toBe(false);
    });

    it('should return false for arrays with different values', () => {
      expect(isEqual([1, 2, 3], [1, 2, 4])).toBe(false);
      expect(isEqual([1, 2], [2, 1])).toBe(false);
    });

    it('should handle nested arrays with deep comparison', () => {
      expect(
        isEqual(
          [
            [1, 2],
            [3, 4],
          ],
          [
            [1, 2],
            [3, 4],
          ],
          true
        )
      ).toBe(true);
      expect(
        isEqual(
          [
            [1, 2],
            [3, 4],
          ],
          [
            [1, 2],
            [3, 5],
          ],
          true
        )
      ).toBe(false);
    });

    it('should handle nested arrays without deep comparison', () => {
      expect(
        isEqual(
          [
            [1, 2],
            [3, 4],
          ],
          [
            [1, 2],
            [3, 4],
          ],
          false
        )
      ).toBe(true);
      expect(
        isEqual(
          [
            [1, 2],
            [3, 4],
          ],
          [
            [1, 2],
            [3, 5],
          ],
          false
        )
      ).toBe(true);
    });
  });

  describe('objects', () => {
    it('should return true for identical objects', () => {
      expect(isEqual({ a: 1, b: 2 }, { a: 1, b: 2 })).toBe(true);
      expect(isEqual({}, {})).toBe(true);
      expect(isEqual({ x: 'hello' }, { x: 'hello' })).toBe(true);
    });

    it('should return false for objects with different keys', () => {
      expect(isEqual({ a: 1 }, { b: 1 })).toBe(false);
      expect(isEqual({ a: 1, b: 2 }, { a: 1 })).toBe(false);
      expect(isEqual({ a: 1 }, { a: 1, b: 2 })).toBe(false);
    });

    it('should return false for objects with different values', () => {
      expect(isEqual({ a: 1 }, { a: 2 })).toBe(false);
      expect(isEqual({ a: 1, b: 2 }, { a: 1, b: 3 })).toBe(false);
    });

    it('should handle nested objects with deep comparison', () => {
      expect(isEqual({ a: { b: 1 } }, { a: { b: 1 } }, true)).toBe(true);
      expect(isEqual({ a: { b: 1 } }, { a: { b: 2 } }, true)).toBe(false);
    });

    it('should handle nested objects without deep comparison', () => {
      expect(isEqual({ a: { b: 1 } }, { a: { b: 1 } }, false)).toBe(true);
      expect(isEqual({ a: { b: 1 } }, { a: { b: 2 } }, false)).toBe(true);
    });

    it('should handle objects with arrays', () => {
      expect(isEqual({ a: [1, 2] }, { a: [1, 2] }, true)).toBe(true);
      expect(isEqual({ a: [1, 2] }, { a: [1, 3] }, true)).toBe(false);
    });
  });

  describe('different types', () => {
    it('should return false for different types', () => {
      expect(isEqual(1, '1')).toBe(false);
      expect(isEqual([], {})).toBe(false);
      expect(isEqual(null, {})).toBe(false);
      expect(isEqual(undefined, null)).toBe(false);
    });

    it('should return false for array vs object', () => {
      expect(isEqual([1, 2], { 0: 1, 1: 2 })).toBe(false);
    });
  });

  describe('dates', () => {
    it('should compare dates correctly', () => {
      const date1 = new Date('2023-01-01');
      const date2 = new Date('2023-01-01');
      const date3 = new Date('2023-01-02');

      expect(isEqual(date1, date2)).toBe(true);
      expect(isEqual(date1, date3)).toBe(false);
    });
  });

  describe('objects with custom toString', () => {
    it('should compare objects with custom toString using toString result', () => {
      const obj1 = {
        value: 'test',
        toString() {
          return this.value;
        },
      };
      const obj2 = {
        value: 'test',
        toString() {
          return this.value;
        },
      };
      const obj3 = {
        value: 'different',
        toString() {
          return this.value;
        },
      };

      expect(isEqual(obj1, obj2)).toBe(true);
      expect(isEqual(obj1, obj3)).toBe(false);
    });
  });

  describe('complex nested structures', () => {
    it('should handle deeply nested structures', () => {
      const obj1 = {
        a: {
          b: {
            c: [1, 2, { d: 3 }],
          },
        },
      };
      const obj2 = {
        a: {
          b: {
            c: [1, 2, { d: 3 }],
          },
        },
      };
      const obj3 = {
        a: {
          b: {
            c: [1, 2, { d: 4 }],
          },
        },
      };

      expect(isEqual(obj1, obj2, true)).toBe(true);
      expect(isEqual(obj1, obj3, true)).toBe(false);
    });
  });
});
