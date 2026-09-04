<script setup lang="ts">
import type { FactorItem } from "@/api/types";
import { FACTOR_TONE } from "@/lib/signals";

defineProps<{
  factors: FactorItem[];
  hitRate: number;
  sampleN: number;
}>();
</script>

<template>
  <div class="verdict-grid">
    <div>
      <div class="label">판단 근거</div>
      <div class="factor-list">
        <div v-for="f in factors" :key="f.name" class="factor-row">
          <span class="factor-name">{{ f.name }}</span>
          <span class="factor-state" :style="{ color: FACTOR_TONE[f.state][1] }">
            <span class="icon">{{ FACTOR_TONE[f.state][0] }}</span>{{ f.state }}
          </span>
        </div>
      </div>
    </div>
    <div>
      <div class="label">신호 신뢰도</div>
      <div>
        <div class="hit-row">
          <span class="hit-rate">{{ hitRate }}%</span>
          <span class="hit-meta">표본 {{ sampleN }}회 · 20거래일 기준</span>
        </div>
        <div class="hit-bar-track">
          <div class="hit-bar-fill" :style="{ width: hitRate + '%' }"></div>
        </div>
        <p class="hit-note">과거 같은 조건에서 이 신호가 20거래일 뒤 방향을 맞춘 비율입니다. 매수·매도 권유가 아닙니다.</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.verdict-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 24px 32px;
}
.label {
  font: 500 11px/1 "IBM Plex Mono", monospace;
  letter-spacing: 0.09em;
  text-transform: uppercase;
  color: var(--ink3);
  margin-bottom: 12px;
}
.factor-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.factor-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}
.factor-name {
  font-size: 13.5px;
  color: var(--ink2);
}
.factor-state {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12.5px;
  font-weight: 500;
}
.icon {
  font-size: 10px;
}
.hit-row {
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin-bottom: 8px;
}
.hit-rate {
  font: 500 26px/1 "IBM Plex Mono", monospace;
}
.hit-meta {
  font-size: 12.5px;
  color: var(--ink3);
}
.hit-bar-track {
  height: 6px;
  border-radius: 3px;
  background: var(--sunken);
  overflow: hidden;
  margin-bottom: 12px;
}
.hit-bar-fill {
  height: 6px;
  background: var(--brand-soft);
  border-radius: 3px;
}
.hit-note {
  font-size: 12.5px;
  line-height: 1.7;
  color: var(--ink3);
  margin: 0;
}
</style>
