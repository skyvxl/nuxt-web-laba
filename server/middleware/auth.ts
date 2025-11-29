export default defineEventHandler(async (event) => {
  // Remove query string for path matching
  const fullPath = event.path;
  const path = fullPath.split("?")[0];

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
