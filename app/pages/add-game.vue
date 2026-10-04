<script setup lang="ts">
// --- Types -------------------------------------------------------
import type { SearchFieldValue } from "~/interfaces/components/ui/form";

type GameType = "duel" | "team" | "ffa";

interface TeamMember {
  player: SearchFieldValue;
  character: SearchFieldValue;
}

// --- Meta --------------------------------------------------------
useHead({ title: "Додати гру" });

// --- API --------------------------------------------------------
const [players, characters] = await Promise.all([
  // Hidden players are still valid opponents, so the picker asks for them
  $fetch("/api/players", { query: { includeHidden: "true" } }),
  $fetch("/api/characters"),
]);

// --- Variables ---------------------------------------------------
const gameTypes: { id: GameType; name: string; type: GameType }[] = [
  {
    id: "duel",
    name: getGameName("duel"),
    type: "duel",
  },
  {
    id: "team",
    name: getGameName("team"),
    type: "team",
  },
  {
    id: "ffa",
    name: getGameName("ffa"),
    type: "ffa",
  },
];

const chosenType = ref(gameTypes[0]!);
const teams = ref<TeamMember[][]>([]);
const error = ref("");
const isLoading = ref(false);
const { errors: fieldErrors, clearErrors, setErrors } = useFormErrors();

// --- Methods -----------------------------------------------------
function createMember(): TeamMember {
  return { player: null, character: null };
}

function createTeams(type: GameType): TeamMember[][] {
  switch (type) {
    case "duel":
      return [[createMember()], [createMember()]];
    case "team":
      return [
        [createMember(), createMember()],
        [createMember(), createMember()],
      ];
    case "ffa":
      return [[createMember()], [createMember()], [createMember()]];
  }
}

function addTeamPlayers() {
  for (const team of teams.value) {
    team.push(createMember());
  }
}

function removeTeamPlayers() {
  for (const team of teams.value) {
    team.pop();
  }
}

function addFfaPlayer() {
  teams.value.push([createMember()]);
}

function removeFfaPlayer() {
  teams.value.pop();
}

function getTeamTitle(teamIndex: number) {
  if (teamIndex === 0) {
    return chosenType.value.type === "team"
      ? "Команда-переможець"
      : "Переможець";
  }

  return chosenType.value.type === "team"
    ? `Команда ${teamIndex + 1}`
    : `Гравець ${teamIndex + 1}`;
}

const submitGame = async () => {
  error.value = "";
  clearErrors();

  const members = teams.value.flatMap((team, teamIndex) =>
    team.map((member) => ({ ...member, teamNumber: teamIndex + 1 })),
  );

  if (members.some((member) => !member.player || !member.character)) {
    error.value = "Оберіть гравця та персонажа для кожного учасника";
    return;
  }

  try {
    isLoading.value = true;
    const created = await $fetch("/api/games", {
      method: "POST",
      body: {
        type: chosenType.value.type,
        winningTeamNumber: 1,
        players: members.map((member) => ({
          playerId: Number(member.player!.id),
          characterId: Number(member.character!.id),
          teamNumber: member.teamNumber,
        })),
      },
    });

    await navigateTo(`/games/${created.game.id}`);
  } catch (e: unknown) {
    error.value =
      setErrors(e) ??
      (Object.keys(fieldErrors.value).length > 0 ? "" : "Щось пішло не так");
  } finally {
    isLoading.value = false;
  }
};

// --- Watchers ----------------------------------------------------
watch(
  () => chosenType.value?.type,
  (type) => {
    error.value = "";
    clearErrors();
    teams.value = type ? createTeams(type) : [];
  },
  { immediate: true },
);
</script>
<template>
  <div class="mx-auto flex w-full max-w-2xl flex-col gap-6">
    <div>
      <h1>Додати гру</h1>
      <p class="mt-1 text-base text-muted">
        Першою вказується сторона, що перемогла.
      </p>
    </div>

    <div class="field max-w-xs">
      <span class="label">Тип гри</span>
      <UiFormSelect
        v-model="chosenType"
        label="Тип гри"
        option-label="name"
        :options="gameTypes"
      />
    </div>

    <form
      v-if="chosenType"
      :key="chosenType.id"
      class="flex flex-col gap-4"
      @submit.prevent="submitGame"
    >
      <div
        v-for="(team, teamIndex) in teams"
        :key="teamIndex"
        class="card gap-4"
        :class="teamIndex === 0 ? 'card-win' : ''"
      >
        <div class="flex items-center gap-2">
          <p class="card-title">{{ getTeamTitle(teamIndex) }}</p>
          <span
            class="badge ml-auto"
            :class="teamIndex === 0 ? 'badge-success' : 'badge-danger'"
          >
            {{ teamIndex === 0 ? "Перемога" : "Поразка" }}
          </span>
        </div>

        <div
          v-for="(member, memberIndex) in team"
          :key="memberIndex"
          class="grid-auto"
          style="--min: 12rem"
        >
          <label class="field">
            <span class="label">Гравець</span>
            <UiFormSearch
              v-model="member.player"
              label="Гравець"
              option-label="name"
              :options="players"
            />
          </label>
          <label class="field">
            <span class="label">Персонаж</span>
            <UiFormSearch
              v-model="member.character"
              label="Персонаж"
              option-label="name"
              :options="characters"
            />
          </label>
        </div>
      </div>

      <div v-if="chosenType.type === 'team'" class="flex flex-wrap gap-2">
        <button type="button" class="btn btn-secondary btn-sm" @click="addTeamPlayers">
          Додати по гравцю в команду
        </button>
        <button
          type="button"
          class="btn btn-ghost btn-sm"
          :disabled="(teams[0]?.length ?? 0) <= 2"
          @click="removeTeamPlayers"
        >
          Видалити по гравцю
        </button>
      </div>

      <div v-if="chosenType.type === 'ffa'" class="flex flex-wrap gap-2">
        <button type="button" class="btn btn-secondary btn-sm" @click="addFfaPlayer">
          Додати гравця
        </button>
        <button
          type="button"
          class="btn btn-ghost btn-sm"
          :disabled="teams.length <= 3"
          @click="removeFfaPlayer"
        >
          Видалити гравця
        </button>
      </div>

      <div v-if="error" class="alert alert-danger" role="alert">{{ error }}</div>
      <div
        v-for="(message, field) in fieldErrors"
        :key="field"
        class="alert alert-danger"
        role="alert"
      >
        {{ message }}
      </div>

      <UiButton type="submit" :loading="isLoading" class="self-start">
        Зберегти гру
      </UiButton>
    </form>
  </div>
</template>
