<script setup lang="ts">
// --- Global variables ---------------------------------------------------
const route = useRoute();

// -- API -----------------------------------------------------------------
const { data: game } = await useFetch(`/api/games/${route.params.slug}`);

// --- Meta ---------------------------------------------------------------
useHead({
  title: computed(() => (game.value ? getGameName(game.value.type) : "Гра")),
});

// --- Methods -------------------------------------------------------------
function calcRatingChange(before: number, after: number): string {
  const change = after - before;
  return change > 0 ? `+${change}` : `${change}`;
}
</script>
<template>
  <div v-if="game" class="flex flex-col gap-6">
    <div class="flex flex-wrap items-start justify-between gap-3">
      <div>
        <h1>{{ getGameName(game.type) }}</h1>
        <p class="mt-1 text-base text-muted">{{ formatDate(game.createdAt) }}</p>
      </div>
      <NuxtLink to="/games" class="btn btn-secondary btn-sm">Усі ігри</NuxtLink>
    </div>

    <!-- Equal-width, equal-height tracks whatever the team count -->
    <div class="grid-auto" style="--min: 15rem; --gap: 0.75rem">
      <div
        v-for="team in game.teams"
        :key="team.teamNumber"
        class="card gap-4"
        :class="team.winner ? 'card-win' : ''"
      >
        <div class="flex items-center gap-2">
          <p v-if="game.type === 'team'" class="card-title">
            Команда {{ team.teamNumber }}
          </p>
          <span
            class="badge ml-auto"
            :class="team.winner ? 'badge-success' : 'badge-danger'"
          >
            {{ team.winner ? "Перемога" : "Поразка" }}
          </span>
        </div>

        <ul class="flex flex-col gap-4">
          <!-- Portrait on the left of both lines, so a team reads as a
               row of faces before it reads as names and numbers -->
          <li v-for="player in team.players" :key="player.id" class="flex gap-3">
            <UiAvatar :player="player" style="--avatar-size: 2.5rem" />
            <div class="flex min-w-0 flex-1 flex-col gap-0.5">
              <div class="flex items-baseline justify-between gap-2">
                <NuxtLink :to="`/players/${player.slug}`" class="link truncate">
                  {{ player.name }}
                </NuxtLink>
                <span
                  class="font-mono tabular-nums"
                  :class="
                    player.ratingAfter >= player.ratingBefore
                      ? 'text-success'
                      : 'text-danger'
                  "
                >
                  {{ calcRatingChange(player.ratingBefore, player.ratingAfter) }}
                </span>
              </div>
              <div class="flex items-baseline justify-between gap-2">
                <UiCharacterLink
                  :character="player.character"
                  class="text-base"
                />
                <span class="font-mono text-sm tabular-nums text-muted">
                  {{ player.ratingBefore }} → {{ player.ratingAfter }}
                </span>
              </div>
            </div>
          </li>
        </ul>
      </div>
    </div>
  </div>

  <p v-else class="card items-center py-10 text-base text-muted">
    Гру не знайдено.
  </p>
</template>
