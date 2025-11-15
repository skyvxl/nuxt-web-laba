<template>
  <div class="min-h-screen bg-base-200 flex flex-col overflow-x-hidden">
    <template v-if="initialized">
      <!-- Top Navbar -->
      <div class="navbar bg-base-100 border-b">
        <div class="navbar-start">
          <label
            for="main-drawer"
            class="btn btn-ghost btn-square lg:hidden"
            aria-label="Открыть меню"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 6h16M4 12h8m-8 6h16"
              />
            </svg>
          </label>
          <NuxtLink
            to="/"
            class="btn btn-ghost text-lg sm:text-xl gap-2 flex items-center"
          >
            <img
              src="/image.png"
              alt="DNS"
              class="h-8 w-8"
              width="64"
              height="64"
            >
            <span class="truncate">DNS Магазин</span>
          </NuxtLink>
        </div>
        <div class="navbar-center hidden lg:flex">
          <ul class="menu menu-horizontal px-1">
            <li><NuxtLink to="/" class="btn btn-ghost">Главная</NuxtLink></li>
            <li>
              <NuxtLink to="/about" class="btn btn-ghost">О нас</NuxtLink>
            </li>
            <li>
              <NuxtLink to="/catalog" class="btn btn-ghost">Каталог</NuxtLink>
            </li>
            <li>
              <NuxtLink to="/contacts" class="btn btn-ghost">Контакты</NuxtLink>
            </li>
          </ul>
        </div>
        <div class="navbar-end items-center gap-3">
          <label class="swap swap-rotate" aria-label="Переключить тему">
            <input
              type="checkbox"
              :checked="theme === 'cosmicburst'"
              @change="toggleTheme"
            >
            <svg
              class="swap-on h-6 w-6 fill-current"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
            >
              <path
                d="M21.64,13a1,1,0,0,0-1.05-.14,8.05,8.05,0,0,1-3.37.73A8.15,8.15,0,0,1,9.08,5.49a8.59,8.59,0,0,1,.25-2A1,1,0,0,0,8,2.36,10.14,10.14,0,1,0,22,14.05,1,1,0,0,0,21.64,13Zm-9.5,6.69A8.14,8.14,0,0,1,7.08,5.22v.27A10.15,10.15,0,0,0,17.22,15.63a9.79,9.79,0,0,0,2.1-.22A8.11,8.11,0,0,1,12.14,19.73Z"
              />
            </svg>
            <svg
              class="swap-off h-6 w-6 fill-current"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
            >
              <path
                d="M5.64,17l-.71.71a1,1,0,0,0,0,1.41,1,1,0,0,0,1.41,0l.71-.71A1,1,0,0,0,5.64,17ZM5,12a1,1,0,0,0-1-1H3a1,1,0,0,0,0,2H4A1,1,0,0,0,5,12Zm7-7a1,1,0,0,0,1-1V3a1,1,0,0,0-2,0V4A1,1,0,0,0,12,5ZM5.64,7.05a1,1,0,0,0,.7.29,1,1,0,0,0,.71-.29,1,1,0,0,0,0-1.41l-.71-.71A1,1,0,0,0,4.93,6.34Zm12,.29a1,1,0,0,0,.7-.29l.71-.71a1,1,0,1,0-1.41-1.41L17,5.64a1,1,0,0,0,0,1.41A1,1,0,0,0,17.66,7.34ZM21,11H20a1,1,0,0,0,0,2h1a1,1,0,0,0,0-2Zm-9,8a1,1,0,0,0-1,1v1a1,1,0,0,0,2,0V20A1,1,0,0,0,12,19ZM18.36,17A1,1,0,0,0,17,18.36l.71.71a1,1,0,0,0,1.41,0,1,1,0,0,0,0-1.41ZM12,6.5A5.5,5.5,0,1,0,17.5,12,5.51,5.51,0,0,0,12,6.5Zm0,9A3.5,3.5,0,1,1,15.5,12,3.5,3.5,0,0,1,12,15.5Z"
              />
            </svg>
          </label>
          <ClientOnly>
            <template #fallback>
              <NuxtLink to="/auth" class="btn btn-ghost gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                Войти
              </NuxtLink>
            </template>
            <template v-if="!user">
              <NuxtLink to="/auth" class="btn btn-ghost gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                Войти
              </NuxtLink>
            </template>
            <template v-else>
              <div class="dropdown dropdown-end">
                <div
                  tabindex="0"
                  role="button"
                  class="btn btn-ghost btn-circle avatar"
                >
                  <div
                    class="w-10 rounded-full border-2 border-base-content/20 overflow-hidden"
                  >
                    <img
                      v-if="avatarUrl"
                      :src="avatarUrl"
                      alt="User avatar"
                      class="w-full h-full object-cover"
                    >
                    <div
                      v-else
                      class="w-full h-full rounded-full bg-neutral text-white flex items-center justify-center font-bold"
                    >
                      {{ avatarInitial }}
                    </div>
                  </div>
                </div>
                <ul
                  tabindex="0"
                  class="menu dropdown-content bg-base-100 rounded-box z-10 mt-3 w-52 p-2 shadow-xl border"
                >
                  <li>
                    <NuxtLink to="/user" class="btn btn-ghost justify-start">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        class="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                      Личный кабинет
                    </NuxtLink>
                  </li>
                  <li>
                    <button class="btn btn-ghost justify-start" @click="logout">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        class="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                        />
                      </svg>
                      Выйти
                    </button>
                  </li>
                </ul>
              </div>
            </template>
          </ClientOnly>
        </div>
      </div>

      <!-- Drawer layout -->
      <div class="drawer flex-1">
        <input id="main-drawer" type="checkbox" class="drawer-toggle" >
        <div class="drawer-content flex flex-col">
          <div class="flex flex-1 min-h-0 min-w-0">
            <aside
              class="hidden lg:block w-64 p-4 bg-base-100 border-r border-base-content/10"
            >
              <div class="space-y-2">
                <h3 class="font-bold text-lg">Категории</h3>
                <ul class="menu">
                  <li>
                    <NuxtLink to="/catalog" class="btn btn-ghost justify-start"
                      >Смартфоны</NuxtLink
                    >
                  </li>
                  <li>
                    <NuxtLink to="/catalog" class="btn btn-ghost justify-start"
                      >Ноутбуки</NuxtLink
                    >
                  </li>
                  <li>
                    <NuxtLink to="/catalog" class="btn btn-ghost justify-start"
                      >Бытовая техника</NuxtLink
                    >
                  </li>
                  <li>
                    <NuxtLink to="/catalog" class="btn btn-ghost justify-start"
                      >Аксессуары</NuxtLink
                    >
                  </li>
                </ul>
              </div>
            </aside>

            <main class="flex-1 p-4 min-h-0 min-w-0">
              <NuxtPage />
            </main>

            <aside
              class="hidden xl:block w-64 p-4 bg-base-100 border-l border-base-content/10"
            >
              <div class="space-y-4">
                <h3 class="font-bold text-lg">Партнеры</h3>
                <div class="space-y-3">
                  <img
                    src="https://brandwiki.ru/up/brands/product/210720_554.webp"
                    alt="Ситилинк"
                    class="rounded-lg w-full h-32 object-contain border-2 border-base-content/20 p-2"
                  >
                  <img
                    src="https://assets.turbologo.ru/blog/ru/2020/02/18162818/logo-mts-ks.png"
                    alt="МТС"
                    class="rounded-lg w-full h-32 object-contain border-2 border-base-content/20 p-2"
                  >
                  <img
                    src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQQxcbHHqNVRXBkbzOlKy8svirKu53s24kZvg&s"
                    alt="iPhone"
                    class="rounded-lg w-full h-32 object-contain border-2 border-base-content/20 p-2"
                  >
                </div>
              </div>
            </aside>
          </div>
        </div>

        <div class="drawer-side z-50">
          <label
            for="main-drawer"
            aria-label="close sidebar"
            class="drawer-overlay"
          />
          <ul class="menu bg-base-100 min-h-full w-64 p-4 space-y-2">
            <li class="menu-title">Навигация</li>
            <li>
              <NuxtLink to="/" class="btn btn-ghost justify-start"
                >Главная</NuxtLink
              >
            </li>
            <li>
              <NuxtLink to="/about" class="btn btn-ghost justify-start"
                >О нас</NuxtLink
              >
            </li>
            <li>
              <NuxtLink to="/catalog" class="btn btn-ghost justify-start"
                >Каталог</NuxtLink
              >
            </li>
            <li>
              <NuxtLink to="/contacts" class="btn btn-ghost justify-start"
                >Контакты</NuxtLink
              >
            </li>
            <div class="divider" />
            <li class="menu-title">Категории</li>
            <li>
              <NuxtLink to="/catalog" class="btn btn-ghost justify-start"
                >Смартфоны</NuxtLink
              >
            </li>
            <li>
              <NuxtLink to="/catalog" class="btn btn-ghost justify-start"
                >Ноутбуки</NuxtLink
              >
            </li>
            <li>
              <NuxtLink to="/catalog" class="btn btn-ghost justify-start"
                >Бытовая техника</NuxtLink
              >
            </li>
            <li>
              <NuxtLink to="/catalog" class="btn btn-ghost justify-start"
                >Аксессуары</NuxtLink
              >
            </li>
          </ul>
        </div>
      </div>

      <div class="navbar bg-base-100 border-t mt-0 justify-center">
        <div class="flex flex-wrap items-center gap-4 text-center sm:text-left">
          <span class="text-xs text-base-content"
            >&copy; 2025 DNS. Все права защищены</span
          >
          <NuxtLink to="/consent" class="text-xs link"
            >Согласие на обработку данных</NuxtLink
          >
          <NuxtLink to="/privacy" class="text-xs link"
            >Политика конфиденциальности</NuxtLink
          >
        </div>
      </div>
    </template>
    <template v-else>
      <div class="flex justify-center items-center flex-1 min-h-screen">
        <span
          class="loading loading-spinner loading-lg text-primary"
          aria-label="Загрузка"
        />
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { useRouter } from "vue-router";
import { useHead } from "#imports";
import { useAuth } from "~/composables/useAuth";

const {
  user,
  initialized,
  check,
  logout: authLogout,
  getAvatarUrl,
} = useAuth();
await check();

const router = useRouter();
const theme = ref("caramellatte");
const hasLocalTheme = ref(false);
const avatarUrl = ref("");

useHead(() => ({
  htmlAttrs: { "data-theme": theme.value },
}));

const setDomTheme = (name: string, persist = true) => {
  const next = name || "caramellatte";
  theme.value = next;
  if (!import.meta.client) return;
  try {
    document.documentElement.setAttribute("data-theme", next);
    if (persist) {
      window.localStorage.setItem("theme", next);
    }
  } catch {
    /* ignore */
  }
};

if (import.meta.client) {
  try {
    const stored = window.localStorage.getItem("theme");
    if (stored) {
      hasLocalTheme.value = true;
      setDomTheme(stored, false);
    } else if (user.value?.prefs?.theme) {
      setDomTheme(user.value.prefs.theme as string, false);
    } else {
      setDomTheme("caramellatte", false);
    }
  } catch {
    /* ignore */
  }
}

const avatarInitial = computed(() =>
  (user.value?.name?.[0] ?? "").toUpperCase()
);

watch(
  () => user.value?.prefs?.theme,
  (val) => {
    if (val && !hasLocalTheme.value) {
      setDomTheme(String(val), false);
    }
  }
);

const toggleTheme = () => {
  const next = theme.value === "cosmicburst" ? "caramellatte" : "cosmicburst";
  hasLocalTheme.value = true;
  setDomTheme(next, true);
};

watch(
  () => user.value?.prefs?.avatarFileId,
  async (fileId) => {
    if (!fileId) {
      avatarUrl.value = "";
      return;
    }
    avatarUrl.value = await getAvatarUrl(fileId);
  },
  { immediate: true }
);

const logout = async () => {
  await authLogout();
  router.push("/");
};

onMounted(() => {
  if (!import.meta.client) return;
  const stored = window.localStorage.getItem("theme");
  if (stored) {
    hasLocalTheme.value = true;
    setDomTheme(stored, false);
  }
});
</script>
