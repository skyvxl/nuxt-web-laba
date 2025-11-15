export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const prefs = body?.prefs ?? body?.preferences ?? null;
  if (!prefs)
    throw createError({ statusCode: 400, statusMessage: "Missing prefs" });

  const { account } = createAppwriteServices();
  try {
    const acct = account as unknown as {
      updatePrefs?: (prefs: Record<string, unknown>) => Promise<unknown>;
    };
    if (typeof acct.updatePrefs === "function") {
      await acct.updatePrefs(prefs as Record<string, unknown>);
    } else {
      throw new Error("updatePrefs not supported");
    }
    return { success: true };
  } catch (err) {
    console.warn("Failed to update prefs", err);
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to update prefs",
    });
  }
});
