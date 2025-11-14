<template>
  <div class="w-full">
    <div v-if="title" class="label mb-0.5">
      <span class="label-text">{{ title }}</span>
    </div>
    <input
      :id="title || undefined"
      v-model="localValue"
      :name="title || undefined"
      :type="type"
      :placeholder="placeholder || ''"
      :required="required"
      class="input input-bordered w-full mb-2"
      :inputmode="type === 'tel' ? 'tel' : undefined"
      :maxlength="type === 'tel' ? 20 : undefined"
      @input="$emit('update:modelValue', localValue)"
    >
    <div v-if="errors?.length" class="label">
      <span class="label-text-alt text-error">{{ errors[0] }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount } from 'vue';

const props = defineProps({
  modelValue: { type: [String, Number], required: false, default: '' },
  title: { type: String, required: false, default: '' },
  type: { type: String, default: 'text' },
  placeholder: { type: String, required: false, default: '' },
  required: { type: Boolean, default: false },
  errors: { type: Array as () => string[] | undefined, required: false, default: () => [] },
  prefix: { type: String, required: false, default: '' },
  immutablePrefix: { type: Boolean, default: false },
});
const emit = defineEmits(['update:modelValue']);
const localValue = ref(props.modelValue as string | number | undefined);

// keep localValue in sync with prop
watch(
  () => props.modelValue,
  (v) => {
    if (v !== localValue.value) localValue.value = v as unknown as string | number | undefined;
  },
);

// IMask: minimal interface to avoid `any`
interface MaskLike {
  value?: string;
  on?: (event: string, handler: () => void) => void;
  destroy?: () => void;
}

// IMask factory type
type IMaskFactory = (el: HTMLInputElement, opts: Record<string, unknown>) => MaskLike;

// IMask instance
let mask: MaskLike | null = null;
onMounted(async () => {
  if (props.type === 'tel') {
    try {
    const IMask = (await import('imask')).default as unknown as IMaskFactory;
      const el = (document.getElementById(props.title || '') || null) as HTMLInputElement | null;
      // If there's no matched element, try to find input by class
      const inputEl = el ?? document.querySelector('input[type=tel]') ?? null;
      if (inputEl) {
        mask = IMask(inputEl as HTMLInputElement, {
          mask: props.prefix === '+7' ? '+{7} (000) 000-00-00' : '+{7} (000) 000-00-00',
          lazy: true,
        });

        mask.on?.('accept', () => {
          const m = mask as MaskLike;
          const v = String(m.value ?? '');
          // if immutable prefix required, ensure prefix present
          if (props.immutablePrefix && props.prefix) {
            if (!v.startsWith(props.prefix)) {
              m.value = props.prefix + v;
              localValue.value = m.value;
              return;
            }
          }
          localValue.value = v;
          // emit synchronization
          emit('update:modelValue', localValue.value);
        });
      }
    } catch {
      // imask not available or failed - ignore (silent fallback)
    }
  }
});

onBeforeUnmount(() => {
  try {
    if (mask) mask.destroy?.();
  } catch {
    /* nothing */
  }
});
</script>
