<script setup lang="ts">
// --- Meta -------------------------------------------------------------
useHead({ title: "Рандом мапи" });

// --- Variables --------------------------------------------------------
const options = ["I", "II", "XVI", "XVII"].map((map) => ({
  id: map,
  name: map,
}));
</script>
<template>
  <div class="flex flex-col gap-5">
    <h1>Рандом мапи</h1>
    <p class="text-base text-muted">
      Натисніть на мапу, щоб прибрати її з жеребу.
    </p>

    <UiRandomizer
      v-slot="{ option }"
      :options="options"
      storage-key="randomizer:maps"
    >
      {{ option.name }}
    </UiRandomizer>
  </div>
</template>
