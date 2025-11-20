<template>
  <div class="container mx-auto px-4 py-8 text-center">
    <div class="card bg-base-100 shadow-md max-w-xl mx-auto p-6">
      <h2 class="text-2xl font-bold mb-2">Ошибка</h2>
      <p class="mb-4 text-base-content/70">{{ title }}</p>
      <div v-if="code" class="text-sm text-base-content/50 mb-4">
        Код: {{ code }}
      </div>
      <div class="flex gap-3 justify-center">
        <button class="btn" @click="goBack">Назад</button>
        <NuxtLink to="/" class="btn btn-ghost">На главную</NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { title = "Произошла ошибка", code = null } = defineProps<{
  title?: string;
  code?: number | string | null;
}>();

const router = useRouter();
function goBack() {
  // try to go back, otherwise navigate to home
  if (window?.history?.length > 1) {
    router.back();
  } else {
    router.push("/");
  }
}
</script>
