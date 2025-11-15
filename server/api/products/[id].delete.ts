import { createAppwriteServices } from "@@/server/utils/appwrite";

export default defineEventHandler(async (event) => {
  const id = event.context.params?.id as string | undefined;
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: "Missing id" });
  }

  const { databases } = createAppwriteServices();
  const config = useRuntimeConfig();

  try {
    await databases.deleteDocument(
      config.public.appwriteDatabaseId,
      config.public.appwriteProductsCollectionId,
      id
    );
    return { id };
  } catch (error) {
    console.error("Failed to delete product", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to delete product",
    });
  }
});
