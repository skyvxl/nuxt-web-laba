import { isH3Error } from "../../utils/errors";
import { recalculateCartTotalsWithRetry } from "../../utils/cartTotals";

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");
  if (!id) throw createError({ statusCode: 400, statusMessage: "Missing id" });

  const { databases } = createAppwriteServices();
  const config = useRuntimeConfig();
  try {
    const userId = await getAuthenticatedUserId(event, true);

    const item = await databases.getDocument(
      config.public.appwriteDatabaseId,
      config.public.appwriteCartItemsCollectionId,
      id
    );
    const itemDoc = item as unknown as Record<string, unknown>;
    const cartId = String(itemDoc.cartId);

    const cart = await databases.getDocument(
      config.public.appwriteDatabaseId,
      config.public.appwriteCartsCollectionId,
      cartId
    );
    const cartDoc = cart as unknown as Record<string, unknown>;
    if (!cartDoc || String(cartDoc.userId) !== userId) {
      throw createError({ statusCode: 403, statusMessage: "Forbidden" });
    }

    await databases.deleteDocument(
      config.public.appwriteDatabaseId,
      config.public.appwriteCartItemsCollectionId,
      id
    );

    // Recalculate totals with optimistic locking to prevent race conditions
    await recalculateCartTotalsWithRetry(databases, {
      databaseId: config.public.appwriteDatabaseId,
      cartsCollectionId: config.public.appwriteCartsCollectionId,
      cartItemsCollectionId: config.public.appwriteCartItemsCollectionId,
    }, cartId);

    return { id };
  } catch (error) {
    // Re-throw known errors (401, 403, etc.) with their original status codes
    if (isH3Error(error)) {
      throw error;
    }
    
    // Only unexpected errors should be wrapped as 500
    console.error("Failed to delete cart item", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Не удалось удалить позицию в корзине",
    });
  }
});
