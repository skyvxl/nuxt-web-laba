<template>
  <div>
    <div class="hero bg-base-200 min-h-[60vh] overflow-hidden">
      <div class="hero-content text-center px-4">
        <div class="max-w-md mx-auto">
          <h1 class="text-4xl md:text-5xl font-bold">DNS Магазин</h1>
          <p class="py-6">Крупнейшая федеральная розничная сеть по продаже цифровой и бытовой техники в России</p>
          <NuxtLink class="btn btn-ghost border-2 border-base-content/20" to="/catalog">Перейти в каталог</NuxtLink>
        </div>
      </div>
    </div>

    <!-- content omitted for brevity; use the Angular HTML content as a guide -->
  </div>
</template>

<script setup>
useHead({ title: 'Главная — DNS Магазин', meta: [{ name: 'description', content: 'DNS магазин электроники: лучшие предложения на смартфоны, ноутбуки и бытовую технику.' }] });
</script>
