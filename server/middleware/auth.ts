export default defineEventHandler(async (event) => {
  const path = event.path;

  if (
    (!path.startsWith("/api/admin") && !path.startsWith("/api/products")) ||
    (path === "/api/products" && event.method === "GET") ||
    (path.match(/^\/api\/products\/[^/]+$/) && event.method === "GET")
  ) {
    return;
  }

  const authCookie = getCookie(event, "auth");

  if (!authCookie || authCookie !== "1") {
    throw createError({
      statusCode: 401,
      statusMessage: "Unauthorized - authentication required",
    });
  }
});
