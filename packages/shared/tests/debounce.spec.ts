import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ref } from 'vue';
import { flushPromises } from '@vue/test-utils';
import { debounce } from '../utils/debounce';

describe('debounce', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('should debounce function calls', async () => {
    const func = vi.fn((x: number) => x * 2);
    const debounced = debounce(func, 100);

    debounced(1);
    debounced(2);
    debounced(3);

    expect(func).not.toHaveBeenCalled();

    vi.advanceTimersByTime(100);

    expect(func).toHaveBeenCalledTimes(1);
    expect(func).toHaveBeenCalledWith(3);
  });

  it('should return a promise that resolves with the function result', async () => {
    const func = vi.fn(async (x: number) => x * 2);
    const debounced = debounce(func, 100);

    const promise = debounced(5);

    vi.advanceTimersByTime(100);

    await expect(promise).resolves.toBe(10);
  });

  it('should handle async functions', async () => {
    const func = vi.fn(async (x: number) => {
      await new Promise((resolve) => setTimeout(resolve, 10));
      return x * 2;
    });
    const debounced = debounce(func, 100);

    const promise = debounced(5);

    vi.advanceTimersByTime(100);
    vi.advanceTimersByTime(10);

    await expect(promise).resolves.toBe(10);
  });

  it('should handle immediate option', async () => {
    const func = vi.fn(async (x: number) => x * 2);
    const debounced = debounce(func, 100, { immediate: true });

    const promise1 = debounced(1);

    expect(func).toHaveBeenCalledTimes(1);
    expect(func).toHaveBeenCalledWith(1);

    await expect(promise1).resolves.toBe(2);

    debounced(2);
    debounced(3);

    expect(func).toHaveBeenCalledTimes(3);
  });

  it('should update trackDebounceRef when debouncing', async () => {
    const trackDebounceRef = ref(false);
    const func = vi.fn((x: number) => x * 2);
    const debounced = debounce(func, 100, { trackDebounceRef });

    expect(trackDebounceRef.value).toBe(false);

    debounced(1);

    expect(trackDebounceRef.value).toBe(true);

    vi.advanceTimersByTime(100);
    await flushPromises();

    expect(func).toHaveBeenCalledTimes(1);
    expect(func).toHaveBeenCalledWith(1);

    expect(trackDebounceRef.value).toBe(false);
  });

  it('should set trackDebounceRef to false when function completes', async () => {
    const trackDebounceRef = ref(false);
    const func = vi.fn(async (x: number) => {
      await new Promise((resolve) => setTimeout(resolve, 10));
      return x * 2;
    });
    const debounced = debounce(func, 100, { trackDebounceRef });

    debounced(1);

    expect(trackDebounceRef.value).toBe(true);

    vi.advanceTimersByTime(100);
    await flushPromises();

    expect(trackDebounceRef.value).toBe(false);
  });

  it('should cancel debounced function', async () => {
    const func = vi.fn((x: number) => x * 2);
    const debounced = debounce(func, 100);

    debounced(1);
    debounced.cancel();

    vi.advanceTimersByTime(100);

    expect(func).not.toHaveBeenCalled();
  });

  it('should set trackDebounceRef to false when cancelled', async () => {
    const trackDebounceRef = ref(false);
    const func = vi.fn((x: number) => x * 2);
    const debounced = debounce(func, 100, { trackDebounceRef });

    debounced(1);

    expect(trackDebounceRef.value).toBe(true);

    debounced.cancel();

    expect(trackDebounceRef.value).toBe(false);
  });

  it('should handle multiple rapid calls correctly', async () => {
    const func = vi.fn((x: number) => x);
    const debounced = debounce(func, 100);

    debounced(1);
    vi.advanceTimersByTime(50);
    debounced(2);
    vi.advanceTimersByTime(50);
    debounced(3);
    vi.advanceTimersByTime(50);
    debounced(4);

    expect(func).not.toHaveBeenCalled();

    vi.advanceTimersByTime(100);

    expect(func).toHaveBeenCalledTimes(1);
    expect(func).toHaveBeenCalledWith(4);
  });

  it('should handle function errors', async () => {
    const func = vi.fn(() => {
      throw new Error('Function error');
    });
    const debounced = debounce(func, 100);

    const promise = debounced();

    vi.advanceTimersByTime(100);

    await expect(promise).rejects.toThrow('Function error');
  });

  it('should handle promise rejections', async () => {
    const func = vi.fn(() => Promise.reject(new Error('Promise error')));
    const debounced = debounce(func, 100);

    const promise = debounced();

    vi.advanceTimersByTime(100);

    await expect(promise).rejects.toThrow('Promise error');
  });

  it('should handle function errors in immediate mode', async () => {
    const func = vi.fn(() => {
      throw new Error('Immediate function error');
    });
    const debounced = debounce(func, 100, { immediate: true });

    const promise = debounced();

    await expect(promise).rejects.toThrow('Immediate function error');
  });

  it('should handle promise rejections in immediate mode', async () => {
    const func = vi.fn(() => Promise.reject(new Error('Immediate promise error')));
    const debounced = debounce(func, 100, { immediate: true });

    const promise = debounced();

    await expect(promise).rejects.toThrow('Immediate promise error');
  });
});
