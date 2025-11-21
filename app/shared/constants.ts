/**
 * Shared constants between client and server
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
