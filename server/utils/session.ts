import type { H3Event } from "h3";

/**
 * Validates the user session and returns the authenticated user ID.
 * Uses cookie-based authentication where:
 * - auth=1 indicates the user is authenticated
 * - userId contains the Appwrite user ID
 *
 * @param event - The H3 event object
 * @param required - If true, throws 401 error when not authenticated. If false, returns null.
 * @returns The authenticated user ID or null
 * @throws 401 error if authentication is required but user is not authenticated
 */
export async function getAuthenticatedUserId(
  event: H3Event,
  required: true
): Promise<string>;
export async function getAuthenticatedUserId(
  event: H3Event,
  required: false
): Promise<string | null>;
export async function getAuthenticatedUserId(
  event: H3Event,
  required: boolean = true
): Promise<string | null> {
  const authCookie = getCookie(event, "auth");
  const userId = getCookie(event, "userId");

  // Check if user is authenticated
  if (!authCookie || authCookie !== "1" || !userId) {
    if (required) {
      throw createError({
        statusCode: 401,
        statusMessage: "Unauthorized",
      });
    }
    return null;
  }

  return userId;
}
