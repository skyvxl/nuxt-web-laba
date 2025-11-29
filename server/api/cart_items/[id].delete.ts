import { Query } from "node-appwrite";
import { isH3Error } from "../../utils/errors";

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

    // Recalculate totals
    // Fetch all cart items in batches of 1000 to avoid missing items due to hardcoded limit
    let all: any[] = [];
    let offset = 0;
    const batchSize = 1000;
    while (true) {
      const response = await databases.listDocuments(
        config.public.appwriteDatabaseId,
        config.public.appwriteCartItemsCollectionId,
        [
          Query.equal("cartId", cartId),
          Query.limit(batchSize),
          Query.offset(offset),
        ]
      );
      const docs = response.documents || [];
      all = all.concat(docs);
      if (docs.length < batchSize) break;
      offset += batchSize;
    }
    const items = all.map((it: unknown) => {
      const doc = it as Record<string, unknown>;
      return {
        quantity: Number(doc.quantity ?? 0),
        fixedPrice: Number(doc.fixedPrice ?? 0),
      };
    });
    const totalItems = items.reduce((sum, it) => sum + it.quantity, 0);
    const totalPrice = items.reduce(
      (sum, it) => sum + it.quantity * it.fixedPrice,
      0
    );
    const timestampNow = new Date().toISOString();

    await databases.updateDocument(
      config.public.appwriteDatabaseId,
      config.public.appwriteCartsCollectionId,
      cartId,
      { totalItems, totalPrice, updatedAt: timestampNow }
    );

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
