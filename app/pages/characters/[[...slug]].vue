<script setup lang="ts">
// --- Types ---------------------------------------------------------------
import type { GameType } from "~/interfaces/api/game";

// --- Global variables ---------------------------------------------------
const route = useRoute();

// -- API -----------------------------------------------------------------
const { data: character } = await useFetch(
  `/api/characters/${route.params.slug}`,
);

// --- Meta ---------------------------------------------------------------
useHead({ title: computed(() => character.value?.name ?? "Персонаж") });

// --- Computed -----------------------------------------------------------
// Four tiles, so they sit as a tidy 2x2 inside their half of the page
const stats = computed(() => {
  if (!character.value) return [];

  return [
    { label: "Ігор", value: character.value.stats.games, accent: false },
    { label: "Перемог", value: character.value.stats.wins, accent: false },
    { label: "Поразок", value: character.value.stats.losses, accent: false },
    {
      label: "Вінрейт",
      value: `${character.value.stats.winRate}%`,
      accent: true,
    },
  ];
});

// Cumulative win rate after each game, so the scale is pinned to 0-100
const winRatePoints = computed(() =>
  (character.value?.winRateHistory ?? []).map((item, index) => ({
    value: item.winRate,
    label: `Матч ${index + 1} · ${item.winRate}% (${item.wins}/${item.games})`,
  })),
);

const byGameType = computed(() => {
  if (!character.value) return [];

  return Object.entries(character.value.byGameType)
    .map(([type, typeStats]) => ({ type: type as GameType, ...typeStats }))
    .filter((typeStats) => typeStats.games > 0);
});

// Flattened to one row per game: who played this character, and how it went
const gameRows = computed(() =>
  (character.value?.games ?? []).map((game) => ({
    id: game.id,
    type: game.type,
    win: game.win,
    player:
      game.teams
        .flatMap((team) => team.players)
        .find((player) => player.character.slug === character.value?.slug) ??
      null,
  })),
);

// --- Composables --------------------------------------------------------
const { page, pageCount, pageItems } = usePagination(gameRows);

// --- Template refs ------------------------------------------------------
const summary = useTemplateRef<HTMLElement>("summary");

// --- Variables ----------------------------------------------------------
// The art takes its height from the block beside it and its width from
// the card's 5:7. Grid cannot work that out on its own - the column
// width and the row height each wait on the other - so the height is
// measured and handed to the stylesheet. Until then the fallback in
// .cardback-hero holds the shape.
const summaryHeight = ref(0);

// --- Lifecycle ----------------------------------------------------------
onMounted(() => {
  const observer = new ResizeObserver(([entry]) => {
    summaryHeight.value = entry!.contentRect.height;
  });

  observer.observe(summary.value!);

  onBeforeUnmount(() => observer.disconnect());
});
</script>
<template>
  <!-- Every section marker on this page takes the character's colour -->
  <div
    v-if="character"
    class="flex flex-col gap-8"
    :style="{ '--heading-mark': character.color }"
  >
    <!-- Name on top, the four tiles as a 2x2 below, and the art beside
         them taking its height from that block - see .cardback-hero -->
    <div
      class="cardback-hero"
      :style="
        summaryHeight ? { '--cardback-hero-height': `${summaryHeight}px` } : {}
      "
    >
      <UiCardback :character="character" />

      <div ref="summary" class="flex flex-col gap-5 justify-between">
        <div class="flex flex-wrap items-start justify-between gap-3">
          <h1 class="flex items-center gap-2.5">
            <span class="dot" :style="{ background: character.color }" />
            {{ character.name }}
          </h1>
          <NuxtLink to="/characters" class="btn btn-secondary btn-sm">
            Усі персонажі
          </NuxtLink>
        </div>

        <div class="grid-auto" style="--min: 7.5rem; --max: 2">
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
      </div>
    </div>

    <!-- A run over time, so it takes the full width -->
    <section v-if="winRatePoints.length" class="flex flex-col gap-3">
      <h2 class="section-heading">Зміна вінрейту</h2>
      <div class="card">
        <!-- The character's own colour, matching its dot everywhere else -->
        <UiLineChart
          :points="winRatePoints"
          :color="character.color"
          :min="0"
          :max="100"
          suffix="%"
        />
      </div>
    </section>

    <!-- The two breakdowns share a row once there is room, stacked below
         that. No breakpoint - the track minimum decides. -->
    <div class="grid-auto items-start" style="--min: 20rem; --gap: 2rem">
      <section v-if="byGameType.length" class="flex flex-col gap-3">
        <h2 class="section-heading">За форматами</h2>
        <div class="table-wrap">
          <table class="table">
            <thead>
              <tr>
                <th>Формат</th>
                <th class="text-right">Ігор</th>
                <th class="text-right">Перемог</th>
                <th class="text-right">Вінрейт</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="typeStats in byGameType" :key="typeStats.type">
                <td>{{ getGameName(typeStats.type) }}</td>
                <td class="text-right font-mono tabular-nums">
                  {{ typeStats.games }}
                </td>
                <td class="text-right font-mono tabular-nums">
                  {{ typeStats.wins }}
                </td>
                <td class="text-right font-mono tabular-nums">
                  {{ typeStats.winRate }}%
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- Only the opponents this character has actually met, the most
           played first -->
      <section v-if="character.matchups.length" class="flex flex-col gap-3">
        <h2 class="section-heading">Проти персонажів</h2>
        <div class="table-wrap">
          <table class="table">
            <thead>
              <tr>
                <th>Персонаж</th>
                <th class="text-right">Ігор</th>
                <th class="text-right">Вінрейт</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="matchup in character.matchups" :key="matchup.id">
                <td>
                  <UiCharacterLink :character="matchup" />
                </td>
                <td class="text-right font-mono tabular-nums">
                  {{ matchup.games }}
                </td>
                <td class="text-right font-mono tabular-nums">
                  {{ matchup.winRate }}%
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>

    <!-- Three data columns, so it reads better across the whole width -->
    <section v-if="gameRows.length" class="flex flex-col gap-3">
      <h2 class="section-heading">Ігри</h2>
      <div class="table-wrap">
        <table class="table">
          <thead>
            <tr>
              <th>Формат</th>
              <th>Гравець</th>
              <th>Результат</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="game in pageItems" :key="game.id">
              <td>
                <NuxtLink
                  :to="`/games/${game.id}`"
                  class="link whitespace-nowrap"
                >
                  {{ getGameName(game.type) }}
                </NuxtLink>
              </td>
              <td>
                <NuxtLink
                  v-if="game.player"
                  :to="`/players/${game.player.slug}`"
                  class="link"
                >
                  {{ game.player.name }}
                </NuxtLink>
                <span v-else class="text-muted">—</span>
              </td>
              <td>
                <span
                  class="badge"
                  :class="game.win ? 'badge-success' : 'badge-danger'"
                >
                  {{ game.win ? "Перемога" : "Поразка" }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <UiPagination v-model="page" :page-count="pageCount" />
    </section>
  </div>

  <p v-else class="card items-center py-10 text-base text-muted">
    Персонажа не знайдено.
  </p>
</template>
