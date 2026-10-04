<script setup lang="ts">
// --- Props -----------------------------------------------------------
defineProps<{
  label?: string;
  disabled?: boolean;
  /** Renders a radio instead of a checkbox */
  radio?: boolean;
  /** Required when used as a radio */
  value?: string | number;
  name?: string;
}>();

// --- Model Value ------------------------------------------------------
const model = defineModel<boolean | string | number | unknown[] | null>();

// --- Variables --------------------------------------------------------
const id = useId();
</script>
<template>
  <div class="flex items-center gap-2">
    <input
      :id="id"
      v-model="model"
      :class="radio ? 'radio' : 'checkbox'"
      :type="radio ? 'radio' : 'checkbox'"
      :value="value"
      :name="name"
      :disabled="disabled"
    />
    <label v-if="label" :for="id" class="label cursor-pointer">
      {{ label }}
    </label>
  </div>
</template>
