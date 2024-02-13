import { mount } from '@vue/test-utils';
import { ComponentOptionsBase, defineComponent, ref } from 'vue';

export function createComponentWithRules<
  S extends ComponentOptionsBase<any, any, any, any, any, any, any, any>['setup'],
>(customSetupFn: S) {
  const testComponent = defineComponent({
    template: '<div></div>',
    setup: customSetupFn,
  });

  return mount(testComponent);
}
