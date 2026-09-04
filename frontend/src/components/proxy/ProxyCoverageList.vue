<script setup lang="ts">
import type { ProxyCoverageRow } from "@/api/types";

defineProps<{ rows: ProxyCoverageRow[] }>();

function dirLabel(r: ProxyCoverageRow) {
  return (r.diffPct >= 0 ? "▲ +" : "▼ ") + Math.abs(r.diffPct).toFixed(2) + "% 추정";
}
function dirColor(r: ProxyCoverageRow) {
  return r.diffPct >= 0 ? "var(--pos)" : "var(--neg)";
}
</script>

<template>
  <section class="coverage">
    <div class="label">관심종목별 지수 대표성</div>
    <div v-for="r in rows" :key="r.ticker" class="row">
      <span class="name-group">
        <span class="name">{{ r.name }}</span>
        <span class="ticker">{{ r.ticker }}</span>
      </span>
      <span class="right-group">
        <span class="quality" :style="{ color: r.quality === 'low' ? 'var(--watch)' : 'var(--ink3)' }">
          {{ r.quality === "low" ? "◈ 대표성 낮음" : "대표성 높음" }}
        </span>
        <span class="dir tabular" :style="{ color: dirColor(r) }">{{ dirLabel(r) }}</span>
      </span>
    </div>
    <p class="note">추정 방향은 지수 프록시에서 도출한 참고값이며, 개별 종목의 개장가를 보장하지 않습니다. 중소형주는 표시하지 않습니다.</p>
  </section>
</template>

<style scoped>
.coverage {
  margin-top: 48px;
  border-top: 2px solid var(--rule);
  padding-top: 24px;
}
.label {
  font: 500 11px/1 "IBM Plex Mono", monospace;
  letter-spacing: 0.09em;
  text-transform: uppercase;
  color: var(--ink3);
  margin-bottom: 16px;
}
.row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 12px 0;
  border-bottom: 1px solid var(--rule-soft);
}
.name-group {
  display: flex;
  align-items: baseline;
  gap: 8px;
  min-width: 0;
}
.name {
  font-size: 14.5px;
}
.ticker {
  font: 400 11.5px "IBM Plex Mono", monospace;
  color: var(--ink3);
}
.right-group {
  display: flex;
  align-items: center;
  gap: 16px;
  flex: none;
}
.quality {
  font-size: 12.5px;
}
.dir {
  font: 400 13px "IBM Plex Sans KR", sans-serif;
}
.note {
  font-size: 12.5px;
  line-height: 1.8;
  color: var(--ink3);
  margin: 24px 0 0;
  max-width: 56ch;
}
</style>
