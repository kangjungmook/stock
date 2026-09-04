<script setup lang="ts">
import { onMounted, ref } from "vue";
import { api } from "@/api/client";
import type { IndexQuote } from "@/api/types";
import { moveColor } from "@/lib/signals";
import { usePolling } from "@/composables/usePolling";

const indices = ref<IndexQuote[]>([]);
const open = ref(true);

async function load() {
  try {
    indices.value = await api.getIndices();
  } catch {
    indices.value = [];
  }
}

onMounted(load);
usePolling(load, 5 * 60 * 1000).start();

function move(ix: IndexQuote) {
  return (ix.chg > 0 ? "▲ +" : "▼ ") + Math.abs(ix.chg).toFixed(2) + " (" + Math.abs(ix.pct).toFixed(2) + "%)";
}
</script>

<template>
  <div class="index-bar-wrap">
    <div class="index-bar">
      <span class="label">시장 지수</span>
      <div v-if="open" class="scroller-wrap">
        <div class="scroller">
          <span v-for="ix in indices" :key="ix.name" class="ix">
            <span class="ix-name">{{ ix.name }}</span>
            <span class="ix-value tabular">{{ ix.value }}</span>
            <span class="ix-move tabular" :style="{ color: moveColor(ix.pct) }">{{ move(ix) }}</span>
          </span>
        </div>
        <div class="scroll-fade" aria-hidden="true"></div>
      </div>
      <span v-else class="closed-summary">
        {{ indices[0]?.name }} {{ indices[0]?.value }} · {{ indices[2]?.name }} {{ indices[2]?.value }}
      </span>
      <button
        class="toggle"
        :aria-label="open ? '지수 띠 접기' : '지수 띠 펼치기'"
        @click="open = !open"
      >
        <span class="caret" :style="{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }">⌄</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.index-bar-wrap {
  border-top: 1px solid var(--rule-soft);
  background: var(--sunken);
}
.index-bar {
  max-width: 1240px;
  margin: 0 auto;
  padding: 0 24px;
  display: flex;
  align-items: center;
  gap: 20px;
  min-height: 44px;
}
.label {
  font-size: 12px;
  color: var(--ink3);
  flex: none;
  white-space: nowrap;
}
.scroller-wrap {
  position: relative;
  flex: 1;
  min-width: 0;
}
.scroller {
  display: flex;
  align-items: center;
  gap: 20px;
  overflow-x: auto;
  padding: 8px 0;
  scrollbar-width: none;
}
.scroller::-webkit-scrollbar {
  display: none;
}
/* 스크롤로 더 볼 지수가 남아 있다는 걸 알려주는 가장자리 페이드 — 화살표나 스크롤바 없이도
   "잘린 게 아니라 더 있다"는 신호를 준다. 클릭을 가로채면 안 되니 pointer-events는 끈다. */
.scroll-fade {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  width: 28px;
  background: linear-gradient(to right, transparent, var(--sunken));
  pointer-events: none;
}
.ix {
  display: inline-flex;
  align-items: baseline;
  gap: 8px;
  white-space: nowrap;
  flex: none;
}
.ix-name {
  font-size: 12.5px;
  color: var(--ink2);
}
.ix-value {
  font: 500 13px "IBM Plex Mono", monospace;
  color: var(--ink);
}
.ix-move {
  font: 400 11.5px "IBM Plex Mono", monospace;
}
.closed-summary {
  flex: 1;
  font-size: 12px;
  color: var(--ink3);
}
.toggle {
  width: 44px;
  height: 44px;
  flex: none;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: 0;
  cursor: pointer;
  color: var(--ink3);
  transition: color 140ms ease;
}
.toggle:hover {
  color: var(--ink);
}
.caret {
  font-size: 13px;
  display: inline-block;
  transition: transform 200ms cubic-bezier(0.32, 0.72, 0, 1);
}

@media (max-width: 640px) {
  .index-bar {
    padding: 0 16px;
    gap: 12px;
  }
}
</style>
