import { defineStore } from "pinia";
import type { Cart } from "~/shared/models/cart";
import type { CartItem } from "~/shared/models/cartItem";
import { useAuthStore } from "./auth";

type CartResponse = { cart: (Cart & { items: CartItem[] }) | null };

export const useCartStore = defineStore("cart", () => {
  // === State ===
  const cart = ref<(Cart & { items: CartItem[] }) | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  // === Getters ===
  const items = computed(() => cart.value?.items ?? []);
  const totalItems = computed(() => cart.value?.totalItems ?? 0);
  const totalPrice = computed(() => cart.value?.totalPrice ?? 0);
  const isEmpty = computed(() => totalItems.value === 0);

  // === Actions ===
  async function fetchCart() {
    const authStore = useAuthStore();
    if (!authStore.isAuthenticated) {
      cart.value = null;
      return;
    }

    loading.value = true;
    error.value = null;

    try {
      const response = await $fetch<CartResponse>("/api/carts", {
        credentials: "include",
      });
      cart.value = response.cart;
    } catch (err) {
      error.value = err instanceof Error ? err.message : "Failed to load cart";
      cart.value = null;
    } finally {
      loading.value = false;
    }
  }

  async function addToCart(productId: string, quantity = 1) {
    const authStore = useAuthStore();
    if (!authStore.isAuthenticated) {
      throw new Error("Unauthorized");
    }

    loading.value = true;
    error.value = null;

    try {
      await $fetch("/api/cart_items", {
        method: "POST",
        body: { productId, quantity },
        credentials: "include",
      });
      await fetchCart();
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Failed to add to cart";
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function updateItem(itemId: string, quantity: number) {
    const authStore = useAuthStore();
    if (!authStore.isAuthenticated) {
      throw new Error("Unauthorized");
    }

    loading.value = true;
    error.value = null;

    try {
      await $fetch(`/api/cart_items/${itemId}`, {
        method: "PUT",
        body: { quantity },
        credentials: "include",
      });
      await fetchCart();
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Failed to update item";
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function removeItem(itemId: string) {
    const authStore = useAuthStore();
    if (!authStore.isAuthenticated) {
      throw new Error("Unauthorized");
    }

    loading.value = true;
    error.value = null;

    try {
      await $fetch(`/api/cart_items/${itemId}`, {
        method: "DELETE",
        credentials: "include",
      });
      await fetchCart();
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Failed to remove item";
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function clearCart() {
    const authStore = useAuthStore();
    if (!authStore.isAuthenticated) {
      throw new Error("Unauthorized");
    }
    if (!cart.value?.id) {
      return;
    }
    loading.value = true;
    error.value = null;
    try {
      await $fetch(`/api/carts/${cart.value.id}/items`, {
        method: "DELETE",
        credentials: "include",
      });
      await fetchCart();
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Failed to clear cart";
      throw err;
    } finally {
      loading.value = false;
    }
  }

  function $reset() {
    cart.value = null;
    loading.value = false;
    error.value = null;
  }

  return {
    // State
    cart,
    loading,
    error,
    // Getters
    items,
    totalItems,
    totalPrice,
    isEmpty,
    // Actions
    fetchCart,
    addToCart,
    updateItem,
    removeItem,
    clearCart,
    $reset,
  };
});
