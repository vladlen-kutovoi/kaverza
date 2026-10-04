<script setup lang="ts">
// --- Props -----------------------------------------------------------
defineProps<{
  pageCount: number;
}>();

// --- Models ----------------------------------------------------------
const page = defineModel<number>({ required: true });
</script>
<template>
  <nav
    v-if="pageCount > 1"
    aria-label="Сторінки"
    class="flex items-center justify-between gap-3"
  >
    <UiButton
      variant="secondary"
      size="sm"
      :disabled="page <= 1"
      @click="page--"
    >
      Назад
    </UiButton>
    <span class="font-mono text-sm tabular-nums text-muted">
      {{ page }} / {{ pageCount }}
    </span>
    <UiButton
      variant="secondary"
      size="sm"
      :disabled="page >= pageCount"
      @click="page++"
    >
      Далі
    </UiButton>
  </nav>
</template>
