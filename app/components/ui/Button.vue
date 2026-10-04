<script setup lang="ts">
// --- Types -----------------------------------------------------------
import type { ButtonSize, ButtonVariant } from "~/interfaces/components/ui/kit";

// --- Props -----------------------------------------------------------
const props = withDefaults(
  defineProps<{
    variant?: ButtonVariant;
    size?: ButtonSize;
    type?: "button" | "submit" | "reset";
    /** Renders a NuxtLink instead of a button */
    to?: string;
    disabled?: boolean;
    loading?: boolean;
    block?: boolean;
  }>(),
  {
    variant: "primary",
    size: "md",
    type: "button",
  },
);

// --- Variables --------------------------------------------------------
const NuxtLinkComponent = resolveComponent("NuxtLink");

// --- Computed ---------------------------------------------------------
const classes = computed(() => [
  "btn",
  `btn-${props.variant}`,
  props.size === "sm" && "btn-sm",
  props.block && "btn-block",
]);

const tagAttrs = computed(() => {
  const inert = props.disabled || props.loading;

  return props.to
    ? { to: props.to, "aria-disabled": inert || undefined }
    : { type: props.type, disabled: inert };
});
</script>
<template>
  <component
    :is="to ? NuxtLinkComponent : 'button'"
    v-bind="tagAttrs"
    :class="classes"
    :aria-busy="loading || undefined"
  >
    <span v-if="loading" class="spinner" aria-hidden="true" />
    <slot />
  </component>
</template>
