<script setup lang="ts">
definePageMeta({
  layout: "admin",
});

useHead({ title: "Адмін панель" });

const actions = [
  {
    name: "Додати персонажа",
    url: "/admin/add-character",
    text: "Імʼя та колір, яким персонаж позначається на сайті.",
  },
];
</script>
<template>
  <div class="flex flex-col gap-6">
    <h1>Адмін панель</h1>

    <div class="grid-auto">
      <NuxtLink
        v-for="action in actions"
        :key="action.url"
        :to="action.url"
        class="card card-interactive"
      >
        <p class="card-title">{{ action.name }}</p>
        <p class="mt-1 text-base text-muted">{{ action.text }}</p>
      </NuxtLink>
    </div>
  </div>
</template>
