<template>
  <div class="container mx-auto py-8">
    <h1 class="text-2xl font-bold mb-4">Каталог</h1>
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <ProductCard v-for="product in products" :key="product.id" :product="product" />
    </div>
  </div>
</template>

<script setup lang="ts">
const { products } = await useProducts();

useHead({
  title: 'Каталог — DNS Магазин',
  meta: [
    {
      name: 'description',
      content: 'Каталог товаров DNS: смартфоны, ноутбуки, бытовая техника и аксессуары.',
    },
  ],
});
</script>
