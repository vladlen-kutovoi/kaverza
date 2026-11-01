<script
  setup
  lang="ts"
  generic="T extends { id: string; name: string; color?: string }"
>
// --- Props -------------------------------------------------------------
const props = defineProps<{
  options: T[];
  /** Remembers the opted-out options per browser under this key */
  storageKey: string;
  /** Keeps every pick, one per player, and draws the next from the rest */
  multiple?: boolean;
}>();

// --- Variables ---------------------------------------------------------
// Spin length is fixed in time, not in steps, so a big pool does not
// drag on: the steps are spread over it on an ease-out curve.
const DURATION = 3500;
// At least this many hops, so even a pool of two visibly goes round
const MIN_STEPS = 20;

const excluded = ref<string[]>([]);
const picks = ref<string[]>([]);
const current = ref<string | null>(null);
const spinning = ref(false);
let timer: ReturnType<typeof setTimeout> | undefined;

// --- Computed ----------------------------------------------------------
const available = computed(() =>
  props.options.filter(
    (option) =>
      !excluded.value.includes(option.id) && !picks.value.includes(option.id),
  ),
);

// The circle under the light: the hop in progress, or the latest pick
const lit = computed(() =>
  spinning.value ? current.value : (picks.value.at(-1) ?? null),
);

const results = computed(() =>
  picks.value.map((id) => props.options.find((option) => option.id === id)!),
);

// --- Methods -----------------------------------------------------------
function isOff(id: string) {
  return (
    excluded.value.includes(id) ||
    (picks.value.includes(id) && id !== lit.value)
  );
}

function toggle(id: string) {
  if (spinning.value || picks.value.includes(id)) {
    return;
  }

  excluded.value = excluded.value.includes(id)
    ? excluded.value.filter((other) => other !== id)
    : [...excluded.value, id];

  try {
    localStorage.setItem(props.storageKey, JSON.stringify(excluded.value));
  } catch {}
}

function roll() {
  if (spinning.value) {
    return;
  }

  // A single draw starts over, so the last winner is back in the pool
  if (!props.multiple) {
    picks.value = [];
  }

  const pool = available.value;

  if (!pool.length) {
    return;
  }

  // Whole loops round the pool, then on to the winner
  const winner = Math.floor(Math.random() * pool.length);
  const steps = Math.ceil(MIN_STEPS / pool.length) * pool.length + winner;
  // Ease-out: hop `i` lands at 1 - (1 - i / steps)^2 of the duration
  const at = (step: number) => DURATION * (1 - Math.sqrt(1 - step / steps));

  let step = 0;
  spinning.value = true;

  const hop = () => {
    current.value = pool[step % pool.length]!.id;

    if (step === steps) {
      picks.value = [...picks.value, current.value];
      spinning.value = false;
      return;
    }

    step++;
    timer = setTimeout(hop, at(step) - at(step - 1));
  };

  hop();
}

function reset() {
  picks.value = [];
}

// --- Lifecycle ---------------------------------------------------------
onMounted(() => {
  try {
    excluded.value = JSON.parse(localStorage.getItem(props.storageKey) ?? "[]");
  } catch {}
});

onUnmounted(() => clearTimeout(timer));
</script>
<template>
  <div class="flex flex-col gap-6">
    <div class="roll-grid">
      <button
        v-for="option in options"
        :key="option.id"
        type="button"
        class="roll-option"
        :class="{ 'is-off': isOff(option.id), 'is-lit': option.id === lit }"
        :aria-pressed="!excluded.includes(option.id)"
        :aria-label="option.name"
        :title="option.name"
        :disabled="spinning || picks.includes(option.id)"
        @click="toggle(option.id)"
      >
        <slot :option="option" />
      </button>
    </div>

    <div class="flex flex-wrap gap-2">
      <button
        type="button"
        class="btn btn-primary"
        :disabled="spinning || !available.length"
        @click="roll"
      >
        {{ multiple && picks.length ? "Ще одного гравця" : "Крутити" }}
      </button>
      <button
        v-if="multiple && picks.length"
        type="button"
        class="btn btn-ghost"
        :disabled="spinning"
        @click="reset"
      >
        Скинути
      </button>
    </div>

    <ol v-if="multiple && results.length" class="flex flex-col gap-1" aria-live="polite">
      <li v-for="(result, index) in results" :key="result.id" class="flex items-center gap-2">
        <span class="text-muted">Гравець {{ index + 1 }}:</span>
        <span v-if="result.color" class="dot" :style="{ background: result.color }" />
        <span class="font-medium">{{ result.name }}</span>
      </li>
    </ol>
  </div>
</template>
