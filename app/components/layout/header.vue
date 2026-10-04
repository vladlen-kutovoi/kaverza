<script setup lang="ts">
// --- Composables ------------------------------------------------------
const { user, isAdmin, logout } = useAuth();
const route = useRoute();

// --- Variables --------------------------------------------------------
const menuOpen = ref(false);

// --- Computed ---------------------------------------------------------
const links = computed(() => {
  const items = [
    { name: "Ігри", url: "/games" },
    { name: "Гравці", url: "/players" },
    { name: "Персонажі", url: "/characters" },
  ];

  if (user.value) {
    items.push({ name: "Додати гру", url: "/add-game" });
  }

  if (isAdmin.value) {
    items.push({ name: "Адмін панель", url: "/admin" });
  }

  return items;
});

// --- Methods ----------------------------------------------------------
function onKeydown(event: KeyboardEvent) {
  if (event.key === "Escape") {
    menuOpen.value = false;
  }
}

// --- Lifecycle --------------------------------------------------------
onMounted(() => window.addEventListener("keydown", onKeydown));
onUnmounted(() => window.removeEventListener("keydown", onKeydown));

// --- Watchers ---------------------------------------------------------
watch(() => route.fullPath, () => (menuOpen.value = false));
</script>
<template>
  <header class="sticky top-0 z-30 border-b border-line bg-bg">
    <div class="container-page flex h-14 items-center gap-4">
      <NuxtLink to="/" class="font-semibold tracking-tight no-underline">
        Каверза
      </NuxtLink>

      <!-- Wide screens: links inline -->
      <nav class="hidden flex-1 items-center gap-1 sm:flex">
        <NuxtLink
          v-for="link in links"
          :key="link.url"
          :to="link.url"
          class="link-nav"
        >
          {{ link.name }}
        </NuxtLink>
      </nav>

      <div class="ml-auto hidden items-center gap-2 sm:flex">
        <template v-if="user">
          <NuxtLink :to="`/players/${user.slug}`" class="link-nav gap-2">
            <UiAvatar :player="user" />
            {{ user.name }}
          </NuxtLink>
          <button type="button" class="btn btn-ghost btn-sm" @click="logout">
            Вийти
          </button>
        </template>
        <template v-else>
          <NuxtLink to="/login" class="btn btn-ghost btn-sm">Увійти</NuxtLink>
          <NuxtLink to="/register" class="btn btn-secondary btn-sm">
            Реєстрація
          </NuxtLink>
        </template>
      </div>

      <!-- Narrow screens: burger. Three lines that fold into a cross. -->
      <button
        type="button"
        class="btn btn-ghost relative z-10 ml-auto w-10 px-0 sm:hidden"
        :aria-expanded="menuOpen"
        aria-controls="main-menu"
        aria-label="Меню"
        @click="menuOpen = !menuOpen"
      >
        <span class="relative block h-4 w-[1.125rem]">
          <span
            class="absolute left-0 h-[1.5px] w-full rounded-full bg-current transition-all duration-200"
            :class="menuOpen ? 'top-1/2 -translate-y-1/2 rotate-45' : 'top-px'"
          />
          <span
            class="absolute top-1/2 left-0 h-[1.5px] w-full -translate-y-1/2 rounded-full bg-current transition-all duration-200"
            :class="menuOpen ? 'scale-x-0 opacity-0' : 'scale-x-100 opacity-100'"
          />
          <span
            class="absolute left-0 h-[1.5px] w-full rounded-full bg-current transition-all duration-200"
            :class="
              menuOpen ? 'bottom-1/2 translate-y-1/2 -rotate-45' : 'bottom-px'
            "
          />
        </span>
      </button>
    </div>

    <!-- Backdrop: dims the page and closes on tap -->
    <Transition
      enter-active-class="transition-opacity duration-200 ease-out"
      enter-from-class="opacity-0"
      leave-active-class="transition-opacity duration-150 ease-in"
      leave-to-class="opacity-0"
    >
      <div
        v-if="menuOpen"
        class="fixed inset-0 top-14 bg-bg/70 sm:hidden"
        @click="menuOpen = false"
      />
    </Transition>

    <!-- Panel: fixed under the header, so it never shifts the page -->
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="-translate-y-2 opacity-0"
      leave-active-class="transition duration-150 ease-in"
      leave-to-class="-translate-y-2 opacity-0"
    >
      <div
        v-if="menuOpen"
        id="main-menu"
        class="fixed inset-x-0 top-14 border-b border-line bg-bg shadow-[0_10px_30px_rgb(0_0_0/0.5)] sm:hidden"
      >
        <nav class="container-page flex flex-col py-3">
          <NuxtLink
            v-for="link in links"
            :key="link.url"
            :to="link.url"
            class="link-nav"
          >
            {{ link.name }}
          </NuxtLink>

          <hr class="my-2 border-t border-line" >

          <template v-if="user">
            <NuxtLink
              :to="`/players/${user.slug}`"
              class="link-nav flex items-center gap-2"
            >
              <UiAvatar :player="user" />
              {{ user.name }}
            </NuxtLink>
            <button type="button" class="link-nav text-left" @click="logout">
              Вийти
            </button>
          </template>
          <template v-else>
            <NuxtLink to="/login" class="link-nav">Увійти</NuxtLink>
            <NuxtLink to="/register" class="link-nav">Реєстрація</NuxtLink>
          </template>
        </nav>
      </div>
    </Transition>
  </header>
</template>
