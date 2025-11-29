<script setup lang="ts">
import { useToastStore } from "~/stores/toast";

const toastStore = useToastStore();

const alertClass = (type: string) => {
  switch (type) {
    case "success":
      return "alert-success";
    case "error":
      return "alert-error";
    case "warning":
      return "alert-warning";
    case "info":
      return "alert-info";
    default:
      return "";
  }
};
</script>

<template>
  <Teleport to="body">
    <div class="toast toast-top toast-end z-50">
      <TransitionGroup name="toast">
        <div
          v-for="toast in toastStore.toasts"
          :key="toast.id"
          :class="['alert alert-soft', alertClass(toast.type)]"
        >
          <span>{{ toast.message }}</span>
          <button
            class="btn btn-ghost btn-xs btn-circle"
            @click="toastStore.remove(toast.id)"
          >
            ✕
          </button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(100%);
}
</style>
