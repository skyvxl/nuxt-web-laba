import { ref } from "vue";
import type { User } from "~/shared/models/user";

export function useAuth() {
  const user = ref<User | null>(null);
  const initialized = ref(false);

  async function check() {
    try {
      const { data } = await useFetch("/api/auth/user");
      user.value = (data.value?.user ?? null) as User | null;
    } finally {
      initialized.value = true;
    }
  }

  async function login(email: string, password: string) {
    const res = await $fetch("/api/auth/login", {
      method: "POST",
      body: { email, password },
    });
    return res;
  }

  async function register(
    email: string,
    password: string,
    name?: string,
    phone?: string
  ) {
    return $fetch("/api/auth/register", {
      method: "POST",
      body: { email, password, name, phone },
    });
  }

  async function logout() {
    await $fetch("/api/auth/logout", { method: "POST" });
    user.value = null;
  }

  async function uploadAvatar(file: File) {
    const form = new FormData();
    form.append("avatar", file);
    const res = await $fetch("/api/auth/avatar", {
      method: "POST",
      body: form,
    });
    await check();
    return res;
  }

  async function deleteAvatar(fileId: string) {
    await $fetch("/api/auth/avatar", { method: "DELETE", body: { fileId } });
    await check();
  }

  async function setPreferences(prefs: Record<string, unknown>) {
    await $fetch("/api/auth/prefs", { method: "POST", body: { prefs } });
    await check();
  }

  async function getAvatarUrl(fileId: string) {
    if (!fileId) return "";
    const data = (await $fetch(`/api/auth/avatar/${fileId}`)) as unknown;
    if (
      data &&
      typeof data === "object" &&
      "url" in (data as Record<string, unknown>)
    ) {
      const urlValue = (data as Record<string, unknown>)["url"];
      if (typeof urlValue === "string") return urlValue;
    }
    return "";
  }

  return {
    user,
    initialized,
    check,
    login,
    register,
    logout,
    uploadAvatar,
    deleteAvatar,
    setPreferences,
    getAvatarUrl,
  };
}
