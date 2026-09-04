<script setup lang="ts">
import type { Verdict } from "@/api/types";
import { SIGNAL_FILTERS } from "@/lib/signals";

defineProps<{ counts: Partial<Record<Verdict, number>>; modelValue: Verdict | null }>();
const emit = defineEmits<{ (e: "update:modelValue", value: Verdict | null): void }>();

function pick(label: Verdict, current: Verdict | null) {
  emit("update:modelValue", current === label ? null : label);
}
</script>

<template>
  <div class="summary-strip">
    <button
      v-for="s in SIGNAL_FILTERS"
      :key="s.label"
      class="chip"
      :class="{ active: modelValue === s.label }"
      @click="pick(s.label, modelValue)"
    >
      <span class="icon" :style="{ color: s.color }">{{ s.icon }}</span>
      {{ s.label }}
      <span class="n">{{ counts[s.label] || 0 }}</span>
    </button>
  </div>
</template>

<style scoped>
.summary-strip {
  display: none;
}
@media (max-width: 1023px) {
  .summary-strip {
    display: flex;
    align-items: center;
    gap: 16px;
    overflow-x: auto;
    min-height: 44px;
    padding: 8px 0;
    margin-top: 8px;
    border-bottom: 1px solid var(--rule-soft);
  }
}
.chip {
  flex: none;
  height: 36px;
  padding: 0 12px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border: 0;
  border-radius: 18px;
  background: transparent;
  cursor: pointer;
  font-size: 12.5px;
  color: var(--ink2);
  white-space: nowrap;
  font-weight: 400;
}
.chip.active {
  background: var(--tint);
  font-weight: 600;
}
.icon {
  font-size: 10px;
}
.n {
  font: 500 12px "IBM Plex Mono", monospace;
  color: var(--ink);
}
</style>
