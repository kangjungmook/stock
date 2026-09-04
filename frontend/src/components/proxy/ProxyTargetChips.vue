<script setup lang="ts">
import type { ProxyCoverageRow } from "@/api/types";

defineProps<{
  targets: (ProxyCoverageRow & { label: string })[];
  modelValue: string;
}>();
const emit = defineEmits<{ (e: "update:modelValue", v: string): void }>();
</script>

<template>
  <div class="chips">
    <button
      v-for="t in targets"
      :key="t.ticker"
      class="chip"
      :class="{ active: modelValue === t.ticker }"
      @click="emit('update:modelValue', t.ticker)"
    >
      {{ t.label }}
      <span v-if="t.quality === 'low'" class="low-icon">◈</span>
    </button>
  </div>
</template>

<style scoped>
.chips {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 24px;
}
.chip {
  height: 40px;
  padding: 0 14px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border: 1px solid var(--rule);
  border-radius: 20px;
  background: transparent;
  color: var(--ink2);
  font-size: 13px;
  font-weight: 400;
  cursor: pointer;
  transition: background 140ms ease;
}
.chip:hover {
  background: var(--tint);
}
.chip.active {
  border-color: var(--brand-soft);
  background: var(--tint);
  color: var(--ink);
  font-weight: 600;
}
.low-icon {
  font-size: 10px;
  color: var(--watch);
}
</style>
