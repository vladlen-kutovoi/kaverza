<script setup lang="ts">
// --- Meta -------------------------------------------------------------
useHead({ title: "Персонажі" });

// --- API --------------------------------------------------------
const { data: characters } = await useFetch("/api/characters");
const { data: matrix } = await useFetch("/api/matchups");

// --- Computed ---------------------------------------------------------
const sorted = computed(() =>
  [...(characters.value ?? [])].sort((a, b) => a.name.localeCompare(b.name)),
);

// Rows and their cells arrive in roster order, so both are zipped by
// position: row `index` is that character, cell `column` is its result
// against the character heading that column.
const matrixRows = computed(() => {
  const roster = matrix.value?.characters ?? [];

  return (matrix.value?.rows ?? []).map((row, index) => {
    const character = roster[index]!;

    return {
      ...character,

      cells: row.cells.map((cell, column) => {
        const opponent = roster[column]!;

        if (!cell) {
          return {
            key: opponent.id,
            played: false,
            label: "—",
            title: undefined,
            tone: "",
            weight: 0,
          };
        }

        return {
          key: opponent.id,
          played: true,
          label: `${cell.winRate}%`,
          title: `${character.name} ${cell.wins} : ${cell.losses} ${opponent.name} · ігор: ${cell.games}`,
          // Towards success above an even split, towards danger below
          tone: cell.winRate >= 50 ? "var(--success)" : "var(--danger)",
          weight: Math.round((Math.abs(cell.winRate - 50) / 50) * 26),
        };
      }),
    };
  });
});
</script>
<template>
  <div class="flex flex-col gap-8">
    <div class="flex flex-col gap-5">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <h1>Персонажі</h1>
        <span v-if="sorted.length" class="text-base text-muted">
          {{ sorted.length }} шт.
        </span>
      </div>

      <!-- The card art is the tile: portrait, so one more fits per row
           than the old text rows allowed -->
      <div v-if="sorted.length" class="grid-auto" style="--min: 11rem; --max: 4">
        <UiCardback
          v-for="character in sorted"
          :key="character.id"
          :character="character"
          link
        />
      </div>
      <p v-else class="card items-center py-10 text-base text-muted">
        Ще немає персонажів.
      </p>
    </div>

    <!-- Everyone against everyone. Needs two characters to say anything,
         and the whole grid is one scroll box - see matrix.css. -->
    <section v-if="matrixRows.length > 1" class="flex flex-col gap-3">
      <h2 class="section-heading">Матчапи</h2>
      <p class="text-base text-muted">
        Вінрейт персонажа з рядка проти персонажа з колонки. Наведіть на
        клітинку, щоб побачити рахунок.
      </p>

      <div class="matrix-wrap">
        <table class="matrix">
          <thead>
            <tr>
              <th class="matrix-corner">
                <span class="sr-only">Персонаж</span>
              </th>
              <th
                v-for="opponent in matrix?.characters"
                :key="opponent.id"
                scope="col"
              >
                <span class="matrix-vertical">
                  <span class="dot" :style="{ background: opponent.color }" />
                  {{ opponent.name }}
                </span>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in matrixRows" :key="row.id">
              <th scope="row">
                <UiCharacterLink :character="row" />
              </th>
              <td
                v-for="cell in row.cells"
                :key="cell.key"
                :class="cell.played ? 'matrix-cell' : 'matrix-empty'"
                :style="
                  cell.played
                    ? { '--cell-tone': cell.tone, '--cell-weight': cell.weight }
                    : undefined
                "
                :title="cell.title"
              >
                {{ cell.label }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
</template>
