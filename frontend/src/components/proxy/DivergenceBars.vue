<script setup lang="ts">
import type { DivergenceBar } from "@/lib/proxyGap";

defineProps<{ bars: DivergenceBar[]; avgLabel: string }>();
</script>

<template>
  <div>
    <div class="head">
      <span class="label">구간별 괴리 추이</span>
      <span class="avg tabular">최근 평균 {{ avgLabel }}</span>
    </div>
    <div class="bars">
      <span v-for="(b, i) in bars" :key="i" class="col">
        <span class="col-inner" :style="{ alignItems: b.align }">
          <span class="bar" :style="{ height: b.heightPx + 'px', background: b.bg }"></span>
        </span>
      </span>
    </div>
    <div class="foot">
      <span>추정가 &gt; 실제가</span>
      <span>최근 24구간</span>
      <span>추정가 &lt; 실제가</span>
    </div>
  </div>
</template>

<style scoped>
.head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
}
.label {
  font: 500 11px/1 "IBM Plex Mono", monospace;
  letter-spacing: 0.09em;
  text-transform: uppercase;
  color: var(--ink3);
}
.avg {
  font-size: 11px;
  color: var(--ink3);
}
.bars {
  display: flex;
  align-items: center;
  gap: 3px;
  height: 88px;
  border-top: 1px dashed var(--rule-soft);
  border-bottom: 1px dashed var(--rule-soft);
  padding: 2px 0;
}
.col {
  flex: 1;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.col-inner {
  display: flex;
  height: 44px;
}
.bar {
  width: 100%;
  border-radius: 1px;
  display: block;
}
.foot {
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  color: var(--ink3);
  margin-top: 8px;
}
</style>
