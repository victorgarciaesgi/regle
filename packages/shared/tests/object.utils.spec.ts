import { describe, it, expect } from 'vitest';
import { isObject, setObjectError, getDotPath, merge } from '../utils/object.utils';

describe('isObject', () => {
  it('should return true for plain objects', () => {
    expect(isObject({})).toBe(true);
    expect(isObject({ a: 1 })).toBe(true);
    expect(isObject({ a: { b: 2 } })).toBe(true);
  });

  it('should return false for arrays', () => {
    expect(isObject([])).toBe(false);
    expect(isObject([1, 2, 3])).toBe(false);
  });

  it('should return false for null', () => {
    expect(isObject(null)).toBe(false);
  });

  it('should return false for Date instances', () => {
    expect(isObject(new Date())).toBe(false);
  });

  it('should return false for File instances', () => {
    const file = new File(['content'], 'test.txt');
    expect(isObject(file)).toBe(false);
  });

  it('should return false for FileList instances', () => {
    const fileList = {
      constructor: { name: 'FileList' },
    } as any;
    expect(isObject(fileList)).toBe(false);
  });

  it('should return false for primitives', () => {
    expect(isObject(1)).toBe(false);
    expect(isObject('string')).toBe(false);
    expect(isObject(true)).toBe(false);
    expect(isObject(undefined)).toBe(false);
  });
});

describe('setObjectError', () => {
  it('should set error on simple path', () => {
    const obj: Record<string, any> = {};
    const result = setObjectError(obj, 'name', 'error message', false);

    expect(result).toBe(true);
    expect(obj.name).toBe('error message');
  });

  it('should set error on nested path', () => {
    const obj: Record<string, any> = {};
    const result = setObjectError(obj, 'user.email', 'email error', false);

    expect(result).toBe(true);
    expect(obj.user.email).toBe('email error');
  });

  it('should set error on deeply nested path', () => {
    const obj: Record<string, any> = {};
    const result = setObjectError(obj, 'a.b.c.d', 'deep error', false);

    expect(result).toBe(true);
    expect(obj.a.b.c.d).toBe('deep error');
  });

  it('should handle array paths', () => {
    const obj: Record<string, any> = {};
    const result = setObjectError(obj, 'items.0.name', ['array error'], false);

    expect(result).toBe(true);
    expect(obj.items.$each[0].name).toEqual(['array error']);
  });

  it('should handle array error with isArray flag', () => {
    const obj: Record<string, any> = {};
    const result = setObjectError(obj, 'items', ['array self error'], false);

    expect(result).toBe(true);
    expect(obj.items).toEqual(['array self error']);
  });

  it('should handle array path with isArray flag', () => {
    const obj: Record<string, any> = {};
    const result = setObjectError(obj, 'items.0', ['item error'], true);

    expect(result).toBe(true);
    expect(obj.items[0].$self).toEqual(['item error']);
  });

  it('should throw error for invalid props arg', () => {
    const obj: Record<string, any> = {};
    expect(() => setObjectError(obj, 123 as any, 'error', false)).toThrow(
      'props arg must be an array, a string or a symbol'
    );
  });

  it('should throw error for prototype pollution attempts', () => {
    const obj: Record<string, any> = {};
    expect(() => setObjectError(obj, '__proto__.polluted', 'error', false)).toThrow(
      'setting of prototype values not supported'
    );
    expect(() => setObjectError(obj, 'constructor.polluted', 'error', false)).toThrow(
      'setting of prototype values not supported'
    );
    expect(() => setObjectError(obj, 'prototype.polluted', 'error', false)).toThrow(
      'setting of prototype values not supported'
    );
  });

  it('should return false for empty path', () => {
    const obj: Record<string, any> = {};
    const result = setObjectError(obj, '', 'error', false);

    expect(result).toBe(false);
  });

  it('should handle existing object structure', () => {
    const obj: Record<string, any> = { user: { name: 'John' } };
    const result = setObjectError(obj, 'user.email', 'email error', false);

    expect(result).toBe(true);
    expect(obj.user.name).toBe('John');
    expect(obj.user.email).toBe('email error');
  });
});

describe('getDotPath', () => {
  it('should get value from simple path', () => {
    const obj = { name: 'John' };
    expect(getDotPath(obj, 'name')).toBe('John');
  });

  it('should get value from nested path', () => {
    const obj = { user: { email: 'john@example.com' } };
    expect(getDotPath(obj, 'user.email')).toBe('john@example.com');
  });

  it('should get value from deeply nested path', () => {
    const obj = { a: { b: { c: { d: 'value' } } } };
    expect(getDotPath(obj, 'a.b.c.d')).toBe('value');
  });

  it('should return default value for non-existent path', () => {
    const obj = { name: 'John' };
    expect(getDotPath(obj, 'email', 'default')).toBe('default');
  });

  it('should return default value for nested non-existent path', () => {
    const obj = { user: { name: 'John' } };
    expect(getDotPath(obj, 'user.email', 'default')).toBe('default');
  });

  it('should return default value for null object', () => {
    expect(getDotPath(null as any, 'name', 'default')).toBe('default');
  });

  it('should return default value for undefined object', () => {
    expect(getDotPath(undefined as any, 'name', 'default')).toBe('default');
  });

  it('should handle array paths', () => {
    const obj = { items: [{ name: 'item1' }, { name: 'item2' }] };
    expect(getDotPath(obj, 'items.0.name')).toBe('item1');
    expect(getDotPath(obj, 'items.1.name')).toBe('item2');
  });

  it('should handle array of paths', () => {
    const obj = { user: { email: 'john@example.com' } };
    expect(getDotPath(obj, ['user', 'email'])).toBe('john@example.com');
  });

  it('should throw error for invalid props arg', () => {
    const obj = { name: 'John' };
    expect(() => getDotPath(obj, 123 as any)).toThrow('props arg must be an array, a string or a symbol');
  });

  it('should return undefined when no default provided', () => {
    const obj = { name: 'John' };
    expect(getDotPath(obj, 'email')).toBeUndefined();
  });

  it('should handle empty path', () => {
    const obj = { name: 'John' };
    expect(getDotPath(obj, '')).toBeUndefined();
  });

  it('should handle paths with undefined intermediate values', () => {
    const obj: Record<string, any> = { user: {} };
    expect(getDotPath(obj, 'user.email.name')).toBeUndefined();
  });
});

describe('merge', () => {
  it('should merge two objects', () => {
    const obj1 = { a: 1 };
    const obj2 = { b: 2 };
    const result = merge(obj1, obj2);

    expect(result).toEqual({ a: 1, b: 2 });
  });

  it('should merge multiple objects', () => {
    const obj1 = { a: 1 };
    const obj2 = { b: 2 };
    const obj3 = { c: 3 };
    const result = merge(obj1, obj2, obj3);

    expect(result).toEqual({ a: 1, b: 2, c: 3 });
  });

  it('should override properties from left to right', () => {
    const obj1 = { a: 1, b: 1 };
    const obj2 = { b: 2 };
    const obj3 = { b: 3 };
    const result = merge(obj1, obj2, obj3);

    expect(result).toEqual({ a: 1, b: 3 });
  });

  it('should mutate the first object', () => {
    const obj1 = { a: 1 };
    const obj2 = { b: 2 };
    const result = merge(obj1, obj2);

    expect(obj1).toEqual({ a: 1, b: 2 });
    expect(result).toBe(obj1);
  });

  it('should handle empty objects', () => {
    const obj1 = {};
    const obj2 = {};
    const result = merge(obj1, obj2);

    expect(result).toEqual({});
  });

  it('should handle null and undefined in objects', () => {
    const obj1 = { a: 1 };
    const obj2 = { b: null, c: undefined };
    const result = merge(obj1, obj2);

    expect(result).toEqual({ a: 1, b: null, c: undefined });
  });

  it('should throw error for non-object arguments', () => {
    expect(() => merge({ a: 1 }, null as any)).toThrow('expected object, got null');
    expect(() => merge({ a: 1 }, undefined as any)).toThrow('expected object, got undefined');
    expect(() => merge({ a: 1 }, 'string' as any)).toThrow('expected object, got string');
    expect(() => merge({ a: 1 }, 123 as any)).toThrow('expected object, got 123');
  });

  it('should handle function values', () => {
    const func = () => 'test';
    const obj1 = { a: 1 };
    const obj2 = { func };
    const result = merge(obj1, obj2);

    expect(result.func).toBe(func);
  });

  it('should handle nested objects (shallow merge)', () => {
    const obj1 = { a: { x: 1 } };
    const obj2 = { a: { y: 2 } };
    const result = merge(obj1, obj2);

    expect(result.a).toEqual({ y: 2 });
  });

  it('should handle arrays', () => {
    const obj1 = { items: [1, 2] };
    const obj2 = { items: [3, 4] };
    const result = merge(obj1, obj2);

    expect(result.items).toEqual([3, 4]);
  });
});
