<script setup lang="ts">
import { ref } from 'vue'
import { useRegle } from '@regle/core'
import { required, minLength, email } from '@regle/rules'
import useForm from './useForm'

type Form = {
  name: string | null
  email: string | null
  address: {
    street: string | null
  }
}

const form = ref<Form>({
  name: '',
  email: '',
  address: {
    street: '',
  },
})

const { r$ } = useRegle(form, {
  name: { required, minLength: minLength(4) },
  email: { email },
  address: {
    street: {
      required,
    },
  },
})

useForm({ r$ })
</script>
