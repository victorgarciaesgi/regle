import { Ref } from 'vue';

export function isObject(obj: unknown): obj is Record<string, any> {
  return typeof obj === 'object' && obj !== null && !Array.isArray(obj);
}

export function isRefObject(obj: Ref<unknown>): obj is Ref<Record<string, any>> {
  return isObject(obj.value);
}
