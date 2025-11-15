import { createAppwriteServices } from "@@/server/utils/appwrite";
import {
  normalizeProductPayload,
  toAppwriteDocumentData,
} from "@@/server/utils/productPayload";

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
    console.error("Failed to create product", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to create product",
    });
  }
});
