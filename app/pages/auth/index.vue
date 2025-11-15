<template>
  <div class="container mx-auto px-4 py-8">
    <div class="max-w-md mx-auto">
      <div class="card bg-base-100 shadow-xl">
        <div class="card-body">
          <div role="tablist" class="tabs tabs-box mb-6">
            <button
              role="tab"
              class="tab"
              :class="{ 'tab-active': activeTab === 'login' }"
              type="button"
              @click="setActiveTab('login')"
            >
              Вход
            </button>
            <button
              role="tab"
              class="tab"
              :class="{ 'tab-active': activeTab === 'register' }"
              type="button"
              @click="setActiveTab('register')"
            >
              Регистрация
            </button>
          </div>

          <form
            v-if="activeTab === 'login'"
            novalidate
            class="space-y-6"
            @submit.prevent="login"
          >
            <h2 class="text-2xl font-bold text-center">Вход в аккаунт</h2>
            <div v-if="loginErrorMsg" class="alert alert-soft alert-error">
              {{ loginErrorMsg }}
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

            <div class="form-control">
              <button
                :disabled="loginLoading"
                class="btn btn-ghost border-2 border-base-content/20"
                type="submit"
              >
                <span v-if="loginLoading" class="loading loading-spinner" />
                <span v-if="loginLoading">Входим...</span>
                <span v-else>Войти</span>
              </button>
            </div>
          </form>

          <form v-else novalidate class="space-y-6" @submit.prevent="register">
            <h2 class="text-2xl font-bold text-center">Регистрация</h2>
            <div v-if="registerErrorMsg" class="alert alert-soft alert-error">
              {{ registerErrorMsg }}
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

            <div class="form-control">
              <label class="cursor-pointer label">
                <input
                  v-model="agreeConsent"
                  type="checkbox"
                  class="checkbox mr-2"
                >
                <span class="label-text"
                  >Согласен(а) на
                  <NuxtLink class="ml-1 link" to="/consent"
                    >обработку персональных данных</NuxtLink
                  ></span
                >
              </label>
            </div>

            <div class="form-control">
              <label class="cursor-pointer label">
                <input
                  v-model="agreePrivacy"
                  type="checkbox"
                  class="checkbox mr-2"
                >
                <span class="label-text"
                  >Согласен(а) с
                  <NuxtLink class="ml-1 link" to="/privacy"
                    >полиской конфиденциальности</NuxtLink
                  ></span
                >
              </label>
            </div>

            <div class="form-control">
              <button
                :disabled="registerLoading || !agreeConsent || !agreePrivacy"
                class="btn btn-ghost border-2 border-base-content/20"
                type="submit"
              >
                <span v-if="registerLoading" class="loading loading-spinner" />
                <span v-if="registerLoading">Регистрируем...</span>
                <span v-else>Зарегистрироваться</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { parseAppError } from "~/shared/services/app-error";

const {
  login: authLogin,
  register: authRegister,
  user,
  initialized,
  check,
} = useAuth();

if (!initialized.value) {
  await check();
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
    await authLogin(loginEmail.value, loginPassword.value);
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
    await authRegister(
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
