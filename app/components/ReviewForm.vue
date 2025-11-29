<template>
  <ClientOnly>
    <!-- Форма для неавторизованных -->
    <div v-if="!isAuthenticated" class="card bg-base-100 shadow-xl">
      <div class="card-body text-center py-12">
        <Icon
          name="heroicons:chat-bubble-left-right"
          class="w-16 h-16 mx-auto mb-4 text-base-content/30"
        />
        <h3 class="text-xl font-semibold mb-2">Оставьте отзыв о товаре</h3>
        <p class="text-base-content/70 mb-4">
          Войдите, чтобы поделиться мнением
        </p>
        <NuxtLink to="/auth" class="btn btn-primary btn-lg"
          >Войти в аккаунт</NuxtLink
        >
      </div>
    </div>

    <!-- Форма для авторизованных -->
    <div v-else class="card bg-base-100 shadow-xl">
      <div class="card-body">
        <h2 class="text-2xl font-bold mb-6">Оставьте отзыв</h2>

        <form @submit.prevent="handleSubmit">
          <!-- Рейтинг -->
          <div class="mb-6">
            <label class="block mb-3">
              <span class="text-base font-medium">Ваша оценка *</span>
            </label>
            <div class="flex items-center gap-2 bg-base-200 p-4 rounded-lg">
              <div class="rating rating-lg gap-2">
                <input
                  v-for="star in 5"
                  :key="star"
                  v-model.number="formData.rating"
                  type="radio"
                  :name="`rating-${productId}`"
                  class="mask mask-star-2 bg-warning cursor-pointer hover:scale-110 transition-transform"
                  :value="star"
                >
              </div>
              <span
                v-if="formData.rating > 0"
                class="text-lg font-semibold ml-2"
              >
                {{ formData.rating }} из 5
              </span>
            </div>
            <p v-if="errors.rating" class="text-error text-sm mt-2">
              {{ errors.rating }}
            </p>
          </div>

          <!-- Комментарий -->
          <div class="mb-6">
            <label class="block mb-3">
              <span class="text-base font-medium">Как вам товар?</span>
            </label>
            <div class="relative">
              <textarea
                v-model="formData.comment"
                class="textarea textarea-bordered w-full resize-none min-h-[120px] text-base"
                :class="{ 'textarea-error': errors.comment }"
                placeholder="Общее впечатление"
                :maxlength="1000"
              />
              <div class="flex justify-end items-center gap-2 mt-2">
                <span v-if="errors.comment" class="text-error text-sm flex-1">{{
                  errors.comment
                }}</span>
                <span class="text-sm text-base-content/60">
                  {{ formData.comment.length }} / 1000
                </span>
              </div>
            </div>
          </div>

          <!-- Загрузка медиа -->
          <div class="mb-6">
            <label class="block mb-3">
              <span class="text-base font-medium">Добавьте фото или видео</span>
            </label>

            <div
              class="bg-base-200 rounded-lg p-6 text-center border-2 border-dashed border-base-300 hover:border-primary transition-colors cursor-pointer"
              @click="() => fileInput?.click()"
            >
              <Icon
                name="heroicons:photo"
                class="w-12 h-12 mx-auto mb-3 text-primary"
              />
              <p class="text-base font-medium mb-2">
                Загрузите не более 10 файлов
              </p>
              <p class="text-sm text-base-content/60">
                Форматы: JPG, PNG, MP4. Макс. размер: 20 МБ
              </p>
              <input
                ref="fileInput"
                type="file"
                class="hidden"
                accept="image/jpeg,image/jpg,image/png,video/mp4"
                multiple
                @change="handleFileSelect"
              >
            </div>

            <!-- Превью выбранных файлов -->
            <div
              v-if="selectedFiles.length > 0"
              class="grid grid-cols-4 gap-3 mt-4 sm:grid-cols-5 md:grid-cols-6"
            >
              <div
                v-for="(file, index) in selectedFiles"
                :key="index"
                class="group relative aspect-square overflow-hidden rounded-xl bg-base-300 border-2 border-base-300 hover:border-primary transition-colors"
              >
                <!-- Превью изображения -->
                <img
                  v-if="file.type.startsWith('image/')"
                  :src="file.preview"
                  :alt="file.name"
                  class="w-full h-full object-cover"
                >

                <!-- Иконка видео -->
                <div
                  v-else
                  class="w-full h-full flex flex-col items-center justify-center bg-base-200"
                >
                  <Icon
                    name="heroicons:video-camera"
                    class="w-10 h-10 text-primary mb-1"
                  />
                  <span class="text-xs text-base-content/60">Видео</span>
                </div>

                <!-- Кнопка удаления -->
                <button
                  type="button"
                  class="btn btn-circle btn-xs btn-error absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                  @click.stop="removeFile(index)"
                >
                  <Icon name="heroicons:x-mark" class="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>

          <!-- Анонимность -->
          <div class="mb-6">
            <label
              class="flex items-start gap-3 p-4 bg-base-200 rounded-lg cursor-pointer hover:bg-base-300 transition-colors"
            >
              <input
                v-model="formData.isAnonymous"
                type="checkbox"
                class="checkbox checkbox-primary mt-0.5"
              >
              <div class="flex-1">
                <span class="text-base font-medium block mb-1"
                  >Сделать отзыв анонимным</span
                >
                <span class="text-sm text-base-content/70"
                  >Имя и email не будут показываться</span
                >
              </div>
            </label>
          </div>

          <!-- Кнопки -->
          <div class="flex justify-end gap-3 pt-4 border-t border-base-300">
            <button
              type="submit"
              class="btn btn-primary btn-lg px-8"
              :disabled="isSubmitting || !formData.rating"
            >
              <span
                v-if="isSubmitting"
                class="loading loading-spinner loading-sm"
              />
              <span v-else>Отправить отзыв</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </ClientOnly>
</template>

<script setup lang="ts">
import type { CreateReviewInput } from "~/shared/models/review";

const props = defineProps<{
  productId: string;
}>();

const emit = defineEmits<{
  submitted: [reviewId: string];
}>();

const authStore = useAuthStore();
const toastStore = useToastStore();
const { createReview, uploadMedia } = useReviews(props.productId);

const isAuthenticated = computed(() => authStore.isAuthenticated);

// Форма
const formData = ref<CreateReviewInput>({
  productId: props.productId,
  rating: 0,
  comment: "",
  isAnonymous: false,
});

const errors = ref<Record<string, string>>({});
const isSubmitting = ref(false);

// Файлы
const fileInput = ref<HTMLInputElement | null>(null);
const selectedFiles = ref<
  Array<File & { preview?: string; type: string; name: string }>
>([]);

// Валидация
const validateForm = () => {
  errors.value = {};

  if (!formData.value.rating || formData.value.rating < 1) {
    errors.value.rating = "Пожалуйста, выберите оценку";
  }

  if (formData.value.comment && formData.value.comment.length > 1000) {
    errors.value.comment = "Комментарий не должен превышать 1000 символов";
  }

  return Object.keys(errors.value).length === 0;
};

// Выбор файлов
const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const files = Array.from(target.files || []);

  if (selectedFiles.value.length + files.length > 10) {
    toastStore.error("Максимум 10 файлов");
    return;
  }

  for (const file of files) {
    // Проверка типа
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "video/mp4"];
    if (!allowedTypes.includes(file.type)) {
      toastStore.error(`Недопустимый формат файла: ${file.name}`);
      continue;
    }

    // Проверка размера (18MB для всех)
    const maxSize = 18 * 1024 * 1024; // 18MB
    if (file.size > maxSize) {
      toastStore.error(`Файл ${file.name} слишком большой (макс. 20 МБ)`);
      continue;
    }

    // Создаём превью для изображений
    const isImage = file.type.startsWith("image/");
    if (isImage) {
      const reader = new FileReader();
      reader.onload = (e) => {
        (file as File & { preview?: string }).preview = e.target
          ?.result as string;
        // Форсируем обновление
        selectedFiles.value = [...selectedFiles.value];
      };
      reader.readAsDataURL(file);
    }

    selectedFiles.value.push(
      file as File & { preview?: string; type: string; name: string }
    );
  }

  // Сбрасываем input
  if (target) target.value = "";
};

// Удаление файла
const removeFile = (index: number) => {
  const file = selectedFiles.value[index];
  if (file?.preview) {
    URL.revokeObjectURL(file.preview);
  }
  selectedFiles.value.splice(index, 1);
};

// Отправка формы
const handleSubmit = async () => {
  if (!validateForm()) {
    return;
  }

  isSubmitting.value = true;

  try {
    // Создаём отзыв
    const review = await createReview(formData.value);

    // Загружаем медиа файлы, если есть
    if (selectedFiles.value.length > 0) {
      await uploadMedia(review.$id, selectedFiles.value);
    }

    // Сбрасываем форму
    formData.value = {
      productId: props.productId,
      rating: 0,
      comment: "",
      isAnonymous: false,
    };
    selectedFiles.value = [];

    toastStore.success("Отзыв успешно добавлен!");
    emit("submitted", review.$id);
  } catch (error: unknown) {
    console.error("Failed to submit review:", error);
    const err = error as { statusCode?: number; message?: string };

    if (err.statusCode === 409) {
      toastStore.error("Вы уже оставили отзыв на этот товар");
    } else if (err.statusCode === 401) {
      toastStore.error("Пожалуйста, войдите в аккаунт");
      navigateTo("/auth");
    } else {
      toastStore.error(err.message || "Не удалось отправить отзыв");
    }
  } finally {
    isSubmitting.value = false;
  }
};

// Очистка превью при размонтировании
onUnmounted(() => {
  for (const file of selectedFiles.value) {
    if (file.preview) {
      URL.revokeObjectURL(file.preview);
    }
  }
});
</script>
