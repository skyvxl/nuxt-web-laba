import { createAppwriteServices } from "@@/server/utils/appwrite";

export default defineEventHandler(async (_event) => {
  const body = await readBody(_event);
  const { email, password } = body;
  const { account } = createAppwriteServices();

  try {
    // try creating session - depending on Appwrite SDK version method might differ
    // we use createEmailPasswordSession as it works for browser SDKs
    type AccountLike = {
      createEmailPasswordSession?: (
        email: string,
        password: string
      ) => Promise<unknown>;
    };
    const acct = account as unknown as AccountLike;
    if (!acct.createEmailPasswordSession)
      throw new Error("createEmailPasswordSession not supported");
    const session = await acct.createEmailPasswordSession(email, password);
    return { success: true, session };
  } catch (err) {
    console.warn("Login failed", err);
    throw createError({
      statusCode: 401,
      statusMessage: "Invalid credentials",
    });
  }
});
