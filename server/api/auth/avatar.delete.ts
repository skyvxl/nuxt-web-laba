import { createAppwriteServices } from "@@/server/utils/appwrite";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const fileId = body?.fileId;
  if (!fileId)
    throw createError({ statusCode: 400, statusMessage: "Missing fileId" });

  const { account, storage } = createAppwriteServices();
  const bucketId = useRuntimeConfig().public.appwriteAvatarBucketId;

  try {
    const st = storage as unknown as {
      deleteFile?: (bucket: string, id: string) => Promise<unknown>;
    };
    if (typeof st.deleteFile === "function") {
      await st.deleteFile(bucketId, fileId);
    }
  } catch {
    // ignore
  }

  try {
    const acct = account as unknown as {
      updatePrefs?: (prefs: Record<string, unknown>) => Promise<unknown>;
    };
    if (typeof acct.updatePrefs === "function") {
      await acct.updatePrefs({ avatarFileId: null });
    }
  } catch {
    // ignore
  }

  return { success: true };
});
