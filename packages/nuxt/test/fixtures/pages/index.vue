<template>
  <div>{{ r$.$fields.fullName.$value }}</div>
</template>

<script setup lang="ts">
import { minLength, required, email, dateBefore, and, checked } from '@regle/rules';

interface Form {
  fullName?: string;
  email?: string;
  eventDate?: Date;
  eventType?: string;
  details?: string;
  acceptTC?: boolean;
}

const { r$ } = useRegle({ fullName: 'Hello' } as Form, {
  fullName: { required, minLength: minLength(6) },
  email: { required, email },
  eventDate: {
    required,
    dateBefore: withTooltip(dateBefore(new Date()), ({ $dirty }) => {
      if (!$dirty) return 'You must put a date before today';
      return '';
    }),
  },
  eventType: { required },
  details: {
    minLength: withMessage(
      minLength(100),
      ({ $value, $params: [min] }) => `Your details are too short: ${$value?.length}/${min}`
    ),
  },
  acceptTC: {
    $autoDirty: false,
    required: withMessage(and(required, checked), 'You must accept the terms and conditions'),
  },
});
</script>

<style lang="scss" scoped></style>
