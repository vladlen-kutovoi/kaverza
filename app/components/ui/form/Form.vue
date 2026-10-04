<script setup lang="ts">
//  --- Types -----------------------------------------------------------
import type { FormField } from "~/interfaces/components/ui/form";

//  --- Emits -----------------------------------------------------------
const emit = defineEmits(["submitForm"]);

//  --- Props -----------------------------------------------------------
defineProps<{
  fields: FormField[];
  submitText: string;
  errors?: Record<string, string>;
  loading: boolean;
}>();

// --- Model Value ------------------------------------------------------
const formData = defineModel<Record<string, unknown>>({
  default: () => ({}),
});
</script>
<template>
  <form
    class="flex flex-col gap-4"
    @submit.prevent="emit('submitForm', formData)"
  >
    <UiFormInputs v-model="formData" :fields="fields" :errors="errors" />

    <UiButton type="submit" :loading="loading" block>
      {{ submitText }}
    </UiButton>
  </form>
</template>
