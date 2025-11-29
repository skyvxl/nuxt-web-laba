import { Permission, Role, ID } from "node-appwrite";
import type { CreateReviewInput } from "~/shared/models/review";
import {
  MIN_REVIEW_RATING,
  MAX_REVIEW_RATING,
  MAX_REVIEW_COMMENT_LENGTH,
} from "../utils/constants";

export default defineEventHandler(async (event) => {
  // Проверяем авторизацию
  const userId = await getAuthenticatedUserId(event, true);

  const body = await readBody<CreateReviewInput>(event);

  // Валидация
  if (!body.productId || typeof body.productId !== "string") {
    throw createError({
      statusCode: 400,
      message: "Invalid product ID",
    });
  }

  if (
    typeof body.rating !== "number" ||
    body.rating < MIN_REVIEW_RATING ||
    body.rating > MAX_REVIEW_RATING
  ) {
    throw createError({
      statusCode: 400,
      message: `Rating must be between ${MIN_REVIEW_RATING} and ${MAX_REVIEW_RATING}`,
    });
  }

  if (
    body.comment &&
    typeof body.comment === "string" &&
    body.comment.length > MAX_REVIEW_COMMENT_LENGTH
  ) {
    throw createError({
      statusCode: 400,
      message: `Comment must not exceed ${MAX_REVIEW_COMMENT_LENGTH} characters`,
    });
  }

  const { databases, users } = createAppwriteServices();
  const config = useRuntimeConfig();

  try {
    // Получаем данные пользователя
    const user = await users!.get(userId);

    // Проверяем, не оставлял ли пользователь уже отзыв на этот товар
    const { Query } = await import("node-appwrite");
    const existingReviews = await databases.listDocuments(
      config.public.appwriteDatabaseId,
      config.public.appwriteReviewCollectionId,
      [Query.equal("productId", body.productId), Query.equal("userId", userId)]
    );

    if (existingReviews.total > 0) {
      return sendError(
        event,
        createError({
          statusCode: 409,
          statusMessage: "You have already reviewed this product",
        })
      );
    }

    // Подготавливаем данные для сохранения
    const reviewData = {
      productId: body.productId,
      userId: userId,
      rating: body.rating,
      comment: body.comment || "",
      isAnonymous: Boolean(body.isAnonymous),
      // Если анонимный - убираем данные, иначе сохраняем
      userName: body.isAnonymous ? null : user.name || "Пользователь",
      userEmail: body.isAnonymous ? null : user.email,
    };

    // Create review with retry logic (up to 3 attempts for ID conflicts)
    const maxAttempts = 3;
    let lastError: unknown;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const review = await databases.createDocument(
          config.public.appwriteDatabaseId,
          config.public.appwriteReviewCollectionId,
          ID.unique(), // Generate new ID for each attempt
          reviewData,
          [
            Permission.read(Role.any()),
            Permission.update(Role.user(userId)),
            Permission.delete(Role.user(userId)),
          ]
        );

        // Success - return the review
        return {
          review,
          message: "Review created successfully",
        };
      } catch (err: unknown) {
        lastError = err;
        const error = err as {
          code?: number;
          message?: string;
        };

        // If it's an ID conflict and we have more attempts - retry
        const isIdConflict =
          error.code === 409 ||
          error.message?.includes(
            "Document with the requested ID already exists"
          );

        if (isIdConflict && attempt < maxAttempts) {
          // Small delay before retry
          await new Promise((resolve) => setTimeout(resolve, 50 * attempt));
          continue;
        }

        // If it's a different error or we've exhausted attempts - throw
        throw err;
      }
    }

    // This point is unreachable because:
    // - Success returns early (line 101)
    // - All errors throw (line 126)
    // But TypeScript needs a return/throw here for type safety
    throw lastError ?? createError({
      statusCode: 500,
      message: "Failed to create review after multiple attempts",
    });
  } catch (error: unknown) {
    console.error("Error creating review:", error);

    const err = error as {
      statusCode?: number;
    };

    if (err.statusCode) {
      throw error;
    }

    throw createError({
      statusCode: 500,
      message: "Failed to create review",
    });
  }
});
