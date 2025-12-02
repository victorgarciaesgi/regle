import { mount } from '@vue/test-utils';
import ParentCollector from './fixtures/ParentCollector.vue';
import { isVueSuperiorOrEqualTo3dotFive } from '../../../../packages/core/src/utils';
import { useScope5Regle } from './fixtures/scoped-config';
import { z } from 'zod';
import { RegleVuePlugin } from '@regle/core';

describe('useScopedRegle', () => {
  // Weird test bug to resolve with Vue 3.4
  if (isVueSuperiorOrEqualTo3dotFive) {
    const wrapper = mount(ParentCollector, {
      attachTo: document.documentElement,
      global: {
        plugins: [RegleVuePlugin],
      },
    });

    it('should work with default exported scoped composables', async () => {
      await wrapper.vm.$nextTick();
      expect(wrapper.vm.scope0R$.$dirty).toBe(false);
      expect(wrapper.vm.scope0R$.$anyDirty).toBe(false);
      expect(wrapper.vm.scope0R$.$invalid).toBe(true);
      expect(wrapper.vm.scope0R$.$correct).toBe(false);
      expect(wrapper.vm.scope0R$.$error).toBe(false);
      expect(wrapper.vm.scope0R$.$edited).toBe(false);
      expect(wrapper.vm.scope0R$.$anyEdited).toBe(false);
      expect(wrapper.vm.scope0R$.$instances).toHaveLength(1);
      expect(wrapper.vm.scope0R$.$errors).toStrictEqual([{ scope0Data: [] }]);
      expect(wrapper.vm.scope0R$.$value).toStrictEqual([{ scope0Data: '' }]);
    });

    it('should behave correctly with multiple scopes', async () => {
      await wrapper.vm.$nextTick();

      expect(wrapper.vm.scope1R$.$dirty).toBe(false);
      expect(wrapper.vm.scope1R$.$anyDirty).toBe(false);
      expect(wrapper.vm.scope1R$.$invalid).toBe(false);
      expect(wrapper.vm.scope1R$.$correct).toBe(false);
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
      expect(wrapper.vm.scope1R$.$correct).toBe(false);
      expect(wrapper.vm.scope1R$.$error).toBe(false);
      expect(wrapper.vm.scope1R$.$edited).toBe(false);
      expect(wrapper.vm.scope1R$.$anyEdited).toBe(false);
      expect(wrapper.vm.scope1R$.$instances).toHaveLength(2);
      expect(wrapper.vm.scope1R$.$errors).toStrictEqual([{ scope1Data: [] }, { scope1Data: [] }]);
      expect(wrapper.vm.scope1R$.$value).toStrictEqual([{ scope1Data: '' }, { scope1Data: '' }]);

      wrapper.vm.showScope1_1 = false;
      await wrapper.vm.$nextTick();

      expect(wrapper.vm.scope1R$.$dirty).toBe(false);
      expect(wrapper.vm.scope1R$.$anyDirty).toBe(false);
      expect(wrapper.vm.scope1R$.$invalid).toBe(true);
      expect(wrapper.vm.scope1R$.$correct).toBe(false);
      expect(wrapper.vm.scope1R$.$error).toBe(false);
      expect(wrapper.vm.scope1R$.$edited).toBe(false);
      expect(wrapper.vm.scope1R$.$anyEdited).toBe(false);
      expect(wrapper.vm.scope1R$.$instances).toHaveLength(1);
      expect(wrapper.vm.scope1R$.$errors).toStrictEqual([{ scope1Data: [] }]);
      expect(wrapper.vm.scope1R$.$value).toStrictEqual([{ scope1Data: '' }]);

      wrapper.vm.showScope1_1 = true;
      await wrapper.vm.$nextTick();

      expect(wrapper.vm.scope1R$.$dirty).toBe(false);
      expect(wrapper.vm.scope1R$.$anyDirty).toBe(false);
      expect(wrapper.vm.scope1R$.$invalid).toBe(true);
      expect(wrapper.vm.scope1R$.$correct).toBe(false);
      expect(wrapper.vm.scope1R$.$error).toBe(false);
      expect(wrapper.vm.scope1R$.$edited).toBe(false);
      expect(wrapper.vm.scope1R$.$anyEdited).toBe(false);
      expect(wrapper.vm.scope1R$.$instances).toHaveLength(2);
      expect(wrapper.vm.scope1R$.$errors).toStrictEqual([{ scope1Data: [] }, { scope1Data: [] }]);
      expect(wrapper.vm.scope1R$.$value).toStrictEqual([{ scope1Data: '' }, { scope1Data: '' }]);

      wrapper.findAll('.scope1-input')[0].setValue('Hello');
      await wrapper.vm.$nextTick();

      expect(wrapper.vm.scope1R$.$dirty).toBe(false);
      expect(wrapper.vm.scope1R$.$anyDirty).toBe(true);
      expect(wrapper.vm.scope1R$.$invalid).toBe(true);
      expect(wrapper.vm.scope1R$.$correct).toBe(false);
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
      expect(wrapper.vm.scope1R$.$correct).toBe(false);
      expect(wrapper.vm.scope1R$.$error).toBe(true);
      expect(wrapper.vm.scope1R$.$edited).toBe(false);
      expect(wrapper.vm.scope1R$.$anyEdited).toBe(true);
      expect(wrapper.vm.scope1R$.$instances).toHaveLength(2);
      expect(wrapper.vm.scope1R$.$errors).toStrictEqual([
        { scope1Data: [] },
        { scope1Data: ['Too small: expected string to have >=1 characters'] },
      ]);
      expect(wrapper.vm.scope1R$.$value).toStrictEqual([{ scope1Data: 'Hello2' }, { scope1Data: '' }]);

      wrapper.findAll('.scope1-input')[0].setValue('Hello1');
      await wrapper.vm.$nextTick();

      expect(wrapper.vm.scope1R$.$dirty).toBe(true);
      expect(wrapper.vm.scope1R$.$anyDirty).toBe(true);
      expect(wrapper.vm.scope1R$.$invalid).toBe(false);
      expect(wrapper.vm.scope1R$.$correct).toBe(true);
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
      expect(wrapper.vm.scope1R$.$correct).toBe(true);
      expect(wrapper.vm.scope1R$.$edited).toBe(true);
      expect(wrapper.vm.scope1R$.$anyEdited).toBe(true);
      expect(wrapper.vm.scope1R$.$instances).toHaveLength(2);
      expect(wrapper.vm.scope1R$.$errors).toStrictEqual([{ scope1Data: [] }, { scope1Data: [] }]);
      expect(wrapper.vm.scope1R$.$value).toStrictEqual([{ scope1Data: 'Hello2' }, { scope1Data: 'Hello1' }]);

      expect(wrapper.vm.scope2R$.$dirty).toBe(false);
      expect(wrapper.vm.scope2R$.$anyDirty).toBe(false);
      expect(wrapper.vm.scope2R$.$invalid).toBe(true);
      expect(wrapper.vm.scope2R$.$correct).toBe(false);
      expect(wrapper.vm.scope2R$.$error).toBe(false);
      expect(wrapper.vm.scope2R$.$edited).toBe(false);
      expect(wrapper.vm.scope2R$.$anyEdited).toBe(false);
      expect(wrapper.vm.scope2R$.$instances).toHaveLength(3);
      expect(wrapper.vm.scope2R$.$errors).toStrictEqual([{ scope2Data: [] }, { scope2Data: [] }, { scope2Data: [] }]);
      expect(wrapper.vm.scope2R$.$value).toStrictEqual([{ scope2Data: '' }, { scope2Data: '' }, { scope2Data: '' }]);

      wrapper.vm.showScope1 = false;
      await wrapper.vm.$nextTick();

      expect(wrapper.vm.scope1R$.$dirty).toBe(false);
      expect(wrapper.vm.scope1R$.$anyDirty).toBe(false);
      expect(wrapper.vm.scope1R$.$invalid).toBe(false);
      expect(wrapper.vm.scope1R$.$error).toBe(false);
      expect(wrapper.vm.scope1R$.$correct).toBe(false);
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
      expect(wrapper.vm.scope1R$.$correct).toBe(false);
      expect(wrapper.vm.scope1R$.$edited).toBe(false);
      expect(wrapper.vm.scope1R$.$anyEdited).toBe(false);
      expect(wrapper.vm.scope1R$.$instances).toStrictEqual([]);
      expect(wrapper.vm.scope1R$.$errors).toStrictEqual([]);
      expect(wrapper.vm.scope1R$.$silentErrors).toStrictEqual([]);
      expect(wrapper.vm.scope1R$.$value).toStrictEqual([]);
    });

    it('should work with namespaces', async () => {
      wrapper.vm.showScope1Namespace = true;
      await wrapper.vm.$nextTick();

      expect(wrapper.vm.scope1NamespaceR$.$dirty).toBe(false);
      expect(wrapper.vm.scope1NamespaceR$.$anyDirty).toBe(false);
      expect(wrapper.vm.scope1NamespaceR$.$invalid).toBe(true);
      expect(wrapper.vm.scope1NamespaceR$.$error).toBe(false);
      expect(wrapper.vm.scope1NamespaceR$.$correct).toBe(false);
      expect(wrapper.vm.scope1NamespaceR$.$edited).toBe(false);
      expect(wrapper.vm.scope1NamespaceR$.$anyEdited).toBe(false);
      expect(wrapper.vm.scope1NamespaceR$.$instances).toHaveLength(1);
      expect(wrapper.vm.scope1NamespaceR$.$errors).toStrictEqual([{ scope1Namespace: [] }]);

      expect(wrapper.vm.scope1NamespaceR$.$value).toStrictEqual([{ scope1Namespace: '' }]);

      wrapper.vm.scopeNamespace = 'other';
      await wrapper.vm.$nextTick();

      expect(wrapper.vm.scope1R$.$dirty).toBe(false);
      expect(wrapper.vm.scope1R$.$anyDirty).toBe(false);
      expect(wrapper.vm.scope1R$.$invalid).toBe(false);
      expect(wrapper.vm.scope1R$.$correct).toBe(false);
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
      expect(wrapper.vm.scope1NamespaceR$.$correct).toBe(false);
      expect(wrapper.vm.scope1NamespaceR$.$edited).toBe(false);
      expect(wrapper.vm.scope1NamespaceR$.$anyEdited).toBe(false);
      expect(wrapper.vm.scope1NamespaceR$.$instances).toHaveLength(1);
      expect(wrapper.vm.scope1NamespaceR$.$errors).toStrictEqual([{ scope1Namespace: [] }]);
      expect(wrapper.vm.scope1NamespaceR$.$value).toStrictEqual([{ scope1Namespace: '' }]);

      wrapper.vm.showScope1Namespace = false;
      await wrapper.vm.$nextTick();

      expect(wrapper.vm.scope1R$.$dirty).toBe(false);
      expect(wrapper.vm.scope1R$.$anyDirty).toBe(false);
      expect(wrapper.vm.scope1R$.$invalid).toBe(false);
      expect(wrapper.vm.scope1R$.$correct).toBe(false);
      expect(wrapper.vm.scope1R$.$error).toBe(false);
      expect(wrapper.vm.scope1R$.$edited).toBe(false);
      expect(wrapper.vm.scope1R$.$anyEdited).toBe(false);
      expect(wrapper.vm.scope1R$.$instances).toStrictEqual([]);
      expect(wrapper.vm.scope1R$.$errors).toStrictEqual([]);
      expect(wrapper.vm.scope1R$.$silentErrors).toStrictEqual([]);
      expect(wrapper.vm.scope1R$.$value).toStrictEqual([]);
    });

    it('should handle the `asRecord` option', async () => {
      expect(wrapper.vm.scope5R$.$dirty).toBe(false);
      expect(wrapper.vm.scope5R$.$anyDirty).toBe(false);
      expect(wrapper.vm.scope5R$.$invalid).toBe(false);
      expect(wrapper.vm.scope5R$.$correct).toBe(false);
      expect(wrapper.vm.scope5R$.$error).toBe(false);
      expect(wrapper.vm.scope5R$.$edited).toBe(false);
      expect(wrapper.vm.scope5R$.$anyEdited).toBe(false);
      expect(wrapper.vm.scope5R$.$instances).toStrictEqual({});
      expect(wrapper.vm.scope5R$.$errors).toStrictEqual({});
      expect(wrapper.vm.scope5R$.$value).toStrictEqual({});

      wrapper.vm.showScope5 = true;
      await wrapper.vm.$nextTick();

      expect(wrapper.vm.scope5R$.$dirty).toBe(false);
      expect(wrapper.vm.scope5R$.$anyDirty).toBe(false);
      expect(wrapper.vm.scope5R$.$invalid).toBe(true);
      expect(wrapper.vm.scope5R$.$correct).toBe(false);
      expect(wrapper.vm.scope5R$.$error).toBe(false);
      expect(wrapper.vm.scope5R$.$edited).toBe(false);
      expect(wrapper.vm.scope5R$.$anyEdited).toBe(false);
      expect(Object.keys(wrapper.vm.scope5R$.$instances)).toHaveLength(1);
      expect(wrapper.vm.scope5R$.$errors).toStrictEqual({
        scope5: {
          scope5Record: [],
        },
      });
      expect(wrapper.vm.scope5R$.$value).toStrictEqual({
        scope5: {
          scope5Record: '',
        },
      });

      expect(wrapper.vm.scope5R$.$value.scope5.scope5Record).toBe('');

      // @ts-expect-error no 3rd argument
      useScope5Regle({}, z.object({}));
      // @ts-expect-error no `id` option
      useScope5Regle({}, z.object({}), {});
      // ✅
      useScope5Regle({}, z.object({}), { id: 'foo' });
    });
  }

  it('should be empty', () => {
    expect(true).toBe(true);
  });
});
