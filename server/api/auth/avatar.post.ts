import { readMultipartFormData } from "h3";
import { createAppwriteServices } from "@@/server/utils/appwrite";

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const { account, storage, ID } = createAppwriteServices();

  // parse multipart form
  const form = (await readMultipartFormData(event)) as unknown as Record<
    string,
    unknown
  >;
  const files = (form.files ?? null) as unknown as Record<
    string,
    unknown
  > | null;
  const file =
    (files?.avatar as unknown as File[] | undefined)?.[0] ??
    (
      files?.[Object.keys(files || {})[0]] as unknown as File[] | undefined
    )?.[0];

  if (!file) {
    throw createError({ statusCode: 400, statusMessage: "Missing file" });
  }

  // Validate file (size and mime)
  const fileRec = file as unknown as Record<string, unknown>;
  const fileSize = typeof fileRec.size === "number" ? fileRec.size : undefined;
  const fileType =
    typeof fileRec.type === "string"
      ? fileRec.type
      : typeof fileRec.mimeType === "string"
      ? (fileRec.mimeType as string)
      : typeof fileRec.contentType === "string"
      ? (fileRec.contentType as string)
      : undefined;

  const maxSize =
    (typeof config.public?.appwriteAvatarMaxBytes === "number"
      ? config.public.appwriteAvatarMaxBytes
      : undefined) ?? 5 * 1024 * 1024; // default 5MB

  if (fileSize && fileSize > maxSize) {
    throw createError({ statusCode: 413, statusMessage: "File too large" });
  }

  const allowed = new Set(["image/jpeg", "image/png", "image/webp"]);
  if (fileType && !allowed.has(fileType)) {
    throw createError({
      statusCode: 415,
      statusMessage: "Unsupported media type",
    });
  }

  try {
    const acct = account as unknown as { get?: () => Promise<unknown> };
    if (typeof acct.get !== "function")
      throw createError({ statusCode: 401, statusMessage: "Unauthorized" });
    const user = await acct.get();
    // extract user id safely
    const getUserId = (u: unknown): string | undefined => {
      if (typeof u !== "object" || u === null) return undefined;
      const rec = u as Record<string, unknown>;
      const id = rec["$id"];
      return typeof id === "string" ? id : undefined;
    };
    const userId = getUserId(user);
    if (!userId)
      throw createError({ statusCode: 401, statusMessage: "Unauthorized" });
    const bucketId = config.public.appwriteAvatarBucketId;

    const stor = storage as unknown as {
      createFile?: (...args: unknown[]) => Promise<unknown>;
    };
    if (typeof stor.createFile !== "function")
      throw createError({
        statusCode: 500,
        statusMessage: "Storage create not supported",
      });
    // pass the file as unknown (not any) and build permissions with the validated userId
    const res = await stor.createFile(bucketId, ID.unique(), file as unknown, [
      `read("user:${userId}")`,
      'read("users")',
      `update("user:${userId}")`,
      `delete("user:${userId}")`,
    ]);

    // Save prefs
    try {
      const acct2 = account as unknown as {
        updatePrefs?: (prefs: Record<string, unknown>) => Promise<unknown>;
      };
      if (typeof acct2.updatePrefs === "function") {
        const resultRec = res as unknown as Record<string, unknown>;
        await acct2.updatePrefs({
          avatarFileId:
            typeof resultRec["$id"] === "string" ? resultRec["$id"] : undefined,
          avatarFileName:
            typeof resultRec["name"] === "string"
              ? resultRec["name"]
              : undefined,
        });
      }
    } catch {
      // ignore
    }

    return { success: true, file: res };
  } catch (err) {
    console.warn("Avatar upload failed", err);
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to upload avatar",
    });
  }
});
