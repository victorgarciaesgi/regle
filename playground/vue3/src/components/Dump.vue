<script setup lang="ts">
// @noErrors
import { timeout } from '@/validations';
import type { Maybe, InlineRuleDeclaration } from '@regle/core';
import { useRegle } from '@regle/core';
import { required } from '@regle/rules';
import { ref } from 'vue';

const form = ref({ email: '', user: { firstName: '', lastName: '' } });
const customRuleInlineAsync = (async (value: Maybe<string>) => {
  await timeout(1);
  return value === 'regle';
}) satisfies InlineRuleDeclaration;
const { regle, errors } = useRegle(form, {
  user: {
    firstName: { required },
  },
});

regle.$fields.user.$fields.firstName;
//                 ^|
</script>
