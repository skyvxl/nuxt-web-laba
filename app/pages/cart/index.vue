<template>
  <div class="container mx-auto px-4 py-8 space-y-8">
    <!-- Заголовок корзины -->
    <div class="bg-base-100 rounded-box shadow-xl overflow-hidden">
      <!-- Header -->
      <div class="bg-base-100 p-6 border-b border-base-300">
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div class="flex items-center gap-4">
            <div class="w-14 h-14 bg-base-200 rounded-box flex items-center justify-center">
              <Icon name="heroicons:shopping-cart" class="w-7 h-7 text-base-content" />
            </div>
            <div>
              <h1 class="text-2xl font-bold">Корзина</h1>
              <p class="text-sm text-base-content/60">Ваши выбранные товары</p>
            </div>
          </div>
          <ClientOnly>
            <template #fallback>
              <div class="flex items-center gap-3">
                <div class="skeleton h-6 w-24" />
                <div class="skeleton h-8 w-28" />
              </div>
            </template>
            <div v-if="items.length > 0" class="flex items-end">
              <div class="badge badge-lg bg-base-300 text-base-content gap-1">
                <Icon name="heroicons:cube" class="w-4 h-4" />
                {{ totalItems }} товар(ов)
              </div>
            </div>
          </ClientOnly>
        </div>
      </div>

      <ClientOnly>
        <template #fallback>
          <div class="py-20 flex flex-col items-center justify-center gap-4">
            <span class="loading loading-spinner loading-lg" />
            <p class="text-base-content/60">Загрузка корзины...</p>
          </div>
        </template>

        <!-- Пустая корзина -->
        <div v-if="!cart || items.length === 0" class="py-16 px-6 text-center">
          <div class="w-24 h-24 mx-auto bg-base-200 rounded-full flex items-center justify-center mb-6">
            <Icon name="heroicons:shopping-cart" class="w-12 h-12 text-base-content/30" />
          </div>
          <h2 class="text-2xl font-bold mb-2">Корзина пуста</h2>
          <p class="text-base-content/60 mb-6 max-w-md mx-auto">
            Добавьте товары из каталога, чтобы оформить заказ
          </p>
          <NuxtLink to="/products" class="btn btn-primary btn-lg gap-2">
            <Icon name="heroicons:squares-2x2" class="w-5 h-5" />
            Перейти в каталог
          </NuxtLink>
        </div>

        <!-- Товары в корзине -->
        <div v-else class="p-6">
          <!-- Десктоп таблица -->
          <div class="hidden md:block overflow-x-auto">
            <table class="table w-full">
              <thead>
                <tr class="border-b-2 border-base-200">
                  <th class="text-left bg-transparent">Товар</th>
                  <th class="text-center bg-transparent">Цена</th>
                  <th class="text-center bg-transparent">Количество</th>
                  <th class="text-right bg-transparent">Сумма</th>
                  <th class="bg-transparent" />
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in items" :key="item.id" class="hover:bg-base-200/50 transition-colors">
                  <td>
                    <div class="flex items-center gap-4">
                      <div class="w-20 h-20 overflow-hidden bg-base-200 shrink-0">
                        <img
v-if="item.productImage" :src="item.productImage"
                          :alt="item.productName || 'Product image'" class="w-full h-full object-cover">
                        <div v-else class="w-full h-full flex items-center justify-center">
                          <Icon name="heroicons:photo" class="w-8 h-8 text-base-content/20" />
                        </div>
                      </div>
                      <div>
                        <NuxtLink
:to="`/products/${item.productId}`"
                          class="font-semibold transition-colors line-clamp-2">
                          {{ item.productName || "Товар" }}
                        </NuxtLink>
                        <p class="text-xs text-base-content/50 mt-1">
                          Арт: {{ item.productId.slice(0, 8) }}...
                        </p>
                      </div>
                    </div>
                  </td>
                  <td class="text-center">
                    <span class="font-medium">{{
                      formatPrice(item.fixedPrice)
                      }}</span>
                  </td>
                  <td>
                    <div class="flex items-center justify-center gap-1">
                      <button
type="button" class="btn btn-sm btn-circle btn-ghost hover:bg-base-300"
                        :disabled="getDisplayQuantity(item) <= 1" @click="decrement(item)">
                        <Icon name="heroicons:minus" class="w-4 h-4" />
                      </button>
                      <div class="w-12 text-center font-bold text-lg relative">
                        {{ getDisplayQuantity(item) }}
                        <span v-if="isItemSyncing(item.id)" class="absolute -top-1 flex h-3 w-3">
                          <span
                            class="animate-ping absolute inline-flex h-full w-full rounded-full bg-base-content/50 opacity-75" />
                          <span class="relative inline-flex rounded-full h-3 w-3 bg-base-content/50" />
                        </span>
                      </div>
                      <button
type="button" class="btn btn-sm btn-circle btn-ghost hover:bg-base-300"
                        @click="increment(item)">
                        <Icon name="heroicons:plus" class="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                  <td class="text-right">
                    <span class="font-bold text-lg">
                      {{
                        formatPrice(item.fixedPrice * getDisplayQuantity(item))
                      }}
                    </span>
                  </td>
                  <td class="text-right">
                    <button
type="button" class="btn btn-ghost btn-sm btn-circle hover:btn-error hover:btn-outline"
                      @click="remove(item)">
                      <Icon name="heroicons:trash" class="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Мобильная версия -->
          <div class="md:hidden space-y-4">
            <div v-for="item in items" :key="item.id" class="bg-base-200/30 rounded-2xl p-4">
              <div class="flex gap-4">
                <div class="w-24 h-24 rounded-xl overflow-hidden bg-base-200 shrink-0">
                  <img
v-if="item.productImage" :src="item.productImage" :alt="item.productName || 'Product image'"
                    class="w-full h-full object-cover">
                  <div v-else class="w-full h-full flex items-center justify-center">
                    <Icon name="heroicons:photo" class="w-8 h-8 text-base-content/20" />
                  </div>
                </div>
                <div class="flex-1 min-w-0">
                  <NuxtLink :to="`/products/${item.productId}`" class="font-semibold line-clamp-2">
                    {{ item.productName || "Товар" }}
                  </NuxtLink>
                  <p class="font-bold mt-1">
                    {{ formatPrice(item.fixedPrice) }}
                  </p>
                </div>
                <button
type="button" class="btn btn-ghost btn-sm btn-circle self-start hover:btn-error"
                  @click="remove(item)">
                  <Icon name="heroicons:x-mark" class="w-5 h-5" />
                </button>
              </div>
              <div class="flex items-center justify-between mt-4 pt-4 border-t border-base-300">
                <div class="flex items-center gap-2">
                  <button
type="button" class="btn btn-sm btn-circle btn-outline"
                    :disabled="getDisplayQuantity(item) <= 1" @click="decrement(item)">
                    <Icon name="heroicons:minus" class="w-4 h-4" />
                  </button>
                  <span class="w-10 text-center font-bold text-lg relative">
                    {{ getDisplayQuantity(item) }}
                    <span
v-if="isItemSyncing(item.id)"
                      class="absolute -top-1 w-2 h-2 bg-base-content/50 rounded-full animate-pulse" />
                  </span>
                  <button type="button" class="btn btn-sm btn-circle btn-outline" @click="increment(item)">
                    <Icon name="heroicons:plus" class="w-4 h-4" />
                  </button>
                </div>
                <span class="font-bold text-lg">
                  {{ formatPrice(item.fixedPrice * getDisplayQuantity(item)) }}
                </span>
              </div>
            </div>
          </div>

          <!-- Итого -->
          <div class="mt-8 pt-6 border-t-2 border-base-200">
            <div class="flex flex-col lg:flex-row items-center justify-between gap-6">
              <div class="text-center lg:text-left">
                <p class="text-sm text-base-content/60 mb-1">Итого к оплате</p>
                <p class="text-4xl font-bold">
                  {{ formatPrice(totalPrice) }}
                </p>
                <p class="text-sm text-base-content/50 mt-1">
                  {{ totalItems }} товар(ов) • Доставка рассчитывается при
                  оформлении
                </p>
              </div>
              <div class="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                <NuxtLink to="/products" class="btn btn-outline gap-2">
                  <Icon name="heroicons:arrow-left" class="w-5 h-5" />
                  Продолжить покупки
                </NuxtLink>
                <button type="button" class="btn gap-2">
                  <Icon name="heroicons:credit-card" class="w-5 h-5" />
                  Оформить заказ
                </button>
              </div>
            </div>
          </div>
        </div>
      </ClientOnly>
    </div>

    <!-- Модальное окно удаления -->
    <dialog ref="deleteModal" class="modal modal-bottom sm:modal-middle">
      <div class="modal-box">
        <div class="flex items-center gap-4 mb-4">
          <div class="w-12 h-12 bg-error/10 rounded-full flex items-center justify-center">
            <Icon name="heroicons:trash" class="w-6 h-6 text-error" />
          </div>
          <div>
            <h3 class="font-bold text-lg">Удалить товар?</h3>
            <p class="text-sm text-base-content/60">
              Это действие нельзя отменить
            </p>
          </div>
        </div>
        <div class="modal-action">
          <form method="dialog">
            <button class="btn btn-ghost">Отмена</button>
          </form>
          <button class="btn btn-error gap-2" @click="confirmDelete">
            <Icon name="heroicons:trash" class="w-4 h-4" />
            Удалить
          </button>
        </div>
      </div>
      <form method="dialog" class="modal-backdrop">
        <button>close</button>
      </form>
    </dialog>
  </div>
</template>

<script setup lang="ts">
import type { CartItem } from "~/shared/models/cartItem";

const cartStore = useCartStore();

// Загружаем корзину при монтировании
onMounted(async () => {
  await cartStore.fetchCart();
});

const { cart, items, totalPrice, totalItems, pendingUpdates, updatingItems } =
  storeToRefs(cartStore);

const deleteModal = ref<HTMLDialogElement | null>(null);
const itemToDelete = ref<CartItem | null>(null);

// Get display quantity (with optimistic updates)
function getDisplayQuantity(item: CartItem): number {
  return cartStore.getItemQuantity(item.id);
}

// Check if item is being synced
function isItemSyncing(itemId: string): boolean {
  return updatingItems.value.has(itemId) || pendingUpdates.value.has(itemId);
}

function increment(item: CartItem) {
  const currentQty = getDisplayQuantity(item);
  cartStore.updateItemOptimistic(item.id, currentQty + 1);
}

function decrement(item: CartItem) {
  const currentQty = getDisplayQuantity(item);
  if (currentQty > 1) {
    cartStore.updateItemOptimistic(item.id, currentQty - 1);
  }
}

function remove(item: CartItem) {
  itemToDelete.value = item;
  deleteModal.value?.showModal();
}
function confirmDelete() {
  if (itemToDelete.value) {
    cartStore.removeItem(itemToDelete.value.id);
    itemToDelete.value = null;
    deleteModal.value?.close();
  }
}

function formatPrice(value: number) {
  return (
    new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 2 }).format(value) +
    " ₽"
  );
}
</script>

<style scoped>
/* Minimal styles; uses existing tailwind classes */
</style>
