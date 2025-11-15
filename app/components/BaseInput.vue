<template>
  <div class="w-full">
    <div v-if="title" class="label mb-0.5">
      <span class="label-text">{{ title }}</span>
    </div>
    <input
      :id="inputId"
      ref="inputRef"
      v-model="localValue"
      :name="title || undefined"
      :type="type"
      :placeholder="placeholder || ''"
      :required="required"
      class="input input-bordered w-full mb-2"
      :inputmode="type === 'tel' ? 'numeric' : undefined"
      :maxlength="type === 'tel' ? 18 : undefined"
      @beforeinput="handleBeforeInput"
      @paste="handlePaste"
      @input="handleInput"
      @blur="$emit('blur')"
    />
    <div v-if="errors?.length" class="label">
      <span class="label-text-alt text-error">{{ errors[0] }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  modelValue: { type: [String, Number], required: false, default: "" },
  title: { type: String, required: false, default: "" },
  type: { type: String, default: "text" },
  placeholder: { type: String, required: false, default: "" },
  required: { type: Boolean, default: false },
  errors: {
    type: Array as () => string[] | undefined,
    required: false,
    default: () => [],
  },
  prefix: { type: String, required: false, default: "" },
  immutablePrefix: { type: Boolean, default: false },
});
const emit = defineEmits(["update:modelValue", "blur"]);
const localValue = ref(props.modelValue as string | number | undefined);
const uid = Math.random().toString(36).slice(2, 9);
const inputId = computed(() => {
  const slug = (props.title || "input")
    .toLowerCase()
    .replace(/[^a-z0-9]+/gi, "-");
  return `${slug}-${uid}`;
});
const inputRef = ref<HTMLInputElement | null>(null);

watch(
  () => props.modelValue,
  (value) => {
    if (value !== localValue.value) {
      localValue.value = value as string | number | undefined;
      if (mask && typeof value === "string") {
        mask.value = value;
      }
    }
  }
);

interface MaskLike {
  value?: string;
  on?: (event: string, handler: () => void) => void;
  destroy?: () => void;
}

type IMaskFactory = (
  el: HTMLInputElement,
  opts: Record<string, unknown>
) => MaskLike;

let mask: MaskLike | null = null;
let keydownHandler: ((event: KeyboardEvent) => void) | null = null;

const formatPhone = (raw: string) => {
  const prefix = props.prefix || "+7";
  const prefixDigits = prefix.replace(/\D/g, "");
  let digits = raw.replace(/\D/g, "");
  if (digits.startsWith(prefixDigits)) {
    digits = digits.slice(prefixDigits.length);
  }
  const capped = digits.slice(0, 10);
  const a = capped.slice(0, 3);
  const b = capped.slice(3, 6);
  const c = capped.slice(6, 8);
  const d = capped.slice(8, 10);
  let formatted = prefix;
  if (a) {
    formatted += " (" + a;
    if (a.length === 3) {
      formatted += ")";
    }
  }
  if (b) {
    formatted += `${a.length === 3 ? " " : ""}${b}`;
  }
  if (c) {
    formatted += `-${c}`;
  }
  if (d) {
    formatted += `-${d}`;
  }
  return formatted;
};

const sanitizeLetters = (value: string) => value.replace(/[A-Za-zА-Яа-я]/g, "");

const syncMaskedValue = (value: string) => {
  let nextValue = value;
  if (props.type === "tel" && props.immutablePrefix) {
    nextValue = formatPhone(value || props.prefix || "+7");
  }
  localValue.value = nextValue;
  emit("update:modelValue", nextValue);
};

const handleBeforeInput = (event: InputEvent) => {
  if (props.type !== "tel") return;
  if (!event.data) return;
  if (!/\d/.test(event.data)) {
    event.preventDefault();
  }
};

const handlePaste = () => {
  if (props.type !== "tel" || !inputRef.value) return;
  requestAnimationFrame(() => {
    const el = inputRef.value as HTMLInputElement;
    const cleaned = sanitizeLetters(el.value);
    if (cleaned !== el.value) {
      el.value = cleaned;
      syncMaskedValue(cleaned);
    }
  });
};

const handleInput = () => {
  if (props.type === "tel" && !mask && typeof localValue.value === "string") {
    const sanitized = sanitizeLetters(localValue.value);
    if (sanitized !== localValue.value) {
      localValue.value = sanitized;
    }
  }
  emit("update:modelValue", localValue.value);
};

const setupMask = async () => {
  if (props.type !== "tel" || !inputRef.value) return;
  try {
    const IMask = (await import("imask")).default as unknown as IMaskFactory;
    mask = IMask(inputRef.value, {
      mask: "+{7} (000) 000-00-00",
      lazy: true,
    });
    mask.on?.("accept", () => {
      const value = String(mask?.value ?? "");
      syncMaskedValue(value);
      if (
        mask &&
        typeof localValue.value === "string" &&
        mask.value !== localValue.value
      ) {
        mask.value = localValue.value as string;
      }
    });

    if (props.immutablePrefix && props.prefix && inputRef.value) {
      const prefixLength = props.prefix.length;
      keydownHandler = (event: KeyboardEvent) => {
        const el = inputRef.value as HTMLInputElement;
        const cursor = el.selectionStart ?? 0;
        if (cursor > prefixLength) return;
        if (event.key === "Backspace" || event.key === "Delete") {
          event.preventDefault();
        }
      };
      inputRef.value.addEventListener(
        "keydown",
        keydownHandler as EventListener
      );
    }
  } catch {
    mask = null;
  }
};

onMounted(() => {
  if (
    props.type === "tel" &&
    props.immutablePrefix &&
    props.prefix &&
    !localValue.value
  ) {
    localValue.value = props.prefix;
    emit("update:modelValue", props.prefix);
  }
  setupMask();
});

onBeforeUnmount(() => {
  try {
    if (mask) mask.destroy?.();
    if (keydownHandler && inputRef.value) {
      inputRef.value.removeEventListener(
        "keydown",
        keydownHandler as EventListener
      );
    }
  } catch {
    /* ignore */
  } finally {
    mask = null;
    keydownHandler = null;
  }
});
</script>
