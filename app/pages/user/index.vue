<template>
  <ClientOnly>
    <template #fallback>
      <div class="container mx-auto px-4 py-8">
        <div class="max-w-4xl mx-auto space-y-6">
          <div class="skeleton h-10 w-1/3" />

          <div class="card bg-base-100 shadow-xl">
            <div class="card-body">
              <div class="skeleton h-6 w-1/3 mb-6" />
              <div
                class="flex items-center gap-6 mb-6 pb-6 border-b border-base-300"
              >
                <div class="skeleton rounded-full w-24 h-24" />
                <div class="flex-1">
                  <div class="skeleton h-6 w-1/3 mb-2" />
                  <div class="skeleton h-4 w-1/2" />
                  <div class="flex gap-2 mt-4">
                    <div class="skeleton h-8 w-32" />
                    <div class="skeleton h-8 w-24" />
                  </div>
                </div>
              </div>

              <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div class="skeleton h-12 w-full" />
                <div class="skeleton h-12 w-full" />
                <div class="skeleton h-12 w-full" />
                <div class="skeleton h-12 w-full" />
              </div>
            </div>
          </div>

          <div class="card bg-base-100 shadow-xl">
            <div class="card-body">
              <div class="skeleton h-6 w-1/3 mb-4" />
              <div class="skeleton h-36 w-full" />
            </div>
          </div>

          <div class="card bg-base-100 shadow-xl">
            <div class="card-body">
              <div class="skeleton h-6 w-1/4 mb-4" />
              <div class="skeleton h-10 w-40" />
            </div>
          </div>
        </div>
      </div>
    </template>

    <div class="container mx-auto px-4 py-8">
      <div v-if="user" class="max-w-4xl mx-auto space-y-6">
        <!-- Заголовок -->
        <div
          class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        >
          <div>
            <h1 class="text-3xl font-bold">Личный кабинет</h1>
            <p class="text-base-content/60 mt-1">
              Управляйте своим профилем и настройками
            </p>
          </div>
          <div v-if="isAdmin">
            <NuxtLink to="/admin" class="btn gap-2">
              <Icon name="heroicons:shield-check" class="w-5 h-5" />
              Админ-панель
            </NuxtLink>
          </div>
        </div>

        <!-- Профиль пользователя -->
        <div class="card bg-base-100 shadow-xl">
          <div class="card-body p-6 sm:p-8">
            <div class="flex items-center gap-3 mb-6">
              <div
                class="w-10 h-10 bg-base-200 rounded-lg flex items-center justify-center"
              >
                <Icon name="heroicons:user" class="w-5 h-5 text-base-content" />
              </div>
              <h2 class="text-xl font-bold">Профиль</h2>
            </div>

            <!-- Аватар и основная информация -->
            <div
              class="flex flex-col sm:flex-row items-center gap-6 mb-6 pb-6 border-b border-base-200"
            >
              <div class="relative group">
                <div
                  class="w-28 h-28 rounded-box bg-base-200 flex items-center justify-center overflow-hidden ring-4 ring-base-300"
                >
                  <img
                    v-if="avatarUrl"
                    :src="avatarUrl"
                    alt="Avatar"
                    class="w-full h-full object-cover"
                  >
                  <span
                    v-else
                    class="text-4xl font-bold text-base-content/60"
                    >{{ avatarInitial }}</span
                  >
                </div>
                <span
                  v-if="uploadingAvatar"
                  class="absolute inset-0 flex items-center justify-center bg-base-100/80 rounded-box"
                >
                  <span class="loading loading-spinner loading-md" />
                </span>
              </div>

              <div class="flex-1 w-full text-center sm:text-left">
                <h3 class="text-2xl font-bold">{{ name }}</h3>
                <p
                  class="text-base-content/60 flex items-center justify-center sm:justify-start gap-2 mt-1"
                >
                  <Icon name="heroicons:envelope" class="w-4 h-4" />
                  {{ email }}
                </p>

                <div
                  class="flex flex-wrap justify-center sm:justify-start gap-2 mt-4"
                >
                  <label class="btn btn-sm btn-outline cursor-pointer">
                    <Icon name="heroicons:camera" class="w-4 h-4" />
                    <span class="hidden sm:inline">Загрузить фото</span>
                    <input
                      type="file"
                      class="hidden"
                      accept="image/*"
                      @change="onAvatarSelected"
                    >
                  </label>
                  <button
                    v-if="avatarUrl"
                    class="btn btn-sm btn-outline btn-error"
                    @click="removeAvatar"
                  >
                    <Icon name="heroicons:trash" class="w-4 h-4" />
                    <span class="hidden sm:inline">Удалить</span>
                  </button>
                </div>
                <p class="text-xs text-base-content/50 mt-2">
                  До 5 МБ • JPG, PNG, GIF, WebP
                </p>
              </div>
            </div>

            <div
              v-if="avatarStatus"
              :class="[
                'alert mb-4',
                avatarStatus.type === 'error' ? 'alert-error' : 'alert-success',
              ]"
            >
              <Icon
                :name="
                  avatarStatus.type === 'error'
                    ? 'heroicons:x-circle'
                    : 'heroicons:check-circle'
                "
                class="w-5 h-5"
              />
              <span>{{ avatarStatus.message }}</span>
            </div>

            <!-- Информация о профиле -->
            <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div class="bg-base-200/50 rounded-xl p-4">
                <div
                  class="flex items-center gap-2 text-sm text-base-content/60 mb-1"
                >
                  <Icon name="heroicons:identification" class="w-4 h-4" />
                  ID пользователя
                </div>
                <p class="font-mono text-sm break-all">{{ uid }}</p>
              </div>
              <div class="bg-base-200/50 rounded-xl p-4">
                <div
                  class="flex items-center gap-2 text-sm text-base-content/60 mb-1"
                >
                  <Icon name="heroicons:phone" class="w-4 h-4" />
                  Телефон
                </div>
                <p class="font-semibold">{{ phone }}</p>
              </div>
              <div class="bg-base-200/50 rounded-xl p-4">
                <div
                  class="flex items-center gap-2 text-sm text-base-content/60 mb-1"
                >
                  <Icon name="heroicons:calendar" class="w-4 h-4" />
                  Дата регистрации
                </div>
                <p class="font-semibold">{{ creation }}</p>
              </div>
              <div class="bg-base-200/50 rounded-xl p-4">
                <div
                  class="flex items-center gap-2 text-sm text-base-content/60 mb-1"
                >
                  <Icon name="heroicons:clock" class="w-4 h-4" />
                  Последний вход
                </div>
                <p class="font-semibold">{{ lastLogin }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Настройки -->
        <div class="card bg-base-100 shadow-xl">
          <div class="card-body p-6 sm:p-8">
            <div class="flex items-center gap-3 mb-6">
              <div
                class="w-10 h-10 bg-base-200 rounded-lg flex items-center justify-center"
              >
                <Icon
                  name="heroicons:cog-6-tooth"
                  class="w-5 h-5 text-base-content"
                />
              </div>
              <h2 class="text-xl font-bold">Настройки</h2>
            </div>

            <!-- Тема -->
            <div class="bg-base-200/50 rounded-box p-5 mb-6">
              <div
                class="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div class="flex items-center gap-3">
                  <div
                    class="w-10 h-10 bg-warning/10 rounded-lg flex items-center justify-center"
                  >
                    <Icon
                      name="heroicons:swatch"
                      class="w-5 h-5 text-warning"
                    />
                  </div>
                  <div>
                    <h3 class="font-semibold">Тема интерфейса</h3>
                    <p class="text-sm text-base-content/60">
                      Выберите предпочитаемую тему
                    </p>
                  </div>
                </div>

                <div class="flex flex-wrap items-center gap-2">
                  <div class="join shadow-sm rounded-lg">
                    <button
                      type="button"
                      class="btn btn-sm join-item gap-1"
                      :class="
                        selectedTheme === 'caramellatte'
                          ? 'btn-active'
                          : 'btn-ghost'
                      "
                      @click="applyLocalTheme('caramellatte')"
                    >
                      <Icon name="heroicons:sun" class="w-4 h-4" />
                      Светлая
                    </button>
                    <button
                      type="button"
                      class="btn btn-sm join-item gap-1"
                      :class="
                        selectedTheme === 'cosmicburst'
                          ? 'btn-active'
                          : 'btn-ghost'
                      "
                      @click="applyLocalTheme('cosmicburst')"
                    >
                      <Icon name="heroicons:moon" class="w-4 h-4" />
                      Тёмная
                    </button>
                  </div>

                  <button
                    class="btn btn-sm btn-outline"
                    @click="saveThemePreference"
                  >
                    <Icon name="heroicons:cloud-arrow-up" class="w-4 h-4" />
                    Сохранить
                  </button>

                  <span
                    v-if="themeStatus"
                    class="badge"
                    :class="themeStatusClass"
                  >
                    {{ themeStatus }}
                  </span>
                </div>
              </div>
            </div>

            <div class="divider my-2">
              <span class="text-sm text-base-content/50">Безопасность</span>
            </div>

            <!-- Смена email и пароля -->
            <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <div class="bg-base-200/50 rounded-xl p-5">
                <div class="flex items-center gap-3 mb-4">
                  <div
                    class="w-8 h-8 bg-info/10 rounded-lg flex items-center justify-center"
                  >
                    <Icon name="heroicons:envelope" class="w-4 h-4 text-info" />
                  </div>
                  <h3 class="font-semibold">Смена E-mail</h3>
                </div>

                <div class="space-y-3">
                  <div>
                    <label for="new-email" class="label py-1">
                      <span class="label-text text-sm">Новый E-mail</span>
                    </label>
                    <input
                      id="new-email"
                      v-model="newEmail"
                      type="email"
                      class="input input-bordered w-full"
                      placeholder="example@email.com"
                    >
                  </div>
                  <div>
                    <label for="email-password" class="label py-1">
                      <span class="label-text text-sm">Текущий пароль</span>
                    </label>
                    <input
                      id="email-password"
                      v-model="emailPassword"
                      type="password"
                      class="input input-bordered w-full"
                      placeholder="••••••••"
                    >
                  </div>
                  <button
                    class="btn btn-block mt-2"
                    :disabled="!newEmail || !emailPassword"
                    @click="changeEmail"
                  >
                    <Icon name="heroicons:envelope" class="w-4 h-4" />
                    Сменить почту
                  </button>
                </div>
              </div>

              <div class="bg-base-200/50 rounded-xl p-5">
                <div class="flex items-center gap-3 mb-4">
                  <div
                    class="w-8 h-8 bg-error/10 rounded-lg flex items-center justify-center"
                  >
                    <Icon
                      name="heroicons:lock-closed"
                      class="w-4 h-4 text-error"
                    />
                  </div>
                  <h3 class="font-semibold">Смена пароля</h3>
                </div>

                <div class="space-y-3">
                  <div>
                    <label for="old-password" class="label py-1">
                      <span class="label-text text-sm">Старый пароль</span>
                    </label>
                    <input
                      id="old-password"
                      v-model="oldPassword"
                      type="password"
                      class="input input-bordered w-full"
                      placeholder="••••••••"
                    >
                  </div>
                  <div>
                    <label for="new-password" class="label py-1">
                      <span class="label-text text-sm">Новый пароль</span>
                    </label>
                    <input
                      id="new-password"
                      v-model="newPassword"
                      type="password"
                      class="input input-bordered w-full"
                      placeholder="••••••••"
                    >
                  </div>
                  <button
                    class="btn btn-block mt-2"
                    :disabled="!newPassword || !oldPassword"
                    @click="changePassword"
                  >
                    <Icon name="heroicons:key" class="w-4 h-4" />
                    Сменить пароль
                  </button>
                </div>
              </div>
            </div>

            <div
              v-if="settingsStatus"
              :class="['alert mt-4', settingsStatusClass]"
            >
              <Icon
                :name="
                  settingsStatusType === 'error'
                    ? 'heroicons:x-circle'
                    : 'heroicons:check-circle'
                "
                class="w-5 h-5"
              />
              <span>{{ settingsStatus }}</span>
            </div>
          </div>
        </div>

        <!-- Выход -->
        <div class="card bg-base-100 shadow-xl">
          <div class="card-body p-6">
            <div
              class="flex flex-col sm:flex-row items-center justify-between gap-4"
            >
              <div class="flex items-center gap-3 text-center sm:text-left">
                <div
                  class="w-10 h-10 bg-error/10 rounded-lg flex items-center justify-center"
                >
                  <Icon
                    name="heroicons:arrow-right-start-on-rectangle"
                    class="w-5 h-5 text-error"
                  />
                </div>
                <div>
                  <h3 class="font-semibold">Выйти из аккаунта</h3>
                  <p class="text-sm text-base-content/60">
                    Завершить текущую сессию
                  </p>
                </div>
              </div>
              <button class="btn btn-outline btn-error" @click="logout">
                <Icon
                  name="heroicons:arrow-right-start-on-rectangle"
                  class="w-5 h-5"
                />
                Выйти
              </button>
            </div>
          </div>
        </div>
      </div>

      <div
        v-else
        class="flex min-h-[50vh] flex-col items-center justify-center space-y-6 px-4"
      >
        <div
          class="w-20 h-20 bg-base-200 rounded-full flex items-center justify-center"
        >
          <Icon
            name="heroicons:user-circle"
            class="w-12 h-12 text-base-content/30"
          />
        </div>
        <div class="text-center">
          <h2 class="text-2xl font-bold mb-2">Вы не авторизованы</h2>
          <p class="text-base-content/60">
            Войдите в аккаунт, чтобы просмотреть профиль
          </p>
        </div>
        <NuxtLink to="/auth" class="btn btn-lg gap-2">
          <Icon name="heroicons:arrow-right-on-rectangle" class="w-5 h-5" />
          Войти в аккаунт
        </NuxtLink>
      </div>
    </div>
  </ClientOnly>
</template>

<script setup lang="ts">
import { parseAppError } from "~/shared/services/app-error";

const authStore = useAuthStore();
const { user, initialized } = storeToRefs(authStore);

if (import.meta.client && !initialized.value) {
  await authStore.check();
}

const avatarUrl = ref("");
const avatarInitial = computed(() =>
  (user.value?.name?.[0] ?? "—").toUpperCase()
);
const isAdmin = computed(() => authStore.isAdmin);
const name = computed(() => user.value?.name ?? "—");
const email = computed(() => user.value?.email ?? "—");
const phone = computed(() => user.value?.phone ?? "—");
const uid = computed(() => user.value?.$id ?? "—");
const creation = computed(() =>
  formatDate(user.value?.$createdAt as string | null | undefined)
);
const lastLogin = computed(() =>
  formatDate(user.value?.accessedAt as string | null | undefined)
);

const avatarStatus = ref<{ message: string; type: "success" | "error" } | null>(
  null
);
const uploadingAvatar = ref(false);

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

const selectedTheme = ref("caramellatte");
const themeStatus = ref("");
const themeStatusType = ref<"success" | "error">("success");
const newEmail = ref("");
const emailPassword = ref("");
const oldPassword = ref("");
const newPassword = ref("");
const settingsStatus = ref("");
const settingsStatusType = ref<"success" | "error">("success");
const themeStatusClass = computed(() =>
  themeStatusType.value === "error" ? "badge-error" : "badge-success"
);
const settingsStatusClass = computed(() =>
  settingsStatusType.value === "error" ? "alert-error" : "alert-success"
);

useHead({
  title: "Личный кабинет — DNS Магазин",
});

const themeCookie = useCookie("theme");

onMounted(() => {
  try {
    const userPref = user.value?.prefs?.theme as string | undefined;
    if (userPref) {
      selectedTheme.value = userPref;
      return;
    }
    const stored = themeCookie.value as string | undefined;
    if (stored) selectedTheme.value = stored;
  } catch {
    /* ignore */
  }
});

watch(
  () => user.value?.prefs?.theme,
  (val) => {
    if (val) {
      selectedTheme.value = String(val);
    }
  }
);

type StatusTarget = "avatar" | "theme" | "settings";

function showTempStatus(
  target: StatusTarget,
  value: string,
  type: "success" | "error" = "success"
) {
  if (target === "avatar") {
    avatarStatus.value = { message: value, type };
    setTimeout(() => {
      avatarStatus.value = null;
    }, 2500);
    return;
  }
  if (target === "theme") {
    themeStatus.value = value;
    themeStatusType.value = type;
    setTimeout(() => {
      themeStatus.value = "";
    }, 2500);
    return;
  }
  settingsStatus.value = value;
  settingsStatusType.value = type;
  setTimeout(() => {
    settingsStatus.value = "";
  }, 2500);
}

async function onAvatarSelected(event: Event) {
  const input = event.target as HTMLInputElement;
  if (!input?.files?.length) return;
  const file = input.files[0];
  if (!file) return;
  uploadingAvatar.value = true;
  try {
    await authStore.uploadAvatar(file);
    showTempStatus("avatar", "Аватар загружен", "success");
  } catch (err) {
    const parsed = parseAppError(err);
    showTempStatus("avatar", parsed.message || "Ошибка загрузки", "error");
  } finally {
    uploadingAvatar.value = false;
    input.value = "";
  }
}

async function removeAvatar() {
  const fileId = user.value?.prefs?.avatarFileId as string | undefined;
  if (!fileId) return;
  try {
    await authStore.deleteAvatar(fileId);
    showTempStatus("avatar", "Аватар удален");
  } catch (err) {
    const parsed = parseAppError(err);
    showTempStatus("avatar", parsed.message || "Ошибка удаления", "error");
  }
}

async function saveThemePreference() {
  try {
    await authStore.setPreferences({ theme: selectedTheme.value });
    applyLocalTheme(selectedTheme.value);
    showTempStatus("theme", "Сохранено");
  } catch (err) {
    const parsed = parseAppError(err);
    showTempStatus("theme", parsed.message || "Ошибка", "error");
  }
}

function applyLocalTheme(theme: string) {
  selectedTheme.value = theme;
  try {
    document.documentElement.setAttribute("data-theme", theme);
    try {
      themeCookie.value = theme;
    } catch {
      /* ignore */
    }
  } catch {
    /* ignore */
  }
}

async function changeEmail() {
  if (!newEmail.value || !emailPassword.value) return;
  try {
    await authStore.updateEmail(newEmail.value.trim(), emailPassword.value);
    showTempStatus("settings", "Email обновлен");
    newEmail.value = "";
    emailPassword.value = "";
  } catch (err) {
    const parsed = parseAppError(err);
    showTempStatus("settings", parsed.message || "Ошибка", "error");
  }
}

async function changePassword() {
  if (!newPassword.value || !oldPassword.value) return;
  try {
    await authStore.updatePassword(newPassword.value, oldPassword.value);
    showTempStatus("settings", "Пароль обновлен");
    newPassword.value = "";
    oldPassword.value = "";
  } catch (err) {
    const parsed = parseAppError(err);
    showTempStatus("settings", parsed.message || "Ошибка", "error");
  }
}

async function logout() {
  await authStore.logout();
  await navigateTo("/");
}

function formatDate(value?: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("ru-RU");
}
</script>
