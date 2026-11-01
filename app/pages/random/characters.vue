<script setup lang="ts">
// --- Meta -------------------------------------------------------------
useHead({ title: "Рандом персонажа" });

// --- API --------------------------------------------------------
const { data: characters } = await useFetch("/api/characters");

// --- Computed ---------------------------------------------------------
// Keyed by slug, so the opted-out list in storage outlives db ids
const options = computed(() =>
  [...(characters.value ?? [])]
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((character) => ({
      id: character.slug,
      name: character.name,
      color: character.color,
      art: cardbackArt[character.slug],
    })),
);
</script>
<template>
  <div class="flex flex-col gap-5">
    <h1>Рандом персонажа</h1>
    <p class="text-base text-muted">
      Натисніть на персонажа, щоб прибрати його з жеребу.
    </p>

    <UiRandomizer
      v-if="options.length"
      v-slot="{ option }"
      :options="options"
      storage-key="randomizer:characters"
      multiple
    >
      <img v-if="option.art" :src="option.art" alt="" />
      <span
        v-else
        class="cardback-fallback"
        :style="{ '--cardback-tint': option.color }"
      >
        {{ option.name.slice(0, 1) }}
      </span>
    </UiRandomizer>
    <p v-else class="card items-center py-10 text-base text-muted">
      Ще немає персонажів.
    </p>
  </div>
</template>
