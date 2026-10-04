<script setup lang="ts">
// --- Variables --------------------------------------------------------
const links = [{ name: "Додати персонажа", url: "/admin/add-character" }];
</script>
<template>
  <header class="sticky top-0 z-20 border-b border-line bg-bg">
    <div class="container-page flex min-h-14 flex-wrap items-center gap-x-4 gap-y-1 py-2">
      <NuxtLink to="/admin" class="font-semibold tracking-tight no-underline">
        Каверза
        <span class="font-normal text-muted">· Адмін</span>
      </NuxtLink>

      <nav class="flex flex-wrap items-center gap-1">
        <NuxtLink
          v-for="link in links"
          :key="link.url"
          :to="link.url"
          class="link-nav"
        >
          {{ link.name }}
        </NuxtLink>
      </nav>

      <NuxtLink to="/" class="btn btn-ghost btn-sm ml-auto">На сайт</NuxtLink>
    </div>
  </header>
</template>
