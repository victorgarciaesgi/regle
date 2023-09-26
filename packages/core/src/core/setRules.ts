export function createSetRules() {
  function setRules<T>(state: T, rules: Record<string, any>) {
    return { state, rules };
  }

  return setRules;
}

export const setRules = createSetRules();
