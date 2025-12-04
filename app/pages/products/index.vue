<template>
  <div class="container mx-auto px-4 py-8 space-y-6">
    <header class="space-y-4">
      <div>
        <p class="text-sm text-base-content/70">Каталог</p>
        <h1 class="text-3xl font-bold">Найдите нужный товар</h1>
      </div>
      <form
class="rounded-2xl bg-base-100 p-4 shadow border border-base-content/5 space-y-4"
        @submit.prevent="applyFilters">
        <div class="flex flex-col gap-3 md:flex-row md:items-end">
          <div class="flex flex-col flex-1 min-w-60 gap-2">
            <label for="catalog-search" class="text-sm font-semibold">Поиск по каталогу</label>
            <div class="join w-full">
              <input
id="catalog-search" v-model="searchInput" type="search"
                class="input input-bordered join-item w-full" placeholder="Например, iPhone 15">
              <button type="submit" class="btn join-item">Найти</button>
            </div>
          </div>
          <div class="flex gap-2">
            <button type="button" class="btn btn-ghost" :disabled="!hasActiveFilters" @click="resetFilters">
              Сбросить
            </button>
          </div>
        </div>
        <div class="space-y-2">
          <div class="flex items-center gap-2">
            <p class="text-sm font-semibold">Категории</p>
            <span v-if="categoryInput.length" class="badge badge-sm bg-base-300 text-base-content">
              {{ categoryInput.length }}
            </span>
          </div>
          <div class="flex flex-wrap gap-2">
            <button
v-for="category in categoriesOptions" :key="category" type="button"
              class="btn btn-sm rounded-full transition-all" :class="categoryInput.includes(category)
                  ? 'btn-primary'
                  : 'btn-ghost border border-base-300 hover:border-base-content/30'
                " @click="toggleCategory(category)">
              <Icon v-if="categoryInput.includes(category)" name="heroicons:check" class="w-4 h-4 -ml-1" />
              {{ category }}
            </button>
            <p v-if="!categoriesOptions.length" class="text-sm text-base-content/60">
              Категории появятся после загрузки товаров.
            </p>
          </div>
        </div>
      </form>
    </header>

    <div class="flex items-center gap-3 text-sm text-base-content/70">
      <span>{{ resultLabel }}</span>
      <span v-if="pending" class="loading loading-dots loading-sm" aria-label="Выполняется поиск" />
    </div>

    <div v-if="products.length" class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      <ProductCard v-for="product in products" :key="product.id" :product="product" />
    </div>
    <div
v-else-if="!pending"
      class="rounded-2xl border border-base-content/10 bg-base-100 p-8 text-center text-base-content/70">
      <p class="text-lg font-semibold mb-2">Ничего не нашлось</p>
      <p class="mb-4">
        Попробуйте изменить запрос или выбрать другие категории.
      </p>
      <button type="button" class="btn" @click="resetFilters">
        Сбросить фильтры
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute();
const router = useRouter();

const appliedSearch = computed(() =>
  typeof route.query.q === "string" ? route.query.q : ""
);
const appliedCategories = computed(() => {
  const raw = route.query.categories;
  if (Array.isArray(raw)) {
    return raw
      .flatMap((value) => String(value ?? "").split(","))
      .map((value) => value.trim())
      .filter(Boolean);
  }
  if (typeof raw === "string") {
    return raw
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean);
  }
  return [];
});

const searchInput = ref(appliedSearch.value);
const categoryInput = ref<string[]>([...appliedCategories.value]);

watch(appliedSearch, (value) => {
  searchInput.value = value;
});
watch(appliedCategories, (value) => {
  categoryInput.value = [...value];
});

const toggleCategory = (category: string) => {
  const idx = categoryInput.value.indexOf(category);
  if (idx === -1) {
    categoryInput.value.push(category);
  } else {
    categoryInput.value.splice(idx, 1);
  }
};

const { products, availableCategories, pending } = await useProducts({
  search: appliedSearch,
  categories: appliedCategories,
});

const categoriesOptions = computed(() => availableCategories.value);
const hasActiveFilters = computed(
  () =>
    Boolean(appliedSearch.value.trim()) || appliedCategories.value.length > 0
);
const resultLabel = computed(() => {
  if (pending.value) {
    return "Выполняется поиск...";
  }
  if (products.value.length) {
    return `Найдено товаров: ${products.value.length}`;
  }
  return hasActiveFilters.value
    ? "По запросу ничего не найдено"
    : "Каталог пока пуст";
});

const applyFilters = () => {
  const query: Record<string, string> = {};
  const term = searchInput.value.trim();
  if (term) {
    query.q = term;
  }
  const categories = categoryInput.value
    .map((item) => item.trim())
    .filter(Boolean);
  if (categories.length) {
    query.categories = Array.from(new Set(categories)).join(",");
  }
  router.replace({ path: route.path, query });
};

const resetFilters = () => {
  searchInput.value = "";
  categoryInput.value = [];
  router.replace({ path: route.path, query: {} });
};

useHead({
  title: "Каталог — DNS Магазин",
  meta: [
    {
      name: "description",
      content:
        "Каталог товаров DNS: смартфоны, ноутбуки, бытовая техника и аксессуары.",
    },
  ],
});
</script>
