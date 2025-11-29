import type { H3Event } from "h3";
import { Query } from "node-appwrite";

interface NormalizedProduct {
  id?: string;
  name?: string;
  category?: string;
  price?: number;
  oldPrice?: number | null;
  image?: string;
  shortDescription?: string;
  description?: string;
  characteristics: Record<string, string>;
  features: string[];
}

export default defineEventHandler(async (event: H3Event) => {
  const { databases } = createAppwriteServices();
  const config = useRuntimeConfig();
  const query = getQuery(event);

  // Pagination parameters
  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.min(Math.max(1, Number(query.limit) || 50), 100); // Max 100 items per page

  const searchTermRaw = typeof query.q === "string" ? query.q.trim() : "";
  const searchTerm = searchTermRaw.toLowerCase();
  const categoriesFilter = normalizeCategories(query.categories);
  const hasFilters = Boolean(searchTerm || categoriesFilter.length);

  try {
    // Always fetch all products when we have filters to ensure proper filtering
    // Otherwise use pagination for performance
    const response = await databases.listDocuments(
      config.public.appwriteDatabaseId,
      config.public.appwriteProductsCollectionId,
      hasFilters
        ? [Query.limit(1000)]
        : [Query.limit(limit), Query.offset((page - 1) * limit)]
    );

    const allCategorySet = new Set<string>();
    const mappedProducts: NormalizedProduct[] = (response.documents || []).map(
      (doc: unknown) => {
        const data = doc as unknown as Record<string, unknown>;
        const product = normalizeProductDocument(data, doc);
        if (product.category) {
          allCategorySet.add(String(product.category));
        }
        return product;
      }
    );

    // Apply filters
    let results = mappedProducts;

    if (categoriesFilter.length) {
      results = results.filter((product) =>
        categoriesFilter.includes(String(product.category || "").toLowerCase())
      );
    }

    if (searchTerm) {
      results = applyFuzzySearch(results, searchTerm);
    }

    return {
      products: results,
      availableCategories: Array.from(allCategorySet).sort((a, b) =>
        a.localeCompare(b, "ru")
      ),
      pagination: {
        page,
        limit,
        total: results.length,
        hasMore: false,
      },
    };
  } catch (err) {
    // Log detailed error on server, return generic message to client
    console.error("Failed to load products:", err);
    throw createError({
      statusCode: 500,
      statusMessage: "Не удалось загрузить товары",
    });
  }
});

function normalizeProductDocument(
  data: Record<string, unknown>,
  rawDoc: unknown
): NormalizedProduct {
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
    features = (data.features as unknown as string[]).map((item) =>
      String(item ?? "")
    );
  }

  const id = (rawDoc as unknown as Record<string, unknown>)["$id"] as
    | string
    | undefined;

  return {
    id,
    name: toOptionalString(data.name),
    category: toOptionalString(data.category),
    price: toOptionalNumber(data.price),
    oldPrice: toOptionalNullableNumber(data.oldPrice),
    image: toOptionalString(data.image),
    shortDescription: toOptionalString(data.shortDescription),
    description: toOptionalString(data.description),
    characteristics,
    features,
  };
}

function toOptionalString(value: unknown): string | undefined {
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed.length ? trimmed : undefined;
  }
  return undefined;
}

function toOptionalNumber(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === "string" && value.trim().length) {
    const parsed = Number(value);
    return Number.isNaN(parsed) ? undefined : parsed;
  }
  return undefined;
}

function toOptionalNullableNumber(value: unknown): number | null | undefined {
  if (value === null) {
    return null;
  }
  return toOptionalNumber(value);
}

function normalizeCategories(value: unknown): string[] {
  if (!value) return [];
  const rawList = Array.isArray(value)
    ? value
    : typeof value === "string"
    ? value.split(",")
    : [];
  return rawList
    .map((item) =>
      String(item ?? "")
        .trim()
        .toLowerCase()
    )
    .filter(Boolean);
}

function applyFuzzySearch(products: NormalizedProduct[], searchTerm: string) {
  return products
    .map((product) => ({
      product,
      score: computeSearchScore(product, searchTerm),
    }))
    .filter((entry) => entry.score >= 0.35)
    .sort((a, b) => b.score - a.score)
    .map((entry) => entry.product);
}

function computeSearchScore(product: NormalizedProduct, term: string) {
  const normalizedTerm = term.toLowerCase();
  const fields = [
    product.name,
    product.category,
    product.shortDescription,
    ...(Array.isArray(product.features) ? product.features : []),
  ];

  let bestScore = 0;
  for (const rawField of fields) {
    const field = normalizeField(rawField);
    if (!field) continue;
    if (field.includes(normalizedTerm)) {
      return 1;
    }
    const similarity =
      1 -
      levenshteinDistance(field, normalizedTerm) /
        Math.max(field.length, normalizedTerm.length);
    if (similarity > bestScore) {
      bestScore = similarity;
    }
  }
  return bestScore;
}

function normalizeField(value: unknown) {
  if (!value) return "";
  return String(value).toLowerCase().trim();
}

function levenshteinDistance(a: string, b: string): number {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  const matrix = Array.from({ length: a.length + 1 }, () =>
    Array.from({ length: b.length + 1 }, () => 0)
  );

  for (let i = 0; i <= a.length; i++) {
    matrix[i][0] = i;
  }
  for (let j = 0; j <= b.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }

  return matrix[a.length][b.length];
}
