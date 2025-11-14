import type { H3Event } from "h3";
import { createAppwriteServices } from "@@/server/utils/appwrite";

export default defineEventHandler(async (_event: H3Event) => {
  const { databases } = createAppwriteServices();
  const config = useRuntimeConfig();

  try {
    const response = await databases.listDocuments(
      config.public.appwriteDatabaseId,
      config.public.appwriteProductsCollectionId
    );

    const products = (response.documents || []).map((doc: unknown) => {
      const data = doc as unknown as Record<string, unknown>;
      let characteristics: Record<string, string> = {};
      if (typeof data.characteristics === "string") {
        try {
          characteristics = JSON.parse(data.characteristics);
        } catch {
          characteristics = {};
        }
      } else if (
        typeof data.characteristics === "object" &&
        data.characteristics !== null
      ) {
        characteristics =
          (data.characteristics as unknown as Record<string, string>) || {};
      }

      let features: string[] = [];
      if (typeof data.features === "string") {
        try {
          features = JSON.parse(data.features);
        } catch {
          features = [];
        }
      } else if (Array.isArray(data.features)) {
        features = data.features as unknown as string[];
      }

      const id = (doc as unknown as Record<string, unknown>)["$id"] as
        | string
        | undefined;

      return {
        id,
        name: data.name,
        category: data.category,
        price: data.price,
        oldPrice: data.oldPrice,
        image: data.image,
        shortDescription: data.shortDescription,
        description: data.description,
        characteristics,
        features,
      };
    });

    return { products };
  } catch (err) {
    // On server errors, return empty array with code for debugging
    console.warn("Failed to load products", err);
    return {
      products: [],
      error: String(err),
    };
  }
});
