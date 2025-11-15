export default defineEventHandler(async (_event) => {
  const { account } = createAppwriteServices();
  try {
    // account.get() will work in client if cookies exist, might throw on server
    const acct = account as unknown as { get?: () => Promise<unknown> };
    if (typeof acct.get !== "function") return { user: null };
    const user = await acct.get();
    return { user };
  } catch {
    // not authorized
    return { user: null };
  }
});
