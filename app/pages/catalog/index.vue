<template>
  <div class="container mx-auto px-4 py-8">
    <div class="mb-8">
      <h1 class="text-3xl font-bold mb-4">Каталог товаров</h1>
      <div class="form-control">
        <div class="join">
          <input type="text" placeholder="Поиск товаров..." class="input input-bordered join-item w-full max-w-md">
          <button class="btn btn-ghost border-2 border-base-content/20 join-item">Найти</button>
        </div>
      </div>
    </div>

    <div v-if="products.length" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      <ProductCard v-for="product in products" :key="product.id" :product="product" />
    </div>
    <div v-else class="flex justify-center items-center w-full col-span-full py-12">
      <span class="loading loading-spinner loading-lg" aria-label="Загрузка каталога" />
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
