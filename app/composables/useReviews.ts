import type {
  ReviewWithMedia,
  ReviewMedia,
  CreateReviewInput,
  ReviewStats,
} from "~/shared/models/review";

export const useReviews = (productId: string) => {
  const reviews = ref<ReviewWithMedia[]>([]);
  const stats = ref<ReviewStats | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  // Загрузка отзывов
  const fetchReviews = async () => {
    loading.value = true;
    error.value = null;

    try {
      const data = await $fetch<{ reviews: ReviewWithMedia[]; total: number }>(
        "/api/reviews",
        {
          query: { productId },
        }
      );
      reviews.value = data.reviews;
    } catch (err: unknown) {
      console.error("Failed to fetch reviews:", err);
      error.value = (err as Error).message || "Failed to load reviews";
      reviews.value = [];
    } finally {
      loading.value = false;
    }
  };

  // Загрузка статистики
  const fetchStats = async () => {
    try {
      const data = await $fetch<ReviewStats>(`/api/review-stats/${productId}`);
      stats.value = data;
    } catch (err: unknown) {
      console.error("Failed to fetch review stats:", err);
      stats.value = null;
    }
  };

  // Создание отзыва
  const createReview = async (input: CreateReviewInput) => {
    try {
      const data = await $fetch<{ review: ReviewWithMedia; message: string }>(
        "/api/reviews",
        {
          method: "POST",
          body: input,
        }
      );

      // Добавляем новый отзыв в начало списка
      reviews.value.unshift({ ...data.review, media: [] });

      // Обновляем статистику
      await fetchStats();

      return data.review;
    } catch (err: unknown) {
      console.error("Failed to create review:", err);
      throw err;
    }
  };

  // Удаление отзыва
  const deleteReview = async (reviewId: string) => {
    try {
      await $fetch(`/api/reviews/${reviewId}`, {
        method: "DELETE",
      });

      // Удаляем отзыв из списка
      reviews.value = reviews.value.filter((r) => r.$id !== reviewId);

      // Обновляем статистику
      await fetchStats();
    } catch (err: unknown) {
      console.error("Failed to delete review:", err);
      throw err;
    }
  };

  // Загрузка медиа к отзыву
  const uploadMedia = async (reviewId: string, files: File[]) => {
    try {
      const formData = new FormData();
      formData.append("reviewId", reviewId);

      for (const file of files) {
        formData.append("file", file);
      }

      const data = await $fetch<{ media: ReviewMedia[]; message: string }>(
        "/api/review-media",
        {
          method: "POST",
          body: formData,
        }
      );

      // Обновляем медиа в отзыве
      const review = reviews.value.find((r) => r.$id === reviewId);
      if (review) {
        review.media = [...review.media, ...data.media];
      }

      return data.media;
    } catch (err: unknown) {
      console.error("Failed to upload media:", err);
      throw err;
    }
  };

  return {
    reviews: readonly(reviews),
    stats: readonly(stats),
    loading: readonly(loading),
    error: readonly(error),
    fetchReviews,
    fetchStats,
    createReview,
    deleteReview,
    uploadMedia,
  };
};
