import { createAppwriteServices } from "@@/server/utils/appwrite";

export default defineEventHandler(async (event) => {
  const id = event.context.params?.id;
  if (!id) throw createError({ statusCode: 400, statusMessage: "Missing id" });

  const { storage } = createAppwriteServices();
  const config = useRuntimeConfig();
  try {
    const stor = storage as unknown as {
      getFileView?: (bucket: string, id: string) => { toString: () => string };
    };
    if (typeof stor.getFileView !== "function")
      throw createError({ statusCode: 404, statusMessage: "File not found" });
    const url = stor
      .getFileView(config.public.appwriteAvatarBucketId, id)
      .toString();
    return { url };
  } catch {
    throw createError({ statusCode: 404, statusMessage: "File not found" });
  }
});
