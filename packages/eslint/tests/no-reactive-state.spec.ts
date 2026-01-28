import { ruleTester } from './ruleTester';
import { noReactiveState } from '../src';

ruleTester.run('no-reactive-state', noReactiveState, {
  valid: [
    `useRegle({ name: '' }, { name: { required: () => true } });`,
    `const state = ref({ name: '' }); useRegle(state, { name: { required: () => true } });`,
  ],
  invalid: [
    {
      code: `const state = reactive({name: ''}); const {r$} = useRegle(state, { name: { required: () => true } });`,
      errors: [{ messageId: 'no-reactive-state' }],
    },
  ],
});
