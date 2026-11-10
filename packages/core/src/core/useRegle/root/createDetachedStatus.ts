/**
 * Inert mock used in place of a stopped Regle instance.
 *
 * Vue stops a component scope before its elements leave the DOM (blur on removal, `<Transition>` leave),
 * so handlers bound to `r$` can still run. Every property access returns the mock, every call
 * returns `undefined`, and writes are ignored, so nothing throws while the status tree is released.
 *
 * See https://github.com/victorgarciaesgi/regle/issues/407
 */
export function createDetachedStatus(): any {
  const mock: any = new Proxy(() => undefined, {
    get: (_, key) => (typeof key === 'symbol' || key === 'then' || key.startsWith('__v_') ? undefined : mock),
    set: () => true,
    apply: () => undefined,
  });
  return mock;
}
