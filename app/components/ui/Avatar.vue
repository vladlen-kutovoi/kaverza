<script setup lang="ts">
// --- Props -------------------------------------------------------------
const props = defineProps<{
  player: { name: string; avatar?: string | null };
}>();

// --- Variables ---------------------------------------------------------
// Bundled, not fetched by guessed URL - same reasoning as Cardback: a key
// with no file behind it falls back to the initial with no broken request.
// Both extensions are in the set, so the key drops it and the glob keeps
// whichever file is actually there.
const art = Object.fromEntries(
  Object.entries(
    import.meta.glob<string>(
      "../../assets/images/profile-pictures/*.{png,jpg}",
      { eager: true, query: "?url", import: "default" },
    ),
  ).map(([path, url]) => [
    path.split("/").pop()!.replace(/\.(png|jpg)$/, ""),
    url,
  ]),
);

// --- Computed ----------------------------------------------------------
const src = computed(() =>
  props.player.avatar ? art[props.player.avatar] : undefined,
);
</script>
<template>
  <!-- Decorative throughout: every placement has the player's name next
       to it, so an alt here would only read the same name twice. Size
       comes from --avatar-size on this element or any ancestor. -->
  <div class="avatar">
    <img v-if="src" :src="src" alt="" loading="lazy" />
    <span v-else class="avatar-fallback" aria-hidden="true">
      {{ player.name.slice(0, 1) }}
    </span>
  </div>
</template>
