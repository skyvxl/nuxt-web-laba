<template>
  <div class="space-y-6">
    <header
      class="rounded-2xl bg-base-100 shadow-xl p-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
    >
      <div>
        <p class="text-sm text-base-content/70">Панель управления</p>
        <h1 class="text-3xl font-bold">Каталог товаров</h1>
      </div>
      <div class="flex gap-2">
        <button
          class="btn btn-ghost border border-base-content/20"
          @click="resetForm"
        >
          Создать новый товар
        </button>
        <NuxtLink to="/" class="btn btn-outline">Вернуться на сайт</NuxtLink>
      </div>
    </header>

    <div class="grid gap-6 xl:grid-cols-2">
      <section class="card bg-base-100 shadow-xl">
        <div class="card-body">
          <div class="flex items-center justify-between gap-4 mb-4">
            <div>
              <h2 class="card-title text-xl">Список товаров</h2>
              <p class="text-sm text-base-content/70">
                Выберите товар для редактирования или удалите его.
              </p>
            </div>
            <span
              v-if="pending"
              class="loading loading-spinner"
              aria-label="Загрузка"
            />
          </div>

          <div v-if="fetchError" class="alert alert-error mb-4">
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
                <tr v-if="!pending && !products.length">
                  <td colspan="4" class="text-center py-6 text-base-content/70">
                    Пока нет товаров. Создайте первый!
                  </td>
                </tr>
                <tr v-for="product in products" :key="product.id">
                  <td class="font-semibold">{{ product.name }}</td>
                  <td>{{ product.category }}</td>
                  <td class="text-right">
                    {{ formatPrice(product.price) }}
                    <span
                      v-if="product.oldPrice"
                      class="block text-xs text-base-content/70 line-through"
                    >
                      {{ formatPrice(product.oldPrice) }}
                    </span>
                  </td>
                  <td class="w-32 text-right space-x-2">
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

      <section class="card bg-base-100 shadow-xl">
        <div class="card-body space-y-4">
          <div class="flex items-center justify-between">
            <div>
              <h2 class="card-title text-xl">
                {{ isEditing ? "Изменение товара" : "Создание товара" }}
              </h2>
              <p class="text-sm text-base-content/70">
                Заполните форму и сохраните изменения.
              </p>
            </div>
            <div
              class="badge"
              :class="isEditing ? 'badge-primary' : 'badge-secondary'"
            >
              {{ isEditing ? "Редактирование" : "Новый товар" }}
            </div>
          </div>

          <div
            v-if="formStatus"
            class="alert"
            :class="
              formStatus.type === 'error' ? 'alert-error' : 'alert-success'
            "
          >
            <span>{{ formStatus.message }}</span>
          </div>

          <form class="space-y-4" @submit.prevent="submitForm">
            <div class="grid gap-4 lg:grid-cols-2">
              <label class="form-control">
                <span class="label-text">Название*</span>
                <input
                  v-model="form.name"
                  type="text"
                  class="input input-bordered"
                  required
                />
              </label>
              <label class="form-control">
                <span class="label-text">Категория*</span>
                <input
                  v-model="form.category"
                  type="text"
                  class="input input-bordered"
                  required
                />
              </label>
              <label class="form-control">
                <span class="label-text">Цена*</span>
                <input
                  v-model="form.price"
                  type="number"
                  step="0.01"
                  class="input input-bordered"
                  required
                />
              </label>
              <label class="form-control">
                <span class="label-text">Старая цена</span>
                <input
                  v-model="form.oldPrice"
                  type="number"
                  step="0.01"
                  class="input input-bordered"
                />
              </label>
            </div>

            <label class="form-control">
              <span class="label-text">Ссылка на изображение*</span>
              <input
                v-model="form.image"
                type="url"
                class="input input-bordered"
                required
              />
            </label>

            <label class="form-control">
              <span class="label-text">Короткое описание*</span>
              <input
                v-model="form.shortDescription"
                type="text"
                class="input input-bordered"
                required
              />
            </label>

            <label class="form-control">
              <span class="label-text">Полное описание*</span>
              <textarea
                v-model="form.description"
                class="textarea textarea-bordered"
                rows="4"
                required
              />
            </label>

            <div class="grid gap-4 lg:grid-cols-2">
              <label class="form-control">
                <span class="label-text"
                  >Особенности (каждая с новой строки)</span
                >
                <textarea
                  v-model="form.featuresRaw"
                  class="textarea textarea-bordered"
                  rows="4"
                  placeholder="Быстрая зарядка&#10;AMOLED экран"
                />
              </label>
              <label class="form-control">
                <span class="label-text"
                  >Характеристики (формат ключ: значение)</span
                >
                <textarea
                  v-model="form.characteristicsRaw"
                  class="textarea textarea-bordered"
                  rows="4"
                  placeholder="Экран: 6.1&#10;Память: 256 ГБ"
                />
              </label>
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
                @click="resetForm"
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
import { computed, reactive, ref } from "vue";
import type { Product } from "~/shared/models/product";
import { useAuth } from "~/composables/useAuth";

definePageMeta({ layout: "admin" });

const { user, initialized, check } = useAuth();
if (!initialized.value) {
  await check();
}
if (!user.value) {
  await navigateTo("/auth");
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

interface ProductFormState {
  id: string | null;
  name: string;
  category: string;
  price: string;
  oldPrice: string;
  image: string;
  shortDescription: string;
  description: string;
  featuresRaw: string;
  characteristicsRaw: string;
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
  featuresRaw: "",
  characteristicsRaw: "",
});

const form = reactive<ProductFormState>(createEmptyForm());
const saving = ref(false);
const formStatus = ref<{ type: "success" | "error"; message: string } | null>(
  null
);

const isEditing = computed(() => Boolean(form.id));

function resetForm() {
  Object.assign(form, createEmptyForm());
  formStatus.value = null;
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
  form.featuresRaw = (product.features || []).join("\n");
  form.characteristicsRaw = Object.entries(product.characteristics || {})
    .map(([key, value]) => `${key}: ${value}`)
    .join("\n");
  formStatus.value = null;
}

function parseFeatures(raw: string): string[] {
  return raw
    .split(/\r?\n/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseCharacteristics(raw: string): Record<string, string> {
  const entries: Record<string, string> = {};
  raw.split(/\r?\n/).forEach((line) => {
    const idx = line.indexOf(":");
    if (idx === -1) return;
    const key = line.slice(0, idx).trim();
    const value = line.slice(idx + 1).trim();
    if (key && value) {
      entries[key] = value;
    }
  });
  return entries;
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
  return {
    name: form.name.trim(),
    category: form.category.trim(),
    price: priceNumber,
    oldPrice: oldPriceNumber,
    image: form.image.trim(),
    shortDescription: form.shortDescription.trim(),
    description: form.description.trim(),
    features: parseFeatures(form.featuresRaw),
    characteristics: parseCharacteristics(form.characteristicsRaw),
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
      resetForm();
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
</script>
