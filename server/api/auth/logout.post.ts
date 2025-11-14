import { createAppwriteServices } from "@@/server/utils/appwrite";

export default defineEventHandler(async (_event) => {
  const { account } = createAppwriteServices();
  try {
    const acct = account as unknown as {
      deleteSession?: (args?: string) => Promise<unknown>;
    };
    if (typeof acct.deleteSession === "function") {
      await acct.deleteSession("current");
    }
    return { success: true };
  } catch (err) {
    console.warn("Logout failed", err);
    return { success: false };
  }
});
