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

          <form v-if="activeTab === 'login'" novalidate class="space-y-6" @submit.prevent="login">
            <h2 class="text-2xl font-bold text-center">Вход в аккаунт</h2>
            <div v-if="loginErrorMsg" class="alert alert-error">{{ loginErrorMsg }}</div>

            <BaseInput v-model="loginEmail" title="Email" placeholder="your@email.com" type="email" />

            <BaseInput v-model="loginPassword" title="Пароль" placeholder="Введите пароль" type="password" />

            <div class="form-control">
              <button :disabled="loginLoading" class="btn btn-ghost border-2 border-base-content/20" type="submit">
                <span v-if="loginLoading" class="loading loading-spinner" />
                <span v-if="loginLoading">Входим...</span>
                <span v-else>Войти</span>
              </button>
            </div>
          </form>

          <form v-else novalidate class="space-y-6" @submit.prevent="register">
            <h2 class="text-2xl font-bold text-center">Регистрация</h2>
            <div v-if="registerErrorMsg" class="alert alert-error">{{ registerErrorMsg }}</div>

            <BaseInput v-model="registerName" title="Имя" placeholder="Ваше имя" type="text" required />
            <BaseInput v-model="registerPhone" title="Телефон" placeholder="+7XXXXXXXXXX" type="tel" required />
            <BaseInput v-model="registerEmail" title="Email" placeholder="your@email.com" type="email" required />
            <BaseInput v-model="registerPassword" title="Пароль" placeholder="Минимум 8 символов" type="password" required />
            <BaseInput v-model="registerConfirmPassword" title="Подтвердите пароль" placeholder="Повторите пароль" type="password" required />

            <div class="form-control">
              <label class="cursor-pointer label">
                <input v-model="agreeConsent" type="checkbox" class="checkbox mr-2">
                <span class="label-text">Согласен(а) на <NuxtLink class="ml-1 link" to="/consent">обработку персональных данных</NuxtLink></span>
              </label>
            </div>

            <div class="form-control">
              <label class="cursor-pointer label">
                <input v-model="agreePrivacy" type="checkbox" class="checkbox mr-2">
                <span class="label-text">Согласен(а) с <NuxtLink class="ml-1 link" to="/privacy">полиской конфиденциальности</NuxtLink></span>
              </label>
            </div>

            <div class="form-control">
              <button :disabled="registerLoading || !agreeConsent || !agreePrivacy" class="btn btn-ghost border-2 border-base-content/20" type="submit">
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
import BaseInput from '~/components/BaseInput.vue';
import { useAuth } from '~/composables/useAuth';
import { parseAppError } from '~/shared/services/app-error';
import { ref } from 'vue';

const { login: authLogin, register: authRegister } = useAuth();

const activeTab = ref<'login'|'register'>('login');

// login form
const loginEmail = ref('');
const loginPassword = ref('');
const loginErrorMsg = ref('');
const loginLoading = ref(false);

// register
const registerEmail = ref('');
const registerPassword = ref('');
const registerConfirmPassword = ref('');
const registerErrorMsg = ref('');
const registerLoading = ref(false);
const registerName = ref('');
const registerPhone = ref('');
const agreeConsent = ref(false);
const agreePrivacy = ref(false);

function setActiveTab(tab: 'login' | 'register') {
  activeTab.value = tab;
  loginErrorMsg.value = '';
  registerErrorMsg.value = '';
}

async function login() {
  loginErrorMsg.value = '';
  loginLoading.value = true;
  try {
    await authLogin(loginEmail.value, loginPassword.value);
    // redirect to home
    navigateTo('/');
  } catch (err) {
    const parsed = parseAppError(err);
    loginErrorMsg.value = parsed.message || 'Неверный email или пароль';
  } finally {
    loginLoading.value = false;
  }
}

function normalizePhone(input: string) {
  let digits = input.replace(/\D/g, '');
  if (digits.length === 11 && digits.startsWith('8')) digits = '7' + digits.slice(1);
  return digits ? '+' + digits : '';
}

async function register() {
  registerErrorMsg.value = '';

  if (registerPassword.value !== registerConfirmPassword.value) {
    registerErrorMsg.value = 'Пароли не совпадают';
    return;
  }

  const email = registerEmail.value.trim();
  if (!email) {
    registerErrorMsg.value = 'Введите email';
    return;
  }
  const emailRegex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
  if (!emailRegex.test(email)) {
    registerErrorMsg.value = 'Некорректный email';
    return;
  }

  if (registerPassword.value.length < 8) {
    registerErrorMsg.value = 'Пароль должен содержать минимум 8 символов';
    return;
  }
  if (!registerName.value.trim()) {
    registerErrorMsg.value = 'Введите ваше имя';
    return;
  }

  const normalizedPhone = normalizePhone(registerPhone.value);
  const phoneRegex = /^\+7\d{10}$/;
  if (!phoneRegex.test(normalizedPhone)) {
    registerErrorMsg.value = 'Номер должен быть в формате +7XXXXXXXXXX';
    return;
  }

  if (!agreeConsent.value || !agreePrivacy.value) {
    registerErrorMsg.value = 'Необходимо согласиться с СОД и политикой конфиденциальности';
    return;
  }

  registerLoading.value = true;
  try {
    await authRegister(email, registerPassword.value, registerName.value, normalizedPhone);
    navigateTo('/');
  } catch (err) {
    const parsed = parseAppError(err);
    registerErrorMsg.value = parsed.message || 'Ошибка регистрации';
  } finally {
    registerLoading.value = false;
  }
}
</script>
