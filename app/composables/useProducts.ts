import type { Product } from "~/shared/models/product";

export async function useProducts() {
  const { data, error } = await useFetch("/api/products");
  const products = (data.value?.products ?? []) as Product[];
  return { products, error };
}

export async function useProduct(id: string) {
  const { data, error } = await useFetch(`/api/products/${id}`);
  return { product: data.value as Product | null, error };
}
