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
  // Track adding to cart state per product
  const addingProducts = ref<Set<string>>(new Set());
  // Track items being deleted to prevent double-delete
  const deletingItems = ref<Set<string>>(new Set());
  // Debounced fetch timer
  let fetchDebounceTimer: ReturnType<typeof setTimeout> | null = null;

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

      // Filter out items that are currently being deleted
      // This prevents "zombie" items from reappearing after optimistic deletion
      if (response.cart?.items && deletingItems.value.size > 0) {
        response.cart.items = response.cart.items.filter(
          (item) => !deletingItems.value.has(item.id)
        );
      }

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

  // Debounced fetch - waits for operations to settle before fetching
  function scheduleFetchCart(delay = 300) {
    if (fetchDebounceTimer) {
      clearTimeout(fetchDebounceTimer);
    }
    fetchDebounceTimer = setTimeout(() => {
      fetchDebounceTimer = null;
      fetchCart();
    }, delay);
  }

  async function addToCart(productId: string, quantity = 1) {
    const authStore = useAuthStore();
    if (!authStore.isAuthenticated) {
      throw new Error("Unauthorized");
    }

    // Prevent multiple simultaneous add operations for the same product
    if (addingProducts.value.has(productId)) {
      return;
    }

    addingProducts.value.add(productId);
    error.value = null;

    try {
      await $fetch("/api/cart_items", {
        method: "POST",
        body: { productId, quantity },
        credentials: "include",
      });

      // Schedule a debounced fetch to get updated cart
      // This allows multiple rapid adds without blocking
      scheduleFetchCart(200);
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Failed to add to cart";
      throw err;
    } finally {
      addingProducts.value.delete(productId);
    }
  }

  // Check if a specific product is being added
  function isAddingProduct(productId: string): boolean {
    return addingProducts.value.has(productId);
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

    // Already deleting this item
    if (deletingItems.value.has(itemId)) {
      return;
    }

    // Store the item for potential rollback
    const itemToRemove = cart.value?.items.find((item) => item.id === itemId);
    if (!itemToRemove) return;

    // Mark as deleting to prevent double-delete
    deletingItems.value.add(itemId);

    // Optimistic removal - immediately remove from array
    if (cart.value?.items) {
      cart.value.items = cart.value.items.filter((item) => item.id !== itemId);
    }
    pendingUpdates.value.delete(itemId);
    error.value = null;

    try {
      await $fetch(`/api/cart_items/${itemId}`, {
        method: "DELETE",
        credentials: "include",
      });
      // Success - item already removed from UI
    } catch (err: unknown) {
      // Check if this is a "not found" error - item already deleted, not an error
      const errMsg = err instanceof Error ? err.message : String(err);
      const isNotFoundError =
        errMsg.includes("not found") ||
        errMsg.includes("could not be found") ||
        (err &&
          typeof err === "object" &&
          "statusCode" in err &&
          (err as { statusCode: number }).statusCode === 404);

      if (isNotFoundError) {
        // Item already deleted on server - this is fine, keep UI as is
        console.debug(`Cart item ${itemId} already deleted on server`);
      } else {
        // Real error - rollback
        error.value = errMsg || "Failed to remove item";
        if (cart.value?.items && itemToRemove) {
          cart.value.items = [...cart.value.items, itemToRemove];
        }
        throw err;
      }
    } finally {
      deletingItems.value.delete(itemId);
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
    addingProducts.value.clear();
    deletingItems.value.clear();
    if (fetchDebounceTimer) {
      clearTimeout(fetchDebounceTimer);
      fetchDebounceTimer = null;
    }
  }

  return {
    // State
    cart,
    loading,
    error,
    addingProducts,
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
    isAddingProduct,
    updateItem,
    updateItemOptimistic,
    removeItem,
    clearCart,
    $reset,
  };
});
