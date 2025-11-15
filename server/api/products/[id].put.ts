export default defineEventHandler(async (event) => {
  const id = event.context.params?.id as string | undefined;
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: "Missing id" });
  }

  const body = await readBody<Record<string, unknown> | null>(event);
  const normalized = normalizeProductPayload(body || {});
  const documentData = toAppwriteDocumentData(normalized);

  const { databases } = createAppwriteServices();
  const config = useRuntimeConfig();

  try {
    await databases.updateDocument(
      config.public.appwriteDatabaseId,
      config.public.appwriteProductsCollectionId,
      id,
      documentData
    );

    return { id };
  } catch (error) {
    console.error("Failed to update product", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to update product",
    });
  }
});
