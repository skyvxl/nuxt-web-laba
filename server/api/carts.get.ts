import { Query } from "node-appwrite";

export default defineEventHandler(async (_event) => {
  const { databases } = createAppwriteServices();
  const config = useRuntimeConfig();
  try {
    const userId = await getAuthenticatedUserId(_event, false);
    if (!userId) return { cart: null };

    const cartsResp = await databases.listDocuments(
      config.public.appwriteDatabaseId,
      config.public.appwriteCartsCollectionId,
      [
        Query.limit(1),
        Query.equal("userId", userId),
        Query.equal("status", "active"),
      ]
    );

    const cartDoc = (cartsResp.documents || [])[0] as
      | Record<string, unknown>
      | undefined;
    if (!cartDoc) return { cart: null };

    const cartId = String(cartDoc.$id);
    const cartResponse = {
      id: cartId,
      userId: String(cartDoc.userId),
      status: String(cartDoc.status),
      totalItems: Number(cartDoc.totalItems ?? 0),
      totalPrice: Number(cartDoc.totalPrice ?? 0),
      createdAt: String(cartDoc.$createdAt ?? ""),
      updatedAt: String(cartDoc.$updatedAt ?? ""),
    };

    // Fetch items
    const itemsResp = await databases.listDocuments(
      config.public.appwriteDatabaseId,
      config.public.appwriteCartItemsCollectionId,
      [Query.equal("cartId", cartId), Query.limit(1000)]
    );

    const items = (itemsResp.documents || []).map((item: unknown) => {
      const doc = item as Record<string, unknown>;
      return {
        id: String(doc.$id),
        cartId: String(doc.cartId),
        productId: String(doc.productId),
        quantity: Number(doc.quantity ?? 0),
        fixedPrice: Number(doc.fixedPrice ?? 0),
        addedAt: String(doc.addedAt ?? ""),
        productName: undefined as string | undefined,
        productImage: undefined as string | undefined,
      };
    });

    // Fetch product details for items (name/image) without storing them in cart_items collection
    const productCache: Record<string, { name?: string; image?: string }> = {};
    for (const item of items) {
      const pid = String(item.productId);
      if (productCache[pid]) {
        item.productName = productCache[pid].name;
        item.productImage = productCache[pid].image;
        continue;
      }
      try {
        const prod = await databases.getDocument(
          config.public.appwriteDatabaseId,
          config.public.appwriteProductsCollectionId,
          pid
        );
        const prodDoc = prod as unknown as Record<string, unknown>;
        const name = (prodDoc.name as string | undefined) ?? undefined;
        const image = (prodDoc.image as string | undefined) ?? undefined;
        productCache[pid] = { name, image };
        item.productName = name;
        item.productImage = image;
      } catch {
        // product not found — leave productName/productImage undefined
      }
    }

    // If products exist, we could optionally fetch latest product data, but keep fixedPrice

    return {
      cart: {
        ...cartResponse,
        items,
      },
    };
  } catch (error) {
    console.error("Failed to fetch cart", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Не удалось получить корзину",
    });
  }
});
