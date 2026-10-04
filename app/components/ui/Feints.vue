<script setup lang="ts">
// --- Variables ---------------------------------------------------------
// Dealt once at module scope, so the server and the browser hydrate the
// same wall - see app/utils/feintRows.ts.
const rows = FEINT_ROWS;
</script>
<template>
  <div class="feints" aria-hidden="true">
    <div class="feints-rows">
      <div v-for="(row, i) in rows" :key="i" class="feints-row">
        <!-- Laid out twice over: the second copy is what the drift
             scrolls into, and it lands exactly where the first began -->
        <img
          v-for="(src, j) in [...row, ...row]"
          :key="j"
          :src="src"
          alt=""
          decoding="async"
        />
      </div>
    </div>
  </div>
</template>
