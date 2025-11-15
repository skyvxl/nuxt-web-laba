import type { Product } from "~/shared/models/product";

type ProductsResponse = {
  products: Product[];
  availableCategories?: string[];
};

interface ProductFilters {
  search?: MaybeRef<string | undefined | null>;
  categories?: MaybeRef<string[] | undefined>;
}

export async function useProducts(filters?: ProductFilters) {
  const searchRef = computed(() => {
    if (!filters?.search) return "";
    return String(unref(filters.search) ?? "");
  });

  const categoriesRef = computed(() => {
    if (!filters?.categories) return [] as string[];
    return (unref(filters.categories) ?? [])
      .map((item) => String(item ?? "").trim())
      .filter(Boolean);
  });

  const fetchProducts = (): Promise<ProductsResponse> => {
    const params = new URLSearchParams();
    const search = searchRef.value.trim();
    if (search) {
      params.set("q", search);
    }
    if (categoriesRef.value.length) {
      params.set("categories", categoriesRef.value.join(","));
    }
    const queryString = params.toString();
    const url = queryString ? `/api/products?${queryString}` : "/api/products";
    return $fetch<ProductsResponse>(url);
  };

  const asyncOptions = filters
    ? {
        watch: [() => searchRef.value, () => categoriesRef.value.join(",")],
      }
    : undefined;

  const { data, error, pending, refresh } =
    await useAsyncData<ProductsResponse>(
      filters ? "products-filtered" : "products",
      fetchProducts,
      asyncOptions
    );

  const products = computed(() => data.value?.products ?? []);
  const availableCategories = computed(
    () => data.value?.availableCategories ?? []
  );

  return { products, availableCategories, error, pending, refresh };
}

export async function useProduct(id: string) {
  const key = `product-${id}`;
  const { data, error } = await useAsyncData(key, () =>
    $fetch(`/api/products/${id}`)
  );
  return { product: data.value as Product | null, error };
}
