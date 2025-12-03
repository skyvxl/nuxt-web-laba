import { defineStore } from "pinia";
import type { Cart } from "~/shared/models/cart";
import type { CartItem } from "~/shared/models/cartItem";
import { useAuthStore } from "./auth";

type CartResponse = { cart: (Cart & { items: CartItem[] }) | null };

// Debounce utility
function debounce<T extends (...args: Parameters<T>) => void>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  return (...args: Parameters<T>) => {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

export const useCartStore = defineStore("cart", () => {
  // === State ===
  const cart = ref<(Cart & { items: CartItem[] }) | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  // Pending updates for optimistic UI (itemId -> pending quantity)
  const pendingUpdates = ref<Map<string, number>>(new Map());
  // Track if an API call is in progress for each item
  const updatingItems = ref<Set<string>>(new Set());
  // Track adding to cart state
  const addingToCart = ref(false);

  // === Getters ===
  const items = computed(() => cart.value?.items ?? []);

  // Get item quantity with pending updates applied
  const getItemQuantity = (itemId: string): number => {
    const item = items.value.find((i) => i.id === itemId);
    if (!item) return 0;
    return pendingUpdates.value.get(itemId) ?? item.quantity;
  };

  const totalItems = computed(() => {
    // Calculate with pending updates
    let total = 0;
    for (const item of items.value) {
      const pendingQty = pendingUpdates.value.get(item.id);
      total += pendingQty !== undefined ? pendingQty : item.quantity;
    }
    return total;
  });

  const totalPrice = computed(() => {
    // Calculate with pending updates
    let total = 0;
    for (const item of items.value) {
      const pendingQty = pendingUpdates.value.get(item.id);
      const qty = pendingQty !== undefined ? pendingQty : item.quantity;
      total += qty * item.fixedPrice;
    }
    return total;
  });

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
      // Clear pending updates after fetching fresh data
      pendingUpdates.value.clear();
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

    // Prevent multiple simultaneous add operations
    if (addingToCart.value) {
      return;
    }

    addingToCart.value = true;
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
      addingToCart.value = false;
    }
  }

  // Debounced update function that actually calls the API
  const debouncedApiUpdate = debounce(async (itemId: string) => {
    const pendingQty = pendingUpdates.value.get(itemId);
    if (pendingQty === undefined) return;

    // Already updating this item
    if (updatingItems.value.has(itemId)) return;

    updatingItems.value.add(itemId);

    try {
      await $fetch(`/api/cart_items/${itemId}`, {
        method: "PUT",
        body: { quantity: pendingQty },
        credentials: "include",
      });
      // After successful update, fetch fresh cart data
      await fetchCart();
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Failed to update item";
      // Revert optimistic update on error
      pendingUpdates.value.delete(itemId);
    } finally {
      updatingItems.value.delete(itemId);
    }
  }, 500); // 500ms debounce

  // Optimistic update function - updates UI immediately
  function updateItemOptimistic(itemId: string, quantity: number) {
    const authStore = useAuthStore();
    if (!authStore.isAuthenticated) {
      throw new Error("Unauthorized");
    }

    if (quantity < 1) quantity = 1;
    if (quantity > 999) quantity = 999;

    // Apply optimistic update immediately
    pendingUpdates.value.set(itemId, quantity);

    // Trigger debounced API call
    debouncedApiUpdate(itemId);
  }

  // Original update function for backwards compatibility
  async function updateItem(itemId: string, quantity: number) {
    updateItemOptimistic(itemId, quantity);
  }

  async function removeItem(itemId: string) {
    const authStore = useAuthStore();
    if (!authStore.isAuthenticated) {
      throw new Error("Unauthorized");
    }

    // Optimistic removal from UI
    if (cart.value?.items) {
      cart.value = {
        ...cart.value,
        items: cart.value.items.filter((item) => item.id !== itemId),
      };
    }
    pendingUpdates.value.delete(itemId);

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
      // Refetch to restore state on error
      await fetchCart();
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
      error.value = err instanceof Error ? err.message : "Failed to clear cart";
      throw err;
    } finally {
      loading.value = false;
    }
  }

  function $reset() {
    cart.value = null;
    loading.value = false;
    error.value = null;
    pendingUpdates.value.clear();
    updatingItems.value.clear();
    addingToCart.value = false;
  }

  return {
    // State
    cart,
    loading,
    error,
    addingToCart,
    pendingUpdates,
    updatingItems,
    // Getters
    items,
    totalItems,
    totalPrice,
    isEmpty,
    getItemQuantity,
    // Actions
    fetchCart,
    addToCart,
    updateItem,
    updateItemOptimistic,
    removeItem,
    clearCart,
    $reset,
  };
});
