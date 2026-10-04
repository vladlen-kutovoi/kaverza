<script setup lang="ts">
// -- Global variables ---------------------------------------------------
const route = useRoute();

// --- API -----------------------------------------------------------------
const { data: player } = await useFetch(`/api/players/${route.params.slug}`);

// --- Meta ----------------------------------------------------------------
useHead({ title: computed(() => player.value?.name ?? "Гравець") });

// --- Computed ------------------------------------------------------------
// Four tiles, so they sit as a tidy 2x2 inside their half of the page
const stats = computed(() => {
  if (!player.value) return [];

  return [
    { label: "Рейтинг", value: player.value.rating, accent: true },
    { label: "Ігор", value: player.value.stats.games, accent: false },
    { label: "Перемог", value: player.value.stats.wins, accent: false },
    {
      label: "Вінрейт",
      value: `${player.value.stats.winRate}%`,
      accent: false,
    },
  ];
});

// Starts from the rating before the first game, so the line shows the
// whole journey rather than beginning at the first result
const ratingPoints = computed(() => {
  const history = player.value?.ratingHistory ?? [];
  const first = history[0];

  if (!first) return [];

  return [
    { value: first.ratingBefore, label: `Старт · ${first.ratingBefore}` },
    ...history.map((item, index) => ({
      value: item.ratingAfter,
      label: `Матч ${index + 1} · ${item.ratingAfter}`,
    })),
  ];
});

// --- Composables ---------------------------------------------------------
const { page, pageCount, pageItems } = usePagination(
  () => player.value?.games
);

// --- Methods -------------------------------------------------------------
function formatChange(change: number): string {
  return change > 0 ? `+${change}` : `${change}`;
}
</script>
<template>
  <div v-if="player" class="flex flex-col gap-8">
    <div class="flex flex-wrap items-start justify-between gap-3">
      <!-- The portrait is the one thing on the page that is purely the
           player's, so it leads the heading rather than sitting in a card -->
      <div class="flex min-w-0 items-center gap-4">
        <UiAvatar :player="player" style="--avatar-size: 4.5rem" />
        <div class="min-w-0">
          <h1>{{ player.name }}</h1>
          <p
            v-if="player.favoriteCharacter"
            class="mt-1 flex items-center gap-1.5 text-base text-muted"
          >
            Улюблений персонаж:
            <UiCharacterLink :character="player.favoriteCharacter" />
          </p>
        </div>
      </div>
      <NuxtLink to="/players" class="btn btn-secondary btn-sm">
        Усі гравці
      </NuxtLink>
    </div>

    <!-- One grid for all four blocks: two per row once there is room,
         stacked below that. No breakpoint - the track minimum decides. -->
    <div class="grid-auto items-start" style="--min: 20rem; --gap: 2rem">
      <section class="flex flex-col gap-3">
        <h2 class="section-heading">Статистика</h2>
        <div class="grid-auto" style="--min: 8rem; --max: 2">
          <div v-for="stat in stats" :key="stat.label" class="card">
            <p
              class="font-mono text-3xl font-semibold tabular-nums"
              :class="stat.accent ? 'text-accent-text' : ''"
            >
              {{ stat.value }}
            </p>
            <p class="mt-0.5 text-sm text-muted">{{ stat.label }}</p>
          </div>
        </div>
      </section>

      <section v-if="ratingPoints.length" class="flex flex-col gap-3 h-full">
        <h2 class="section-heading">Зміна рейтингу</h2>
        <div class="card grow">
          <UiLineChart :points="ratingPoints" class="grow" />
        </div>
      </section>

      <section v-if="player.characters.length" class="flex flex-col gap-3">
        <h2 class="section-heading">Персонажі</h2>
        <div class="table-wrap">
          <table class="table">
            <thead>
              <tr>
                <th>Персонаж</th>
                <th class="text-right">Ігор</th>
                <th class="text-right">Перемог</th>
                <th class="text-right">Вінрейт</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="character in player.characters" :key="character.id">
                <td><UiCharacterLink :character="character" /></td>
                <td class="text-right font-mono tabular-nums">
                  {{ character.games }}
                </td>
                <td class="text-right font-mono tabular-nums">
                  {{ character.wins }}
                </td>
                <td class="text-right font-mono tabular-nums">
                  {{ character.winRate }}%
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section v-if="player.games.length" class="flex flex-col gap-3">
        <h2 class="section-heading">Історія ігор</h2>
        <div class="table-wrap">
          <table class="table">
            <thead>
              <tr>
                <th>Дата</th>
                <th>Формат</th>
                <th>Персонаж</th>
                <th class="text-right">Рейтинг</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="game in pageItems" :key="game.id">
                <td>
                  <NuxtLink
                    :to="`/games/${game.id}`"
                    class="link whitespace-nowrap"
                  >
                    {{ formatDate(game.createdAt) }}
                  </NuxtLink>
                </td>
                <td class="text-muted">{{ getGameName(game.type) }}</td>
                <td><UiCharacterLink :character="game.character" /></td>
                <td
                  class="text-right font-mono tabular-nums"
                  :class="
                    game.ratingChange >= 0 ? 'text-success' : 'text-danger'
                  "
                >
                  {{ formatChange(game.ratingChange) }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <UiPagination v-model="page" :page-count="pageCount" />
      </section>
    </div>
  </div>

  <p v-else class="card items-center py-10 text-base text-muted">
    Гравця не знайдено.
  </p>
</template>
