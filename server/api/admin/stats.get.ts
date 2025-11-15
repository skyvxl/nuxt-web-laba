import { Query } from "node-appwrite";

export default defineEventHandler(async () => {
  const config = useRuntimeConfig();
  const { databases, users } = createAppwriteServices();

  try {
    const productsResponse = await databases.listDocuments(
      config.public.appwriteDatabaseId,
      config.public.appwriteProductsCollectionId,
      [Query.limit(1)]
    );

    let userCount: number | null = null;
    if (users) {
      try {
        const userResponse = await users.list([Query.limit(1)]);
        userCount = userResponse.total;
      } catch (userError) {
        console.warn("Unable to fetch user stats", userError);
      }
    }

    return {
      products: {
        total: productsResponse.total,
      },
      users: userCount,
      generatedAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error("Failed to fetch admin stats", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Не удалось получить статистику",
    });
  }
});
