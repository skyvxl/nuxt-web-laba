<template>
  <div class="container mx-auto py-8">
    <h1 class="text-2xl font-semibold mb-4">Корзина</h1>
    <div v-if="pending" class="py-8">Загружаем...</div>
    <div v-else>
      <div v-if="!cart">
        <p>Ваша корзина пуста.</p>
      </div>
      <div v-else>
        <div
          v-for="item in items"
          :key="item.id"
          class="flex items-center gap-4 bg-base-100 p-4 rounded-md"
        >
          <div class="h-16 w-16">
            <img
              v-if="item.productImage"
              :src="item.productImage"
              alt=""
              class="h-16 w-16 object-cover"
            >
            <div
              v-else
              class="h-16 w-16 bg-base-200 flex items-center justify-center text-xs text-base-content/70"
            >
              Нет фото
            </div>
          </div>
          <div class="flex-1">
            <div class="font-medium">{{ item.productName || "Товар" }}</div>
            <div class="text-sm text-base-content/70">
              {{ item.fixedPrice }} ₽
            </div>
          </div>
          <div class="flex items-center gap-2">
            <button class="btn btn-sm" @click="decrement(item)">-</button>
            <div>{{ item.quantity }}</div>
            <button class="btn btn-sm" @click="increment(item)">+</button>
          </div>
          <div class="w-20 text-right font-semibold">
            {{ formatPrice(item.fixedPrice * item.quantity) }}
          </div>
          <button class="btn btn-ghost btn-sm" @click="remove(item)">
            Удалить
          </button>
        </div>

        <div class="text-right text-lg font-bold">
          Итого: {{ formatPrice(totalPrice) }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useCart } from "~/composables/useCart";
import type { CartItem } from "~/shared/models/cartItem";
const { cart, items, totalPrice, pending, updateItem, removeItem } =
  await useCart();

function increment(item: CartItem) {
  updateItem(item.id, item.quantity + 1);
}
function decrement(item: CartItem) {
  if (item.quantity > 1) updateItem(item.id, item.quantity - 1);
}
function remove(item: CartItem) {
  if (confirm("Удалить товар из корзины?")) removeItem(item.id);
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
