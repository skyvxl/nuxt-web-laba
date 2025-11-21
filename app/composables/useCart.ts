import type { Cart } from "~/shared/models/cart";
import type { CartItem } from "~/shared/models/cartItem";
import type { Ref } from "vue";

type CartResponse = { cart: (Cart & { items: CartItem[] }) | null };

export async function useCart() {
  const { user } = useAuth();
  const fetchCart = async (): Promise<CartResponse> => {
    return await $fetch<CartResponse>("/api/carts", { credentials: "include" });
  };

  const defaultData = ref<CartResponse>({ cart: null });
  let data: Ref<CartResponse> = defaultData;
  let pending = ref(false);
  let error = ref<unknown | null>(null);
  let refresh = async () => {};
  if (user.value) {
    const res = await useAsyncData<CartResponse>("cart", fetchCart);
    data = res.data as Ref<CartResponse>;
    pending = res.pending as Ref<boolean>;
    error = res.error as Ref<unknown | null>;
    refresh = res.refresh;
  }

  const cart = computed(() => data.value?.cart ?? null);
  const items = computed(() => data.value?.cart?.items ?? []);
  const totalItems = computed(() => data.value?.cart?.totalItems ?? 0);
  const totalPrice = computed(() => data.value?.cart?.totalPrice ?? 0);

  async function addToCart(productId: string, quantity = 1) {
    if (!user.value) {
      throw new Error("Unauthorized");
    }
    await $fetch("/api/cart_items", {
      method: "POST",
      body: { productId, quantity },
      credentials: "include",
    });
    await refresh();
  }

  async function updateItem(itemId: string, quantity: number) {
    if (!user.value) {
      throw new Error("Unauthorized");
    }
    await $fetch(`/api/cart_items/${itemId}`, {
      method: "PUT",
      body: { quantity },
      credentials: "include",
    });
    await refresh();
  }

  async function removeItem(itemId: string) {
    if (!user.value) {
      throw new Error("Unauthorized");
    }
    await $fetch(`/api/cart_items/${itemId}`, {
      method: "DELETE",
      credentials: "include",
    });
    await refresh();
  }

  return {
    cart,
    items,
    totalItems,
    totalPrice,
    pending,
    error,
    refresh,
    addToCart,
    updateItem,
    removeItem,
  };
}
