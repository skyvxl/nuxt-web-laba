import { handleServerError } from "../utils/errors";

export default defineEventHandler(async (event) => {
  const body = await readBody<Record<string, unknown> | null>(event);
  const normalized = normalizeProductPayload(body || {});
  const documentData = toAppwriteDocumentData(normalized);

  const { databases, ID } = createAppwriteServices();
  const config = useRuntimeConfig();

  try {
    const created = await databases.createDocument(
      config.public.appwriteDatabaseId,
      config.public.appwriteProductsCollectionId,
      ID.unique(),
      documentData
    );

    return {
      id: (created as unknown as Record<string, unknown>).$id,
    };
  } catch (error) {
    handleServerError(error, "products.post", {
      statusCode: 500,
      publicMessage: "Не удалось создать товар",
    });
  }
});
