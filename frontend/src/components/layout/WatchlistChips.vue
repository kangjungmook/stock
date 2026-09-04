<script setup lang="ts">
import { ref } from "vue";
import { useWatchlist } from "@/composables/useWatchlist";
import { useSecurityNames } from "@/composables/useSecurityNames";

const { list, remove, reorder } = useWatchlist();
const { nameOf } = useSecurityNames();
const dragFrom = ref<number | null>(null);

function onDrop(index: number) {
  if (dragFrom.value !== null) reorder(dragFrom.value, index);
  dragFrom.value = null;
}
</script>

<template>
  <div class="chip-row">
    <span
      v-for="(ticker, i) in list"
      :key="ticker"
      class="chip"
      :class="{ dragging: dragFrom === i }"
      draggable="true"
      @dragstart="dragFrom = i"
      @dragover.prevent
      @drop.prevent="onDrop(i)"
      @dragend="dragFrom = null"
    >
      <span class="handle" aria-hidden="true">⠿</span>
      <span>{{ nameOf(ticker) }}</span>
      <button class="remove" aria-label="관심종목에서 빼기" @click="remove(ticker)">×</button>
    </span>
    <span v-if="list.length" class="meta">{{ list.length }}개 · 이 브라우저에만 저장됩니다 · 드래그로 순서 변경</span>
  </div>
</template>

<style scoped>
.chip-row {
  display: flex;
  gap: 8px;
  margin-top: 12px;
  flex-wrap: wrap;
  align-items: center;
}
.chip {
  height: 36px;
  padding: 0 6px 0 10px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border-radius: 18px;
  background: var(--tint);
  font-size: 13px;
  cursor: grab;
  transition: opacity 140ms ease;
}
.chip.dragging {
  opacity: 0.45;
}
.handle {
  font-size: 10px;
  color: var(--ink3);
  letter-spacing: -1px;
}
.remove {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: 0;
  border-radius: 12px;
  cursor: pointer;
  color: var(--ink3);
  font-size: 14px;
  line-height: 1;
  transition: background 140ms ease, color 140ms ease;
}
.remove:hover {
  background: var(--down-bg);
  color: var(--down);
}
.meta {
  font-size: 12px;
  color: var(--ink3);
  margin-left: 4px;
}
</style>
