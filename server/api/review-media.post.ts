import { Permission, Role } from "node-appwrite";
import {
  ALLOWED_REVIEW_IMAGE_MIME_TYPES,
  ALLOWED_REVIEW_VIDEO_MIME_TYPES,
  MAX_REVIEW_IMAGE_SIZE_BYTES,
  MAX_REVIEW_VIDEO_SIZE_BYTES,
  MAX_REVIEW_MEDIA_COUNT,
} from "../utils/constants";

export default defineEventHandler(async (event) => {
  // Проверяем авторизацию
  const userId = await getAuthenticatedUserId(event, true);

  const formData = await readMultipartFormData(event);
  if (!formData || formData.length === 0) {
    throw createError({
      statusCode: 400,
      message: "No files provided",
    });
  }

  const reviewIdField = formData.find((field) => field.name === "reviewId");
  if (!reviewIdField) {
    throw createError({
      statusCode: 400,
      message: "Review ID is required",
    });
  }

  const reviewId = reviewIdField.data.toString();

  const { databases, storage, ID } = createAppwriteServices();
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
        message: "You can only add media to your own reviews",
      });
    }

    // Проверяем количество уже загруженных медиа
    const { Query } = await import("node-appwrite");
    const existingMedia = await databases.listDocuments(
      config.public.appwriteDatabaseId,
      config.public.appwriteReviewMediaCollectionId,
      [Query.equal("reviewId", reviewId)]
    );

    const files = formData.filter((field) => field.name === "file");

    if (existingMedia.total + files.length > MAX_REVIEW_MEDIA_COUNT) {
      throw createError({
        statusCode: 400,
        message: `Maximum ${MAX_REVIEW_MEDIA_COUNT} files allowed per review`,
      });
    }

    const uploadedMedia = [];

    for (const fileField of files) {
      if (!fileField.data || !fileField.filename || !fileField.type) {
        continue;
      }

      const mimeType = fileField.type;
      const fileSize = fileField.data.length;
      const fileName = fileField.filename;

      // Определяем тип медиа
      const isImage = ALLOWED_REVIEW_IMAGE_MIME_TYPES.includes(
        mimeType as "image/jpeg" | "image/jpg" | "image/png"
      );
      const isVideo = ALLOWED_REVIEW_VIDEO_MIME_TYPES.includes(
        mimeType as "video/mp4"
      );

      if (!isImage && !isVideo) {
        throw createError({
          statusCode: 400,
          message: `Invalid file type: ${mimeType}. Allowed types: ${ALLOWED_REVIEW_IMAGE_MIME_TYPES.join(
            ", "
          )}, ${ALLOWED_REVIEW_VIDEO_MIME_TYPES.join(", ")}`,
        });
      }

      // Проверяем размер файла
      const maxSize = isImage
        ? MAX_REVIEW_IMAGE_SIZE_BYTES
        : MAX_REVIEW_VIDEO_SIZE_BYTES;
      if (fileSize > maxSize) {
        throw createError({
          statusCode: 400,
          message: `File ${fileName} exceeds maximum size of ${
            maxSize / 1024 / 1024
          }MB`,
        });
      }

      // Загружаем файл в storage
      const fileBuffer = Buffer.from(fileField.data);
      const fileBlob = new File([fileBuffer], fileName, { type: mimeType });
      const file = await storage.createFile(
        config.public.appwriteReviewsMediaBucketId,
        ID.unique(),
        fileBlob,
        [Permission.read(Role.any())]
      );

      // Создаём запись в БД
      const mediaRecord = await databases.createDocument(
        config.public.appwriteDatabaseId,
        config.public.appwriteReviewMediaCollectionId,
        ID.unique(),
        {
          reviewId: reviewId,
          fileId: file.$id,
          fileName,
          mimeType,
          fileSize,
          mediaType: isImage ? "image" : "video",
          uploadedAt: new Date().toISOString(),
        },
        [Permission.read(Role.any()), Permission.delete(Role.user(userId))]
      );

      uploadedMedia.push(mediaRecord);
    }

    return {
      media: uploadedMedia,
      message: "Files uploaded successfully",
    };
  } catch (error: unknown) {
    console.error("Error uploading review media:", error);
    const err = error as { statusCode?: number };

    if (err.statusCode) {
      throw error;
    }

    throw createError({
      statusCode: 500,
      message: "Failed to upload files",
    });
  }
});
