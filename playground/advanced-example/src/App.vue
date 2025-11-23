<script setup lang="ts">
import { type _DeepPartial } from 'pinia';
import MyInput from './components/MyInput.vue';
import { useMyForm } from './stores/myForm.store';
import Password from './components/Password.vue';
import { ref } from 'vue';
import FieldError from './components/FieldError.vue';

const myForm = useMyForm();

const dirtyFields = ref<ReturnType<typeof myForm.r$.$extractDirtyFields>>();

function extractDirtyFields() {
  dirtyFields.value = myForm.r$.$extractDirtyFields();
}

function reset() {
  dirtyFields.value = undefined;
  myForm.r$.$reset({ toInitialState: true });
}

async function submit() {
  const { valid, data } = await myForm.r$.$validate();
  if (valid) {
    alert('Your form is valid!');
    console.log(data);
    //           ^ Hover type here to see type safe result
  }
}
</script>

<template>
  <div class="px-6 text-gray-900 antialiased">
    <div class="mx-auto divide-y py-12 md:max-w-4xl">
      <div class="py-12 flex flex-col justify-center items-center">
        <h2 class="text-2xl font-bold">Advanced Regle</h2>
        <div class="mt-8 w-[500px]">
          <div class="grid grid-cols-1 gap-4">
            <MyInput
              v-model="myForm.r$.$value.user.pseudo"
              :field="myForm.r$.user.pseudo"
              label="Pseudo"
              placeholder="Type your unique pseudo"
            />

            <Password
              v-model="myForm.r$.$value.user.password"
              :field="myForm.r$.user.password"
              label="Password"
              placeholder="********"
            />

            <MyInput
              v-model="myForm.r$.$value.user.confirmPassword"
              :field="myForm.r$.user.confirmPassword"
              type="password"
              label="Confirm your password"
              placeholder="********"
            />

            <MyInput
              v-model="myForm.r$.$value.additionalInfos"
              label="Additional informations"
              placeholder="Optional informations"
            />

            <h3 class="text-xl font-bold">Projects</h3>
            <div class="flex flex-col gap-2">
              <template v-if="myForm.r$.projects.$each.length">
                <div
                  class="rounded border border-gray-400 border-dashed p-4"
                  v-for="(project, index) of myForm.r$.projects.$each"
                  :key="project.$id"
                >
                  <div class="flex justify-between">
                    <span>Project {{ index + 1 }}</span>
                    <button
                      class="mt-2 hover:bg-red-600 text-white h-6 w-6 bg-red-400 text-cs font-semibold border rounded flex items-center justify-center"
                      @click="myForm.r$.$value.projects.splice(index, 1)"
                    >
                      X
                    </button>
                  </div>
                  <div class="flex flex-col gap-2">
                    <MyInput v-model="project.name.$value" :field="project.name" label="Name of the project" />
                    <MyInput
                      v-model="project.countMaintainers.$value"
                      type="number"
                      :field="project.countMaintainers"
                      label="Number of maintainers"
                    />

                    <div class="flex flex-col gap-2">
                      <template v-if="project.maintainers.$each.length">
                        <div
                          class="rounded border border-gray-400 border-dashed p-4"
                          v-for="(maintainer, index) of project.maintainers.$each"
                          :key="maintainer.$id"
                        >
                          <div class="flex justify-between">
                            <span>Maintainer {{ index + 1 }}</span>
                            <button
                              class="mt-2 hover:bg-red-600 text-white h-6 w-6 bg-red-400 text-cs font-semibold border rounded flex items-center justify-center"
                              @click="project.$value.maintainers.splice(index, 1)"
                            >
                              X
                            </button>
                          </div>
                          <div class="flex flex-col gap-2">
                            <MyInput
                              v-model="maintainer.name.$value"
                              :field="maintainer.name"
                              label="Name of the maintainer"
                            />
                          </div>
                        </div>
                      </template>
                      <div v-else class="rounded border border-gray-400 border-dashed p-4">No maintainers</div>
                      <FieldError :errors="project.maintainers.$errors.$self" />
                      <div class="flex justify-center">
                        <button
                          class="bg-white mt-2 hover:bg-gray-100 text-gray-800 text-sm font-semibold py-1 px-3 border border-gray-400 rounded shadow"
                          @click="project.$value.maintainers.push({ name: '' })"
                        >
                          Add a maintainer
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </template>
              <div v-else class="rounded border border-gray-400 border-dashed p-4">No projects</div>
              <FieldError :errors="myForm.r$.projects.$errors.$self" />
              <div class="flex justify-center">
                <button
                  class="bg-white mt-2 hover:bg-gray-100 text-gray-800 text-sm font-semibold py-1 px-3 border border-gray-400 rounded shadow"
                  @click="myForm.r$.$value.projects.push({ name: '', countMaintainers: undefined, maintainers: [] })"
                >
                  Add a project
                </button>
              </div>
            </div>
            <div class="flex justify-between p-3 shadow rounded border">
              <div class="flex gap-1">
                <button
                  class="bg-white hover:bg-gray-100 text-gray-800 font-semibold py-2 px-4 border border-gray-400 rounded shadow"
                  @click="reset"
                >
                  Reset
                </button>
                <button
                  class="bg-white hover:bg-gray-100 text-gray-800 font-semibold py-2 px-4 border border-gray-400 rounded shadow"
                  @click="extractDirtyFields"
                >
                  Extract dirty fields
                </button>
              </div>
              <button
                class="bg-indigo-500 text-white hover:bg-indigo-600 font-semibold py-2 px-4 rounded shadow"
                @click="submit"
              >
                Submit
              </button>
            </div>
            <div>
              <div v-if="dirtyFields">
                <span>Dirty fields</span>
                <pre class="bg-warmGray-50 border rounded p-1">{{ dirtyFields }}</pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped></style>
