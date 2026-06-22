import { useRegle } from '@regle/core';

useRegle({ email: '' }, { email: { required: (v) => !!v } });
