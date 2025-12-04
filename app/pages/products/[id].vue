<template>
  <div class="max-w-7xl mx-auto px-4 py-8">
    <div v-if="product" class="space-y-8">
      <!-- Хлебные крошки -->
      <div class="breadcrumbs text-sm">
        <ul>
          <li>
            <NuxtLink to="/">Главная</NuxtLink>
          </li>
          <li>
            <NuxtLink to="/products">Каталог</NuxtLink>
          </li>
          <li class="text-base-content/60">{{ product.name }}</li>
        </ul>
      </div>

      <!-- Основная информация о товаре -->
      <div class="card bg-base-100 shadow-xl overflow-hidden">
        <div class="card-body p-0">
          <div class="grid grid-cols-1 gap-0 lg:grid-cols-2">
            <!-- Изображение -->
            <figure class="bg-base-200/30 p-8 flex items-center justify-center relative">
              <img :src="product.image" :alt="product.name" class="max-h-96 w-full object-contain">
              <!-- Скидка badge -->
              <div v-if="product.oldPrice" class="absolute top-4 left-4">
                <span class="badge badge-error badge-lg font-bold px-4 py-3">
                  -{{ discountPercent }}%
                </span>
              </div>
            </figure>

            <!-- Информация -->
            <div class="p-6 lg:p-8 flex flex-col">
              <h1 class="text-2xl lg:text-3xl font-bold mb-4">
                {{ product.name }}
              </h1>
              <p class="text-base-content/70 mb-6">
                {{ product.shortDescription }}
              </p>

              <div class="divider my-2" />

              <!-- Цена -->
              <div class="mb-6">
                <div v-if="product.oldPrice" class="flex items-center gap-3 mb-1">
                  <span class="text-xl text-base-content/40 line-through">
                    {{ formatPrice(product.oldPrice) }}
                  </span>
                  <span class="badge badge-error">Скидка</span>
                </div>
                <span class="text-4xl font-bold">
                  {{ formatPrice(product.price) }}
                </span>
              </div>

              <!-- Кнопки -->
              <div class="flex gap-3 mt-auto">
                <button class="btn btn-lg flex-1" :class="{ 'btn-disabled': isAddingToCart }" @click="onBuy">
                  <span v-if="isAddingToCart" class="loading loading-spinner" />
                  <Icon v-else name="heroicons:bolt" class="w-5 h-5" />
                  Купить сейчас
                </button>
                <button class="btn btn-outline btn-lg" :class="{ 'btn-disabled': isAddingToCart }" @click="onAddToCart">
                  <Icon name="heroicons:shopping-cart" class="w-5 h-5" />
                  <span class="hidden sm:inline">В корзину</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Характеристики -->
      <div class="card bg-base-100 shadow-xl">
        <div class="card-body">
          <h2 class="card-title text-xl mb-4">
            <Icon name="heroicons:clipboard-document-list" class="w-6 h-6" />
            Характеристики товара
          </h2>
          <div class="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
            <div
v-for="(value, key) in product.characteristics" :key="key"
              class="flex justify-between items-center p-4 rounded-xl bg-base-200/50 hover:bg-base-200 transition-colors">
              <span class="text-sm text-base-content/70">{{ key }}</span>
              <span class="font-semibold text-right ml-4">{{ value }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Описание -->
      <div class="card bg-base-100 shadow-xl">
        <div class="card-body">
          <h2 class="card-title text-xl mb-4">
            <Icon name="heroicons:document-text" class="w-6 h-6" />
            Подробное описание
          </h2>
          <p class="text-base-content/80 leading-relaxed mb-6">
            {{ product.description }} Этот товар отличается высоким качеством
            исполнения и современными технологиями. Идеально подходит как для
            повседневного использования, так и для профессиональных задач.
            <strong>Официальная гарантия производителя</strong> и поддержка в
            <em>сервисных центрах DNS</em> по всей России.
          </p>

          <h3 class="text-lg font-semibold mb-3 flex items-center gap-2">
            <Icon name="heroicons:check-badge" class="w-5 h-5 text-success" />
            Особенности и преимущества
          </h3>
          <ul class="space-y-2">
            <li
v-for="feature in product.features" :key="feature"
              class="flex items-start gap-3 p-3 rounded-lg bg-success/10">
              <Icon name="heroicons:check-circle" class="w-5 h-5 text-success shrink-0 mt-0.5" />
              <span>{{ feature }}</span>
            </li>
          </ul>
        </div>
      </div>

      <!-- Статистика отзывов -->
      <div v-if="reviewStats && reviewStats.totalReviews > 0" class="card bg-base-100 shadow-xl">
        <div class="card-body">
          <h2 class="card-title">Рейтинг товара</h2>
          <div class="flex flex-col gap-4 sm:flex-row sm:items-center">
            <!-- Средний рейтинг -->
            <div class="text-center sm:text-left">
              <div class="text-4xl font-bold">
                {{ reviewStats.averageRating }}
              </div>
              <div class="rating rating-sm mt-2">
                <input
v-for="star in 5" :key="star" type="radio" class="mask mask-star bg-warning"
                  :checked="star === Math.round(reviewStats.averageRating)" disabled>
              </div>
              <div class="text-sm text-base-content/70 mt-1">
                {{ reviewStats.totalReviews }}
                {{
                  reviewStats.totalReviews === 1
                    ? "отзыв"
                    : reviewStats.totalReviews < 5 ? "отзыва" : "отзывов" }} </div>
              </div>

              <!-- Распределение рейтингов -->
              <div class="flex-1 space-y-2">
                <div v-for="rating in [5, 4, 3, 2, 1]" :key="rating" class="flex items-center gap-2">
                  <span class="text-sm w-8">{{ rating }} ★</span>
                  <progress
class="progress progress-warning flex-1"
                    :value="reviewStats.ratingDistribution[rating as 1 | 2 | 3 | 4 | 5]"
                    :max="reviewStats.totalReviews" />
                  <span class="text-sm text-base-content/70 w-8 text-right">
                    {{
                      reviewStats.ratingDistribution[rating as 1 | 2 | 3 | 4 | 5]
                    }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Форма добавления отзыва -->
        <ReviewForm v-if="product" :product-id="product.id" @submitted="handleReviewSubmitted" />

        <!-- Список отзывов -->
        <div class="card bg-base-100 shadow-xl">
          <div class="card-body">
            <h2 class="card-title mb-4">
              Отзывы
              <span v-if="reviewStats && reviewStats.totalReviews > 0" class="badge bg-base-300 text-base-content">{{
                reviewStats.totalReviews }}</span>
            </h2>

            <!-- Загрузка -->
            <div v-if="reviewsLoading" class="flex items-center justify-center py-8">
              <span class="loading loading-spinner loading-lg" />
            </div>

            <!-- Список отзывов -->
            <div v-else-if="reviews.length > 0" class="space-y-4">
              <ReviewCard
v-for="review in reviews" :key="review.$id" :review="review"
                :can-delete="canDeleteReview(review)" @delete="handleDeleteReview" @open-media="handleOpenMedia" />
            </div>

            <!-- Нет отзывов -->
            <div v-else class="text-center py-8 text-base-content/70">
              <Icon name="heroicons:chat-bubble-left-right" class="w-16 h-16 mx-auto mb-2 opacity-50" />
              <p>Отзывов пока нет. Будьте первым!</p>
            </div>
          </div>
        </div>
      </div>

      <div v-else-if="pending" class="flex min-h-[50vh] items-center justify-center">
        <span class="loading loading-spinner loading-lg" aria-label="Загрузка товара" />
      </div>
      <AppError v-else-if="error" :title="error.statusMessage ?? 'Произошла ошибка'" :code="error.statusCode" />
      <div v-else class="flex min-h-[50vh] items-center justify-center">
        <span class="loading loading-spinner loading-lg" aria-label="Загрузка товара" />
      </div>

      <!-- Модальное окно для просмотра медиа -->
      <dialog ref="mediaModal" class="modal" @close="handleModalClose">
        <div class="modal-box max-w-7xl w-11/12 max-h-[90vh] p-0 overflow-hidden">
          <form method="dialog">
            <button
              class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2 z-10 bg-base-100/80 hover:bg-base-100">
              ✕
            </button>
          </form>
          <div v-if="selectedMedia" class="w-full h-full flex items-center justify-center bg-base-200">
            <!-- Изображение -->
            <img
v-if="selectedMedia.mediaType === 'image'" :src="getMediaUrl(selectedMedia.fileId)"
              :alt="selectedMedia.fileName" class="max-w-full max-h-[90vh] w-auto h-auto object-contain">
            <!-- Видео -->
            <video
v-else :key="selectedMedia.fileId" ref="videoPlayer" :src="getMediaUrl(selectedMedia.fileId)"
              class="max-w-full max-h-[90vh] w-auto h-auto" controls controlslist="nodownload">
              <track kind="captions">
            </video>
          </div>
        </div>
        <form method="dialog" class="modal-backdrop">
          <button>Закрыть</button>
        </form>
      </dialog>
    </div>
</template>

<script setup lang="ts">
import type { ReviewWithMedia, ReviewMedia } from "~/shared/models/review";

const route = useRoute();
const id = route.params.id as string;
const { product, error, pending } = await useProduct(id);

const authStore = useAuthStore();
const cartStore = useCartStore();
const toastStore = useToastStore();
const config = useRuntimeConfig();

// Состояние кнопок
const isAddingToCart = ref(false);

// Вычисление скидки
const discountPercent = computed(() => {
  if (!product?.oldPrice || product.oldPrice <= product.price) return 0;
  return Math.round(
    ((product.oldPrice - product.price) / product.oldPrice) * 100
  );
});

// Форматирование цены
function formatPrice(value: number) {
  return new Intl.NumberFormat("ru-RU").format(value) + " ₽";
}

// Отзывы
const {
  reviews,
  stats: reviewStats,
  loading: reviewsLoading,
  fetchReviews,
  fetchStats,
  deleteReview,
} = useReviews(id);

// Модальное окно для медиа
const mediaModal = ref<HTMLDialogElement | null>(null);
const selectedMedia = ref<ReviewMedia | null>(null);
const videoPlayer = ref<HTMLVideoElement | null>(null);

// Загружаем отзывы и статистику
onMounted(async () => {
  await Promise.all([fetchReviews(), fetchStats()]);
});

// Проверка прав на удаление отзыва
const canDeleteReview = (review: Readonly<ReviewWithMedia>) => {
  if (!authStore.isAuthenticated) return false;
  return review.userId === authStore.user?.$id;
};

// Обработка удаления отзыва
const handleDeleteReview = async (reviewId: string) => {
  try {
    await deleteReview(reviewId);
    toastStore.success("Отзыв удалён");
  } catch (error: unknown) {
    console.error("Failed to delete review:", error);
    toastStore.error("Не удалось удалить отзыв");
  }
};

// Обработка добавления отзыва
const handleReviewSubmitted = async () => {
  await Promise.all([fetchReviews(), fetchStats()]);
};

// Открытие модального окна с медиа
const handleOpenMedia = (media: ReviewMedia) => {
  selectedMedia.value = media;
  mediaModal.value?.showModal();
};

// Закрытие модального окна
const handleModalClose = () => {
  // Останавливаем видео при закрытии
  if (videoPlayer.value) {
    videoPlayer.value.pause();
    videoPlayer.value.currentTime = 0;
  }
  selectedMedia.value = null;
};

// Получение URL медиа файла
const getMediaUrl = (fileId: string) => {
  return `${config.public.appwriteEndpoint}/storage/buckets/${config.public.appwriteReviewsMediaBucketId}/files/${fileId}/view?project=${config.public.appwriteProjectId}`;
};

async function onBuy() {
  if (isAddingToCart.value) return;
  try {
    if (!authStore.isAuthenticated) return navigateTo("/auth");
    isAddingToCart.value = true;
    await cartStore.addToCart(product!.id, 1);
    return navigateTo("/cart");
  } catch (err) {
    console.error("Failed to add to cart", err);
    if ((err as Error).message === "Unauthorized") return navigateTo("/auth");
    toastStore.error("Ошибка добавления в корзину");
  } finally {
    isAddingToCart.value = false;
  }
}

async function onAddToCart() {
  if (isAddingToCart.value) return;
  try {
    if (!authStore.isAuthenticated) return navigateTo("/auth");
    isAddingToCart.value = true;
    await cartStore.addToCart(product!.id, 1);
    toastStore.success("Товар добавлен в корзину");
  } catch (err) {
    console.error("Failed to add to cart", err);
    if ((err as Error).message === "Unauthorized") return navigateTo("/auth");
    toastStore.error("Ошибка добавления в корзину");
  } finally {
    isAddingToCart.value = false;
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
        href: `${useRuntimeConfig().public.siteUrl || ""}/products/${product.id
          }`,
      },
    ],
  });
}
</script>
