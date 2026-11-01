<script setup lang="ts">
// --- Props -------------------------------------------------------------
const props = defineProps<{
  character: { name: string; slug: string; color: string };
  /** Renders a NuxtLink to the character, with its name plate on top */
  link?: boolean;
}>();

// --- Variables ---------------------------------------------------------
const NuxtLinkComponent = resolveComponent("NuxtLink");

// --- Computed ----------------------------------------------------------
const src = computed(() => cardbackArt[props.character.slug]);
</script>
<template>
  <component
    :is="link ? NuxtLinkComponent : 'div'"
    :to="link ? `/characters/${character.slug}` : undefined"
    class="cardback"
    :class="{ 'card-interactive': link }"
    :style="{ '--cardback-tint': character.color }"
  >
    <!-- Decorative once the plate below carries the name -->
    <img
      v-if="src"
      :src="src"
      :alt="link ? '' : character.name"
      loading="lazy"
    />
    <span v-else class="cardback-fallback" aria-hidden="true">
      {{ character.name.slice(0, 1) }}
    </span>

    <span v-if="link" class="cardback-label">
      <span class="dot" :style="{ background: character.color }" />
      <span class="card-title truncate">{{ character.name }}</span>
    </span>
  </component>
</template>
