<script setup lang="ts">
// @noErrors
import { useRegle } from '@regle/core';
import { required } from '@regle/rules';
import { ref } from 'vue';

const form = ref({ email: '', user: { firstName: '', lastName: '' } });

const { regle, errors } = useRegle(form, {
  user: {
    firstName: { required },
  },
});

regle.$fields.user.$fields.firstName;
//                 ^|
</script>
