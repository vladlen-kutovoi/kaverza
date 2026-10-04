<script setup lang="ts">
// --- Props -----------------------------------------------------------
defineProps<{
  character: { name: string; slug: string; color: string };
}>();
</script>
<template>
  <NuxtLink
    :to="`/characters/${character.slug}`"
    class="inline-flex min-w-0 items-center gap-1.5 text-muted no-underline hover:text-text"
  >
    <span class="dot" :style="{ background: character.color }" />
    <span class="truncate">{{ character.name }}</span>
  </NuxtLink>
</template>
