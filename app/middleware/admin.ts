export default defineNuxtRouteMiddleware(() => {
  const authCookie = useCookie<string | null>("auth");
  if (!authCookie.value) {
    return navigateTo("/auth");
  }
});
