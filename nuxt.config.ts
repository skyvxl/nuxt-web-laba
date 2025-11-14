// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from "@tailwindcss/vite";
declare const process: { env: Record<string, string | undefined> };

export default defineNuxtConfig({
  srcDir: "app",
  compatibilityDate: "2025-07-15",
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
    public: {
      appwriteEndpoint:
        process.env.APPWRITE_ENDPOINT || "***REMOVED_ENDPOINT***",
      appwriteProjectId:
        process.env.APPWRITE_PROJECT_ID || "***REMOVED_PROJECT_ID***",
      appwriteDatabaseId:
        process.env.APPWRITE_DATABASE_ID || "***REMOVED_DATABASE_ID***",
      appwriteProductsCollectionId:
        process.env.APPWRITE_PRODUCTS_COLLECTION_ID || "id",
      appwriteAvatarBucketId:
        process.env.APPWRITE_AVATAR_BUCKET_ID || "***REMOVED_BUCKET_ID***",
      siteUrl: process.env.SITE_URL || "",
    },
  },

  vite: {
    plugins: [tailwindcss()],
  },
});
