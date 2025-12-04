import { defineStore } from "pinia";
import type { Cart } from "~/shared/models/cart";
import type { CartItem } from "~/shared/models/cartItem";
import { useAuthStore } from "./auth";

export const useCartStore = defineStore("cart", () => {
  // === State ===
  const cart = ref<(Cart & { items: CartItem[] }) | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  // Pending updates for optimistic UI (itemId -> pending quantity)
  const pendingUpdates = ref<Map<string, number>>(new Map());
  // Track if an API call is in progress for each item
  const updatingItems = ref<Set<string>>(new Set());
  // Per-item timers for debounced updates
  const updateTimers: Map<string, ReturnType<typeof setTimeout>> = new Map();
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

  // Function that will process the pending update for an item.
  // It is safe against concurrent updates: if an update is in-flight
  // and the quantity changes again, we will schedule another attempt.
  async function processUpdate(itemId: string) {
    // Clear any pending timer since we're processing now
    const timer = updateTimers.get(itemId);
    if (timer) {
      clearTimeout(timer);
      updateTimers.delete(itemId);
    }

    const pendingQty = pendingUpdates.value.get(itemId);
    if (pendingQty === undefined) return;

    // If an update is already in progress, schedule a retry shortly after
    if (updatingItems.value.has(itemId)) {
      const retry = setTimeout(() => processUpdate(itemId), 200);
      updateTimers.set(itemId, retry);
      return;
    }

    updatingItems.value.add(itemId);
    const qtyToSend = pendingQty;

    try {
      await $fetch(`/api/cart_items/${itemId}`, {
        method: "PUT",
        body: { quantity: qtyToSend },
        credentials: "include",
      });

      // Apply server-confirmed quantity locally to avoid a full refetch
      if (cart.value?.items) {
        const idx = cart.value.items.findIndex((i) => i.id === itemId);
        if (idx !== -1) {
          cart.value.items[idx] = {
            ...cart.value.items[idx],
            quantity: qtyToSend,
          } as CartItem;
        }
      }
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Failed to update item";
      // Revert optimistic update on error
      pendingUpdates.value.delete(itemId);
    } finally {
      updatingItems.value.delete(itemId);
    }

    // If the quantity changed while we were updating, schedule another update
    const nowPending = pendingUpdates.value.get(itemId);
    if (nowPending !== undefined && nowPending !== qtyToSend) {
      // schedule next attempt after short delay (debounce)
      const nextTimer = setTimeout(() => processUpdate(itemId), 200);
      updateTimers.set(itemId, nextTimer);
    } else {
      // nothing more to do for this item
      pendingUpdates.value.delete(itemId);
      const t = updateTimers.get(itemId);
      if (t) {
        clearTimeout(t);
        updateTimers.delete(itemId);
      }
    }
  }

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

    // Schedule per-item debounced API call
    const existing = updateTimers.get(itemId);
    if (existing) clearTimeout(existing);
    const timer = setTimeout(() => processUpdate(itemId), 500);
    updateTimers.set(itemId, timer);
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
