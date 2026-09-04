<script setup lang="ts">
import { computed, ref } from "vue";
import { seriesToPath } from "@/lib/signals";

const props = withDefaults(
  defineProps<{
    series: number[];
    height?: number;
  }>(),
  { height: 180 }
);

const RANGES = ["1D", "1W", "3M", "1Y"] as const;
const range = ref<(typeof RANGES)[number]>("3M");

const W = 640;
const path = computed(() => seriesToPath(props.series, W, props.height));
const base = computed(() => props.height - 8);
const from = computed(() => (range.value === "1D" ? "09:00" : "6월 04"));
const to = computed(() => (range.value === "1D" ? "15:30" : "9월 04"));
const chartLabel = computed(() => `${range.value} 종가 추이`);
</script>

<template>
  <div class="price-chart">
    <div class="chart-head">
      <div class="chart-label">{{ chartLabel }}</div>
      <div class="ranges">
        <button
          v-for="r in RANGES"
          :key="r"
          class="range-btn"
          :class="{ active: range === r }"
          @click="range = r"
        >
          {{ r }}
        </button>
      </div>
    </div>
    <svg :viewBox="`0 0 640 ${height}`" :height="height" preserveAspectRatio="none" class="chart-svg">
      <path :d="path.area" fill="var(--up-bg)" />
      <path :d="path.line" fill="none" stroke="var(--brand)" stroke-width="1.75" stroke-linejoin="round" />
      <line x1="0" :y1="base" x2="640" :y2="base" stroke="var(--rule)" stroke-width="1" stroke-dasharray="3 4" />
    </svg>
    <div class="chart-foot tabular">
      <span>{{ from }}</span><span>{{ to }}</span>
    </div>
  </div>
</template>

<style scoped>
.chart-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
  margin-bottom: 16px;
}
.chart-label {
  font: 500 11px/1 "IBM Plex Mono", monospace;
  letter-spacing: 0.09em;
  text-transform: uppercase;
  color: var(--ink3);
}
.ranges {
  display: flex;
  gap: 4px;
}
.range-btn {
  height: 36px;
  padding: 0 12px;
  border-radius: 4px;
  border: 1px solid var(--rule);
  background: transparent;
  color: var(--ink2);
  font: 500 12.5px "IBM Plex Mono", monospace;
  cursor: pointer;
}
.range-btn.active {
  background: var(--brand);
  color: var(--brand-ink);
  border-color: var(--brand);
}
.chart-svg {
  width: 100%;
  display: block;
}
.chart-foot {
  display: flex;
  justify-content: space-between;
  font: 400 11.5px "IBM Plex Mono", monospace;
  color: var(--ink3);
  margin-top: 8px;
}
</style>
