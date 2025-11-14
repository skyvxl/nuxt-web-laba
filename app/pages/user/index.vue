<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-2xl font-bold mb-4">Профиль</h1>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="card bg-base-100 shadow-xl">
        <div class="card-body">
          <div class="text-center">
            <img v-if="avatarUrlRef" :src="avatarUrlRef" alt="avatar" class="w-32 h-32 rounded-full mx-auto object-cover mb-4">
            <div v-else class="w-32 h-32 rounded-full bg-base-200 mx-auto mb-4" />
            <div class="text-lg font-medium">{{ name }}</div>
            <div class="text-sm text-base-content/60">{{ email }}</div>
            <div class="mt-4">
              <button class="btn btn-ghost" @click="logout">Выйти</button>
            </div>
            <div class="mt-4">
              <input type="file" accept="image/*" @change="onAvatarSelected">
              <div class="mt-2">
                <button v-if="avatarUrlRef" class="btn btn-ghost" @click="removeAvatar">Удалить аватар</button>
              </div>
              <div v-if="uploadingAvatar" class="text-sm text-base-content/60 mt-2">Загрузка...</div>
              <div v-if="avatarStatus" class="text-sm mt-2">{{ avatarStatus }}</div>
            </div>
          </div>
        </div>
      </div>

      <div class="col-span-2">
        <div class="card bg-base-100 shadow-xl mb-6">
          <div class="card-body">
            <h3 class="card-title">Настройки</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="label"><span class="label-text">Email</span></label>
                <input v-model="emailLocal" class="input input-bordered w-full">
                <label class="label"><span class="label-text">Пароль</span></label>
                <input v-model="passwordLocal" type="password" class="input input-bordered w-full">
                <div class="mt-4">
                  <button class="btn btn-ghost" @click="saveEmail">Сохранить</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="card bg-base-100 shadow-xl">
          <div class="card-body">
            <h3 class="card-title">Тема</h3>
            <div class="mt-2">
              <select v-model="selectedTheme" class="select select-bordered w-full">
                <option value="">По умолчанию</option>
                <option value="caramellatte">Caramellatte</option>
                <option value="cyberpunk">Cyberpunk</option>
              </select>
              <div class="mt-4">
                <button class="btn btn-ghost" @click="saveTheme">Сохранить тему</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuth } from '~/composables/useAuth';
import { computed, ref, watch } from 'vue';

const { user, check, logout: authLogout, setPreferences } = useAuth();
await check();

const name = computed(() => user.value?.name ?? '—');
const email = computed(() => user.value?.email ?? '—');

const selectedTheme = ref('');
const avatarStatus = ref('');
const uploadingAvatar = ref(false);
const { uploadAvatar, deleteAvatar, getAvatarUrl } = useAuth();

const fileId = computed(() => user.value?.prefs?.avatarFileId as string | undefined);
const avatarUrlRef = ref('');

watch(fileId, async (id) => {
  if (!id) {
    avatarUrlRef.value = '';
    return;
  }
  avatarUrlRef.value = await getAvatarUrl(id);
}, { immediate: true });
const emailLocal = ref('');
const passwordLocal = ref('');

async function onAvatarSelected(e: Event) {
  const input = e.target as HTMLInputElement;
  if (!input?.files?.length) return;
  const file = input.files[0];
  if (!file) return;
  uploadingAvatar.value = true;
  try {
    await uploadAvatar(file);
    avatarStatus.value = 'Аватар загружен';
  } catch (err) {
    console.warn('Failed upload', err);
    avatarStatus.value = 'Ошибка загрузки';
  } finally {
    uploadingAvatar.value = false;
    // refresh avatar
    await check();
  }
}

async function removeAvatar() {
  const id = fileId.value;
  if (!id) return;
  try {
    await deleteAvatar(id);
    avatarStatus.value = 'Аватар удален';
  } catch (err) {
    console.warn('Failed delete', err);
    avatarStatus.value = 'Ошибка удаления';
  }
}

function logout() {
  authLogout();
  navigateTo('/');
}

async function saveTheme() {
  try {
    await setPreferences({ theme: selectedTheme.value });
    // apply locally as well
    try {
      if (typeof document !== 'undefined') document.documentElement.setAttribute('data-theme', selectedTheme.value);
      if (typeof window !== 'undefined') localStorage.setItem('theme', selectedTheme.value);
    } catch {
      /* ignore */
    }
    alert('Тема сохранена');
  } catch (err) {
    console.warn('Failed to save theme', err);
    alert('Ошибка при сохранении темы');
  }
}

function saveEmail() {
  alert('Сохранить email: ' + emailLocal.value);
}
</script>
