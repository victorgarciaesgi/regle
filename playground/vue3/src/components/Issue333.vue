<template>
  <div style="font-family: system-ui; padding: 20px; max-width: 900px">
    <h1>Issue #333 – Memory pressure reproduction</h1>
    <p>
      Reproduces
      <a href="https://github.com/victorgarciaesgi/regle/issues/333" target="_blank">#333</a>: deeply nested schema with
      many array items causes noticeable memory spikes on every keystroke.
    </p>

    <section style="padding: 12px; background: #f5f5f5; border-radius: 8px; margin-bottom: 16px">
      <strong>Controls:</strong>
      <button @click="addTasks(1)">+1 task</button>
      <button @click="addTasks(10)">+10 tasks</button>
      <button @click="addTasks(40)">+40 tasks</button>
      <button @click="form.task_sections.tasks = []">Reset tasks</button>
      <span style="margin-left: 12px">Tasks: {{ form.task_sections.tasks.length }}</span>
      <br />
      <label style="margin-top: 8px; display: inline-block">
        <input v-model="showValidationState" type="checkbox" />
        Render validation errors (toggle off to compare)
      </label>
    </section>

    <section style="padding: 12px; background: #fff8dc; border-radius: 8px; margin-bottom: 16px">
      <strong>Metrics:</strong>
      <div>Last validation run: {{ lastValidationMs.toFixed(2) }} ms</div>
      <div>JS heap (if exposed): {{ heapInfo }}</div>
      <button @click="measureTyping">Type 20 chars programmatically into task[0].name</button>
    </section>

    <h3>Top-level fields</h3>
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px">
      <input v-model="form.name" placeholder="name" />
      <input v-model.number="form.some_number" placeholder="some_number" />
      <input v-model.number="form.some_year" placeholder="some_year" />
      <input v-model="form.some_gov_id" placeholder="some_gov_id" />
      <input v-model="form.adopted_on" placeholder="adopted_on" />
      <input v-model="form.published_on" placeholder="published_on" />
      <input v-model="form.material_number" placeholder="material_number" />
      <input v-model="form.link" placeholder="link" />
      <input v-model="form.resolution_outcome" placeholder="resolution_outcome" />
      <input v-model="form.lead_presenter" placeholder="lead_presenter" />
    </div>

    <h3>task_sections.tasks[]</h3>
    <input v-model="form.task_sections.action" placeholder="section action" style="width: 100%; margin-bottom: 8px" />

    <div
      v-for="(task, index) of r$.$fields.task_sections.$fields.tasks.$each"
      :key="index"
      style="border: 1px solid #ddd; padding: 8px; margin-bottom: 8px; border-radius: 4px"
    >
      <strong>#{{ index }}</strong>
      <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 6px; margin-top: 4px">
        <input v-model="task.$value.some_id" placeholder="some_id" />
        <input v-model="task.$value.some_code" placeholder="some_code" />
        <input v-model="task.$value.some_action" placeholder="some_action" />
        <input v-model="task.$value.name" placeholder="name" :class="{ err: task.$fields.name.$error }" />
        <input v-model="task.$value.some_id_periodic" placeholder="some_id_periodic" />
        <input v-model="task.$value.date_from" placeholder="date_from" />
        <input v-model="task.$value.date_until" placeholder="date_until" />
      </div>
      <template v-if="showValidationState">
        <ul style="color: crimson; margin: 4px 0">
          <li v-for="(errs, k) in task.$errors" :key="k">
            <template v-if="Array.isArray(errs) && errs.length">{{ k }}: {{ errs.join(', ') }}</template>
          </li>
        </ul>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { useRegleSchema } from '@regle/schemas';
  import { reactive, ref, onMounted, onUnmounted, watch } from 'vue';
  import { z } from 'zod/v3';

  const task = z.object({
    some_id: z.string(),
    some_code: z.string(),
    some_action: z.string().optional(),
    name: z.string(),
    some_id_periodic: z.string().optional(),
    date_from: z.string().nullable().optional(),
    date_until: z.string().nullable().optional(),
  });

  const rules = z.object({
    name: z.string(),
    some_number: z.number(),
    some_year: z.number(),
    some_gov_id: z.string(),
    adopted_on: z.string(),
    published_on: z.string(),
    material_number: z.string(),
    link: z.string(),
    resolution_outcome: z.string(),
    lead_presenter: z.string(),
    task_sections: z.object({
      action: z.string(),
      tasks: z.array(task),
    }),
  });

  type FormShape = z.infer<typeof rules>;

  const form = reactive<FormShape>({
    name: '',
    some_number: 0,
    some_year: 2026,
    some_gov_id: '',
    adopted_on: '',
    published_on: '',
    material_number: '',
    link: '',
    resolution_outcome: '',
    lead_presenter: '',
    task_sections: {
      action: '',
      tasks: [],
    },
  });

  const { r$ } = useRegleSchema(form, rules);

  const showValidationState = ref(true);
  const lastValidationMs = ref(0);
  const heapInfo = ref('(not available – start Chrome with --enable-precise-memory-info)');

  function addTasks(n: number) {
    for (let i = 0; i < n; i++) {
      form.task_sections.tasks.push({
        some_id: `id_${form.task_sections.tasks.length}`,
        some_code: 'code',
        some_action: '',
        name: '',
        some_id_periodic: '',
        date_from: null,
        date_until: null,
      });
    }
  }

  async function measureTyping() {
    if (!form.task_sections.tasks[0]) {
      addTasks(1);
    }
    form.task_sections.tasks[0]!.name = '';
    const start = performance.now();
    for (let i = 0; i < 20; i++) {
      form.task_sections.tasks[0]!.name += 'a';
      await Promise.resolve();
    }
    lastValidationMs.value = performance.now() - start;
  }

  let raf: number | null = null;
  function tick() {
    const perf = performance as any;
    if (perf.memory) {
      const used = (perf.memory.usedJSHeapSize / 1024 / 1024).toFixed(1);
      const total = (perf.memory.totalJSHeapSize / 1024 / 1024).toFixed(1);
      heapInfo.value = `${used} MB used / ${total} MB total`;
    }
    raf = requestAnimationFrame(tick);
  }
  onMounted(() => {
    tick();
  });
  onUnmounted(() => {
    if (raf) cancelAnimationFrame(raf);
  });
</script>

<style scoped>
  button {
    margin-right: 6px;
    padding: 4px 10px;
    cursor: pointer;
  }
  input {
    padding: 4px 6px;
    border: 1px solid #ccc;
    border-radius: 4px;
  }
  input.err {
    border-color: crimson;
  }
</style>
