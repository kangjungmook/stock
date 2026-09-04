<script setup lang="ts">
import type { Timeframe } from "@/api/types";

const TFS: Timeframe[] = ["1분", "15분", "1시간", "4시간", "일", "주", "월"];

defineProps<{ modelValue: Timeframe }>();
const emit = defineEmits<{ (e: "update:modelValue", v: Timeframe): void }>();
</script>

<template>
  <div class="tfs">
    <button
      v-for="tf in TFS"
      :key="tf"
      class="tf-btn"
      :class="{ active: modelValue === tf }"
      @click="emit('update:modelValue', tf)"
    >
      {{ tf }}
    </button>
  </div>
</template>

<style scoped>
.tfs {
  display: flex;
  gap: 2px;
  flex-wrap: wrap;
}
.tf-btn {
  height: 36px;
  min-width: 44px;
  padding: 0 10px;
  border: 0;
  border-radius: 4px;
  background: transparent;
  color: var(--ink3);
  font-size: 12.5px;
  font-weight: 400;
  cursor: pointer;
  transition: background 140ms ease;
}
.tf-btn:hover {
  background: var(--tint);
}
.tf-btn.active {
  background: var(--tint);
  color: var(--ink);
  font-weight: 600;
}
</style>
