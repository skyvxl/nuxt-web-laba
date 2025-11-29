<template>
  <div class="space-y-6">
    <header
      class="rounded-2xl bg-base-100 p-6 shadow-xl flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between"
    >
      <div>
        <p class="text-sm text-base-content/70">Каталог</p>
        <h1 class="text-3xl font-bold">Управление товарами</h1>
        <p class="text-sm text-base-content/70">
          Фильтруйте список, редактируйте товары и создавайте новые позиции.
        </p>
      </div>
      <div class="flex flex-col gap-3 sm:flex-row sm:items-center">
        <label class="input input-bordered flex items-center gap-2 min-w-0">
          <Icon name="ph:magnifying-glass" class="h-4 w-4 opacity-60" />
          <input
            v-model="searchQuery"
            type="search"
            class="grow"
            placeholder="Поиск по названию или категории"
          >
        </label>
        <button class="btn btn-primary shrink-0" @click="resetForm()">
          + Новый товар
        </button>
      </div>
    </header>

    <div class="grid gap-6 xl:grid-cols-2">
      <section class="card bg-base-100 shadow-xl">
        <div class="card-body">
          <div class="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div>
              <h2 class="card-title text-xl">Список товаров</h2>
              <p class="text-sm text-base-content/70">
                Доступно {{ filteredProducts.length }} из
                {{ products.length }} записей.
              </p>
            </div>
            <span
              v-if="pending"
              class="loading loading-spinner"
              aria-label="Загрузка"
            />
          </div>

          <div v-if="fetchError" class="alert alert-soft alert-error mb-4">
            <span>{{ fetchError }}</span>
          </div>

          <div class="overflow-x-auto">
            <table class="table">
              <thead>
                <tr>
                  <th>Название</th>
                  <th>Категория</th>
                  <th class="text-right">Цена</th>
                  <th aria-label="Действия" />
                </tr>
              </thead>
              <tbody>
                <tr v-if="!pending && !filteredProducts.length">
                  <td colspan="4" class="text-center py-6 text-base-content/70">
                    По запросу ничего не найдено.
                  </td>
                </tr>
                <tr v-for="product in filteredProducts" :key="product.id">
                  <td class="font-semibold">{{ product.name }}</td>
                  <td class="text-base-content/80">{{ product.category }}</td>
                  <td class="text-right">
                    {{ formatPrice(product.price) }}
                    <span
                      v-if="product.oldPrice"
                      class="block text-xs text-base-content/60 line-through"
                    >
                      {{ formatPrice(product.oldPrice) }}
                    </span>
                  </td>
                  <td class="w-40 text-right space-x-2">
                    <button class="btn btn-xs" @click="startEdit(product)">
                      Изменить
                    </button>
                    <button
                      class="btn btn-xs btn-error"
                      @click="removeProduct(product.id)"
                    >
                      Удалить
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section id="create" class="card bg-base-100 shadow-xl">
        <div class="card-body space-y-4">
          <div
            class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <h2 class="card-title text-xl">
                {{ isEditing ? "Изменение товара" : "Создание товара" }}
              </h2>
              <p class="text-sm text-base-content/70">
                Заполните форму и сохраните изменения.
              </p>
              <p
                v-if="isEditing && form.name"
                class="text-xs text-base-content/60"
              >
                Сейчас редактируется: {{ form.name }}
              </p>
            </div>
            <div class="flex items-center gap-3">
              <div
                class="badge"
                :class="isEditing ? 'badge-primary' : 'badge-secondary'"
              >
                {{ isEditing ? "Редактирование" : "Новый товар" }}
              </div>
              <button
                v-if="isEditing"
                type="button"
                class="btn btn-sm btn-ghost text-error"
                @click="cancelEditing"
              >
                Отменить редактирование
              </button>
            </div>
          </div>

          <div
            v-if="formStatus"
            class="alert alert-soft"
            :class="{
              'alert-error': formStatus.type === 'error',
              'alert-success': formStatus.type === 'success',
              'alert-info': formStatus.type === 'info',
            }"
          >
            <span>{{ formStatus.message }}</span>
          </div>

          <form class="space-y-6" @submit.prevent="submitForm">
            <div class="grid gap-4 md:grid-cols-2">
              <label class="form-control">
                <span class="label-text">Название*</span>
                <input
                  v-model="form.name"
                  type="text"
                  class="input input-bordered w-full"
                  required
                >
              </label>
              <label class="form-control">
                <span class="label-text">Категория*</span>
                <input
                  v-model="form.category"
                  type="text"
                  class="input input-bordered w-full"
                  required
                >
              </label>
              <label class="form-control">
                <span class="label-text">Цена*</span>
                <input
                  v-model="form.price"
                  type="number"
                  step="0.01"
                  class="input input-bordered w-full"
                  required
                >
              </label>
              <label class="form-control">
                <span class="label-text">Старая цена</span>
                <input
                  v-model="form.oldPrice"
                  type="number"
                  step="0.01"
                  class="input input-bordered w-full"
                >
              </label>
            </div>

            <div class="grid gap-4 md:grid-cols-2">
              <label class="form-control">
                <span class="label-text">Ссылка на изображение*</span>
                <input
                  v-model="form.image"
                  type="url"
                  class="input input-bordered w-full"
                  required
                >
              </label>
              <label class="form-control">
                <span class="label-text">Короткое описание*</span>
                <input
                  v-model="form.shortDescription"
                  type="text"
                  class="input input-bordered w-full"
                  required
                >
              </label>
            </div>

            <label class="form-control">
              <span class="label-text">Полное описание*</span>
              <textarea
                v-model="form.description"
                class="textarea textarea-bordered w-full"
                rows="5"
                required
              />
            </label>

            <div class="grid gap-6 lg:grid-cols-2">
              <div class="space-y-3">
                <span class="label-text font-semibold">Особенности</span>
                <p class="text-sm text-base-content/60">
                  Добавляйте короткие тезисы, которые продают товар.
                </p>
                <div class="flex flex-wrap gap-3">
                  <input
                    v-model="newFeature"
                    type="text"
                    class="input input-bordered flex-1 min-w-[200px]"
                    placeholder="Например, Быстрая зарядка"
                  >
                  <button
                    type="button"
                    class="btn btn-secondary"
                    :disabled="!newFeature.trim()"
                    @click="addFeature"
                  >
                    Добавить
                  </button>
                </div>
                <ul v-if="form.features.length" class="space-y-2">
                  <li
                    v-for="(feature, index) in form.features"
                    :key="`feature-${index}`"
                    class="flex items-center gap-2 rounded-xl border border-base-content/10 bg-base-200/50 px-3 py-2"
                  >
                    <input
                      v-model="form.features[index]"
                      type="text"
                      class="input input-sm flex-1 border-none bg-transparent focus:border-base-content/30 focus:outline-none"
                      :placeholder="`Особенность ${index + 1}`"
                    >
                    <button
                      type="button"
                      class="btn btn-xs btn-ghost text-error"
                      aria-label="Удалить особенность"
                      @click="removeFeature(index)"
                    >
                      <Icon name="ph:x" class="h-4 w-4" />
                    </button>
                  </li>
                </ul>
                <p v-else class="text-sm text-base-content/60">
                  Пока нет особенностей — добавьте первую.
                </p>
              </div>

              <div class="space-y-3">
                <div class="flex items-center justify-between">
                  <div>
                    <span class="label-text font-semibold">Характеристики</span>
                    <p class="text-sm text-base-content/60">
                      Строки вида «ключ — значение».
                    </p>
                  </div>
                  <button
                    type="button"
                    class="btn btn-sm"
                    @click="addCharacteristicRow"
                  >
                    + Добавить
                  </button>
                </div>
                <div v-if="form.characteristics.length" class="space-y-3">
                  <div
                    v-for="(row, index) in form.characteristics"
                    :key="`characteristic-${index}`"
                    class="flex flex-wrap gap-2 rounded-xl border border-base-content/10 bg-base-200/50 px-3 py-3"
                  >
                    <input
                      v-model="row.key"
                      type="text"
                      class="input input-sm flex-1 min-w-[140px]"
                      placeholder="Ключ"
                    >
                    <input
                      v-model="row.value"
                      type="text"
                      class="input input-sm flex-1 min-w-[140px]"
                      placeholder="Значение"
                    >
                    <button
                      type="button"
                      class="btn btn-xs btn-ghost text-error"
                      aria-label="Удалить характеристику"
                      @click="removeCharacteristicRow(index)"
                    >
                      Удалить
                    </button>
                  </div>
                </div>
                <p v-else class="text-sm text-base-content/60">
                  Пока нет характеристик — нажмите «Добавить».
                </p>
              </div>
            </div>

            <div class="flex flex-wrap gap-3">
              <button class="btn" :disabled="saving" type="submit">
                <span
                  v-if="saving"
                  class="loading loading-spinner loading-sm"
                />
                {{ isEditing ? "Сохранить изменения" : "Создать товар" }}
              </button>
              <button
                class="btn btn-ghost"
                type="button"
                :disabled="saving"
                @click="resetForm()"
              >
                Сбросить
              </button>
            </div>
          </form>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Product } from "~/shared/models/product";

interface CharacteristicRow {
  key: string;
  value: string;
}

const requireAuth = () => {
  const authCookie = useCookie<string | null>("auth");
  if (!authCookie.value) {
    return navigateTo("/auth");
  }
};

definePageMeta({ layout: "admin", middleware: requireAuth });

const route = useRoute();
const authStore = useAuthStore();

if (!authStore.initialized) {
  await authStore.check();
}

const {
  data: productsData,
  pending,
  refresh: refreshProducts,
  error,
} = await useAsyncData("admin-products", () => $fetch("/api/products"));

const products = computed(
  () => (productsData.value?.products as Product[]) || []
);
const fetchError = computed(
  () => error.value?.message || error.value?.statusMessage
);

const searchQuery = ref("");
const filteredProducts = computed(() => {
  const query = searchQuery.value.trim().toLowerCase();
  if (!query) {
    return products.value;
  }
  return products.value.filter((product) => {
    const name = String(product.name ?? "").toLowerCase();
    const category = String(product.category ?? "").toLowerCase();
    return name.includes(query) || category.includes(query);
  });
});

interface ProductFormState {
  id: string | null;
  name: string;
  category: string;
  price: string;
  oldPrice: string;
  image: string;
  shortDescription: string;
  description: string;
  features: string[];
  characteristics: CharacteristicRow[];
}

const createEmptyForm = (): ProductFormState => ({
  id: null,
  name: "",
  category: "",
  price: "",
  oldPrice: "",
  image: "",
  shortDescription: "",
  description: "",
  features: [],
  characteristics: [{ key: "", value: "" }],
});

const form = reactive<ProductFormState>(createEmptyForm());
const newFeature = ref("");
const saving = ref(false);
type FormStatus = { type: "success" | "error" | "info"; message: string };
const formStatus = ref<FormStatus | null>(null);

const isEditing = computed(() => Boolean(form.id));
const formSectionId = "create";

const scrollToForm = () => {
  if (!import.meta.client) return;
  nextTick(() => {
    document.getElementById(formSectionId)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  });
};

function resetForm(options?: { keepStatus?: boolean }) {
  Object.assign(form, createEmptyForm());
  newFeature.value = "";
  if (!options?.keepStatus) {
    formStatus.value = null;
  }
  scrollToForm();
}

function cancelEditing() {
  resetForm({ keepStatus: true });
  formStatus.value = { type: "info", message: "Редактирование отменено" };
}

function addFeature() {
  const value = newFeature.value.trim();
  if (!value) return;
  form.features.push(value);
  newFeature.value = "";
}

function removeFeature(index: number) {
  form.features.splice(index, 1);
}

function addCharacteristicRow() {
  form.characteristics.push({ key: "", value: "" });
}

function removeCharacteristicRow(index: number) {
  form.characteristics.splice(index, 1);
  if (!form.characteristics.length) {
    form.characteristics.push({ key: "", value: "" });
  }
}

function startEdit(product: Product) {
  form.id = product.id;
  form.name = String(product.name ?? "");
  form.category = String(product.category ?? "");
  form.price = String(product.price ?? "");
  form.oldPrice = product.oldPrice ? String(product.oldPrice) : "";
  form.image = String(product.image ?? "");
  form.shortDescription = String(product.shortDescription ?? "");
  form.description = String(product.description ?? "");
  form.features = (product.features || []).map((feature) =>
    String(feature ?? "")
  );
  const characteristicEntries = Object.entries(product.characteristics || {})
    .map(([key, value]) => ({
      key: String(key ?? ""),
      value: String(value ?? ""),
    }))
    .filter((item) => item.key || item.value);
  form.characteristics = characteristicEntries.length
    ? characteristicEntries
    : [{ key: "", value: "" }];
  formStatus.value = null;
  scrollToForm();
}

function formatPrice(value?: number | null) {
  if (value === undefined || value === null) return "—";
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    maximumFractionDigits: 0,
  }).format(value);
}

function buildPayload() {
  const priceNumber = Number(form.price);
  if (!Number.isFinite(priceNumber)) {
    throw new Error("Укажите корректную цену");
  }
  const oldPriceNumber = form.oldPrice ? Number(form.oldPrice) : null;
  if (form.oldPrice && !Number.isFinite(oldPriceNumber)) {
    throw new Error("Укажите корректную старую цену");
  }
  const features = form.features.map((item) => item.trim()).filter(Boolean);
  const characteristicsEntries = form.characteristics
    .map((row) => ({ key: row.key.trim(), value: row.value.trim() }))
    .filter((row) => row.key && row.value);
  const characteristics: Record<string, string> = {};
  characteristicsEntries.forEach((row) => {
    characteristics[row.key] = row.value;
  });
  return {
    name: form.name.trim(),
    category: form.category.trim(),
    price: priceNumber,
    oldPrice: oldPriceNumber,
    image: form.image.trim(),
    shortDescription: form.shortDescription.trim(),
    description: form.description.trim(),
    features,
    characteristics,
  };
}

async function submitForm() {
  formStatus.value = null;
  try {
    const payload = buildPayload();
    if (
      !payload.name ||
      !payload.category ||
      !payload.image ||
      !payload.shortDescription ||
      !payload.description
    ) {
      throw new Error("Заполните обязательные поля");
    }

    saving.value = true;
    if (form.id) {
      await $fetch(`/api/products/${form.id}`, {
        method: "PUT",
        body: payload,
      });
      formStatus.value = { type: "success", message: "Товар обновлен" };
    } else {
      await $fetch("/api/products", {
        method: "POST",
        body: payload,
      });
      formStatus.value = { type: "success", message: "Товар создан" };
      resetForm({ keepStatus: true });
    }
    await refreshProducts();
  } catch (error) {
    const message =
      (error as { statusMessage?: string; message?: string })?.statusMessage ||
      (error as Error)?.message ||
      "Не удалось сохранить";
    formStatus.value = { type: "error", message };
  } finally {
    saving.value = false;
  }
}

async function removeProduct(id: string) {
  if (saving.value) return;
  if (import.meta.client) {
    if (!window.confirm("Удалить этот товар?")) {
      return;
    }
  }
  try {
    saving.value = true;
    await $fetch(`/api/products/${id}`, { method: "DELETE" });
    if (form.id === id) {
      resetForm();
    }
    await refreshProducts();
  } catch (error) {
    const message =
      (error as { statusMessage?: string; message?: string })?.statusMessage ||
      (error as Error)?.message ||
      "Не удалось удалить";
    formStatus.value = { type: "error", message };
  } finally {
    saving.value = false;
  }
}

watch(
  () => route.hash,
  (hash) => {
    if (hash === "#create") {
      resetForm();
    }
  },
  { immediate: true }
);
</script>
