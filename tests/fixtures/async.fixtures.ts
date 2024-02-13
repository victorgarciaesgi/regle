import { vi } from 'vitest';

export function toAsync(validator: any, time = 0) {
  return (value: any) =>
    new Promise((resolve) => setTimeout(() => resolve(validator(value)), time));
}

const isEven = vi.fn((v) => v % 2 === 0);
const isOdd = vi.fn((v) => v % 2 === 1);

export const asyncIsEven = toAsync(isEven, 5);
export const asyncIsOdd = toAsync(isOdd, 5);
