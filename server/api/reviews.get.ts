import { Query } from "node-appwrite";
import type { Review, ReviewMedia } from "~/shared/models/review";

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const productId = query.productId as string | undefined;

  if (!productId) {
    throw createError({
      statusCode: 400,
      message: "Product ID is required",
    });
  }

  const { databases } = createAppwriteServices();
  const config = useRuntimeConfig();

  try {
    // Получаем отзывы для товара
    const reviewsResponse = await databases.listDocuments(
      config.public.appwriteDatabaseId,
      config.public.appwriteReviewCollectionId,
      [
        Query.equal("productId", productId),
        Query.orderDesc("$createdAt"),
        Query.limit(100),
      ]
    );

    const reviews = reviewsResponse.documents as unknown as Review[];

    // Получаем медиа для всех отзывов
    const reviewIds = reviews.map((r) => r.$id);
    let allMedia: ReviewMedia[] = [];

    if (reviewIds.length > 0) {
      const mediaResponse = await databases.listDocuments(
        config.public.appwriteDatabaseId,
        config.public.appwriteReviewMediaCollectionId,
        [Query.equal("reviewId", reviewIds), Query.limit(1000)]
      );
      allMedia = mediaResponse.documents as unknown as ReviewMedia[];
    }

    // Группируем медиа по reviewId
    const mediaByReview = allMedia.reduce((acc, media) => {
      const key = media.reviewId;
      if (!acc[key]) acc[key] = [];
      acc[key].push(media);
      return acc;
    }, {} as Record<string, ReviewMedia[]>);

    // Объединяем отзывы с медиа
    const reviewsWithMedia = reviews.map((review) => ({
      ...review,
      media: mediaByReview[review.$id] || [],
    }));

    return {
      reviews: reviewsWithMedia,
      total: reviewsResponse.total,
    };
  } catch (error) {
    console.error("Error fetching reviews:", error);
    throw createError({
      statusCode: 500,
      message: "Failed to fetch reviews",
    });
  }
});
