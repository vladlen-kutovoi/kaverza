<script setup lang="ts">
// --- Types ------------------------------------------------------------
import type { Game } from "~/interfaces/api/game";

// --- Meta -------------------------------------------------------------
useHead({ title: "Ігри" });

// --- API --------------------------------------------------------
const { data: games } = await useFetch("/api/games");

// --- Composables ------------------------------------------------------
const { page, pageCount, pageItems } = usePagination(games);

// --- Methods ----------------------------------------------------------
function winners(game: Game) {
  return game.teams.find((team) => team.winner)?.players ?? [];
}
</script>
<template>
  <div class="flex flex-col gap-5">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <h1>Ігри</h1>
      <span v-if="games?.length" class="text-base text-muted">
        {{ games.length }} партій
      </span>
    </div>

    <template v-if="games?.length">
      <div class="table-wrap">
        <table class="table">
          <thead>
            <tr>
              <th>Дата</th>
              <th>Формат</th>
              <th>Переможець</th>
              <th>Персонаж</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="game in pageItems" :key="game.id">
              <td>
                <NuxtLink :to="`/games/${game.id}`" class="link whitespace-nowrap">
                  {{ formatDate(game.createdAt) }}
                </NuxtLink>
              </td>
              <td class="text-muted whitespace-nowrap">
                {{ getGameName(game.type) }}
              </td>
              <!-- Both cells stack one line per player in the same order,
                   at the same font size, so line N here is line N there -->
              <td class="align-top">
                <div class="flex flex-col gap-1">
                  <NuxtLink
                    v-for="player in winners(game)"
                    :key="player.id"
                    :to="`/players/${player.slug}`"
                    class="link flex items-center gap-2 whitespace-nowrap"
                  >
                    <!-- Smaller than the line box on purpose: the row
                         keeps its text height, so the character beside it
                         still lines up line for line -->
                    <UiAvatar :player="player" style="--avatar-size: 1.25rem" />
                    {{ player.name }}
                  </NuxtLink>
                </div>
              </td>
              <td class="align-top">
                <div class="flex flex-col gap-1">
                  <UiCharacterLink
                    v-for="player in winners(game)"
                    :key="player.id"
                    :character="player.character"
                  />
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <UiPagination v-model="page" :page-count="pageCount" />
    </template>
    <p v-else class="card items-center py-10 text-base text-muted">
      Ще немає жодної гри.
    </p>
  </div>
</template>
