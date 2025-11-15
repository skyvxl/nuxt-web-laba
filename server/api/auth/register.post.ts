export default defineEventHandler(async (_event) => {
  const body = await readBody(_event);
  const { email, password, name, phone } = body;
  const { account, ID } = createAppwriteServices();
  type AccountLike = {
    create?: (
      id: string,
      email: string,
      password: string,
      name?: string
    ) => Promise<unknown>;
    createEmailPasswordSession?: (
      email: string,
      password: string
    ) => Promise<unknown>;
    updatePhone?: (args: {
      phone: string;
      password?: string;
    }) => Promise<unknown>;
  };
  const acct = account as unknown as AccountLike;
  try {
    if (typeof acct.create !== "function") {
      throw createError({
        statusCode: 500,
        statusMessage: "Account create not supported",
      });
    }

    const user = await acct.create(
      ID.unique(),
      email,
      password,
      name || undefined
    );
    // login after registration
    if (acct.createEmailPasswordSession) {
      await acct.createEmailPasswordSession(email, password);
    }
    // try update phone if function exists
    try {
      if (phone && typeof acct.updatePhone === "function") {
        await acct.updatePhone({ phone, password });
      }
    } catch {
      // ignore phone errors
    }
    return { success: true, user };
  } catch (err) {
    console.warn("Register failed", err);
    const message = err instanceof Error ? err.message : String(err);
    throw createError({
      statusCode: 400,
      statusMessage: message || "Register failed",
    });
  }
});
