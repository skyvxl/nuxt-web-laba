/**
 * Centralized constants for server-side validation
 */

// Allowed image mime types for avatar uploads
export const ALLOWED_AVATAR_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
] as const;

// Maximum file size for avatars (5MB)
export const MAX_AVATAR_SIZE_BYTES = 5 * 1024 * 1024;

// Pagination defaults
export const DEFAULT_PAGE_SIZE = 50;
export const MAX_PAGE_SIZE = 100;

// Product validation
export const MIN_PRODUCT_NAME_LENGTH = 1;
export const MAX_PRODUCT_NAME_LENGTH = 200;
export const MIN_PRODUCT_PRICE = 0;

// Rate limiting (requests per minute)
export const RATE_LIMIT_REQUESTS = 60;
export const RATE_LIMIT_WINDOW_MS = 60 * 1000;

// Review validation
export const MIN_REVIEW_RATING = 1;
export const MAX_REVIEW_RATING = 5;
export const MAX_REVIEW_COMMENT_LENGTH = 1000;
export const MAX_REVIEW_MEDIA_COUNT = 10; // Максимум файлов на отзыв

// Review media validation
export const ALLOWED_REVIEW_IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
] as const;

export const ALLOWED_REVIEW_VIDEO_MIME_TYPES = ["video/mp4"] as const;

export const ALLOWED_REVIEW_MEDIA_MIME_TYPES = [
  ...ALLOWED_REVIEW_IMAGE_MIME_TYPES,
  ...ALLOWED_REVIEW_VIDEO_MIME_TYPES,
] as const;

// Maximum file size for review images (18MB, показываем как 20MB)
export const MAX_REVIEW_IMAGE_SIZE_BYTES = 18 * 1024 * 1024;

// Maximum file size for review videos (18MB, показываем как 20MB)
export const MAX_REVIEW_VIDEO_SIZE_BYTES = 18 * 1024 * 1024;
