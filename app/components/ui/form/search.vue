<script setup lang="ts">
// --- Types -----------------------------------------------------------
import type { Option, SearchFieldValue } from "~/interfaces/components/ui/form";

// --- Props -----------------------------------------------------------
const props = defineProps<{
  label: string;
  invalid?: boolean;
  loading?: boolean;
  optionLabel: string;
  options: Option[];
}>();

// --- Model Value ------------------------------------------------------
const chosenOption = defineModel<SearchFieldValue>();

// --- Variables --------------------------------------------------------
const searchQuery = ref("");
const dropdownVisible = ref(false);

// --- Computed ---------------------------------------------------------
const filteredOptions = computed(() => {
  return props.options.filter(
    (option) =>
      (option[props.optionLabel] ?? "")
        .toString()
        .toLowerCase()
        .includes(searchQuery.value.toLowerCase()) &&
      option.id !== chosenOption.value?.id,
  );
});

// --- Methods ----------------------------------------------------------
function toggleOption(option: Record<string, unknown>) {
  if (chosenOption.value && chosenOption.value.id === option.id) {
    chosenOption.value = null;
  } else {
    chosenOption.value = option;
    searchQuery.value =
      option[props.optionLabel]?.toString() ?? searchQuery.value;
  }

  dropdownVisible.value = false;
}
</script>
<template>
  <div class="relative">
    <input
      v-model="searchQuery"
      class="input"
      type="search"
      :placeholder="label"
      :aria-invalid="invalid || undefined"
      :disabled="loading"
      @input="dropdownVisible = true"
    />

    <div
      v-show="searchQuery.length > 0 && dropdownVisible"
      class="popover absolute top-full right-0 left-0 z-10 mt-1"
    >
      <ul v-if="filteredOptions.length > 0" class="menu">
        <li v-if="chosenOption">
          <button
            type="button"
            class="menu-item"
            aria-selected="true"
            @click="toggleOption(chosenOption)"
          >
            {{ chosenOption[optionLabel] }}
          </button>
        </li>
        <template
          v-for="(option, index) in filteredOptions"
          :key="option.id as string"
        >
          <li v-if="index < 5">
            <button type="button" class="menu-item" @click="toggleOption(option)">
              {{ option[optionLabel] }}
            </button>
          </li>
        </template>
      </ul>
      <p v-else class="px-2.5 py-1.5 text-base text-muted">Нічого не знайдено</p>
    </div>
  </div>
</template>
