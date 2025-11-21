import { Client, Account, Storage, ID } from "appwrite";
import type { User } from "~/shared/models/user";
import {
  ALLOWED_AVATAR_MIME_TYPES,
  MAX_AVATAR_SIZE_BYTES,
} from "~/shared/constants";

let clientRef: Client | null = null;
let accountRef: Account | null = null;
let storageRef: Storage | null = null;

const user = ref<User | null>(null);
const initialized = ref(false);

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

export function useAuth() {
  ensureSdk();
  const authCookie = useCookie<string | null>("auth", {
    sameSite: "lax",
    path: "/",
  });

  const setAuthCookie = (value: boolean) => {
    authCookie.value = value ? "1" : null;
  };

  async function check() {
    ensureSdk();
    if (!import.meta.client || !accountRef) {
      initialized.value = true;
      if (!import.meta.client) {
        user.value = null;
      }
      return;
    }
    try {
      const current = (await accountRef.get()) as unknown as User;
      user.value = current;
      setAuthCookie(true);
    } catch {
      user.value = null;
      setAuthCookie(false);
    } finally {
      initialized.value = true;
    }
  }

  async function login(email: string, password: string) {
    ensureSdk();
    if (!accountRef) throw new Error("Appwrite account unavailable");
    await accountRef.createEmailPasswordSession(email, password);
    await check();
  }

  async function register(
    email: string,
    password: string,
    name?: string,
    phone?: string
  ) {
    ensureSdk();
    if (!accountRef) throw new Error("Appwrite account unavailable");
    const created = await accountRef.create(ID.unique(), email, password, name);
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
  }

  async function logout() {
    ensureSdk();
    if (!accountRef) return;
    await accountRef.deleteSession("current");
    user.value = null;
    setAuthCookie(false);
  }

  async function uploadAvatar(file: File) {
    ensureSdk();
    if (!storageRef || !accountRef)
      throw new Error("Avatar upload unavailable");
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
    updateEmail,
    updatePassword,
  };
}
