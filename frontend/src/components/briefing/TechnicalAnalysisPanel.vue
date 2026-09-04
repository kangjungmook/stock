<script setup lang="ts">
import { computed } from "vue";
import type { TechnicalAnalysis } from "@/lib/technicalAnalysis";

const props = defineProps<{ analysis: TechnicalAnalysis }>();

const TREND_TONE: Record<TechnicalAnalysis["trend"], string> = {
  상승: "var(--up)",
  하락: "var(--down)",
  횡보: "var(--ink2)"
};

const ALIGNMENT_TONE: Record<string, string> = {
  정배열: "var(--up)",
  역배열: "var(--down)"
};

const RSI_TONE: Record<TechnicalAnalysis["rsiState"], string> = {
  과매수: "var(--watch)",
  과매도: "var(--watch)",
  중립: "var(--ink2)"
};

const summary = computed(() => {
  const a = props.analysis;
  const alignmentPhrase = a.maAlignment ? `5일선이 10일선 ${a.maAlignment === "정배열" ? "위" : "아래"}에 있는 ${a.maAlignment} 구간이고, ` : "";
  const rsiPhrase = a.rsi !== null ? `RSI는 ${Math.round(a.rsi)}로 ${a.rsiState} 수준입니다.` : "RSI를 계산하기엔 데이터가 아직 부족합니다.";
  return `최근 추세는 ${a.trend}이며, ${alignmentPhrase}${rsiPhrase}`;
});

function pct(v: number): string {
  return `${v.toFixed(1)}%`;
}
</script>

<template>
  <div class="ta-panel">
    <p class="ta-summary">{{ summary }}</p>
    <div class="ta-grid">
      <div class="ta-row">
        <span class="ta-name">추세</span>
        <span class="ta-value" :style="{ color: TREND_TONE[analysis.trend] }">{{ analysis.trend }}</span>
      </div>
      <div class="ta-row">
        <span class="ta-name">이동평균 배열</span>
        <span class="ta-value" :style="{ color: analysis.maAlignment ? ALIGNMENT_TONE[analysis.maAlignment] : 'var(--ink2)' }">
          {{ analysis.maAlignment ?? "데이터 부족" }}
        </span>
      </div>
      <div class="ta-row">
        <span class="ta-name">RSI(14)</span>
        <span class="ta-value" :style="{ color: RSI_TONE[analysis.rsiState] }">
          {{ analysis.rsi !== null ? Math.round(analysis.rsi) : "—" }} · {{ analysis.rsiState }}
        </span>
      </div>
      <div class="ta-row">
        <span class="ta-name">변동성(일간 등락폭 표준편차)</span>
        <span class="ta-value tabular">{{ pct(analysis.volatilityPct) }}</span>
      </div>
      <div class="ta-row">
        <span class="ta-name">최근 구간 위치</span>
        <span class="ta-value tabular">저점 대비 +{{ pct(analysis.pctFromLow) }} · 고점 대비 -{{ pct(analysis.pctFromHigh) }}</span>
      </div>
    </div>
    <p class="ta-disclaimer">가격(종가) 데이터만으로 계산한 참고 지표이며, 투자 조언이나 매수·매도 신호가 아닙니다.</p>
  </div>
</template>

<style scoped>
.ta-panel {
  padding-top: var(--s-2);
}
.ta-summary {
  font-family: var(--font-serif);
  font-size: var(--text-body);
  line-height: 1.7;
  color: var(--ink);
  margin: 0 0 var(--s-6);
  max-width: 58ch;
}
.ta-grid {
  display: flex;
  flex-direction: column;
  gap: var(--s-2);
  margin-bottom: var(--s-4);
}
.ta-row {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: var(--s-4);
  padding: var(--s-2) 0;
  border-bottom: 1px solid var(--rule-soft);
}
.ta-name {
  font-size: var(--text-data);
  color: var(--ink2);
}
.ta-value {
  font: 500 var(--text-data) "IBM Plex Mono", monospace;
  flex: none;
  text-align: right;
}
.ta-disclaimer {
  font-size: var(--text-micro);
  line-height: 1.7;
  color: var(--ink3);
  margin: 0;
}
</style>
