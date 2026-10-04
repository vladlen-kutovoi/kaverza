<script setup lang="ts">
// --- Meta -------------------------------------------------------------
useHead({ title: "Гравці" });

// -- API --------------------------------------------------------
const { data: players } = await useFetch("/api/players");

// --- Computed ---------------------------------------------------------
const ranked = computed(() =>
  [...(players.value ?? [])].sort(
    (a, b) => b.rating - a.rating || a.name.localeCompare(b.name),
  ),
);
</script>
<template>
  <div class="flex flex-col gap-5">
    <h1>Гравці</h1>

    <div v-if="ranked.length" class="table-wrap">
      <table class="table">
        <thead>
          <tr>
            <th class="w-10">#</th>
            <th>Гравець</th>
            <th class="text-right">Рейтинг</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(player, index) in ranked" :key="player.id">
            <td class="tabular-nums text-muted">{{ index + 1 }}</td>
            <td>
              <NuxtLink
                :to="`/players/${player.slug}`"
                class="link flex items-center gap-2.5"
              >
                <UiAvatar :player="player" />
                <span class="truncate">{{ player.name }}</span>
              </NuxtLink>
            </td>
            <td class="text-right font-mono tabular-nums text-accent-text">
              {{ player.rating }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <p v-else class="card items-center py-10 text-base text-muted">
      Ще немає гравців.
    </p>
  </div>
</template>
