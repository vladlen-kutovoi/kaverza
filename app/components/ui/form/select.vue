<script setup lang="ts">
// --- Types -----------------------------------------------------------
type Option = Record<string, unknown>;

// --- Props -----------------------------------------------------------
defineProps<{
  label: string;
  invalid?: boolean;
  loading?: boolean;
  optionLabel: string;
  options: Option[];
}>();

// --- Model Value ------------------------------------------------------
const chosenOption = defineModel<Option | null>();

// --- Variables --------------------------------------------------------
const dropdownVisible = ref(false);

// --- Methods ----------------------------------------------------------
function toggleOption(option: Record<string, unknown>) {
  if (chosenOption.value && chosenOption.value.id === option.id) {
    chosenOption.value = null;
  } else {
    chosenOption.value = option;
  }

  dropdownVisible.value = false;
}
</script>
<template>
  <div class="relative">
    <button
      type="button"
      class="input flex items-center justify-between gap-2 text-left"
      :aria-invalid="invalid || undefined"
      :aria-expanded="dropdownVisible"
      :disabled="loading"
      @click="dropdownVisible = !dropdownVisible"
    >
      <span :class="chosenOption ? '' : 'text-muted'">
        {{ chosenOption ? chosenOption[optionLabel] : "Оберіть опцію" }}
      </span>
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        stroke-width="1.75"
        stroke-linecap="round"
        stroke-linejoin="round"
        class="shrink-0 text-muted transition-transform"
        :class="dropdownVisible ? 'rotate-180' : ''"
        aria-hidden="true"
      >
        <path d="M4 6.5 8 10.5 12 6.5" />
      </svg>
    </button>

    <div
      v-show="dropdownVisible"
      class="popover absolute top-full right-0 left-0 z-10 mt-1"
    >
      <ul v-if="options.length > 0" class="menu">
        <li v-for="option in options" :key="option.id as string">
          <button
            type="button"
            class="menu-item"
            :aria-selected="chosenOption?.id === option.id"
            @click="toggleOption(option)"
          >
            {{ option[optionLabel] }}
          </button>
        </li>
      </ul>
      <p v-else class="px-2.5 py-1.5 text-base text-muted">Немає опцій</p>
    </div>
  </div>
</template>
