import { describe, it, expect, vi } from 'vitest';
import { abortablePromise, AbortError } from '../utils/abortablePromise';

describe('abortablePromise', () => {
  it('should resolve when the input promise resolves', async () => {
    const inputPromise = Promise.resolve('success');
    const { promise } = abortablePromise(inputPromise);

    await expect(promise).resolves.toBe('success');
  });

  it('should reject when the input promise rejects', async () => {
    const inputPromise = Promise.reject(new Error('original error'));
    const { promise } = abortablePromise(inputPromise);

    await expect(promise).rejects.toThrow('original error');
  });

  it('should reject with AbortError when aborted before resolution', async () => {
    const inputPromise = new Promise((resolve) => {
      setTimeout(() => resolve('success'), 100);
    });
    const { promise, abort } = abortablePromise(inputPromise);

    abort();
    await expect(promise).rejects.toThrow(AbortError);
    await expect(promise).rejects.toThrow('Promise was aborted');
  });

  it('should reject with AbortError if aborted after input promise resolves but before our promise resolves', async () => {
    let resolveInput: (value: string) => void;
    const inputPromise = new Promise<string>((resolve) => {
      resolveInput = resolve;
    });
    const { promise, abort } = abortablePromise(inputPromise);

    const promiseResult = promise;
    abort();
    resolveInput!('success');

    await expect(promiseResult).rejects.toThrow(AbortError);
  });

  it('should mark signal as aborted when abort is called', async () => {
    const inputPromise = Promise.resolve('success');
    const { signal, abort, promise } = abortablePromise(inputPromise);

    expect(signal.aborted).toBe(false);
    abort();
    expect(signal.aborted).toBe(true);
    await expect(promise).rejects.toThrow(AbortError);
  });

  it('should handle already aborted signal', async () => {
    const inputPromise = Promise.resolve('success');

    const { promise, abort } = abortablePromise(inputPromise);
    abort();

    await expect(promise).rejects.toThrow(AbortError);
  });

  it('should clean up event listener when promise rejects', async () => {
    const inputPromise = Promise.reject(new Error('error'));
    const { promise, signal } = abortablePromise(inputPromise);

    const removeEventListenerSpy = vi.spyOn(signal, 'removeEventListener');

    await expect(promise).rejects.toThrow('error');

    expect(removeEventListenerSpy).toHaveBeenCalled();
  });
});
