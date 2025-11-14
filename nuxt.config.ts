// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
    compatibilityDate: '2025-07-15',
    devtools: {
        enabled: true,

        timeline: {
            enabled: true
        }
    },
    css: ['./app/assets/css/main.css'],
    modules: [
        '@nuxt/eslint',
        '@nuxt/fonts',
        '@nuxt/hints',
        '@nuxt/icon',
        '@nuxt/image',
        '@nuxt/test-utils'
    ],

    vite: {
        plugins: [
            tailwindcss()
        ]
    }
})