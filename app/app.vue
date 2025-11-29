<template>
  <NuxtLoadingIndicator color="#4285f4" error-color="#ff0000" />
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
  <AppToast />
</template>

<script setup lang="ts">
import { useAuthStore } from "~/stores/auth";

// Инициализация auth store при старте приложения
const authStore = useAuthStore();

// Проверяем авторизацию только на клиенте
onMounted(async () => {
  if (!authStore.initialized) {
    await authStore.check();
  }
});
</script>
