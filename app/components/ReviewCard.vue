<template>
  <div>
    <div class="card bg-base-200 shadow-md">
      <div class="card-body">
        <!-- Заголовок с рейтингом и датой -->
        <div class="flex items-start justify-between gap-4">
          <div class="flex-1">
            <!-- Имя пользователя -->
            <div class="flex items-center gap-2 mb-2">
              <h3 class="font-semibold text-base">
                {{ review.isAnonymous ? "Аноним" : review.userName }}
              </h3>
              <span class="text-xs text-base-content/50">
                {{ formattedDate }}
              </span>
            </div>

            <!-- Рейтинг -->
            <div class="rating rating-sm mb-3">
              <input
v-for="star in 5" :key="star" type="radio" :name="`rating-${review.$id}`"
                class="mask mask-star bg-warning" :checked="star === review.rating" disabled>
            </div>
          </div>

          <!-- Кнопка удаления (только для своих отзывов) -->
          <button v-if="canDelete" class="btn btn-ghost btn-sm btn-square" title="Удалить отзыв" @click="handleDelete">
            <Icon name="heroicons:trash" class="w-5 h-5" />
          </button>
        </div>

        <!-- Текст отзыва -->
        <p v-if="review.comment" class="text-base-content/90 mb-4">
          {{ review.comment }}
        </p>

        <!-- Медиа галерея -->
        <div
v-if="review.media && review.media.length > 0"
          class="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
          <div
v-for="media in review.media" :key="media.$id"
            class="relative aspect-square overflow-hidden rounded-lg bg-base-300">
            <!-- Изображение -->
            <img
v-if="media.mediaType === 'image'" :src="getMediaUrl(media.fileId)" :alt="media.fileName"
              class="w-full h-full object-cover cursor-pointer hover:opacity-90 transition-opacity"
              @click="openMediaModal(media)">

            <!-- Видео -->
            <div v-else class="relative w-full h-full cursor-pointer group" @click="openMediaModal(media)">
              <video :src="getMediaUrl(media.fileId)" class="w-full h-full object-cover">
                <track kind="captions">
              </video>

              <!-- Индикатор видео -->
              <div
                class="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-colors">
                <div class="w-16 h-16 rounded-full bg-black/60 flex items-center justify-center backdrop-blur-sm">
                  <Icon name="heroicons:play-solid" class="w-8 h-8 text-white ml-1" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Delete confirmation modal -->
    <dialog ref="deleteModal" class="modal">
      <div class="modal-box">
        <h3 class="font-bold text-lg">Удалить отзыв?</h3>
        <p class="py-4">
          Вы уверены, что хотите удалить этот отзыв? Это действие нельзя отменить.
        </p>
        <div class="modal-action">
          <form method="dialog">
            <button class="btn btn-ghost">Отмена</button>
          </form>
          <button class="btn btn-error" @click="confirmDelete">Удалить</button>
        </div>
      </div>
      <form method="dialog" class="modal-backdrop">
        <button aria-label="Закрыть">close</button>
      </form>
    </dialog>
  </div>
</template>

<script setup lang="ts">
import type { ReviewWithMedia, ReviewMedia } from "~/shared/models/review";

const props = defineProps<{
  review: Readonly<ReviewWithMedia>;
  canDelete?: boolean;
}>();

const emit = defineEmits<{
  delete: [reviewId: string];
  openMedia: [media: ReviewMedia];
}>();

const config = useRuntimeConfig();

// Ref for delete confirmation modal
const deleteModal = ref<HTMLDialogElement | null>(null);

// Форматирование даты
const formattedDate = computed(() => {
  const date = new Date(props.review.$createdAt);
  return new Intl.DateTimeFormat("ru-RU", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
});

// Получение URL медиа файла
const getMediaUrl = (fileId: string) => {
  return `${config.public.appwriteEndpoint}/storage/buckets/${config.public.appwriteReviewsMediaBucketId}/files/${fileId}/view?project=${config.public.appwriteProjectId}`;
};

// Удаление отзыва - открывает модальное окно подтверждения
const handleDelete = () => {
  deleteModal.value?.showModal();
};

// Подтверждение удаления отзыва
const confirmDelete = () => {
  emit("delete", props.review.$id);
  deleteModal.value?.close();
};

// Открытие модального окна с медиа
const openMediaModal = (media: ReviewMedia) => {
  emit("openMedia", media);
};
</script>
