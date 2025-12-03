<template>
  <article
    class="card bg-base-100 shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-translate transition-transform duration-300 h-full flex flex-col group"
  >
    <figure class="relative overflow-hidden bg-base-200/50">
      <NuxtLink :to="`/products/${product.id}`" class="block w-full">
        <img
          :src="product.image"
          :alt="product.name"
          class="h-56 w-full object-contain p-4 group-hover:scale-105 transition-transform duration-300"
        >
      </NuxtLink>
      <!-- Скидка badge -->
      <div v-if="product.oldPrice" class="absolute top-3 left-3">
        <span class="badge badge-error badge-lg font-bold">
          -{{ discountPercent }}%
        </span>
      </div>
    </figure>
    <div class="card-body flex-1 flex flex-col p-4">
      <NuxtLink :to="`/products/${product.id}`" class="transition-colors">
        <h2 class="card-title text-base font-bold line-clamp-2 mb-2">
          {{ product.name }}
        </h2>
      </NuxtLink>
      <p class="text-sm text-base-content/60 line-clamp-2 flex-1 mb-3">
        {{ product.shortDescription }}
      </p>

      <!-- Цена -->
      <div class="mb-4">
        <div v-if="product.oldPrice" class="flex items-baseline gap-2">
          <span class="text-sm text-base-content/40 line-through">
            {{ formatPrice(product.oldPrice) }}
          </span>
        </div>
        <span class="text-2xl font-bold">
          {{ formatPrice(product.price) }}
        </span>
      </div>

      <!-- Кнопки -->
      <div class="card-actions flex gap-2">
        <button
          class="btn flex-1"
          :class="{ 'btn-disabled': isAdding }"
          type="button"
          @click="onAddToCart"
        >
          <span v-if="isAdding" class="loading loading-spinner loading-sm" />
          <Icon v-else name="heroicons:shopping-cart" class="w-5 h-5" />
          <span class="hidden sm:inline">В корзину</span>
        </button>
        <NuxtLink
          :to="`/products/${product.id}`"
          class="btn btn-ghost btn-square"
          title="Подробнее"
        >
          <Icon name="heroicons:arrow-right" class="w-5 h-5" />
        </NuxtLink>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import type { Product } from "~/shared/models/product";
const { product } = defineProps<{ product: Product }>();

const authStore = useAuthStore();
const cartStore = useCartStore();
const toastStore = useToastStore();

const isAdding = ref(false);

const discountPercent = computed(() => {
  if (!product.oldPrice || product.oldPrice <= product.price) return 0;
  return Math.round(
    ((product.oldPrice - product.price) / product.oldPrice) * 100
  );
});

function formatPrice(value: number) {
  return new Intl.NumberFormat("ru-RU").format(value) + " ₽";
}

async function onAddToCart() {
  if (isAdding.value) return;

  try {
    if (!authStore.isAuthenticated) {
      return navigateTo("/auth");
    }
    isAdding.value = true;
    await cartStore.addToCart(product.id, 1);
    toastStore.success("Товар добавлен в корзину");
  } catch (err) {
    console.error("Failed to add to cart", err);
    if ((err as Error).message === "Unauthorized") {
      return navigateTo("/auth");
    }
    toastStore.error("Ошибка добавления в корзину");
  } finally {
    isAdding.value = false;
  }
}
</script>
