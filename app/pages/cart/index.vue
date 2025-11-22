<template>
  <div class="container mx-auto px-4 py-8 space-y-8">
    <div
      class="bg-base-100 rounded-2xl p-6 shadow border border-base-content/5"
    >
      <div
        class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4"
      >
        <div>
          <h1 class="text-2xl font-bold">Корзина</h1>
          <p class="text-sm text-base-content/70">
            Удобная корзина для заказов
          </p>
        </div>
        <ClientOnly>
          <div class="flex items-center gap-3">
            <span class="badge badge-primary">{{ totalItems }} товар(ов)</span>
            <span class="text-lg font-bold">{{ formatPrice(totalPrice) }}</span>
          </div>
        </ClientOnly>
      </div>

      <div v-if="pending" class="py-12 flex justify-center">
        <span class="loading loading-dots loading-lg" />
      </div>

      <ClientOnly>
        <div v-if="!cart || items.length === 0" class="py-12 text-center">
          <p class="text-lg mb-4">Ваша корзина пуста</p>
          <NuxtLink to="/products" class="btn btn-primary"
            >Перейти в каталог</NuxtLink
          >
        </div>

        <div v-else class="space-y-6">
          <div class="overflow-x-auto">
            <table class="table w-full">
              <thead>
                <tr class="border-b border-base-content/10">
                  <th class="text-left">Товар</th>
                  <th class="text-right">Цена</th>
                  <th class="text-center">Кол-во</th>
                  <th class="text-right">Сумма</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="item in items"
                  :key="item.id"
                  class="border-b border-base-content/5"
                >
                  <td>
                    <div class="flex items-center gap-3">
                      <div
                        class="w-16 h-16 rounded overflow-hidden bg-base-200 shrink-0"
                      >
                        <img
                          v-if="item.productImage"
                          :src="item.productImage"
                          alt=""
                          class="w-full h-full object-cover"
                        >
                        <div
                          v-else
                          class="w-full h-full flex items-center justify-center text-xs"
                        >
                          Нет фото
                        </div>
                      </div>
                      <div>
                        <NuxtLink
                          :to="`/products/${item.productId}`"
                          class="font-semibold hover:underline"
                        >
                          {{ item.productName || "Товар" }}
                        </NuxtLink>
                        <p class="text-xs text-base-content/70">
                          Артикул: {{ item.productId }}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td class="text-right">{{ item.fixedPrice }} ₽</td>
                  <td class="text-center">
                    <div class="inline-flex items-center gap-2">
                      <button
                        type="button"
                        class="btn btn-sm btn-ghost"
                        :disabled="item.quantity <= 1"
                        @click="decrement(item)"
                      >
                        -
                      </button>
                      <span class="w-8 text-center">{{ item.quantity }}</span>
                      <button
                        type="button"
                        class="btn btn-sm btn-ghost"
                        @click="increment(item)"
                      >
                        +
                      </button>
                    </div>
                  </td>
                  <td class="text-right font-semibold">
                    {{ formatPrice(item.fixedPrice * item.quantity) }}
                  </td>
                  <td class="text-right">
                    <button
                      type="button"
                      class="btn btn-ghost btn-sm text-error"
                      @click="remove(item)"
                    >
                      Удалить
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="border-t border-base-content/10 pt-6">
            <div class="flex flex-col items-end gap-4">
              <div class="text-right">
                <p class="text-sm text-base-content/70 mb-1">Итого</p>
                <p class="text-3xl font-bold">{{ formatPrice(totalPrice) }}</p>
                <p class="text-sm text-base-content/70 mt-1">
                  {{ totalItems }} товар(ов)
                </p>
              </div>
              <p class="text-xs text-base-content/60 max-w-md text-right">
                Доставка рассчитывается при оформлении заказа.
              </p>
              <div class="flex gap-3">
                <NuxtLink to="/products" class="btn btn-ghost"
                  >Продолжить покупки</NuxtLink
                >
                <button type="button" class="btn btn-primary">
                  Оформить заказ
                </button>
              </div>
            </div>
          </div>
        </div>
      </ClientOnly>
    </div>

    <!-- Delete confirmation modal -->
    <dialog ref="deleteModal" class="modal">
      <div class="modal-box">
        <h3 class="font-bold text-lg">Удалить товар?</h3>
        <p class="py-4">
          Вы уверены, что хотите удалить этот товар из корзины?
        </p>
        <div class="modal-action">
          <form method="dialog">
            <button class="btn btn-ghost">Отмена</button>
          </form>
          <button class="btn btn-error" @click="confirmDelete">Удалить</button>
        </div>
      </div>
      <form method="dialog" class="modal-backdrop">
        <button>close</button>
      </form>
    </dialog>
  </div>
</template>

<script setup lang="ts">
import { useCart } from "~/composables/useCart";
import type { CartItem } from "~/shared/models/cartItem";
const { cart, items, totalPrice, pending, totalItems, updateItem, removeItem } =
  await useCart();

const deleteModal = ref<HTMLDialogElement | null>(null);
const itemToDelete = ref<CartItem | null>(null);

function increment(item: CartItem) {
  updateItem(item.id, item.quantity + 1);
}
function decrement(item: CartItem) {
  if (item.quantity > 1) updateItem(item.id, item.quantity - 1);
}
function remove(item: CartItem) {
  itemToDelete.value = item;
  deleteModal.value?.showModal();
}
function confirmDelete() {
  if (itemToDelete.value) {
    removeItem(itemToDelete.value.id);
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
