import { Query } from "node-appwrite";

export default defineEventHandler(async (event) => {
  const { databases } = createAppwriteServices();
  const config = useRuntimeConfig();

  const cartId = getRouterParam(event, "id");
  if (!cartId) {
    throw createError({
      statusCode: 400,
      statusMessage: "ID корзины не указан",
    });
  }

  const userId = await getAuthenticatedUserId(event, true);

  try {
    // Проверяем, что корзина принадлежит пользователю
    const cartDoc = await databases.getDocument(
      config.public.appwriteDatabaseId,
      config.public.appwriteCartsCollectionId,
      cartId
    );

    if ((cartDoc as Record<string, unknown>).userId !== userId) {
      throw createError({
        statusCode: 403,
        statusMessage: "Доступ запрещён",
      });
    }

    // Получаем все элементы корзины
    const itemsResp = await databases.listDocuments(
      config.public.appwriteDatabaseId,
      config.public.appwriteCartItemsCollectionId,
      [Query.equal("cartId", cartId), Query.limit(1000)]
    );

    // Удаляем все элементы корзины
    for (const item of itemsResp.documents) {
      await databases.deleteDocument(
        config.public.appwriteDatabaseId,
        config.public.appwriteCartItemsCollectionId,
        item.$id
      );
    }

    // Обновляем корзину: сбрасываем totalItems и totalPrice
    await databases.updateDocument(
      config.public.appwriteDatabaseId,
      config.public.appwriteCartsCollectionId,
      cartId,
      {
        totalItems: 0,
        totalPrice: 0,
      }
    );

    return { success: true };
  } catch (error) {
    if ((error as { statusCode?: number }).statusCode) {
      throw error;
    }
    console.error("Failed to clear cart", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Не удалось очистить корзину",
    });
  }
});
