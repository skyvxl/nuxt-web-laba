import { defineStore } from "pinia";
import { Client, Account, Storage, ID } from "appwrite";
import type { User } from "~/shared/models/user";

// Разрешенные MIME-типы и максимальный размер для аватара
const ALLOWED_AVATAR_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
] as const;
const MAX_AVATAR_SIZE_BYTES = 5 * 1024 * 1024;

export const useAuthStore = defineStore("auth", () => {
  // === SDK References ===
  let clientRef: Client | null = null;
  let accountRef: Account | null = null;
  let storageRef: Storage | null = null;

  // === State ===
  const user = ref<User | null>(null);
  const initialized = ref(false);
  const loading = ref(false);

  // === Cookies ===
  const authCookie = useCookie<string | null>("auth", {
    sameSite: "strict",
    secure: !import.meta.dev,
    path: "/",
  });
  const userIdCookie = useCookie<string | null>("userId", {
    sameSite: "strict",
    secure: !import.meta.dev,
    path: "/",
  });

  // === Getters ===
  const isAuthenticated = computed(() => !!user.value);
  const userId = computed(() => user.value?.$id ?? null);
  const userName = computed(() => user.value?.name ?? "");
  const userEmail = computed(() => user.value?.email ?? "");
  const isAdmin = computed(
    () => user.value?.labels?.includes("admin") ?? false
  );
  const avatarFileId = computed(
    () => (user.value?.prefs?.avatarFileId as string) ?? null
  );

  // === Internal Methods ===
  function ensureSdk() {
    if (!import.meta.client || clientRef) return;
    const config = useRuntimeConfig();
    const sdk = new Client()
      .setEndpoint(config.public.appwriteEndpoint)
      .setProject(config.public.appwriteProjectId);
    clientRef = sdk;
    accountRef = new Account(sdk);
    storageRef = new Storage(sdk);
  }

  function setAuthCookies(currentUser: User | null) {
    if (currentUser && currentUser.$id) {
      authCookie.value = "1";
      userIdCookie.value = currentUser.$id;
    } else {
      authCookie.value = null;
      userIdCookie.value = null;
    }
  }

  // === Actions ===
  async function check() {
    ensureSdk();
    if (!import.meta.client || !accountRef) {
      initialized.value = true;
      if (!import.meta.client) {
        user.value = null;
      }
      return;
    }
    loading.value = true;
    try {
      const current = (await accountRef.get()) as unknown as User;
      user.value = current;
      setAuthCookies(current);
    } catch {
      user.value = null;
      setAuthCookies(null);
    } finally {
      loading.value = false;
      initialized.value = true;
    }
  }

  async function login(email: string, password: string) {
    ensureSdk();
    if (!accountRef) throw new Error("Appwrite account unavailable");
    loading.value = true;
    try {
      await accountRef.createEmailPasswordSession(email, password);
      await check();
    } finally {
      loading.value = false;
    }
  }

  async function register(
    email: string,
    password: string,
    name?: string,
    phone?: string
  ) {
    ensureSdk();
    if (!accountRef) throw new Error("Appwrite account unavailable");
    loading.value = true;
    try {
      const created = await accountRef.create(
        ID.unique(),
        email,
        password,
        name
      );
      await accountRef.createEmailPasswordSession(email, password);
      if (phone) {
        try {
          const accountExt = accountRef as unknown as {
            updatePhone?: (args: {
              phone: string;
              password?: string;
            }) => Promise<unknown>;
          };
          if (typeof accountExt.updatePhone === "function") {
            await accountExt.updatePhone({ phone, password });
          }
        } catch {
          // ignore phone errors
        }
      }
      await check();
      return created;
    } finally {
      loading.value = false;
    }
  }

  async function logout() {
    ensureSdk();
    if (!accountRef) return;
    loading.value = true;
    try {
      await accountRef.deleteSession("current");
      user.value = null;
      setAuthCookies(null);
    } finally {
      loading.value = false;
    }
  }

  async function uploadAvatar(file: File) {
    ensureSdk();
    if (!storageRef || !accountRef) {
      throw new Error("Avatar upload unavailable");
    }
    const config = useRuntimeConfig();
    const maxBytes =
      (config.public.appwriteAvatarMaxBytes as number | undefined) ??
      MAX_AVATAR_SIZE_BYTES;

    if (file.size > maxBytes) throw new Error("file_too_large");
    if (
      !ALLOWED_AVATAR_MIME_TYPES.includes(
        file.type as (typeof ALLOWED_AVATAR_MIME_TYPES)[number]
      )
    ) {
      throw new Error("file_type");
    }

    const bucketId = config.public.appwriteAvatarBucketId;
    const previousFileId = user.value?.prefs?.avatarFileId as
      | string
      | undefined;
    if (previousFileId) {
      try {
        await storageRef.deleteFile(bucketId, previousFileId);
      } catch {
        /* ignore delete failures */
      }
    }

    const currentUser = await accountRef.get();
    const res = await storageRef.createFile(bucketId, ID.unique(), file, [
      `read("user:${currentUser.$id}")`,
      'read("users")',
      `update("user:${currentUser.$id}")`,
      `delete("user:${currentUser.$id}")`,
    ]);

    await updatePrefsSafe({
      avatarFileId: res.$id,
      avatarFileName: res.name,
    });
    return res;
  }

  async function deleteAvatar(fileId: string) {
    ensureSdk();
    if (!storageRef || !accountRef) return;
    const config = useRuntimeConfig();
    try {
      await storageRef.deleteFile(config.public.appwriteAvatarBucketId, fileId);
    } catch {
      /* ignore */
    }
    try {
      await updatePrefsSafe({
        avatarFileId: null,
        avatarFileName: null,
      });
    } catch {
      /* ignore */
    }
  }

  async function setPreferences(prefs: Record<string, unknown>) {
    ensureSdk();
    if (!accountRef) return;
    await updatePrefsSafe(prefs);
  }

  async function updatePrefsSafe(partial: Record<string, unknown>) {
    ensureSdk();
    if (!accountRef) return;
    let currentPrefs: Record<string, unknown> =
      (user.value?.prefs as Record<string, unknown>) ?? {};
    try {
      currentPrefs = (await accountRef.getPrefs()) as Record<string, unknown>;
    } catch {
      /* ignore: fallback to cached prefs */
    }
    let merged: Record<string, unknown> = { ...currentPrefs };
    for (const [key, value] of Object.entries(partial)) {
      if (value === undefined) {
        const { [key]: _removed, ...rest } = merged;
        merged = rest;
      } else {
        merged[key] = value;
      }
    }
    await accountRef.updatePrefs(merged);
    await check();
  }

  function getAvatarUrl(fileId: string) {
    ensureSdk();
    if (!storageRef || !fileId) return "";
    const config = useRuntimeConfig();
    return storageRef
      .getFileView(config.public.appwriteAvatarBucketId, fileId)
      .toString();
  }

  async function updateEmail(newEmail: string, password?: string) {
    ensureSdk();
    if (!accountRef) throw new Error("Appwrite account unavailable");
    const accountExt = accountRef as unknown as {
      updateEmail?: (email: string, password?: string) => Promise<void>;
    };
    if (typeof accountExt.updateEmail !== "function") {
      throw new Error("update_email_unsupported");
    }
    await accountExt.updateEmail(newEmail, password);
    await check();
  }

  async function updatePassword(newPassword: string, oldPassword?: string) {
    ensureSdk();
    if (!accountRef) throw new Error("Appwrite account unavailable");
    const accountExt = accountRef as unknown as {
      updatePassword?: (
        newPassword: string,
        oldPassword?: string
      ) => Promise<void>;
    };
    if (typeof accountExt.updatePassword !== "function") {
      throw new Error("update_password_unsupported");
    }
    await accountExt.updatePassword(newPassword, oldPassword);
    await check();
  }

  // === SSR: Восстанавливаем состояние по куке на сервере ===
  function $reset() {
    user.value = null;
    initialized.value = false;
    loading.value = false;
  }

  return {
    // State
    user,
    initialized,
    loading,
    // Getters
    isAuthenticated,
    userId,
    userName,
    userEmail,
    isAdmin,
    avatarFileId,
    // Actions
    check,
    login,
    register,
    logout,
    uploadAvatar,
    deleteAvatar,
    setPreferences,
    getAvatarUrl,
    updateEmail,
    updatePassword,
    $reset,
  };
});
