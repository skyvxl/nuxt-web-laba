import { createError } from "h3";

export interface NormalizedProductPayload {
  name: string;
  category: string;
  price: number;
  oldPrice: number | null;
  image: string;
  shortDescription: string;
  description: string;
  features: string[];
  characteristics: Record<string, string>;
}

export function normalizeProductPayload(
  body: Record<string, unknown> | null | undefined
): NormalizedProductPayload {
  const source = body || {};
  const name = String(source.name ?? "").trim();
  const category = String(source.category ?? "").trim();
  const image = String(source.image ?? "").trim();
  const shortDescription = String(source.shortDescription ?? "").trim();
  const description = String(source.description ?? "").trim();
  const price = Number(source.price);
  const oldPriceRaw = source.oldPrice;
  const oldPrice =
    oldPriceRaw === undefined || oldPriceRaw === null || oldPriceRaw === ""
      ? null
      : Number(oldPriceRaw);

  if (!name) {
    throw createError({ statusCode: 400, statusMessage: "Name is required" });
  }
  if (!category) {
    throw createError({
      statusCode: 400,
      statusMessage: "Category is required",
    });
  }
  if (!Number.isFinite(price)) {
    throw createError({
      statusCode: 400,
      statusMessage: "Price must be a number",
    });
  }
  if (!image) {
    throw createError({
      statusCode: 400,
      statusMessage: "Image URL is required",
    });
  }
  if (!shortDescription) {
    throw createError({
      statusCode: 400,
      statusMessage: "Short description is required",
    });
  }
  if (!description) {
    throw createError({
      statusCode: 400,
      statusMessage: "Description is required",
    });
  }
  if (oldPrice !== null && !Number.isFinite(oldPrice)) {
    throw createError({
      statusCode: 400,
      statusMessage: "Old price must be a number",
    });
  }

  const features = parseFeatures(source.features ?? source.featuresRaw);
  const characteristics = parseCharacteristics(
    source.characteristics ?? source.characteristicsRaw
  );

  return {
    name,
    category,
    price,
    oldPrice,
    image,
    shortDescription,
    description,
    features,
    characteristics,
  };
}

export function toAppwriteDocumentData(
  payload: NormalizedProductPayload
): Record<string, unknown> {
  return {
    name: payload.name,
    category: payload.category,
    price: payload.price,
    oldPrice: payload.oldPrice,
    image: payload.image,
    shortDescription: payload.shortDescription,
    description: payload.description,
    features: JSON.stringify(payload.features),
    characteristics: JSON.stringify(payload.characteristics),
  };
}

function parseFeatures(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .map((item) => String(item ?? "").trim())
      .filter((item) => Boolean(item));
  }
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return [];
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) {
        return parseFeatures(parsed);
      }
    } catch {
      /* ignore json parse */
    }
    return trimmed
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);
  }
  return [];
}

function parseCharacteristics(value: unknown): Record<string, string> {
  if (!value) return {};
  if (typeof value === "object") {
    const result: Record<string, string> = {};
    Object.entries(value as Record<string, unknown>).forEach(([key, val]) => {
      const cleanKey = key.trim();
      if (!cleanKey) return;
      if (val === undefined || val === null) return;
      const cleanVal = String(val).trim();
      if (!cleanVal) return;
      result[cleanKey] = cleanVal;
    });
    return result;
  }
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return {};
    try {
      const parsed = JSON.parse(trimmed);
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        return parseCharacteristics(parsed as Record<string, unknown>);
      }
    } catch {
      /* ignore json parse */
    }
    const result: Record<string, string> = {};
    trimmed.split(/\r?\n/).forEach((line) => {
      const idx = line.indexOf(":");
      if (idx === -1) return;
      const key = line.slice(0, idx).trim();
      const val = line.slice(idx + 1).trim();
      if (key && val) {
        result[key] = val;
      }
    });
    return result;
  }
  return {};
}
