import { Query } from "node-appwrite";
import { validateNumber, validateString, isH3Error } from "../utils/errors";

export default defineEventHandler(async (event) => {
  const body = await readBody<Record<string, unknown> | null>(event);
  const productId = validateString(body?.productId, "productId");
  const quantity = validateNumber(body?.quantity ?? 1, "quantity", {
    min: 1,
    max: 999,
  }) as number;

  const { databases, ID } = createAppwriteServices();
  const config = useRuntimeConfig();

  // Must be logged in
  try {
    const userId = await getAuthenticatedUserId(event, true);

    // Fetch product
    const product = await databases.getDocument(
      config.public.appwriteDatabaseId,
      config.public.appwriteProductsCollectionId,
      productId
    );
    const productDoc = product as unknown as Record<string, unknown>;
    const productPrice = Number(productDoc.price ?? productDoc["price"]);
    if (!Number.isFinite(productPrice)) {
      throw createError({
        statusCode: 400,
        statusMessage: "Product price invalid",
      });
    }

    // Find or create active cart for user
    const cartsResp = await databases.listDocuments(
      config.public.appwriteDatabaseId,
      config.public.appwriteCartsCollectionId,
      [
        Query.equal("userId", userId),
        Query.equal("status", "active"),
        Query.limit(1),
      ]
    );

    let cartId: string;
    const existingCartDoc = (cartsResp.documents || [])[0] as
      | Record<string, unknown>
      | undefined;
    if (existingCartDoc) {
      cartId = String(existingCartDoc.$id);
    } else {
      const timestamp = new Date().toISOString();
      const createdCart = await databases.createDocument(
        config.public.appwriteDatabaseId,
        config.public.appwriteCartsCollectionId,
        ID.unique(),
        {
          userId: userId,
          status: "active",
          totalItems: 0,
          totalPrice: 0,
          createdAt: timestamp,
          updatedAt: timestamp,
        }
      );
      cartId = String((createdCart as unknown as Record<string, unknown>).$id);
    }

    // Check existing item
    const itemsResp = await databases.listDocuments(
      config.public.appwriteDatabaseId,
      config.public.appwriteCartItemsCollectionId,
      [
        Query.equal("cartId", cartId),
        Query.equal("productId", productId),
        Query.limit(1),
      ]
    );

    const existingItem = (itemsResp.documents || [])[0] as
      | Record<string, unknown>
      | undefined;
    let itemId: string;
    if (existingItem) {
      // Update quantity
      const newQty = Number(existingItem.quantity || 0) + quantity;
      const updated = await databases.updateDocument(
        config.public.appwriteDatabaseId,
        config.public.appwriteCartItemsCollectionId,
        String(existingItem.$id),
        {
          quantity: newQty,
        }
      );
      itemId = String((updated as unknown as Record<string, unknown>).$id);
    } else {
      const createdItem = await databases.createDocument(
        config.public.appwriteDatabaseId,
        config.public.appwriteCartItemsCollectionId,
        ID.unique(),
        {
          cartId,
          productId,
          quantity,
          fixedPrice: productPrice,
          addedAt: new Date().toISOString(),
        }
      );
      itemId = String((createdItem as unknown as Record<string, unknown>).$id);
    }

    // Recalculate totals
    // Fetch all cart items with pagination to avoid missing items if >1000
    async function fetchAllCartItems(databases, dbId, collectionId, cartId) {
      const allItems: Record<string, unknown>[] = [];
      let offset = 0;
      const pageSize = 1000;
      while (true) {
        const resp = await databases.listDocuments(
          dbId,
          collectionId,
          [
            Query.equal("cartId", cartId),
            Query.limit(pageSize),
            Query.offset(offset),
          ]
        );
        const docs = resp.documents || [];
        allItems.push(...docs);
        if (docs.length < pageSize) break;
        offset += pageSize;
      }
      return allItems;
    }

    const allItems = await fetchAllCartItems(
      databases,
      config.public.appwriteDatabaseId,
      config.public.appwriteCartItemsCollectionId,
      cartId
    );
    const items = (allItems || []).map((it: unknown) => {
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

    return { id: itemId };
  } catch (error) {
    // Re-throw known errors (401, 400, etc.) with their original status codes
    if (isH3Error(error)) {
      throw error;
    }
    
    // Only unexpected errors should be wrapped as 500
    console.error("Failed to add item to cart", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Не удалось добавить в корзину",
    });
  }
});
