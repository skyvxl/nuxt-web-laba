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
        <h1 class="text-3xl font-bold text-base-content">Личный кабинет</h1>

        <div class="card bg-base-100 shadow-xl">
          <div class="card-body">
            <h2 class="card-title text-2xl mb-4">
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
              Данные пользователя
            </h2>

            <div
              class="flex flex-col sm:flex-row items-center gap-6 mb-6 pb-6 border-b border-base-300"
            >
              <div
                class="avatar placeholder rounded-full border-2 border-base-content/20"
              >
                <div
                  class="w-24 h-24 rounded-full bg-neutral text-neutral-content flex items-center justify-center"
                >
                  <img
                    v-if="avatarUrl"
                    :src="avatarUrl"
                    alt="Avatar"
                    class="w-24 h-24 object-cover rounded-full"
                  >
                  <span v-else class="text-3xl">{{ avatarInitial }}</span>
                </div>
              </div>
              <div class="flex-1 w-full text-center sm:text-left">
                <h3 class="text-2xl font-bold">{{ name }}</h3>
                <p class="text-base-content/70">{{ email }}</p>
                <div class="flex flex-col sm:flex-row gap-2 mt-3">
                  <label
                    class="btn btn-sm btn-ghost flex-1 sm:flex-none min-h-8 cursor-pointer"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      class="h-4 w-4 mr-1"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    Загрузить аватар
                    <input
                      type="file"
                      class="hidden"
                      accept="image/*"
                      @change="onAvatarSelected"
                    >
                  </label>
                  <button
                    v-if="avatarUrl"
                    class="btn btn-sm btn-ghost flex-1 sm:flex-none min-h-8"
                    @click="removeAvatar"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      class="h-4 w-4 mr-1"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                    Удалить
                  </button>
                  <span
                    v-if="uploadingAvatar"
                    class="loading loading-spinner loading-sm mx-auto sm:mx-0"
                  />
                </div>
                <p class="text-xs text-base-content/60 mt-2">
                  Максимум 5 МБ. Форматы: jpg, jpeg, png, gif, webp
                </p>
              </div>
            </div>

            <div
              v-if="avatarStatus"
              :class="[
                'alert alert-soft',
                avatarStatus.type === 'error' ? 'alert-error' : 'alert-success',
                'mb-4',
              ]"
            >
              <span>{{ avatarStatus.message }}</span>
            </div>

            <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div class="form-control">
                <div class="label">
                  <span class="label-text font-semibold">ID пользователя</span>
                </div>
                <div class="text-sm break-all bg-base-200 p-3 rounded-lg">
                  {{ uid }}
                </div>
              </div>
              <div class="form-control">
                <div class="label">
                  <span class="label-text font-semibold">Телефон</span>
                </div>
                <div class="text-sm bg-base-200 p-3 rounded-lg">
                  {{ phone }}
                </div>
              </div>
              <div class="form-control">
                <div class="label">
                  <span class="label-text font-semibold">Дата регистрации</span>
                </div>
                <div class="text-sm bg-base-200 p-3 rounded-lg">
                  {{ creation }}
                </div>
              </div>
              <div class="form-control">
                <div class="label">
                  <span class="label-text font-semibold">Последний вход</span>
                </div>
                <div class="text-sm bg-base-200 p-3 rounded-lg">
                  {{ lastLogin }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="card bg-base-100 shadow-xl">
          <div class="card-body">
            <h2 class="card-title text-2xl mb-4">
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
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              Настройки
            </h2>

            <div class="bg-base-200 rounded-lg p-4 mb-4">
              <h3 class="font-semibold mb-3 flex items-center gap-2">
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
                    d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
                  />
                </svg>
                Тема интерфейса
              </h3>
              <div
                class="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center"
              >
                <div class="join w-full sm:w-auto">
                  <button
                    type="button"
                    class="btn btn-sm join-item flex-1"
                    :class="{ 'btn-active': selectedTheme === 'caramellatte' }"
                    @click="applyLocalTheme('caramellatte')"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      class="h-4 w-4 sm:mr-1"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                      />
                    </svg>
                    <span class="hidden sm:inline">Светлая</span>
                  </button>
                  <button
                    type="button"
                    class="btn btn-sm join-item flex-1"
                    :class="{ 'btn-active': selectedTheme === 'cosmicburst' }"
                    @click="applyLocalTheme('cosmicburst')"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      class="h-4 w-4 sm:mr-1"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                      />
                    </svg>
                    <span class="hidden sm:inline">Тёмная</span>
                  </button>
                </div>
                <button
                  class="btn btn-ghost border-2 border-base-content/20 btn-sm w-full sm:w-auto"
                  @click="saveThemePreference"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-4 w-4 mr-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
                    />
                  </svg>
                  Сохранить в профиле
                </button>
                <div v-if="themeStatus" class="badge" :class="themeStatusClass">
                  {{ themeStatus }}
                </div>
              </div>
              <p class="text-xs text-base-content/60 mt-2">
                Тема применяется локально сразу. Нажмите кнопку для сохранения
                на сервере
              </p>
            </div>

            <div class="divider" />

            <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <div class="bg-base-200 rounded-lg p-4">
                <h3 class="font-semibold mb-3 flex items-center gap-2">
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
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                  Смена E-mail
                </h3>
                <div class="form-control">
                  <label for="new-email" class="label"
                    ><span class="label-text">Новый E-mail</span></label
                  >
                  <input
                    id="new-email"
                    v-model="newEmail"
                    type="email"
                    class="input input-bordered w-full"
                    placeholder="example@email.com"
                  >
                </div>
                <div class="form-control mt-2">
                  <label for="email-password" class="label"
                    ><span class="label-text">Текущий пароль</span></label
                  >
                  <input
                    id="email-password"
                    v-model="emailPassword"
                    type="password"
                    class="input input-bordered w-full"
                    placeholder="••••••••"
                  >
                </div>
                <button
                  class="btn btn-ghost border-2 border-base-content/20 btn-block mt-4"
                  :disabled="!newEmail || !emailPassword"
                  @click="changeEmail"
                >
                  Сменить почту
                </button>
              </div>

              <div class="bg-base-200 rounded-lg p-4">
                <h3 class="font-semibold mb-3 flex items-center gap-2">
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
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                  Смена пароля
                </h3>
                <div class="form-control">
                  <label for="old-password" class="label"
                    ><span class="label-text">Старый пароль</span></label
                  >
                  <input
                    id="old-password"
                    v-model="oldPassword"
                    type="password"
                    class="input input-bordered w-full"
                    placeholder="••••••••"
                  >
                </div>
                <div class="form-control mt-2">
                  <label for="new-password" class="label"
                    ><span class="label-text">Новый пароль</span></label
                  >
                  <input
                    id="new-password"
                    v-model="newPassword"
                    type="password"
                    class="input input-bordered w-full"
                    placeholder="••••••••"
                  >
                </div>
                <button
                  class="btn btn-ghost border-2 border-base-content/20 btn-block mt-4"
                  :disabled="!newPassword || !oldPassword"
                  @click="changePassword"
                >
                  Сменить пароль
                </button>
              </div>
            </div>

            <div
              v-if="settingsStatus"
              :class="['alert mt-4', settingsStatusClass]"
            >
              <span>{{ settingsStatus }}</span>
            </div>
          </div>
        </div>

        <div class="card bg-base-100 shadow-xl">
          <div class="card-body">
            <button
              class="btn btn-ghost border-2 border-base-content/20"
              @click="logout"
            >
              Выйти из аккаунта
            </button>
          </div>
        </div>
      </div>

      <div
        v-else
        class="flex min-h-[40vh] flex-col items-center justify-center space-y-4"
      >
        <p class="text-center text-lg">
          Авторизуйтесь, чтобы просмотреть профиль
        </p>
        <NuxtLink
          to="/auth"
          class="btn btn-ghost border-2 border-base-content/20"
          >Войти</NuxtLink
        >
      </div>
    </div>
  </ClientOnly>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { useAuth } from "~/composables/useAuth";
import { parseAppError } from "~/shared/services/app-error";

const {
  user,
  initialized,
  check,
  logout: authLogout,
  uploadAvatar,
  deleteAvatar,
  getAvatarUrl,
  setPreferences,
  updateEmail,
  updatePassword,
} = useAuth();

if (import.meta.client && !initialized.value) {
  await check();
}

const avatarUrl = ref("");
const avatarInitial = computed(() =>
  (user.value?.name?.[0] ?? "—").toUpperCase()
);
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
    avatarUrl.value = await getAvatarUrl(fileId);
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
    await uploadAvatar(file);
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
    await deleteAvatar(fileId);
    showTempStatus("avatar", "Аватар удален");
  } catch (err) {
    const parsed = parseAppError(err);
    showTempStatus("avatar", parsed.message || "Ошибка удаления", "error");
  }
}

async function saveThemePreference() {
  try {
    await setPreferences({ theme: selectedTheme.value });
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
    await updateEmail(newEmail.value.trim(), emailPassword.value);
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
    await updatePassword(newPassword.value, oldPassword.value);
    showTempStatus("settings", "Пароль обновлен");
    newPassword.value = "";
    oldPassword.value = "";
  } catch (err) {
    const parsed = parseAppError(err);
    showTempStatus("settings", parsed.message || "Ошибка", "error");
  }
}

async function logout() {
  await authLogout();
  await navigateTo("/");
}

function formatDate(value?: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("ru-RU");
}
</script>
