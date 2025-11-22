import { Query } from "node-appwrite";
import { validateNumber, validateString } from "../utils/errors";

export default defineEventHandler(async (event) => {
  const body = await readBody<Record<string, unknown> | null>(event);
  const productId = validateString(body?.productId, "productId");
  const quantity = validateNumber(body?.quantity ?? 1, "quantity", {
    min: 1,
  }) as number;

  const { databases, ID } = createAppwriteServices();
  const config = useRuntimeConfig();

  // Must be logged in
  try {
    const userId = getCookie(event, "userId") as string | undefined | null;
    if (!userId)
      throw createError({ statusCode: 401, statusMessage: "Unauthorized" });

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
    const allItems = await databases.listDocuments(
      config.public.appwriteDatabaseId,
      config.public.appwriteCartItemsCollectionId,
      [Query.equal("cartId", cartId), Query.limit(1000)]
    );
    const items = (allItems.documents || []).map((it: unknown) => {
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
    console.error("Failed to add item to cart", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Не удалось добавить в корзину",
    });
  }
});
