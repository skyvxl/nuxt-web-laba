import { Query } from "node-appwrite";

export default defineEventHandler(async (event) => {
  // Проверяем авторизацию
  const userId = await getAuthenticatedUserId(event, true);

  const reviewId = getRouterParam(event, "id");
  if (!reviewId) {
    throw createError({
      statusCode: 400,
      message: "Review ID is required",
    });
  }

  const { databases, storage } = createAppwriteServices();
  const config = useRuntimeConfig();

  try {
    // Проверяем существование отзыва и права доступа
    const review = await databases.getDocument(
      config.public.appwriteDatabaseId,
      config.public.appwriteReviewCollectionId,
      reviewId
    );

    if (review.userId !== userId) {
      throw createError({
        statusCode: 403,
        message: "You can only delete your own reviews",
      });
    }

    // Удаляем все медиа файлы, связанные с отзывом
    const mediaResponse = await databases.listDocuments(
      config.public.appwriteDatabaseId,
      config.public.appwriteReviewMediaCollectionId,
      [Query.equal("reviewId", reviewId)]
    );

    // Удаляем файлы из storage и записи из БД
    for (const media of mediaResponse.documents) {
      try {
        await storage.deleteFile(
          config.public.appwriteReviewsMediaBucketId,
          media.fileId
        );
      } catch (error) {
        console.error(`Failed to delete file ${media.fileId}:`, error);
      }

      try {
        await databases.deleteDocument(
          config.public.appwriteDatabaseId,
          config.public.appwriteReviewMediaCollectionId,
          media.$id
        );
      } catch (error) {
        console.error(`Failed to delete media document ${media.$id}:`, error);
      }
    }

    // Удаляем сам отзыв
    await databases.deleteDocument(
      config.public.appwriteDatabaseId,
      config.public.appwriteReviewCollectionId,
      reviewId
    );

    return {
      message: "Review deleted successfully",
    };
  } catch (error: unknown) {
    console.error("Error deleting review:", error);
    const err = error as { statusCode?: number };

    if (err.statusCode) {
      throw error;
    }

    throw createError({
      statusCode: 500,
      message: "Failed to delete review",
    });
  }
});
