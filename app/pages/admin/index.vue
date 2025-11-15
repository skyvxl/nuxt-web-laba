<template>
  <div class="space-y-6">
    <section class="rounded-2xl bg-base-100 p-6 shadow-xl">
      <p class="text-sm text-base-content/70">Панель управления</p>
      <h1 class="mt-1 text-3xl font-bold">Добро пожаловать, админ 👋</h1>
      <p class="mt-3 max-w-2xl text-base-content/70">
        Следите за ключевыми показателями и переходите к управлению каталогом в
        один клик.
      </p>
      <div class="mt-6 flex flex-wrap gap-3">
        <NuxtLink to="/admin/products" class="btn btn-primary">
          Перейти к товарам
        </NuxtLink>
        <NuxtLink to="/admin/products#create" class="btn">
          Создать товар
        </NuxtLink>
        <NuxtLink to="/" class="btn btn-ghost">Вернуться на сайт</NuxtLink>
      </div>
    </section>

    <section class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <article
        v-for="card in statCards"
        :key="card.label"
        class="card bg-base-100 shadow-lg"
      >
        <div class="card-body">
          <p class="text-sm text-base-content/60">{{ card.label }}</p>
          <p class="text-4xl font-bold">{{ card.value }}</p>
          <p class="text-xs text-base-content/50">{{ card.helper }}</p>
        </div>
      </article>
    </section>

    <section class="grid gap-6 xl:grid-cols-3">
      <article class="card bg-base-100 shadow-xl xl:col-span-2">
        <div class="card-body">
          <div class="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 class="card-title text-xl">Последние товары</h2>
              <p class="text-sm text-base-content/70">
                Несколько свежих позиций каталога.
              </p>
            </div>
            <NuxtLink to="/admin/products" class="btn btn-sm"
              >Все товары</NuxtLink
            >
          </div>

          <div v-if="productsPending" class="py-10 text-center">
            <span class="loading loading-spinner" aria-label="Загрузка" />
          </div>
          <div v-else-if="productsError" class="alert alert-error">
            <span>{{ productsError }}</span>
          </div>
          <div v-else>
            <div
              v-if="!latestProducts.length"
              class="py-8 text-center text-base-content/70"
            >
              Пока нет товаров — создайте первый.
            </div>
            <div v-else class="overflow-x-auto">
              <table class="table">
                <thead>
                  <tr>
                    <th>Название</th>
                    <th>Категория</th>
                    <th class="text-right">Цена</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="product in latestProducts" :key="product.id">
                    <td class="font-semibold">{{ product.name }}</td>
                    <td>{{ product.category }}</td>
                    <td class="text-right">
                      {{ formatPrice(product.price) }}
                      <span
                        v-if="product.oldPrice"
                        class="block text-xs text-base-content/60 line-through"
                      >
                        {{ formatPrice(product.oldPrice) }}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </article>

      <article class="card bg-base-100 shadow-xl">
        <div class="card-body space-y-4">
          <h2 class="card-title text-xl">Быстрые ссылки</h2>
          <NuxtLink to="/admin/products" class="btn btn-outline w-full">
            Управление товарами
          </NuxtLink>
          <NuxtLink to="/admin/products#create" class="btn btn-outline w-full">
            Создать новый товар
          </NuxtLink>
          <NuxtLink to="/auth" class="btn btn-outline w-full">
            Управление профилем
          </NuxtLink>
        </div>
      </article>
    </section>
  </div>
</template>

<script setup lang="ts">
import type { Product } from "~/shared/models/product";

interface AdminStatsResponse {
  products?: { total?: number };
  users?: number | null;
  generatedAt?: string;
}

const requireAuth = () => {
  const authCookie = useCookie<string | null>("auth");
  if (!authCookie.value) {
    return navigateTo("/auth");
  }
};

definePageMeta({ layout: "admin", middleware: requireAuth });

const fetchStats = () => $fetch<AdminStatsResponse>("/api/admin/stats");

const { data: statsData, pending: statsPending } = await useAsyncData(
  "admin-stats",
  fetchStats
);

const statCards = computed(() => {
  const productTotal = statsData.value?.products?.total ?? "—";
  const userTotal = statsData.value?.users ?? "—";
  return [
    {
      label: "Всего товаров",
      value: statsPending.value ? "…" : productTotal,
      helper: "Количество записей в каталоге",
    },
    {
      label: "Пользователи",
      value: statsPending.value ? "…" : userTotal,
      helper: "Доступно при наличии server key",
    },
    {
      label: "Статус системы",
      value: "Online",
      helper: "Nitro / Bun",
    },
    {
      label: "Обновлено",
      value: statsData.value?.generatedAt
        ? new Date(statsData.value.generatedAt).toLocaleTimeString("ru-RU")
        : "—",
      helper: "Время расчёта",
    },
  ];
});

const {
  data: productsData,
  pending: productsPending,
  error: productsErrorRaw,
} = await useAsyncData("admin-dashboard-products", () =>
  $fetch("/api/products")
);

const productsError = computed(
  () =>
    productsErrorRaw.value?.statusMessage ||
    productsErrorRaw.value?.message ||
    null
);

const latestProducts = computed(() => {
  const list = (productsData.value?.products as Product[]) || [];
  return list.slice(0, 5);
});

function formatPrice(value?: number | null) {
  if (value === undefined || value === null) return "—";
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    maximumFractionDigits: 0,
  }).format(value);
}
</script>
