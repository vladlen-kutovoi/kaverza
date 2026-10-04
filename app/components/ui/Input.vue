<script setup lang="ts">
// --- Props -----------------------------------------------------------
withDefaults(
  defineProps<{
    label?: string;
    error?: string;
    type?: string;
    placeholder?: string;
    required?: boolean;
    disabled?: boolean;
  }>(),
  {
    type: "text",
  },
);

// --- Model Value ------------------------------------------------------
const model = defineModel<string | number | null>();

// --- Variables --------------------------------------------------------
const id = useId();
</script>
<template>
  <div class="field">
    <label v-if="label" :for="id" class="label" :data-required="required || undefined">
      {{ label }}
    </label>

    <input
      :id="id"
      v-model="model"
      class="input"
      :type="type"
      :placeholder="placeholder"
      :required="required"
      :disabled="disabled"
      :aria-invalid="Boolean(error) || undefined"
      :aria-describedby="error ? `${id}-error` : undefined"
    />

    <span v-if="error" :id="`${id}-error`" class="field-error" role="alert">
      {{ error }}
    </span>
  </div>
</template>
