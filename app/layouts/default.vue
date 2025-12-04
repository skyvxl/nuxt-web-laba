<template>
  <div class="min-h-screen bg-base-200 flex flex-col overflow-x-hidden">
    <template v-if="initialized">
      <!-- Top Navbar -->
      <header class="navbar border-b border-base-200 sticky top-0 z-40 backdrop-blur-lg bg-base-100/90">
        <div class="navbar-start">
          <label for="main-drawer" class="btn btn-ghost btn-square lg:hidden" aria-label="Открыть меню">
            <Icon name="heroicons:bars-3" class="w-6 h-6" />
          </label>
          <NuxtLink to="/" class="btn btn-ghost text-lg sm:text-xl gap-2 flex items-center hover:bg-base-200">
            <img src="/image.png" alt="DNS" class="h-8 w-8" width="64" height="64">
            <span class="font-bold">DNS</span>
          </NuxtLink>
        </div>
        <nav class="navbar-center hidden lg:flex">
          <ul class="menu menu-horizontal px-1 gap-1">
            <li>
              <NuxtLink to="/" class="btn btn-ghost rounded-xl" :class="{ 'bg-base-300': $route.path === '/' }">
                <Icon name="heroicons:home" class="w-4 h-4" />
                Главная
              </NuxtLink>
            </li>
            <li>
              <NuxtLink
to="/about" class="btn btn-ghost rounded-xl" :class="{
                'bg-base-300': $route.path === '/about',
              }">
                <Icon name="heroicons:information-circle" class="w-4 h-4" />
                О нас
              </NuxtLink>
            </li>
            <li>
              <NuxtLink
to="/products" class="btn btn-ghost rounded-xl" :class="{
                'bg-base-300': $route.path.startsWith('/products'),
              }">
                <Icon name="heroicons:squares-2x2" class="w-4 h-4" />
                Каталог
              </NuxtLink>
            </li>
            <li>
              <NuxtLink
to="/contacts" class="btn btn-ghost rounded-xl" :class="{
                'bg-base-300': $route.path === '/contacts',
              }">
                <Icon name="heroicons:phone" class="w-4 h-4" />
                Контакты
              </NuxtLink>
            </li>
          </ul>
        </nav>
        <div class="navbar-end items-center gap-2">
          <!-- Theme toggle -->
          <label class="swap swap-rotate btn btn-ghost btn-circle" aria-label="Переключить тему">
            <input type="checkbox" :checked="theme === 'cosmicburst'" @change="toggleTheme">
            <Icon name="heroicons:moon" class="swap-on w-5 h-5" />
            <Icon name="heroicons:sun" class="swap-off w-5 h-5" />
          </label>

          <ClientOnly>
            <template #fallback>
              <NuxtLink to="/auth" class="btn btn-ghost btn-sm gap-2">
                <Icon name="heroicons:user-circle" class="w-5 h-5" />
                <span class="hidden sm:inline">Войти</span>
              </NuxtLink>
            </template>
            <template v-if="!user">
              <NuxtLink to="/auth" class="btn btn-sm gap-2">
                <Icon name="heroicons:arrow-right-on-rectangle" class="w-4 h-4" />
                <span class="hidden sm:inline">Войти</span>
              </NuxtLink>
            </template>
            <template v-else>
              <!-- Cart link -->
              <NuxtLink v-if="user" to="/cart" class="btn btn-ghost btn-circle relative">
                <Icon name="heroicons:shopping-cart" class="w-5 h-5" />
                <span
v-if="totalItems > 0"
                  class="badge badge-sm bg-base-300 text-base-content absolute -top-1 -right-1 min-w-5 h-5">{{
                  totalItems }}</span>
              </NuxtLink>

              <!-- User dropdown -->
              <div class="dropdown dropdown-end">
                <div
tabindex="0" role="button"
                  class="btn btn-ghost btn-circle avatar ring-2 ring-base-300 hover:ring-base-content/30 transition-all">
                  <div class="w-9 rounded-full overflow-hidden">
                    <img v-if="avatarUrl" :src="avatarUrl" alt="User avatar" class="w-full h-full object-cover">
                    <div
v-else
                      class="w-full h-full bg-base-300 text-base-content flex items-center justify-center font-bold text-sm">
                      {{ avatarInitial }}
                    </div>
                  </div>
                </div>
                <ul
tabindex="0"
                  class="menu dropdown-content bg-base-100 rounded-box z-10 mt-3 w-56 p-2 shadow-xl border border-base-300">
                  <li class="px-4 py-2 pointer-events-none">
                    <span class="text-xs font-normal text-base-content/60 p-0 bg-transparent!">Привет,
                      {{ user.name?.split(" ")[0] || "пользователь" }}!</span>
                  </li>
                  <li>
                    <NuxtLink to="/user" class="rounded-xl gap-3">
                      <Icon name="heroicons:user" class="w-5 h-5" />
                      Личный кабинет
                    </NuxtLink>
                  </li>
                  <li>
                    <NuxtLink to="/cart" class="rounded-xl gap-3">
                      <Icon name="heroicons:shopping-cart" class="w-5 h-5" />
                      Корзина
                      <span v-if="totalItems > 0" class="badge badge-sm bg-base-300 text-base-content">{{ totalItems
                        }}</span>
                    </NuxtLink>
                  </li>
                  <div class="divider my-1" />
                  <li>
                    <button class="rounded-xl gap-3 text-error hover:bg-error/10" @click="logout">
                      <Icon name="heroicons:arrow-right-start-on-rectangle" class="w-5 h-5" />
                      Выйти
                    </button>
                  </li>
                </ul>
              </div>
            </template>
          </ClientOnly>
        </div>
      </header>

      <!-- Drawer layout -->
      <div class="drawer flex-1">
        <input id="main-drawer" type="checkbox" class="drawer-toggle">
        <div class="drawer-content flex flex-col">
          <div class="flex flex-1 min-h-0 min-w-0">
            <!-- Left Sidebar - Categories -->
            <aside class="hidden lg:flex flex-col w-64 p-4 bg-base-100 border-r border-base-200">
              <div class="sticky top-20">
                <div class="flex items-center gap-2 mb-4">
                  <Icon name="heroicons:tag" class="w-5 h-5 text-base-content/70" />
                  <h3 class="font-bold text-lg">Категории</h3>
                </div>
                <ul class="menu bg-base-200/30 rounded-box p-2">
                  <li v-for="category in catalogCategoryLinks" :key="category.value">
                    <NuxtLink
:to="{
                      path: '/products',
                      query: { categories: category.value },
                    }" class="rounded-xl gap-3" :class="{
                        active: $route.query.categories === category.value,
                      }">
                      <Icon :name="category.icon" class="w-5 h-5" />
                      {{ category.label }}
                    </NuxtLink>
                  </li>
                </ul>
              </div>
            </aside>

            <main class="flex-1 p-4 min-h-0 min-w-0">
              <slot />
            </main>

            <!-- Right Sidebar - Partners -->
            <aside class="hidden xl:flex flex-col w-64 p-4 bg-base-100 border-l border-base-200">
              <div class="sticky top-20">
                <div class="flex items-center gap-2 mb-4">
                  <Icon name="heroicons:building-office" class="w-5 h-5 text-base-content/70" />
                  <h3 class="font-bold text-lg">Партнеры</h3>
                </div>
                <div class="space-y-3">
                  <div class="bg-base-200/50 rounded-2xl p-4 hover:bg-base-200 transition-colors cursor-pointer">
                    <img
src="https://brandwiki.ru/up/brands/product/210720_554.webp" alt="Ситилинк"
                      class="w-full h-24 object-contain">
                  </div>
                  <div class="bg-base-200/50 rounded-2xl p-4 hover:bg-base-200 transition-colors cursor-pointer">
                    <img
src="https://assets.turbologo.ru/blog/ru/2020/02/18162818/logo-mts-ks.png" alt="МТС"
                      class="w-full h-24 object-contain">
                  </div>
                  <div class="bg-base-200/50 rounded-2xl p-4 hover:bg-base-200 transition-colors cursor-pointer">
                    <img
                      src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQQxcbHHqNVRXBkbzOlKy8svirKu53s24kZvg&s"
                      alt="iPhone" class="w-full h-24 object-contain">
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>

        <!-- Mobile Drawer -->
        <div class="drawer-side z-50">
          <label for="main-drawer" aria-label="close sidebar" class="drawer-overlay" />
          <div class="bg-base-100 min-h-full w-72 p-0">
            <!-- Drawer header -->
            <div class="p-4 border-b border-base-200">
              <div class="flex items-center gap-3">
                <img src="/image.png" alt="DNS" class="h-10 w-10">
                <div>
                  <h2 class="font-bold text-lg">DNS Магазин</h2>
                  <p class="text-xs text-base-content/60">
                    Электроника и техника
                  </p>
                </div>
              </div>
            </div>

            <ul class="menu p-4 space-y-1">
              <li class="menu-title text-xs uppercase tracking-wider">
                Навигация
              </li>
              <li>
                <NuxtLink to="/" class="rounded-xl gap-3" :class="{ active: $route.path === '/' }">
                  <Icon name="heroicons:home" class="w-5 h-5" />
                  Главная
                </NuxtLink>
              </li>
              <li>
                <NuxtLink to="/about" class="rounded-xl gap-3" :class="{ active: $route.path === '/about' }">
                  <Icon name="heroicons:information-circle" class="w-5 h-5" />
                  О нас
                </NuxtLink>
              </li>
              <li>
                <NuxtLink to="/products" class="rounded-xl gap-3" :class="{ active: $route.path === '/products' }">
                  <Icon name="heroicons:squares-2x2" class="w-5 h-5" />
                  Каталог
                </NuxtLink>
              </li>
              <li>
                <NuxtLink to="/contacts" class="rounded-xl gap-3" :class="{ active: $route.path === '/contacts' }">
                  <Icon name="heroicons:phone" class="w-5 h-5" />
                  Контакты
                </NuxtLink>
              </li>

              <div class="divider my-2" />

              <li class="menu-title text-xs uppercase tracking-wider">
                Категории
              </li>
              <li v-for="category in catalogCategoryLinks" :key="category.value">
                <NuxtLink
:to="{
                  path: '/products',
                  query: { categories: category.value },
                }" class="rounded-xl gap-3">
                  <Icon :name="category.icon" class="w-5 h-5" />
                  {{ category.label }}
                </NuxtLink>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <footer class="bg-base-100 border-t border-base-200 mt-auto">
        <div class="container mx-auto px-4 py-6">
          <div class="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div class="flex items-center gap-3">
              <img src="/image.png" alt="DNS" class="h-8 w-8">
              <span class="text-sm text-base-content/60">&copy; 2025 DNS. Все права защищены</span>
            </div>
            <div class="flex flex-wrap items-center justify-center gap-4">
              <NuxtLink to="/consent" class="text-sm link link-hover">
                Согласие на обработку данных
              </NuxtLink>
              <NuxtLink to="/privacy" class="text-sm link link-hover">
                Политика конфиденциальности
              </NuxtLink>
            </div>
          </div>
        </div>
      </footer>
    </template>
    <template v-else>
      <div class="flex justify-center items-center flex-1 min-h-screen">
        <span class="loading loading-spinner loading-lg" aria-label="Загрузка" />
      </div>
    </template>
  </div>
</template>

<script lang="ts" setup>
const authStore = useAuthStore();
const cartStore = useCartStore();

const { user, initialized } = storeToRefs(authStore);

await authStore.check();

const router = useRouter();
const totalItems = computed(() => cartStore.totalItems);

// Загружаем корзину когда пользователь авторизован
watch(
  () => authStore.isAuthenticated,
  async (isAuth) => {
    if (isAuth) {
      await cartStore.fetchCart();
    } else {
      cartStore.$reset();
    }
  },
  { immediate: true }
);

const catalogCategoryLinks = [
  {
    label: "Смартфоны",
    value: "Смартфоны",
    icon: "heroicons:device-phone-mobile",
  },
  { label: "Ноутбуки", value: "Ноутбуки", icon: "heroicons:computer-desktop" },
  {
    label: "Бытовая техника",
    value: "Бытовая техника",
    icon: "heroicons:home-modern",
  },
  { label: "Аксессуары", value: "Аксессуары", icon: "heroicons:puzzle-piece" },
];
const theme = ref("caramellatte");
const themeCookie = useCookie("theme");
const hasLocalTheme = ref(Boolean(themeCookie.value));
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
      try {
        themeCookie.value = next;
      } catch {
        /* ignore cookie set errors */
      }
    }
  } catch {
    /* ignore */
  }
};

// Initialize theme from cookie -> user prefs -> default.
if (themeCookie.value) {
  hasLocalTheme.value = true;
  setDomTheme(String(themeCookie.value), false);
} else if (user.value?.prefs?.theme) {
  setDomTheme(user.value.prefs.theme as string, false);
} else {
  setDomTheme("caramellatte", false);
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
    avatarUrl.value = authStore.getAvatarUrl(fileId);
  },
  { immediate: true }
);

const logout = async () => {
  await authStore.logout();
  router.push("/");
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
