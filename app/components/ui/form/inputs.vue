<script setup lang="ts">
//  --- Types -----------------------------------------------------------
import type {
  FormField,
  SearchFieldValue,
} from "~/interfaces/components/ui/form";

//  --- Props -----------------------------------------------------------
defineProps<{
  fields: FormField[];
  errors?: Record<string, string>;
}>();

// --- Model Value ------------------------------------------------------
const formData = defineModel<Record<string, unknown>>({
  default: () => ({}),
});
</script>
<template>
  <!-- A label per field wires the caption to its control for free, but
       the avatar picker is a radio group whose options carry labels of
       their own, and labels cannot nest - that one gets a plain div and
       is named by its own aria-label instead. -->
  <component
    :is="field.type === 'avatar' ? 'div' : 'label'"
    v-for="field in fields"
    :key="field.name"
    class="field"
  >
    <span class="label">{{ field.label }}</span>

    <UiFormSearch
      v-if="field.type === 'search'"
      :model-value="formData[field.name] as SearchFieldValue"
      :label="field.label"
      :invalid="Boolean(errors?.[field.name])"
      :option-label="field.optionLabel"
      :options="field.options"
      @update:model-value="formData[field.name] = $event"
    />
    <UiFormAvatar
      v-else-if="field.type === 'avatar'"
      :model-value="formData[field.name] as string"
      :label="field.label"
      :invalid="Boolean(errors?.[field.name])"
      @update:model-value="formData[field.name] = $event"
    />
    <input
      v-else
      v-model="formData[field.name]"
      class="input"
      :type="field.type"
      :aria-invalid="Boolean(errors?.[field.name]) || undefined"
    />

    <span v-if="errors?.[field.name]" class="field-error" role="alert">
      {{ errors[field.name] }}
    </span>
  </component>
</template>
