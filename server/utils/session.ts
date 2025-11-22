import type { H3Event } from "h3";
import type { Models } from "node-appwrite";

/**
 * Validates the Appwrite session and returns the authenticated user ID.
 * This prevents userId manipulation by validating against the actual Appwrite session.
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
  const { account } = createAppwriteServices();

  try {
    // Get the current authenticated user from Appwrite session
    // Appwrite manages sessions via httpOnly cookies automatically
    const user = await account.get() as unknown as Models.User<Models.Preferences>;
    
    if (!user || !user.$id) {
      if (required) {
        throw createError({
          statusCode: 401,
          statusMessage: "Unauthorized",
        });
      }
      return null;
    }

    return user.$id;
  } catch (error) {
    // If there's an error getting the user (e.g., invalid session), treat as unauthorized
    // Log the error for debugging purposes
    if (error && typeof error === 'object' && 'statusCode' in error && error.statusCode !== 401) {
      console.error('Unexpected error during session validation:', error);
    }
    if (required) {
      throw createError({
        statusCode: 401,
        statusMessage: "Unauthorized",
      });
    }
    return null;
  }
}
