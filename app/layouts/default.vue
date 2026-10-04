<template>
  <div class="flex min-h-screen flex-col overflow-x-clip">
    <LayoutHeader />
    <main class="container-page flex flex-1 flex-col py-8">
      <slot />
    </main>
  </div>
</template>
