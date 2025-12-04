<template>
  <div class="min-h-[70vh] flex items-center justify-center px-4 py-8">
    <div class="w-full max-w-md">
      <div class="card bg-base-100 shadow-2xl">
        <div class="card-body p-6 sm:p-8">
          <!-- Табы -->
          <div
            role="tablist"
            class="tabs tabs-boxed bg-base-200 p-1 mb-8 gap-1 rounded-lg"
          >
            <button
              role="tab"
              class="tab flex-1 font-medium transition-all rounded-lg"
              :class="
                activeTab === 'login' ? 'tab-active bg-base-100 shadow' : ''
              "
              type="button"
              @click="setActiveTab('login')"
            >
              <Icon
                name="heroicons:arrow-right-on-rectangle"
                class="w-4 h-4 mr-2"
              />
              Вход
            </button>
            <button
              role="tab"
              class="tab flex-1 font-medium transition-all rounded-lg"
              :class="
                activeTab === 'register' ? 'tab-active bg-base-100 shadow' : ''
              "
              type="button"
              @click="setActiveTab('register')"
            >
              <Icon name="heroicons:user-plus" class="w-4 h-4 mr-2" />
              Регистрация
            </button>
          </div>

          <!-- Форма входа -->
          <form
            v-if="activeTab === 'login'"
            novalidate
            class="space-y-5"
            @submit.prevent="login"
          >
            <div class="text-center mb-6">
              <h2 class="text-2xl font-bold">Добро пожаловать!</h2>
              <p class="text-base-content/60 mt-1">Войдите в свой аккаунт</p>
            </div>

            <div v-if="loginErrorMsg" class="alert alert-error">
              <Icon name="heroicons:exclamation-circle" class="w-5 h-5" />
              <span>{{ loginErrorMsg }}</span>
            </div>

            <BaseInput
              v-model="loginEmail"
              title="Email"
              placeholder="your@email.com"
              type="email"
            />

            <BaseInput
              v-model="loginPassword"
              title="Пароль"
              placeholder="Введите пароль"
              type="password"
            />

            <button
              :disabled="loginLoading"
              class="btn btn-primary btn-block btn-lg"
              type="submit"
            >
              <span v-if="loginLoading" class="loading loading-spinner" />
              <Icon
                v-else
                name="heroicons:arrow-right-on-rectangle"
                class="w-5 h-5"
              />
              {{ loginLoading ? "Входим..." : "Войти" }}
            </button>
          </form>

          <!-- Форма регистрации -->
          <form v-else novalidate class="space-y-4" @submit.prevent="register">
            <div class="text-center mb-6">
              <h2 class="text-2xl font-bold">Создать аккаунт</h2>
              <p class="text-base-content/60 mt-1">
                Заполните данные для регистрации
              </p>
            </div>

            <div v-if="registerErrorMsg" class="alert alert-error">
              <Icon name="heroicons:exclamation-circle" class="w-5 h-5" />
              <span>{{ registerErrorMsg }}</span>
            </div>

            <BaseInput
              v-model="registerName"
              title="Имя"
              placeholder="Ваше имя"
              type="text"
              required
              :errors="fieldErrorList('name')"
              @blur="markTouched('name')"
            />
            <BaseInput
              v-model="registerPhone"
              title="Телефон"
              placeholder="+7 (___) ___-__-__"
              type="tel"
              required
              prefix="+7"
              immutable-prefix
              :errors="fieldErrorList('phone')"
              @blur="markTouched('phone')"
            />
            <BaseInput
              v-model="registerEmail"
              title="Email"
              placeholder="your@email.com"
              type="email"
              required
              :errors="fieldErrorList('email')"
              @blur="markTouched('email')"
            />
            <BaseInput
              v-model="registerPassword"
              title="Пароль"
              placeholder="Минимум 8 символов"
              type="password"
              required
              :errors="fieldErrorList('password')"
              @blur="markTouched('password')"
            />
            <BaseInput
              v-model="registerConfirmPassword"
              title="Подтвердите пароль"
              placeholder="Повторите пароль"
              type="password"
              required
              :errors="fieldErrorList('confirm')"
              @blur="markTouched('confirm')"
            />

            <div class="divider my-2" />

            <!-- Чекбоксы -->
            <div class="space-y-3">
              <label
                class="flex items-start gap-3 cursor-pointer p-3 rounded-lg hover:bg-base-200 transition-colors"
              >
                <input
                  v-model="agreeConsent"
                  type="checkbox"
                  class="checkbox checkbox-primary mt-0.5"
                >
                <span class="text-sm">
                  Согласен(а) на
                  <NuxtLink class="link font-medium" to="/consent">
                    обработку персональных данных
                  </NuxtLink>
                </span>
              </label>

              <label
                class="flex items-start gap-3 cursor-pointer p-3 rounded-lg hover:bg-base-200 transition-colors"
              >
                <input
                  v-model="agreePrivacy"
                  type="checkbox"
                  class="checkbox checkbox-primary mt-0.5"
                >
                <span class="text-sm">
                  Согласен(а) с
                  <NuxtLink class="link font-medium" to="/privacy">
                    политикой конфиденциальности
                  </NuxtLink>
                </span>
              </label>
            </div>

            <button
              :disabled="registerLoading || !agreeConsent || !agreePrivacy"
              class="btn btn-primary btn-block btn-lg mt-6"
              type="submit"
            >
              <span v-if="registerLoading" class="loading loading-spinner" />
              <Icon v-else name="heroicons:user-plus" class="w-5 h-5" />
              {{ registerLoading ? "Регистрируем..." : "Зарегистрироваться" }}
            </button>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { parseAppError } from "~/shared/services/app-error";

const authStore = useAuthStore();
const { user, initialized } = storeToRefs(authStore);

if (!initialized.value) {
  await authStore.check();
}

if (user.value) {
  await navigateTo("/user");
}

const activeTab = ref<"login" | "register">("login");

// login form
const loginEmail = ref("");
const loginPassword = ref("");
const loginErrorMsg = ref("");
const loginLoading = ref(false);

// register
const registerEmail = ref("");
const registerPassword = ref("");
const registerConfirmPassword = ref("");
const registerErrorMsg = ref("");
const registerLoading = ref(false);
const registerName = ref("");
const registerPhone = ref("");
const agreeConsent = ref(false);
const agreePrivacy = ref(false);

type RegisterField = "name" | "phone" | "email" | "password" | "confirm";
const registerFieldTouched = reactive<Record<RegisterField, boolean>>({
  name: false,
  phone: false,
  email: false,
  password: false,
  confirm: false,
});
const registerFieldErrors = reactive<Record<RegisterField, string[]>>({
  name: [],
  phone: [],
  email: [],
  password: [],
  confirm: [],
});

function setActiveTab(tab: "login" | "register") {
  activeTab.value = tab;
  loginErrorMsg.value = "";
  registerErrorMsg.value = "";
}

async function login() {
  loginErrorMsg.value = "";
  loginLoading.value = true;
  try {
    await authStore.login(loginEmail.value, loginPassword.value);
    // redirect to home
    navigateTo("/");
  } catch (err) {
    const parsed = parseAppError(err);
    loginErrorMsg.value = parsed.message || "Неверный email или пароль";
  } finally {
    loginLoading.value = false;
  }
}

function normalizePhone(input: string) {
  let digits = input.replace(/\D/g, "");
  if (digits.length === 11 && digits.startsWith("8"))
    digits = "7" + digits.slice(1);
  return digits ? "+" + digits : "";
}

function validateField(field: RegisterField) {
  const errors: string[] = [];
  switch (field) {
    case "name":
      if (!registerName.value.trim()) errors.push("Введите ваше имя");
      break;
    case "phone": {
      const normalized = normalizePhone(registerPhone.value);
      if (!/^\+7\d{10}$/.test(normalized))
        errors.push("Номер в формате +7XXXXXXXXXX");
      break;
    }
    case "email": {
      const email = registerEmail.value.trim();
      if (!email) errors.push("Введите email");
      else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email))
        errors.push("Некорректный email");
      break;
    }
    case "password":
      if (registerPassword.value.length < 8) errors.push("Минимум 8 символов");
      break;
    case "confirm":
      if (registerConfirmPassword.value !== registerPassword.value)
        errors.push("Пароли не совпадают");
      break;
    default:
      break;
  }
  registerFieldErrors[field] = errors;
  return errors.length === 0;
}

function fieldErrorList(field: RegisterField) {
  return registerFieldTouched[field] ? registerFieldErrors[field] : [];
}

function markTouched(field: RegisterField) {
  registerFieldTouched[field] = true;
  validateField(field);
}

function validateAllFields() {
  let valid = true;
  (
    ["name", "phone", "email", "password", "confirm"] as RegisterField[]
  ).forEach((field) => {
    registerFieldTouched[field] = true;
    if (!validateField(field)) valid = false;
  });
  return valid;
}

watch(registerName, () => registerFieldTouched.name && validateField("name"));
watch(
  registerPhone,
  () => registerFieldTouched.phone && validateField("phone")
);
watch(
  registerEmail,
  () => registerFieldTouched.email && validateField("email")
);
watch(registerPassword, () => {
  if (registerFieldTouched.password) validateField("password");
  if (registerFieldTouched.confirm) validateField("confirm");
});
watch(
  registerConfirmPassword,
  () => registerFieldTouched.confirm && validateField("confirm")
);

async function register() {
  registerErrorMsg.value = "";

  if (!validateAllFields()) {
    registerErrorMsg.value = "Исправьте ошибки в форме";
    return;
  }

  const normalizedPhone = normalizePhone(registerPhone.value);

  if (!agreeConsent.value || !agreePrivacy.value) {
    registerErrorMsg.value =
      "Необходимо согласиться с СОД и политикой конфиденциальности";
    return;
  }

  registerLoading.value = true;
  try {
    await authStore.register(
      registerEmail.value.trim(),
      registerPassword.value,
      registerName.value,
      normalizedPhone
    );
    navigateTo("/");
  } catch (err) {
    const parsed = parseAppError(err);
    registerErrorMsg.value = parsed.message || "Ошибка регистрации";
  } finally {
    registerLoading.value = false;
  }
}
</script>
