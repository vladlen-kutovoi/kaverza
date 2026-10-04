// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  css: ["~/assets/css/main.css"],
  app: {
    head: {
      htmlAttrs: { lang: "uk" },
      titleTemplate: "%s · Каверза",
      meta: [{ name: "color-scheme", content: "dark" }],
    },
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
