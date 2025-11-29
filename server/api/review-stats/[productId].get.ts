import { Query } from "node-appwrite";
import type { Review, ReviewStats } from "~/shared/models/review";

export default defineEventHandler(async (event) => {
  const productId = getRouterParam(event, "productId");

  if (!productId) {
    throw createError({
      statusCode: 400,
      message: "Product ID is required",
    });
  }

  const { databases } = createAppwriteServices();
  const config = useRuntimeConfig();

  try {
    // Получаем все отзывы для товара
    const reviewsResponse = await databases.listDocuments(
      config.public.appwriteDatabaseId,
      config.public.appwriteReviewCollectionId,
      [Query.equal("productId", productId), Query.limit(1000)]
    );

    const reviews = reviewsResponse.documents as unknown as Review[];

    if (reviews.length === 0) {
      return {
        averageRating: 0,
        totalReviews: 0,
        ratingDistribution: {
          1: 0,
          2: 0,
          3: 0,
          4: 0,
          5: 0,
        },
      } as ReviewStats;
    }

    // Вычисляем статистику
    const ratingDistribution = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
    };

    let totalRating = 0;

    for (const review of reviews) {
      totalRating += review.rating;
      ratingDistribution[review.rating as keyof typeof ratingDistribution]++;
    }

    const averageRating = totalRating / reviews.length;

    return {
      averageRating: Math.round(averageRating * 10) / 10,
      totalReviews: reviews.length,
      ratingDistribution,
    } as ReviewStats;
  } catch (error) {
    console.error("Error fetching review stats:", error);
    throw createError({
      statusCode: 500,
      message: "Failed to fetch review statistics",
    });
  }
});
