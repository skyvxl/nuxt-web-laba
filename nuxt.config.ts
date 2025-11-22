// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from "@tailwindcss/vite";
declare const process: { env: Record<string, string | undefined> };

export default defineNuxtConfig({
  srcDir: "app",
  compatibilityDate: "2025-07-15",
  // theme is handled via cookies and SSR in app.vue; no inline head script needed
  devtools: {
    enabled: true,

    timeline: {
      enabled: true,
    },
  },
  css: ["./app/assets/css/main.css"],
  modules: [
    "@nuxt/eslint",
    "@nuxt/fonts",
    "@nuxt/hints",
    "@nuxt/icon",
    "@nuxt/image",
    "@nuxt/test-utils",
  ],
  components: [
    {
      path: "~/components",
      global: true,
    },
  ],
  imports: {
    dirs: ["composables"],
  },
  runtimeConfig: {
    // Server-only keys (never exposed to client)
    appwriteApiKey: process.env.APPWRITE_API_KEY,

    public: {
      appwriteEndpoint: process.env.APPWRITE_ENDPOINT,
      appwriteProjectId: process.env.APPWRITE_PROJECT_ID,
      appwriteDatabaseId: process.env.APPWRITE_DATABASE_ID,
      appwriteProductsCollectionId: process.env.APPWRITE_PRODUCTS_COLLECTION_ID,
      appwriteCartsCollectionId: process.env.APPWRITE_CARTS_COLLECTION_ID,
      appwriteCartItemsCollectionId:
        process.env.APPWRITE_CART_ITEMS_COLLECTION_ID,
      appwriteAvatarBucketId: process.env.APPWRITE_AVATAR_BUCKET_ID,
      appwriteAvatarMaxBytes: process.env.APPWRITE_AVATAR_MAX_BYTES
        ? Number(process.env.APPWRITE_AVATAR_MAX_BYTES)
        : 5 * 1024 * 1024,
      siteUrl: process.env.SITE_URL || "",
    },
  },

  vite: {
    plugins: [tailwindcss()],
  },
  nitro: {
    preset: "bun",
  },
});
