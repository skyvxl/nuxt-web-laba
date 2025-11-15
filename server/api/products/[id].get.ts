export default defineEventHandler(async (_event) => {
  const { databases } = createAppwriteServices();
  const config = useRuntimeConfig();
  const id = _event.context.params?.id as string | undefined;

  if (!id) {
    throw createError({ statusCode: 400, statusMessage: "Missing id" });
  }

  try {
    const response = await databases.getDocument(
      config.public.appwriteDatabaseId,
      config.public.appwriteProductsCollectionId,
      id
    );

    const doc = response as unknown as Record<string, unknown>;
    const data = doc || {};
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

    const documentId = doc["$id"] as string | undefined;

    return {
      id: documentId,
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
  } catch {
    throw createError({ statusCode: 404, statusMessage: "Product not found" });
  }
});
