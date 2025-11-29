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

      <!-- Статистика отзывов -->
      <div
        v-if="reviewStats && reviewStats.totalReviews > 0"
        class="card bg-base-100 shadow-xl"
      >
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
                  v-for="star in 5"
                  :key="star"
                  type="radio"
                  class="mask mask-star bg-warning"
                  :checked="star === Math.round(reviewStats.averageRating)"
                  disabled
                >
              </div>
              <div class="text-sm text-base-content/70 mt-1">
                {{ reviewStats.totalReviews }}
                {{
                  reviewStats.totalReviews === 1
                    ? "отзыв"
                    : reviewStats.totalReviews < 5
                    ? "отзыва"
                    : "отзывов"
                }}
              </div>
            </div>

            <!-- Распределение рейтингов -->
            <div class="flex-1 space-y-2">
              <div
                v-for="rating in [5, 4, 3, 2, 1]"
                :key="rating"
                class="flex items-center gap-2"
              >
                <span class="text-sm w-8">{{ rating }} ★</span>
                <progress
                  class="progress progress-warning flex-1"
                  :value="reviewStats.ratingDistribution[rating as 1 | 2 | 3 | 4 | 5]"
                  :max="reviewStats.totalReviews"
                />
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
      <ReviewForm
        v-if="product"
        :product-id="product.id"
        @submitted="handleReviewSubmitted"
      />

      <!-- Список отзывов -->
      <div class="card bg-base-100 shadow-xl">
        <div class="card-body">
          <h2 class="card-title mb-4">
            Отзывы
            <span
              v-if="reviewStats && reviewStats.totalReviews > 0"
              class="badge badge-neutral"
              >{{ reviewStats.totalReviews }}</span
            >
          </h2>

          <!-- Загрузка -->
          <div
            v-if="reviewsLoading"
            class="flex items-center justify-center py-8"
          >
            <span class="loading loading-spinner loading-lg" />
          </div>

          <!-- Список отзывов -->
          <div v-else-if="reviews.length > 0" class="space-y-4">
            <ReviewCard
              v-for="review in reviews"
              :key="review.$id"
              :review="review"
              :can-delete="canDeleteReview(review)"
              @delete="handleDeleteReview"
              @open-media="handleOpenMedia"
            />
          </div>

          <!-- Нет отзывов -->
          <div v-else class="text-center py-8 text-base-content/70">
            <Icon
              name="heroicons:chat-bubble-left-right"
              class="w-16 h-16 mx-auto mb-2 opacity-50"
            />
            <p>Отзывов пока нет. Будьте первым!</p>
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

    <!-- Модальное окно для просмотра медиа -->
    <dialog ref="mediaModal" class="modal" @close="handleModalClose">
      <div class="modal-box max-w-7xl w-11/12 max-h-[90vh] p-0 overflow-hidden">
        <form method="dialog">
          <button
            class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2 z-10 bg-base-100/80 hover:bg-base-100"
          >
            ✕
          </button>
        </form>
        <div
          v-if="selectedMedia"
          class="w-full h-full flex items-center justify-center bg-base-200"
        >
          <!-- Изображение -->
          <img
            v-if="selectedMedia.mediaType === 'image'"
            :src="getMediaUrl(selectedMedia.fileId)"
            :alt="selectedMedia.fileName"
            class="max-w-full max-h-[90vh] w-auto h-auto object-contain"
          >
          <!-- Видео -->
          <video
            v-else
            :key="selectedMedia.fileId"
            ref="videoPlayer"
            :src="getMediaUrl(selectedMedia.fileId)"
            class="max-w-full max-h-[90vh] w-auto h-auto"
            controls
            controlslist="nodownload"
          >
            <track kind="captions" >
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
  try {
    if (!authStore.isAuthenticated) return navigateTo("/auth");
    await cartStore.addToCart(product!.id, 1);
    return navigateTo("/cart");
  } catch (err) {
    console.error("Failed to add to cart", err);
    if ((err as Error).message === "Unauthorized") return navigateTo("/auth");
    toastStore.error("Ошибка добавления в корзину");
  }
}

async function onAddToCart() {
  try {
    if (!authStore.isAuthenticated) return navigateTo("/auth");
    await cartStore.addToCart(product!.id, 1);
    toastStore.success("Товар добавлен в корзину");
  } catch (err) {
    console.error("Failed to add to cart", err);
    if ((err as Error).message === "Unauthorized") return navigateTo("/auth");
    toastStore.error("Ошибка добавления в корзину");
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
