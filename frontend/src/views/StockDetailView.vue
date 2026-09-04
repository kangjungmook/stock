<script setup lang="ts">
import { computed, toRef } from "vue";
import { useRouter } from "vue-router";
import { useSingleBriefing } from "@/composables/useBriefing";
import { useWatchlist } from "@/composables/useWatchlist";
import { VERDICTS, moveColor, moveLabel } from "@/lib/signals";
import SignalBadge from "@/components/briefing/SignalBadge.vue";
import VerdictPanel from "@/components/briefing/VerdictPanel.vue";
import SpectrumGauge from "@/components/briefing/SpectrumGauge.vue";
import PriceChart from "@/components/briefing/PriceChart.vue";
import TechnicalAnalysisPanel from "@/components/briefing/TechnicalAnalysisPanel.vue";
import ConsensusPanel from "@/components/briefing/ConsensusPanel.vue";
import NewsList from "@/components/briefing/NewsList.vue";
import FilingsList from "@/components/briefing/FilingsList.vue";
import FlowsTable from "@/components/briefing/FlowsTable.vue";
import { analyzeSeries } from "@/lib/technicalAnalysis";

const props = defineProps<{ ticker: string }>();
const router = useRouter();
const { remove } = useWatchlist();

const tickerRef = toRef(props, "ticker");
const { snapshot, loading } = useSingleBriefing(tickerRef);

const verdict = computed(() => (snapshot.value ? VERDICTS[snapshot.value.verdict] : null));
const technicalAnalysis = computed(() => (snapshot.value ? analyzeSeries(snapshot.value.series) : null));

function backToFeed() {
  router.push("/");
}
function removeAndBack() {
  remove(props.ticker);
  router.push("/");
}
</script>

<template>
  <div class="detail-page">
    <button class="back-btn" @click="backToFeed"><span class="chevron">‹</span>브리핑 피드로 돌아가기</button>

    <div v-if="loading || !snapshot" class="loading-note">불러오는 중…</div>

    <template v-else>
      <header class="detail-header">
        <div class="title-row">
          <h1 class="name">{{ snapshot.name }}</h1>
          <span class="ticker">{{ snapshot.ticker }}</span>
          <span class="sector">{{ snapshot.sector }}</span>
        </div>
        <div class="price-row">
          <div>
            <div class="price tabular">{{ snapshot.price }}</div>
            <div class="move tabular" :style="{ color: moveColor(snapshot.changePct) }">{{ moveLabel(snapshot.changePct) }}</div>
          </div>
          <SignalBadge v-if="verdict" :icon="verdict.icon" :label="snapshot.verdict" :color="verdict.color" :bg="verdict.bg" />
        </div>
        <p class="headline">{{ snapshot.headline }}</p>
      </header>

      <section class="section">
        <div class="section-label">판단 근거와 신뢰도</div>
        <VerdictPanel :factors="snapshot.factors" :hit-rate="snapshot.hitRate" :sample-n="snapshot.sampleN" />
      </section>

      <section v-if="snapshot.aiVerdict" class="section">
        <div class="section-label">AI 신호 스펙트럼</div>
        <SpectrumGauge :verdict="snapshot.aiVerdict" />
      </section>

      <section class="section">
        <PriceChart :series="snapshot.series" :height="220" />
      </section>

      <section v-if="technicalAnalysis" class="section">
        <div class="section-label">차트 분석</div>
        <TechnicalAnalysisPanel :analysis="technicalAnalysis" />
      </section>

      <section class="section">
        <div class="section-label">애널리스트 컨센서스</div>
        <ConsensusPanel :consensus="snapshot.consensus" :opinions="snapshot.opinions" />
      </section>

      <section class="section">
        <div class="section-label">뉴스 타임라인</div>
        <NewsList :news="snapshot.news" />
      </section>

      <section class="section">
        <div class="section-label">공시 · DART</div>
        <FilingsList :filings="snapshot.filings" />
      </section>

      <section class="section no-border">
        <div class="section-label">수급 · 최근 5거래일</div>
        <FlowsTable :flows="snapshot.flows" :updated="snapshot.updated" />
      </section>

      <div class="sticky-actions">
        <button class="primary" @click="backToFeed">브리핑 피드로 돌아가기</button>
        <button class="danger" @click="removeAndBack">관심종목에서 빼기</button>
      </div>
    </template>
  </div>
</template>

<style scoped>
.detail-page {
  max-width: 840px;
  margin: 0 auto;
  padding: 0 24px 120px;
  animation: flash 200ms cubic-bezier(0.32, 0.72, 0, 1);
}
.back-btn {
  margin-top: max(32px, env(safe-area-inset-top, 0px));
  height: 44px;
  padding: 0 12px 0 8px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: transparent;
  border: 0;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13.5px;
  color: var(--ink2);
  transition: background 140ms ease;
}
.back-btn:hover {
  background: var(--tint);
}
.chevron {
  font-size: 14px;
}
.loading-note {
  padding: 48px 0;
  color: var(--ink3);
  font-size: 14px;
}
.detail-header {
  margin-top: 24px;
  padding-bottom: 24px;
  border-bottom: 2px solid var(--rule);
}
.title-row {
  display: flex;
  align-items: baseline;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 16px;
}
.name {
  font-size: clamp(24px, 3vw, 32px);
  font-weight: 600;
  line-height: 1.25;
  margin: 0;
}
.ticker {
  font: 400 13px "IBM Plex Mono", monospace;
  color: var(--ink3);
}
.sector {
  font-size: 13px;
  color: var(--ink3);
}
.price-row {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 24px;
  flex-wrap: wrap;
}
.price {
  font: 500 clamp(28px, 3.6vw, 38px) / 1.1 "IBM Plex Mono", monospace;
}
.move {
  font: 400 14px/1.5 "IBM Plex Mono", monospace;
  margin-top: 4px;
}
.headline {
  font-family: var(--font-serif);
  font-size: clamp(18px, 2vw, 22px);
  line-height: 1.55;
  margin: 24px 0 0;
  max-width: 42ch;
}
.section {
  padding: 32px 0;
  border-bottom: 1px solid var(--rule-soft);
}
.section.no-border {
  border-bottom: 0;
}
.section-label {
  font: 500 11px/1 "IBM Plex Mono", monospace;
  letter-spacing: 0.09em;
  text-transform: uppercase;
  color: var(--ink3);
  margin-bottom: 16px;
}
.sticky-actions {
  position: sticky;
  bottom: 0;
  background: var(--bg);
  border-top: 1px solid var(--rule);
  padding: 16px 0;
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
.primary {
  height: 44px;
  padding: 0 16px;
  border-radius: 6px;
  border: 0;
  background: var(--brand);
  color: var(--brand-ink);
  font-size: 13.5px;
  cursor: pointer;
}
.danger {
  height: 44px;
  padding: 0 16px;
  border-radius: 6px;
  border: 1px solid var(--rule);
  background: transparent;
  color: var(--ink2);
  font-size: 13.5px;
  cursor: pointer;
  transition: background 140ms ease, color 140ms ease;
}
.danger:hover {
  background: var(--down-bg);
  color: var(--down);
}
</style>
