<script setup lang="ts">
// --- Variables ---------------------------------------------------------
// Nuxt's own navigation tracker. The throttle keeps quick hops from
// flashing the overlay; the hide delay lets a clash land before it fades.
const { isLoading } = useLoadingIndicator({ throttle: 150, hideDelay: 400 });
</script>
<template>
  <Transition name="loader">
    <div v-if="isLoading" class="loader" role="status" aria-label="Завантаження">
      <div class="loader-clash" aria-hidden="true">
        <span class="loader-card" />
        <span class="loader-spark" />
        <span class="loader-card" />
      </div>
    </div>
  </Transition>
</template>
