import { mount } from '@vue/test-utils';
import ParentCollector from './fixtures/ParentCollector.vue';
import { isVueSuperiorOrEqualTo3dotFive } from '../../../packages/core/src/utils';

describe('useScopedRegle', () => {
  // Weird test bug to resolve with Vue 3.4
  if (isVueSuperiorOrEqualTo3dotFive) {
    const wrapper = mount(ParentCollector, { attachTo: document.documentElement });

    it('should behave correctly with multiple scopes', async () => {
      await wrapper.vm.$nextTick();

      expect(wrapper.vm.scope1R$.$dirty).toBe(false);
      expect(wrapper.vm.scope1R$.$anyDirty).toBe(false);
      expect(wrapper.vm.scope1R$.$invalid).toBe(false);
      expect(wrapper.vm.scope1R$.$valid).toBe(false);
      expect(wrapper.vm.scope1R$.$error).toBe(false);
      expect(wrapper.vm.scope1R$.$edited).toBe(false);
      expect(wrapper.vm.scope1R$.$anyEdited).toBe(false);
      expect(wrapper.vm.scope1R$.$instances).toStrictEqual([]);
      expect(wrapper.vm.scope1R$.$errors).toStrictEqual([]);
      expect(wrapper.vm.scope1R$.$silentErrors).toStrictEqual([]);
      expect(wrapper.vm.scope1R$.$value).toStrictEqual([]);

      wrapper.vm.showScope1 = true;
      await wrapper.vm.$nextTick();

      expect(wrapper.vm.scope1R$.$dirty).toBe(false);
      expect(wrapper.vm.scope1R$.$anyDirty).toBe(false);
      expect(wrapper.vm.scope1R$.$invalid).toBe(true);
      expect(wrapper.vm.scope1R$.$valid).toBe(false);
      expect(wrapper.vm.scope1R$.$error).toBe(false);
      expect(wrapper.vm.scope1R$.$edited).toBe(false);
      expect(wrapper.vm.scope1R$.$anyEdited).toBe(false);
      expect(wrapper.vm.scope1R$.$instances).toHaveLength(2);
      expect(wrapper.vm.scope1R$.$errors).toStrictEqual([{ scope1Data: [] }, { scope1Data: [] }]);
      expect(wrapper.vm.scope1R$.$silentErrors).toStrictEqual([
        { scope1Data: ['This field is required'] },
        { scope1Data: ['This field is required'] },
      ]);
      expect(wrapper.vm.scope1R$.$value).toStrictEqual([{ scope1Data: '' }, { scope1Data: '' }]);

      wrapper.vm.showScope1_1 = false;
      await wrapper.vm.$nextTick();

      expect(wrapper.vm.scope1R$.$dirty).toBe(false);
      expect(wrapper.vm.scope1R$.$anyDirty).toBe(false);
      expect(wrapper.vm.scope1R$.$invalid).toBe(true);
      expect(wrapper.vm.scope1R$.$valid).toBe(false);
      expect(wrapper.vm.scope1R$.$error).toBe(false);
      expect(wrapper.vm.scope1R$.$edited).toBe(false);
      expect(wrapper.vm.scope1R$.$anyEdited).toBe(false);
      expect(wrapper.vm.scope1R$.$instances).toHaveLength(1);
      expect(wrapper.vm.scope1R$.$errors).toStrictEqual([{ scope1Data: [] }]);
      expect(wrapper.vm.scope1R$.$silentErrors).toStrictEqual([{ scope1Data: ['This field is required'] }]);
      expect(wrapper.vm.scope1R$.$value).toStrictEqual([{ scope1Data: '' }]);

      wrapper.vm.showScope1_1 = true;
      await wrapper.vm.$nextTick();

      expect(wrapper.vm.scope1R$.$dirty).toBe(false);
      expect(wrapper.vm.scope1R$.$anyDirty).toBe(false);
      expect(wrapper.vm.scope1R$.$invalid).toBe(true);
      expect(wrapper.vm.scope1R$.$valid).toBe(false);
      expect(wrapper.vm.scope1R$.$error).toBe(false);
      expect(wrapper.vm.scope1R$.$edited).toBe(false);
      expect(wrapper.vm.scope1R$.$anyEdited).toBe(false);
      expect(wrapper.vm.scope1R$.$instances).toHaveLength(2);
      expect(wrapper.vm.scope1R$.$errors).toStrictEqual([{ scope1Data: [] }, { scope1Data: [] }]);
      expect(wrapper.vm.scope1R$.$silentErrors).toStrictEqual([
        { scope1Data: ['This field is required'] },
        { scope1Data: ['This field is required'] },
      ]);
      expect(wrapper.vm.scope1R$.$value).toStrictEqual([{ scope1Data: '' }, { scope1Data: '' }]);

      wrapper.findAll('.scope1-input')[0].setValue('Hello');
      await wrapper.vm.$nextTick();

      expect(wrapper.vm.scope1R$.$dirty).toBe(false);
      expect(wrapper.vm.scope1R$.$anyDirty).toBe(true);
      expect(wrapper.vm.scope1R$.$invalid).toBe(true);
      expect(wrapper.vm.scope1R$.$valid).toBe(false);
      expect(wrapper.vm.scope1R$.$error).toBe(false);
      expect(wrapper.vm.scope1R$.$edited).toBe(false);
      expect(wrapper.vm.scope1R$.$anyEdited).toBe(true);
      expect(wrapper.vm.scope1R$.$instances).toHaveLength(2);
      expect(wrapper.vm.scope1R$.$errors).toStrictEqual([{ scope1Data: [] }, { scope1Data: [] }]);
      expect(wrapper.vm.scope1R$.$value).toStrictEqual([{ scope1Data: '' }, { scope1Data: 'Hello' }]);

      wrapper.findAll('.scope1-input')[0].setValue('');
      wrapper.findAll('.scope1-input')[1].setValue('Hello2');
      await wrapper.vm.$nextTick();

      expect(wrapper.vm.scope1R$.$dirty).toBe(true);
      expect(wrapper.vm.scope1R$.$anyDirty).toBe(true);
      expect(wrapper.vm.scope1R$.$invalid).toBe(true);
      expect(wrapper.vm.scope1R$.$valid).toBe(false);
      expect(wrapper.vm.scope1R$.$error).toBe(true);
      expect(wrapper.vm.scope1R$.$edited).toBe(false);
      expect(wrapper.vm.scope1R$.$anyEdited).toBe(true);
      expect(wrapper.vm.scope1R$.$instances).toHaveLength(2);
      expect(wrapper.vm.scope1R$.$errors).toStrictEqual([
        { scope1Data: [] },
        { scope1Data: ['This field is required'] },
      ]);
      expect(wrapper.vm.scope1R$.$value).toStrictEqual([{ scope1Data: 'Hello2' }, { scope1Data: '' }]);

      wrapper.findAll('.scope1-input')[0].setValue('Hello1');
      await wrapper.vm.$nextTick();

      expect(wrapper.vm.scope1R$.$dirty).toBe(true);
      expect(wrapper.vm.scope1R$.$anyDirty).toBe(true);
      expect(wrapper.vm.scope1R$.$invalid).toBe(false);
      expect(wrapper.vm.scope1R$.$valid).toBe(true);
      expect(wrapper.vm.scope1R$.$error).toBe(false);
      expect(wrapper.vm.scope1R$.$edited).toBe(true);
      expect(wrapper.vm.scope1R$.$anyEdited).toBe(true);
      expect(wrapper.vm.scope1R$.$instances).toHaveLength(2);
      expect(wrapper.vm.scope1R$.$errors).toStrictEqual([{ scope1Data: [] }, { scope1Data: [] }]);
      expect(wrapper.vm.scope1R$.$value).toStrictEqual([{ scope1Data: 'Hello2' }, { scope1Data: 'Hello1' }]);

      wrapper.vm.showScope2 = true;
      await wrapper.vm.$nextTick();

      expect(wrapper.vm.scope1R$.$dirty).toBe(true);
      expect(wrapper.vm.scope1R$.$anyDirty).toBe(true);
      expect(wrapper.vm.scope1R$.$invalid).toBe(false);
      expect(wrapper.vm.scope1R$.$error).toBe(false);
      expect(wrapper.vm.scope1R$.$valid).toBe(true);
      expect(wrapper.vm.scope1R$.$edited).toBe(true);
      expect(wrapper.vm.scope1R$.$anyEdited).toBe(true);
      expect(wrapper.vm.scope1R$.$instances).toHaveLength(2);
      expect(wrapper.vm.scope1R$.$errors).toStrictEqual([{ scope1Data: [] }, { scope1Data: [] }]);
      expect(wrapper.vm.scope1R$.$value).toStrictEqual([{ scope1Data: 'Hello2' }, { scope1Data: 'Hello1' }]);

      expect(wrapper.vm.scope2R$.$dirty).toBe(false);
      expect(wrapper.vm.scope2R$.$anyDirty).toBe(false);
      expect(wrapper.vm.scope2R$.$invalid).toBe(true);
      expect(wrapper.vm.scope2R$.$valid).toBe(false);
      expect(wrapper.vm.scope2R$.$error).toBe(false);
      expect(wrapper.vm.scope2R$.$edited).toBe(false);
      expect(wrapper.vm.scope2R$.$anyEdited).toBe(false);
      expect(wrapper.vm.scope2R$.$instances).toHaveLength(3);
      expect(wrapper.vm.scope2R$.$errors).toStrictEqual([{ scope2Data: [] }, { scope2Data: [] }, { scope2Data: [] }]);
      expect(wrapper.vm.scope2R$.$silentErrors).toStrictEqual([
        { scope2Data: ['This field is required'] },
        { scope2Data: ['This field is required'] },
        { scope2Data: ['This field is required'] },
      ]);
      expect(wrapper.vm.scope2R$.$value).toStrictEqual([{ scope2Data: '' }, { scope2Data: '' }, { scope2Data: '' }]);

      wrapper.vm.showScope1 = false;
      await wrapper.vm.$nextTick();

      expect(wrapper.vm.scope1R$.$dirty).toBe(false);
      expect(wrapper.vm.scope1R$.$anyDirty).toBe(false);
      expect(wrapper.vm.scope1R$.$invalid).toBe(false);
      expect(wrapper.vm.scope1R$.$error).toBe(false);
      expect(wrapper.vm.scope1R$.$valid).toBe(false);
      expect(wrapper.vm.scope1R$.$edited).toBe(false);
      expect(wrapper.vm.scope1R$.$anyEdited).toBe(false);
      expect(wrapper.vm.scope1R$.$instances).toStrictEqual([]);
      expect(wrapper.vm.scope1R$.$errors).toStrictEqual([]);
      expect(wrapper.vm.scope1R$.$silentErrors).toStrictEqual([]);
      expect(wrapper.vm.scope1R$.$value).toStrictEqual([]);

      wrapper.vm.showScope1 = false;
      await wrapper.vm.$nextTick();

      expect(wrapper.vm.scope1R$.$dirty).toBe(false);
      expect(wrapper.vm.scope1R$.$anyDirty).toBe(false);
      expect(wrapper.vm.scope1R$.$invalid).toBe(false);
      expect(wrapper.vm.scope1R$.$error).toBe(false);
      expect(wrapper.vm.scope1R$.$valid).toBe(false);
      expect(wrapper.vm.scope1R$.$edited).toBe(false);
      expect(wrapper.vm.scope1R$.$anyEdited).toBe(false);
      expect(wrapper.vm.scope1R$.$instances).toStrictEqual([]);
      expect(wrapper.vm.scope1R$.$errors).toStrictEqual([]);
      expect(wrapper.vm.scope1R$.$silentErrors).toStrictEqual([]);
      expect(wrapper.vm.scope1R$.$value).toStrictEqual([]);
    });

    it('should work with global config', async () => {
      wrapper.vm.showScope3 = true;
      await wrapper.vm.$nextTick();

      expect(wrapper.vm.scope3R$.$dirty).toBe(false);
      expect(wrapper.vm.scope3R$.$anyDirty).toBe(false);
      expect(wrapper.vm.scope3R$.$invalid).toBe(true);
      expect(wrapper.vm.scope3R$.$error).toBe(false);
      expect(wrapper.vm.scope3R$.$valid).toBe(false);
      expect(wrapper.vm.scope3R$.$edited).toBe(false);
      expect(wrapper.vm.scope3R$.$anyEdited).toBe(false);
      expect(wrapper.vm.scope3R$.$instances).toHaveLength(1);
      expect(wrapper.vm.scope3R$.$errors).toStrictEqual([{ scope3Data: [] }]);
      expect(wrapper.vm.scope3R$.$silentErrors).toStrictEqual([{ scope3Data: ['Custom error'] }]);
      expect(wrapper.vm.scope3R$.$value).toStrictEqual([{ scope3Data: '' }]);

      wrapper.findAll('.scope3-input')[0].setValue('Hello');
      await wrapper.vm.$nextTick();

      expect(wrapper.vm.scope3R$.$dirty).toBe(true);
      expect(wrapper.vm.scope3R$.$anyDirty).toBe(true);
      expect(wrapper.vm.scope3R$.$invalid).toBe(false);
      expect(wrapper.vm.scope3R$.$valid).toBe(true);
      expect(wrapper.vm.scope3R$.$error).toBe(false);
      expect(wrapper.vm.scope3R$.$edited).toBe(true);
      expect(wrapper.vm.scope3R$.$anyEdited).toBe(true);
      expect(wrapper.vm.scope3R$.$instances).toHaveLength(1);
      expect(wrapper.vm.scope3R$.$errors).toStrictEqual([{ scope3Data: [] }]);
      expect(wrapper.vm.scope3R$.$value).toStrictEqual([{ scope3Data: 'Hello' }]);
    });

    it('should work with namespaces', async () => {
      wrapper.vm.showScope1Namespace = true;
      await wrapper.vm.$nextTick();

      expect(wrapper.vm.scope1NamespaceR$.$dirty).toBe(false);
      expect(wrapper.vm.scope1NamespaceR$.$anyDirty).toBe(false);
      expect(wrapper.vm.scope1NamespaceR$.$invalid).toBe(true);
      expect(wrapper.vm.scope1NamespaceR$.$error).toBe(false);
      expect(wrapper.vm.scope1NamespaceR$.$valid).toBe(false);
      expect(wrapper.vm.scope1NamespaceR$.$edited).toBe(false);
      expect(wrapper.vm.scope1NamespaceR$.$anyEdited).toBe(false);
      expect(wrapper.vm.scope1NamespaceR$.$instances).toHaveLength(1);
      expect(wrapper.vm.scope1NamespaceR$.$errors).toStrictEqual([{ scope1Namespace: [] }]);
      expect(wrapper.vm.scope1NamespaceR$.$silentErrors).toStrictEqual([
        { scope1Namespace: ['This field is required'] },
      ]);
      expect(wrapper.vm.scope1NamespaceR$.$value).toStrictEqual([{ scope1Namespace: '' }]);

      wrapper.vm.scopeNamespace = 'other';
      await wrapper.vm.$nextTick();

      expect(wrapper.vm.scope1R$.$dirty).toBe(false);
      expect(wrapper.vm.scope1R$.$anyDirty).toBe(false);
      expect(wrapper.vm.scope1R$.$invalid).toBe(false);
      expect(wrapper.vm.scope1R$.$valid).toBe(false);
      expect(wrapper.vm.scope1R$.$error).toBe(false);
      expect(wrapper.vm.scope1R$.$edited).toBe(false);
      expect(wrapper.vm.scope1R$.$anyEdited).toBe(false);
      expect(wrapper.vm.scope1R$.$instances).toStrictEqual([]);
      expect(wrapper.vm.scope1R$.$errors).toStrictEqual([]);
      expect(wrapper.vm.scope1R$.$silentErrors).toStrictEqual([]);
      expect(wrapper.vm.scope1R$.$value).toStrictEqual([]);

      wrapper.vm.scopeNamespace = 'scope';
      await wrapper.vm.$nextTick();

      expect(wrapper.vm.scope1NamespaceR$.$dirty).toBe(false);
      expect(wrapper.vm.scope1NamespaceR$.$anyDirty).toBe(false);
      expect(wrapper.vm.scope1NamespaceR$.$invalid).toBe(true);
      expect(wrapper.vm.scope1NamespaceR$.$error).toBe(false);
      expect(wrapper.vm.scope1NamespaceR$.$valid).toBe(false);
      expect(wrapper.vm.scope1NamespaceR$.$edited).toBe(false);
      expect(wrapper.vm.scope1NamespaceR$.$anyEdited).toBe(false);
      expect(wrapper.vm.scope1NamespaceR$.$instances).toHaveLength(1);
      expect(wrapper.vm.scope1NamespaceR$.$errors).toStrictEqual([{ scope1Namespace: [] }]);
      expect(wrapper.vm.scope1NamespaceR$.$silentErrors).toStrictEqual([
        { scope1Namespace: ['This field is required'] },
      ]);
      expect(wrapper.vm.scope1NamespaceR$.$value).toStrictEqual([{ scope1Namespace: '' }]);

      wrapper.vm.showScope1Namespace = false;
      await wrapper.vm.$nextTick();

      expect(wrapper.vm.scope1R$.$dirty).toBe(false);
      expect(wrapper.vm.scope1R$.$anyDirty).toBe(false);
      expect(wrapper.vm.scope1R$.$invalid).toBe(false);
      expect(wrapper.vm.scope1R$.$valid).toBe(false);
      expect(wrapper.vm.scope1R$.$error).toBe(false);
      expect(wrapper.vm.scope1R$.$edited).toBe(false);
      expect(wrapper.vm.scope1R$.$anyEdited).toBe(false);
      expect(wrapper.vm.scope1R$.$instances).toStrictEqual([]);
      expect(wrapper.vm.scope1R$.$errors).toStrictEqual([]);
      expect(wrapper.vm.scope1R$.$silentErrors).toStrictEqual([]);
      expect(wrapper.vm.scope1R$.$value).toStrictEqual([]);
    });
  }

  it('should be emtpy', () => {
    expect(true).toBe(true);
  });
});