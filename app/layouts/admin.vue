<template>
  <div class="flex min-h-screen bg-base-200">
    <aside
      class="hidden lg:flex w-64 flex-col border-r border-base-content/10 bg-base-100 px-5 py-6"
    >
      <NuxtLink to="/" class="flex items-center gap-3 font-semibold text-lg">
        <img
          src="/image.png"
          alt="DNS"
          class="h-8 w-8"
          width="32"
          height="32"
        >
        <div>
          <p class="leading-tight">DNS Admin</p>
          <span class="text-xs font-normal text-base-content/60">
            Управление контентом
          </span>
        </div>
      </NuxtLink>

      <nav class="mt-10 flex flex-col gap-2">
        <NuxtLink
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          class="flex items-center gap-3 rounded-xl px-3 py-2 transition"
          :class="
            isActive(item.to)
              ? 'bg-base-200 text-base-content'
              : 'text-base-content/70 hover:bg-base-200/70'
          "
        >
          <Icon :name="item.icon" class="h-5 w-5" />
          <div>
            <p class="text-sm font-semibold">{{ item.label }}</p>
            <p class="text-xs text-base-content/60">{{ item.caption }}</p>
          </div>
        </NuxtLink>
      </nav>

      <NuxtLink to="/" class="btn btn-outline mt-auto"
        >Вернуться на сайт</NuxtLink
      >
    </aside>

    <div class="flex flex-1 flex-col">
      <header
        class="bg-base-100 border-b border-base-content/10 px-4 py-3 flex flex-wrap items-center gap-4 justify-between"
      >
        <div class="flex items-center gap-3 lg:hidden">
          <NuxtLink
            to="/"
            class="flex items-center gap-2 font-semibold text-lg"
          >
            <img
              src="/image.png"
              alt="DNS"
              class="h-8 w-8"
              width="32"
              height="32"
            >
            <span>DNS Admin</span>
          </NuxtLink>
          <div class="flex gap-1">
            <NuxtLink
              v-for="item in navItems"
              :key="`mobile-${item.to}`"
              :to="item.to"
              class="btn btn-xs"
              :class="isActive(item.to) ? 'btn-active' : 'btn-ghost'"
            >
              {{ item.short }}
            </NuxtLink>
          </div>
        </div>
        <div class="flex items-center gap-3 ml-auto">
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
              <NuxtLink to="/auth" class="btn btn-ghost">Войти</NuxtLink>
            </template>
            <template v-if="user">
              <div class="flex items-center gap-2">
                <div class="text-right">
                  <p class="text-sm font-semibold">{{ displayName }}</p>
                  <p class="text-xs text-base-content/60">Администратор</p>
                </div>
                <button class="btn btn-sm btn-ghost" @click="logout">
                  Выйти
                </button>
              </div>
            </template>
            <template v-else>
              <NuxtLink to="/auth" class="btn btn-sm btn-ghost">Войти</NuxtLink>
            </template>
          </ClientOnly>
        </div>
      </header>

      <main class="flex-1 overflow-y-auto p-4 md:p-8">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
const navItems = [
  {
    label: "Дашборд",
    short: "Dash",
    caption: "Общая статистика",
    to: "/admin",
    icon: "ph:squares-four",
  },
  {
    label: "Товары",
    short: "Goods",
    caption: "Каталог и CRUD",
    to: "/admin/products",
    icon: "ph:shopping-bag-open",
  },
];

const authStore = useAuthStore();
const { user, initialized } = storeToRefs(authStore);
const authStateCookie = useCookie<string | null>("auth");

if (import.meta.client) {
  await authStore.check();
} else if (!authStateCookie.value) {
  await navigateTo("/", { replace: true });
}

const isAdmin = computed(() => authStore.isAdmin);

if (import.meta.client) {
  watch(
    () => ({ ready: initialized.value, admin: isAdmin.value }),
    ({ ready, admin }) => {
      if (ready && !admin) {
        navigateTo("/", { replace: true });
      }
    },
    { immediate: true }
  );
}

const router = useRouter();
const route = useRoute();
const theme = ref("caramellatte");
const themeCookie = useCookie("theme");
const hasLocalTheme = ref(Boolean(themeCookie.value));

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
      try {
        themeCookie.value = next;
      } catch {
        /* ignore */
      }
    }
  } catch {
    /* ignore */
  }
};

if (themeCookie.value) {
  hasLocalTheme.value = true;
  setDomTheme(String(themeCookie.value), false);
} else if (user.value?.prefs?.theme) {
  setDomTheme(user.value.prefs.theme as string, false);
} else {
  setDomTheme("caramellatte", false);
}

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

const displayName = computed(
  () => user.value?.name || user.value?.email || "Без имени"
);

const logout = async () => {
  await authStore.logout();
  router.push("/auth");
};

const isActive = (path: string) => {
  const normalized = path.endsWith("/") ? path.slice(0, -1) : path;
  const current = route.path.endsWith("/")
    ? route.path.slice(0, -1)
    : route.path;
  if (current === normalized) return true;
  if (normalized !== "/admin" && current.startsWith(`${normalized}/`)) {
    return true;
  }
  return false;
};

onMounted(() => {
  if (!import.meta.client) return;
  const stored = themeCookie.value;
  if (stored) {
    hasLocalTheme.value = true;
    setDomTheme(String(stored), false);
  }
});
</script>
