<script setup lang="ts">
// --- Meta -------------------------------------------------------------
useHead({ titleTemplate: "Каверза" });

// --- Composables ------------------------------------------------------
const { user } = useAuth();

// --- Variables --------------------------------------------------------
const sections = [
  { name: "Ігри", url: "/games", text: "Партії, склади та результати." },
  { name: "Гравці", url: "/players", text: "Рейтинг і вінрейт." },
  { name: "Персонажі", url: "/characters", text: "Статистика персонажів." },
];
</script>
<template>
  <section
    class="full-bleed relative isolate -mt-8 -mb-8 flex grow items-center overflow-hidden"
  >
    <UiFeints class="-z-10" />
    <!-- Scrim: keeps both the heading and the cards legible over the art -->
    <div
      class="absolute inset-0 -z-10 bg-gradient-to-t from-bg/90 via-bg/85 to-bg/65"
    />

    <div class="container-page flex w-full flex-col gap-8 py-10">
      <div class="flex max-w-prose flex-col items-start gap-5">
        <h1 class="text-[clamp(2.5rem,9vw,4.5rem)] leading-[1.05]">Каверза</h1>
        <p class="text-xl text-muted">
          Облік партій Unmatched: хто з ким грав, хто переміг і як після цього
          змінився рейтинг.
        </p>
        <UiButton v-if="user" to="/add-game">Додати гру</UiButton>
        <UiButton v-else to="/login">Увійти, щоб додати гру</UiButton>
      </div>

      <div class="grid-auto" style="--min: 13rem">
        <NuxtLink
          v-for="section in sections"
          :key="section.url"
          :to="section.url"
          class="card card-interactive bg-surface/60 backdrop-blur-md hover:bg-surface/80"
        >
          <p class="card-title">{{ section.name }}</p>
          <p class="mt-1 text-base text-muted">{{ section.text }}</p>
        </NuxtLink>
      </div>
    </div>
  </section>
</template>
