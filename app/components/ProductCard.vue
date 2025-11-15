<template>
  <div
    class="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow h-full flex flex-col"
  >
    <figure class="px-4 pt-4">
      <img
        :src="product.image"
        :alt="product.name"
        class="rounded-xl h-48 w-full object-contain"
      >
    </figure>
    <div class="card-body flex-1 flex flex-col">
      <h2 class="card-title text-lg line-clamp-2">{{ product.name }}</h2>
      <p class="text-sm text-base-content/70 line-clamp-3 flex-1">
        {{ product.shortDescription }}
      </p>
      <div class="card-actions justify-between items-center mt-4">
        <div class="flex flex-col">
          <span
            v-if="product.oldPrice"
            class="text-sm text-base-content/50 line-through"
            >{{ product.oldPrice }} ₽</span
          >
          <span class="text-xl font-bold">{{ product.price }} ₽</span>
        </div>
        <div class="flex gap-2">
          <button
            class="btn btn-ghost border-2 border-base-content/20 btn-sm"
            type="button"
          >
            Купить
          </button>
          <NuxtLink
            :to="`/product/${product.id}`"
            class="btn btn-ghost border-2 border-base-content/20 btn-sm"
            >Подробнее</NuxtLink
          >
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Product } from "~/shared/models/product";
defineProps<{ product: Product }>();
</script>
