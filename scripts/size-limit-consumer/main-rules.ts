import { useRegle } from '@regle/core';
import { required } from '@regle/rules';

useRegle({ email: '' }, { email: { required } });
