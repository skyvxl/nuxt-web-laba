<template>
  <div>
    <header class="bg-base-100 shadow">
      <div class="container mx-auto px-4 py-4 flex justify-between items-center">
        <NuxtLink to="/" class="text-xl font-bold">DNS</NuxtLink>
        <nav class="space-x-4">
          <NuxtLink to="/catalog">Каталог</NuxtLink>
          <NuxtLink to="/about">О нас</NuxtLink>
          <NuxtLink to="/contacts">Контакты</NuxtLink>
        </nav>
        <div>
          <NuxtLink to="/auth" class="btn btn-ghost">Войти</NuxtLink>
        </div>
      </div>
    </header>
    <main class="min-h-[60vh]">
      <NuxtPage />
    </main>
    <footer class="bg-base-200 text-center py-6">
      <div class="container mx-auto">© DNS Магазин</div>
    </footer>
  </div>
</template>

<script setup lang="ts">
// global layout - can add header, footer and session checks
import { useAuth } from '~/composables/useAuth';
const auth = useAuth();
auth.check();
</script>
