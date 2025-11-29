<template>
  <div class="max-w-7xl mx-auto px-4 py-8">
    <div v-if="product" class="space-y-8">
      <div class="card bg-base-100 shadow-xl">
        <div class="card-body">
          <h1 class="text-3xl font-bold mb-4">{{ product.name }}</h1>
          <div class="grid grid-cols-1 gap-8 lg:grid-cols-2">
            <figure>
              <img
                :src="product.image"
                :alt="product.name"
                class="rounded-xl w-full h-96 object-contain"
              >
            </figure>
            <div class="space-y-4">
              <p class="text-base">{{ product.shortDescription }}</p>
              <div class="divider" />
              <div class="flex flex-col gap-2">
                <span
                  v-if="product.oldPrice"
                  class="text-lg text-base-content/50 line-through"
                  >{{ product.oldPrice }} ₽</span
                >
                <span class="text-3xl font-bold">{{ product.price }} ₽</span>
              </div>
              <div class="flex gap-3 flex-row">
                <button
                  class="btn btn-ghost border-2 border-base-content/20 flex-1"
                  @click="onBuy"
                >
                  Купить
                </button>
                <button
                  class="btn btn-ghost border-2 border-base-content/20"
                  @click="onAddToCart"
                >
                  В корзину
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="card bg-base-100 shadow-xl">
        <div class="card-body">
          <h2 class="card-title">Характеристики товара</h2>
          <div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div
              v-for="(value, key) in product.characteristics"
              :key="key"
              class="rounded-lg bg-base-200 p-4"
            >
              <div class="text-sm text-base-content/70 truncate mb-1">
                {{ key }}
              </div>
              <div class="text-lg font-bold truncate">{{ value }}</div>
            </div>
          </div>
        </div>
      </div>

      <div class="card bg-base-100 shadow-xl">
        <div class="card-body space-y-4">
          <h2 class="card-title">Подробное описание товара</h2>
          <p>
            {{ product.description }} Этот товар отличается высоким качеством
            исполнения и современными технологиями. Идеально подходит как для
            повседневного использования, так и для профессиональных задач.
            <strong>Официальная гарантия производителя</strong> и поддержка в
            <em>сервисных центрах DNS</em> по всей России.
          </p>
          <div>
            <h3 class="text-xl font-semibold mb-3">
              Особенности и преимущества:
            </h3>
            <ul class="list-disc list-inside space-y-2">
              <li v-for="feature in product.features" :key="feature">
                {{ feature }}
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div class="card bg-base-100 shadow-xl">
        <div class="card-body">
          <h2 class="card-title">Отзывы</h2>
          <div class="space-y-3">
            <label class="label">
              <span class="label-text">Ваш отзыв</span>
            </label>
            <textarea
              class="textarea textarea-bordered w-full"
              rows="4"
              placeholder="Напишите ваш отзыв..."
            />
            <div class="text-sm text-base-content/70">Отзывов пока нет</div>
          </div>
        </div>
      </div>
    </div>
    <div
      v-else-if="pending"
      class="flex min-h-[50vh] items-center justify-center"
    >
      <span
        class="loading loading-spinner loading-lg"
        aria-label="Загрузка товара"
      />
    </div>
    <AppError
      v-else-if="error"
      :title="error.statusMessage ?? 'Произошла ошибка'"
      :code="error.statusCode"
    />
    <div v-else class="flex min-h-[50vh] items-center justify-center">
      <span
        class="loading loading-spinner loading-lg"
        aria-label="Загрузка товара"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute();
const id = route.params.id as string;
const { product, error, pending } = await useProduct(id);
const { user } = useAuth();
const { addToCart } = await useCart();
const { showToast } = useToast();

async function onBuy() {
  try {
    if (!user.value) return navigateTo("/auth");
    await addToCart(product!.id, 1);
    return navigateTo("/cart");
  } catch (err) {
    console.error("Failed to add to cart", err);
    if ((err as Error).message === "Unauthorized") return navigateTo("/auth");
    showToast("Ошибка добавления в корзину", "error");
  }
}

async function onAddToCart() {
  try {
    if (!user.value) return navigateTo("/auth");
    await addToCart(product!.id, 1);
    showToast("Товар добавлен в корзину", "success");
  } catch (err) {
    console.error("Failed to add to cart", err);
    if ((err as Error).message === "Unauthorized") return navigateTo("/auth");
    showToast("Ошибка добавления в корзину", "error");
  }
}

if (error?.value) {
  type ErrType = {
    statusCode?: number;
    status?: number;
    statusMessage?: string;
  };
  const statusCode =
    (error.value as ErrType)?.statusCode ??
    (error.value as ErrType)?.status ??
    null;
  if (statusCode === 404) {
    await navigateTo("/not-found");
  }
}

if (product) {
  useHead({
    title: `${product.name} — DNS Магазин`,
    meta: [
      {
        name: "description",
        content: product.shortDescription || product.description.slice(0, 160),
      },
      { property: "og:title", content: `${product.name} — DNS Магазин` },
      {
        property: "og:description",
        content: product.shortDescription || product.description.slice(0, 160),
      },
      { property: "og:image", content: product.image },
      { property: "og:type", content: "product" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    link: [
      {
        rel: "canonical",
        href: `${useRuntimeConfig().public.siteUrl || ""}/products/${
          product.id
        }`,
      },
    ],
  });
}
</script>
