import { defineStore } from "pinia";

export interface Toast {
  id: string;
  message: string;
  type: "success" | "error" | "info" | "warning";
  duration?: number;
}

export const useToastStore = defineStore("toast", () => {
  // === State ===
  const toasts = ref<Toast[]>([]);

  // === Actions ===
  function show(
    message: string,
    type: Toast["type"] = "success",
    duration = 3000
  ) {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const toast: Toast = { id, message, type, duration };

    toasts.value.push(toast);

    // Автоматическое удаление
    if (duration > 0) {
      setTimeout(() => {
        remove(id);
      }, duration);
    }

    return id;
  }

  function success(message: string, duration = 3000) {
    return show(message, "success", duration);
  }

  function error(message: string, duration = 4000) {
    return show(message, "error", duration);
  }

  function info(message: string, duration = 3000) {
    return show(message, "info", duration);
  }

  function warning(message: string, duration = 3500) {
    return show(message, "warning", duration);
  }

  function remove(id: string) {
    const index = toasts.value.findIndex((t) => t.id === id);
    if (index !== -1) {
      toasts.value.splice(index, 1);
    }
  }

  function clear() {
    toasts.value = [];
  }

  function $reset() {
    toasts.value = [];
  }

  return {
    // State
    toasts,
    // Actions
    show,
    success,
    error,
    info,
    warning,
    remove,
    clear,
    $reset,
  };
});
