<script setup lang="ts">
// --- Imports ----------------------------------------------------------
import { AVATARS, avatarLabel } from "#shared/utils/avatars";

// --- Props ------------------------------------------------------------
defineProps<{
  label: string;
  invalid?: boolean;
  loading?: boolean;
}>();

// --- Model Value ------------------------------------------------------
const chosenAvatar = defineModel<string>();

// --- Variables --------------------------------------------------------
// Shared name is what makes the arrow keys walk the group, so it has to
// be unique to this instance rather than the literal "avatar".
const groupName = useId();
</script>
<template>
  <!-- A radio group, not a listbox: all options fit on screen, so the
       choice is made by looking rather than by opening anything. The
       inputs stay in the dom for the keyboard and the screen reader;
       the circle beside each one is what is actually seen. -->
  <div
    class="avatar-choices"
    role="radiogroup"
    :aria-label="label"
    :aria-invalid="invalid || undefined"
  >
    <label
      v-for="avatar in AVATARS"
      :key="avatar"
      class="avatar-choice"
      :title="avatarLabel(avatar)"
    >
      <input
        v-model="chosenAvatar"
        class="sr-only"
        type="radio"
        :name="groupName"
        :value="avatar"
        :aria-label="avatarLabel(avatar)"
        :disabled="loading"
      />
      <UiAvatar :player="{ name: avatarLabel(avatar), avatar }" />
    </label>
  </div>
</template>
