import { useRegleSchema } from '@regle/schemas';
import { nextTick, reactive, ref } from 'vue';
import { z } from 'zod/v4';
import { createRegleComponent } from '../../../utils/test.utils';

// Regression / performance test for https://github.com/victorgarciaesgi/regle/issues/333
//
// When a deeply nested schema holds a large collection and the user types in a single
// leaf field, regle should NOT rebuild the whole reactive validation tree on every
// keystroke. Before the fix, both the root state watcher and the root schemaErrors watcher
// triggered a full re-creation of every child status (40 items × N fields) on every
// validation run, which caused the memory spikes and per-keystroke cost reported in
// issue #333.
//
// This test pins that behavior: every field status instance must stay stable while
// typing into an unrelated sibling leaf, as long as the schema errors keep the same
// top-level shape.
describe('Issue #333 – deep nested schema perf', () => {
  function useDeepSchema() {
    const task = z.object({
      some_id: z.string(),
      some_code: z.string(),
      some_action: z.string().optional(),
      name: z.string().min(1, 'Required'),
      some_id_periodic: z.string().optional(),
      date_from: z.string().nullable().optional(),
      date_until: z.string().nullable().optional(),
    });

    const rules = z.object({
      name: z.string(),
      some_number: z.number(),
      task_sections: z.object({
        action: z.string(),
        tasks: z.array(task),
      }),
    });

    const state = reactive<z.infer<typeof rules>>({
      name: '',
      some_number: 0,
      task_sections: {
        action: '',
        tasks: Array.from({ length: 40 }, (_, index) => ({
          some_id: `id_${index}`,
          some_code: 'code',
          some_action: '',
          name: '',
          some_id_periodic: '',
          date_from: null,
          date_until: null,
        })),
      },
    });

    return { state, ...useRegleSchema(state, rules) };
  }

  it('should not recreate collection element statuses on content-only validation runs', async () => {
    const { vm } = createRegleComponent(useDeepSchema);

    await nextTick();

    expect(vm.r$.task_sections.tasks.$each.length).toBe(40);

    // Snapshot the status instances BEFORE typing.
    const beforeItem0 = vm.r$.task_sections.tasks.$each[0];
    const beforeItem0NameField = beforeItem0.name;
    const beforeItem39 = vm.r$.task_sections.tasks.$each[39];

    // Trigger many validation runs by simulating user typing into a deeply nested leaf.
    for (let i = 0; i < 20; i++) {
      vm.state.task_sections.tasks[0].name += 'a';
      await Promise.resolve();
    }
    await nextTick();

    // Value must actually have been written.
    expect(vm.state.task_sections.tasks[0].name).toBe('aaaaaaaaaaaaaaaaaaaa');

    // The error tree must have updated: leaf field is now valid, so no errors at that path.
    expect(vm.r$.task_sections.tasks.$each[0].name.$errors).toStrictEqual([]);

    // Status instances for unrelated items must be the SAME objects (stable references).
    // This is the heart of the fix: on every content-only validation run we used to
    // rebuild the whole children tree, replacing every status instance. Now the shape
    // is stable and only the errors Ref content changes.
    expect(vm.r$.task_sections.tasks.$each[0]).toBe(beforeItem0);
    expect(vm.r$.task_sections.tasks.$each[0].name).toBe(beforeItem0NameField);
    expect(vm.r$.task_sections.tasks.$each[39]).toBe(beforeItem39);
  });

  it('should still rebuild the tree when the schema errors shape changes', async () => {
    const state = ref<{ items: { name: string }[] }>({ items: [{ name: 'ok' }] });
    const rules = z.object({
      items: z.array(z.object({ name: z.string().min(1, 'Required') })),
    });

    function useShapeSchema() {
      return { state, ...useRegleSchema(state, rules) };
    }

    const { vm } = createRegleComponent(useShapeSchema);

    await nextTick();

    // Initially the `items` field has no error key in the errors tree.
    expect(vm.r$.$errors.items?.$each?.[0]?.name).toStrictEqual([]);

    // Trigger a shape change: now items[0].name becomes empty, so the tree grows a new key.
    vm.state.items[0].name = '';
    await nextTick();
    await nextTick();

    expect(vm.r$.$errors.items.$each[0].name).toStrictEqual(['Required']);
  });
});
