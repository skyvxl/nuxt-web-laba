<template>
  <div class="container mx-auto py-8">
    <div v-if="product">
      <div class="flex gap-6">
        <img :src="product.image" :alt="product.name" class="w-96 object-contain">
        <div>
          <h1 class="text-2xl font-bold">{{ product.name }}</h1>
          <p class="text-lg font-semibold mt-2">{{ product.price }} ₽</p>
          <p class="text-sm text-base-content/60 mt-3">{{ product.shortDescription }}</p>
          <div class="mt-4">
            <h3 class="font-medium">Характеристики</h3>
            <ul class="list-disc pl-5 mt-2">
              <li v-for="(val, key) in product.characteristics" :key="key">{{ key }}: {{ val }}</li>
            </ul>
          </div>
        </div>
    </div>
    </div>
    <div v-else>
      <p>Товар не найден</p>
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute();
const id = route.params.id as string;
const { product } = await useProduct(id);

if (product) {
  useHead({
    title: `${product.name} — DNS Магазин`,
    meta: [
      { name: 'description', content: product.shortDescription || product.description.slice(0, 160) },
      { property: 'og:title', content: `${product.name} — DNS Магазин` },
      { property: 'og:description', content: product.shortDescription || product.description.slice(0, 160) },
      { property: 'og:image', content: product.image },
      { property: 'og:type', content: 'product' },
      { name: 'twitter:card', content: 'summary_large_image' },
    ],
    link: [{ rel: 'canonical', href: `${useRuntimeConfig().public.siteUrl || ''}/product/${product.id}` }],
  });
}
</script>
