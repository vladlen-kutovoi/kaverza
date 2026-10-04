<script setup lang="ts">
// --- Props -------------------------------------------------------------
const props = defineProps<{
  character: { name: string; slug: string; color: string };
  /** Renders a NuxtLink to the character, with its name plate on top */
  link?: boolean;
}>();

// --- Variables ---------------------------------------------------------
const NuxtLinkComponent = resolveComponent("NuxtLink");

// The art is bundled, not fetched by guessed URL: a character whose card
// has not been scanned yet simply has no entry here and falls back to its
// initial, with no broken request on the way. Files are named after the
// slug, so there is no column in the db to keep in sync.
const art = Object.fromEntries(
  Object.entries(
    import.meta.glob<string>("../../assets/images/cardbacks/*.webp", {
      eager: true,
      query: "?url",
      import: "default",
    }),
  ).map(([path, url]) => [path.split("/").pop()!.replace(".webp", ""), url]),
);

// --- Computed ----------------------------------------------------------
const src = computed(() => art[props.character.slug]);
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
