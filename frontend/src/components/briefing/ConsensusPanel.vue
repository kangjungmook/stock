<script setup lang="ts">
import type { ConsensusInfo, OpinionItem } from "@/api/types";

defineProps<{
  consensus: ConsensusInfo;
  opinions: OpinionItem[];
  price?: string;
}>();

const toneColor: Record<string, string> = { up: "var(--up)", down: "var(--down)", flat: "var(--ink3)", watch: "var(--watch)" };
</script>

<template>
  <div class="consensus-grid">
    <div>
      <div class="label">12개월 목표주가 <span class="count">· {{ consensus.count }}</span></div>
      <div class="target-row">
        <span class="target">{{ consensus.target }}</span>
        <span class="upside">{{ consensus.upside }}</span>
      </div>
      <div class="band-track">
        <div class="band" :style="{ left: consensus.bandLeft, width: consensus.bandWidth }"></div>
        <div class="mark" :style="{ left: consensus.markPos }"></div>
      </div>
      <div class="band-labels">
        <span>{{ consensus.low }}</span>
        <span v-if="price">현재가 {{ price }}</span>
        <span>{{ consensus.high }}</span>
      </div>
    </div>
    <div>
      <div class="label">투자의견 분포</div>
      <div class="opinion-list">
        <div v-for="o in opinions" :key="o.label" class="opinion-row">
          <span class="opinion-label">{{ o.label }}</span>
          <span class="opinion-track">
            <span class="opinion-fill" :style="{ width: o.pct, background: toneColor[o.tone] }"></span>
          </span>
          <span class="opinion-n">{{ o.n }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.consensus-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 32px;
}
.label {
  font-size: 13px;
  color: var(--ink2);
  margin-bottom: 12px;
}
.count {
  color: var(--ink3);
}
.target-row {
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin-bottom: 16px;
}
.target {
  font: 500 24px/1 "IBM Plex Mono", monospace;
}
.upside {
  font-size: 13px;
  color: var(--ink2);
}
.band-track {
  position: relative;
  height: 8px;
  border-radius: 4px;
  background: var(--sunken);
  margin-bottom: 8px;
}
.band {
  position: absolute;
  top: 0;
  bottom: 0;
  background: var(--up-bg);
  border-radius: 4px;
}
.mark {
  position: absolute;
  top: -3px;
  bottom: -3px;
  width: 2px;
  background: var(--brand);
  border-radius: 1px;
}
.band-labels {
  display: flex;
  justify-content: space-between;
  font: 400 11.5px "IBM Plex Mono", monospace;
  color: var(--ink3);
}
.opinion-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.opinion-row {
  display: flex;
  align-items: center;
  gap: 12px;
}
.opinion-label {
  font-size: 13px;
  color: var(--ink2);
  width: 56px;
  flex: none;
}
.opinion-track {
  flex: 1;
  height: 8px;
  border-radius: 4px;
  background: var(--sunken);
  overflow: hidden;
  display: block;
}
.opinion-fill {
  display: block;
  height: 8px;
  border-radius: 4px;
}
.opinion-n {
  font: 400 12px "IBM Plex Mono", monospace;
  color: var(--ink3);
  width: 24px;
  text-align: right;
  flex: none;
}
</style>
