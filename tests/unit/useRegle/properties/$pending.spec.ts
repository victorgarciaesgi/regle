import { flushPromises } from '@vue/test-utils';
import { useRegle } from '@regle/core';
import { ruleMockIsEvenAsync, ruleMockIsEven, ruleMockIsFooAsync } from '../../../fixtures';
import { createRegleComponent } from '../../../utils/test.utils';
import { nextTick, ref } from 'vue';

function nesteAsyncObjectWithRefsValidation() {
  const form = ref({
    level0: 0,
    level1: {
      child: 0,
    },
    collection: [{ child: 0 }],
  });

  return useRegle(form, {
    level0: { ruleEvenAsync: ruleMockIsEvenAsync() },
    level1: {
      child: { ruleEven: ruleMockIsEven },
    },
    collection: {
      $each: (value) => ({
        child: {},
      }),
    },
  });
}

describe('$pending', () => {
  it('sets `$pending` to `true`, when async validators are used and are being resolved', () => {});

  it('propagates `$pending` up to the top most parent', () => {});

  it('sets `$pending` to false, when the last async invocation resolves', () => {});
});
