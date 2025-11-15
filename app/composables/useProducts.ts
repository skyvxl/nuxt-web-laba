import type { Product } from "~/shared/models/product";

export async function useProducts() {
  const { data, error } = await useAsyncData("products", () =>
    $fetch("/api/products")
  );
  const products = (data.value?.products ?? []) as Product[];
  return { products, error };
}

export async function useProduct(id: string) {
  const key = `product-${id}`;
  const { data, error } = await useAsyncData(key, () =>
    $fetch(`/api/products/${id}`)
  );
  return { product: data.value as Product | null, error };
}
