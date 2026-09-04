<script setup lang="ts">
import { computed } from "vue";
import type { FlowItem } from "@/api/types";
import { flowColor, flowLabel } from "@/lib/signals";

const props = defineProps<{ flows: FlowItem[]; updated?: string }>();

const foreignSum = computed(() => props.flows.reduce((a, f) => a + f.foreign, 0));
const instSum = computed(() => props.flows.reduce((a, f) => a + f.inst, 0));
function sumLabel(v: number) {
  return (v > 0 ? "+" : "") + v.toLocaleString("ko-KR") + "억";
}
</script>

<template>
  <div class="flows">
    <div class="sum-row">
      <span class="sum-item">외국인 5일 누적 <strong :style="{ color: 'var(--ink)' }">{{ sumLabel(foreignSum) }}</strong></span>
      <span class="sum-item">기관 5일 누적 <strong :style="{ color: 'var(--ink)' }">{{ sumLabel(instSum) }}</strong></span>
    </div>
    <div class="flow-list">
      <div v-for="(fl, i) in flows" :key="i" class="flow-row">
        <span class="date">{{ fl.date }}</span>
        <span class="cell">
          <span class="cell-label">외국인</span>
          <span class="cell-value tabular" :style="{ color: flowColor(fl.foreign) }">{{ flowLabel(fl.foreign) }}</span>
        </span>
        <span class="cell">
          <span class="cell-label">기관</span>
          <span class="cell-value tabular" :style="{ color: flowColor(fl.inst) }">{{ flowLabel(fl.inst) }}</span>
        </span>
      </div>
    </div>
    <p class="note">단위: 억원 · ▲ 순매수 / ▼ 순매도<template v-if="updated"> · {{ updated }}</template></p>
  </div>
</template>

<style scoped>
.sum-row {
  display: flex;
  gap: 24px;
  margin-bottom: 16px;
  flex-wrap: wrap;
  font-size: 13px;
  color: var(--ink2);
}
.sum-item strong {
  font: 500 14px "IBM Plex Mono", monospace;
}
.flow-list {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.flow-row {
  display: grid;
  grid-template-columns: 56px 1fr 1fr;
  gap: 16px;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid var(--rule-soft);
}
.date {
  font: 400 11.5px "IBM Plex Mono", monospace;
  color: var(--ink3);
}
.cell {
  display: flex;
  align-items: center;
  gap: 8px;
}
.cell-label {
  font-size: 12px;
  color: var(--ink3);
  width: 40px;
  flex: none;
}
.cell-value {
  font: 400 12.5px "IBM Plex Mono", monospace;
}
.note {
  font-size: 12.5px;
  color: var(--ink3);
  margin: 16px 0 0;
}
</style>
