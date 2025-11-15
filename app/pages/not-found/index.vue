<template>
  <div class="container mx-auto px-4 py-8 text-center">
    <h1 class="text-4xl font-bold mb-4">Страница не найдена</h1>
    <p class="mb-4">Запрошенная страница не найдена.</p>
    <NuxtLink to="/" class="btn">Вернуться на главную</NuxtLink>
  </div>
</template>

<script setup>
useHead({ title: "404 — Не найдено" });
</script>
