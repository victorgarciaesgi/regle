<template>
  <!-- Values -->
  <pre>{{ r$.$value }}</pre
  ><br />
  <!-- Errors -->
  <pre>{{ r$.$errors }}</pre>

  <div style="display: flex; flex-direction: column; gap: 16px; width: 500px">
    <label>
      Name
      <input v-model="r$.$value.name" /> </label
    ><br />

    <label>
      Top level type
      <select v-model="r$.type.$value">
        <option disabled value="">Top level type</option>
        <option value="a">A</option>
        <option value="b">B</option>
        <option value="c">C</option>
      </select> </label
    ><br />

    <label>
      A
      <input type="text" v-model="r$.a.$value" /> </label
    ><br />

    <label>
      B
      <input type="text" v-model="r$.b.$value" /> </label
    ><br />

    <label>
      C
      <input type="text" v-model="r$.c.$value" /> </label
    ><br />

    <!-- Array field -->
    <div style="border: 1px solid; padding: 14px" v-for="field in r$.array.$each" :key="field.$id">
      <label>
        Type
        <select v-model="field.type.$value">
          <option disabled value="">Field type</option>
          <option value="test">Test</option>
          <option value="rest">Rest</option>
          <option value="grest">Grest</option>
        </select> </label
      ><br />

      <label>
        Test
        <input type="text" v-model="field.test.$value" /> </label
      ><br />

      <label>
        Rest
        <input type="text" v-model="field.rest.$value" /> </label
      ><br />

      <label>
        Grest
        <input type="text" v-model="field.grest.$value" /> </label
      ><br />
    </div>

    <button @click="addTopLevel">Add one top level array field</button>
    <button @click="moveTopLevelUp">Move last up</button>
    <button @click="submit">Submit me!</button>
  </div>
</template>

<script setup lang="ts">
  import { createVariant, useRegle } from '@regle/core';
  import { literal, required } from '@regle/rules';
  import { ref } from 'vue';

  const createArrayField = (type = 'test') => ({
    type: type as 'test' | 'rest' | 'grest',
    test: type === 'test' ? 'test' : '',
    rest: type === 'rest' ? 'rest' : '',
    grest: type === 'grest' ? 'grest' : '',
  });

  const values = ref({
    name: 'test',
    type: 'a' as 'a' | 'b' | 'c',
    a: 'a',
    b: '',
    c: '',
    array: [createArrayField()],
  });

  const { r$ } = useRegle(values, () => {
    const topLevelVariant = createVariant(values, 'type', [
      { type: { literal: literal('a') }, a: { required } },
      { type: { literal: literal('b') }, b: { required } },
      { type: { literal: literal('c') }, c: { required } },
      { type: { required } },
    ]);

    return {
      name: { required },
      a: {},
      b: {},
      c: {},
      ...topLevelVariant.value,
      array: {
        $each: (field) => {
          const variant = createVariant(field, 'type', [
            { type: { literal: literal('test') }, test: { required } },
            { type: { literal: literal('rest') }, rest: { required } },
            { type: { literal: literal('grest') }, grest: { required } },
            { type: { required } },
          ]);

          return {
            test: {},
            rest: {},
            grest: {},
            ...variant.value,
          };
        },
      },
    };
  });

  const submit = async () => {
    const res = await r$.$validate();
    console.log(res);
  };

  const addTopLevel = () => {
    r$.$value.array.push(createArrayField(''));
  };

  // Moves the top level array's item one index higher within the array
  const moveTopLevelUp = () => {
    r$.$value.array.unshift(r$.$value.array.pop());
  };
</script>
