<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { useRouter } from "vue-router";
import { api } from "@/api/client";
import type { ProxyCoverageRow, Timeframe } from "@/api/types";
import { useWatchlist } from "@/composables/useWatchlist";
import { useProxy } from "@/composables/useProxy";
import ProxyTargetChips from "@/components/proxy/ProxyTargetChips.vue";
import DivergenceStrip from "@/components/proxy/DivergenceStrip.vue";
import TimeframeTabs from "@/components/proxy/TimeframeTabs.vue";
import ProxyValueBadges from "@/components/proxy/ProxyValueBadges.vue";
import ProxyChart from "@/components/proxy/ProxyChart.vue";
import DivergenceBars from "@/components/proxy/DivergenceBars.vue";
import ProxyCoverageList from "@/components/proxy/ProxyCoverageList.vue";

const router = useRouter();
const { list } = useWatchlist();

const target = ref("MARKET");
const timeframe = ref<Timeframe>("15분");
const coverage = ref<ProxyCoverageRow[]>([]);

async function loadCoverage() {
  if (list.value.length === 0) {
    coverage.value = [];
    return;
  }
  try {
    coverage.value = await api.getProxyCoverage(list.value);
  } catch {
    coverage.value = [];
  }
}
onMounted(loadCoverage);
watch(list, loadCoverage, { deep: true });

const targets = computed(() => [
  { ticker: "MARKET", name: "지수 전체 (EWY)", label: "지수 전체 (EWY)", quality: "high" as const, diffPct: 0 },
  ...coverage.value.map((r) => ({ ...r, label: r.name }))
]);

const { data, divergence } = useProxy(target, timeframe);

const selQuality = computed(() => data.value?.cfg.quality ?? "high");
</script>

<template>
  <div class="proxy-page">
    <div class="eyebrow">
      <span class="tag">EWY PROXY</span>
      <span class="ref-badge">참고용 추정가</span>
      <span class="updated tabular">모의 데이터 · 실시간 연동 전</span>
    </div>
    <h1 class="title">개장하면 대략 이 정도입니다</h1>
    <p class="lede">
      국내 장이 닫힌 사이 미국 시장에서 거래되는 한국 지수 ETF(EWY)를 프록시로 삼아 방향을 추정합니다. 대형주 비중이 높은
      지수 기반이라, 개별 종목 특히 중소형주와는 어긋날 수 있습니다.
    </p>

    <ProxyTargetChips v-model="target" :targets="targets" />

    <template v-if="divergence">
      <DivergenceStrip :divergence="divergence" />
    </template>

    <div class="tf-row">
      <TimeframeTabs v-model="timeframe" />
      <ProxyValueBadges
        v-if="data"
        :act="'$' + data.cfg.base.toFixed(2)"
        :est="'$' + data.cfg.est.toFixed(2)"
      />
    </div>

    <ProxyChart v-if="data" :est="data.est" :act="data.act" />

    <div v-if="divergence" class="divergence-section">
      <div>
        <div class="dg-head">
          <span class="dg-label">괴리도 (모의 데이터)</span>
          <span class="dg-state">
            <span class="icon">{{ divergence.stateIcon }}</span>{{ divergence.state }}
          </span>
        </div>
        <div class="dg-now-row">
          <span class="dg-now tabular">{{ divergence.nowLabel }}</span>
          <span class="dg-avg tabular">최근 평균 {{ divergence.avgLabel }}</span>
        </div>
        <p class="dg-hint">{{ divergence.hint }}</p>
      </div>
      <DivergenceBars :bars="divergence.bars" :avg-label="divergence.avgLabel" />
    </div>

    <div v-if="selQuality === 'low'" class="low-note">
      <span class="icon">◈</span>
      <span>이 종목은 지수 대표성이 낮아 <strong>정확도 낮음</strong>입니다. 방향 참고 정도로만 보세요.</span>
    </div>

    <ProxyCoverageList v-if="coverage.length" :rows="coverage" />

    <button class="back-btn" @click="router.push('/')">브리핑으로 돌아가기</button>
  </div>
</template>

<style scoped>
.proxy-page {
  max-width: 1000px;
  margin: 0 auto;
  padding: 40px 24px 96px;
}
.eyebrow {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 16px;
}
.tag {
  font: 500 11px/1 "IBM Plex Mono", monospace;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--brand-soft);
}
.ref-badge {
  height: 20px;
  padding: 0 7px;
  display: inline-flex;
  align-items: center;
  border-radius: 3px;
  border: 1px solid var(--brand-soft);
  color: var(--brand-soft);
  font-size: 10.5px;
  font-weight: 500;
}
.updated {
  font-size: 12px;
  color: var(--ink3);
}
.title {
  font-family: var(--font-serif);
  font-weight: 700;
  font-size: clamp(24px, 3vw, 34px);
  line-height: 1.3;
  margin: 0 0 12px;
}
.lede {
  font-size: 15px;
  line-height: 1.75;
  color: var(--ink2);
  margin: 0 0 32px;
  max-width: 60ch;
}
.tf-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
  margin-bottom: 16px;
}
.divergence-section {
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid var(--rule-soft);
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 24px 40px;
  align-items: start;
}
.dg-head {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
}
.dg-label {
  font: 500 11px/1 "IBM Plex Mono", monospace;
  letter-spacing: 0.09em;
  text-transform: uppercase;
  color: var(--ink3);
}
.dg-state {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 11.5px;
  color: var(--ink2);
}
.dg-state .icon {
  font-size: 10px;
}
.dg-now-row {
  display: flex;
  align-items: baseline;
  gap: 10px;
  margin-bottom: 8px;
}
.dg-now {
  font: 500 28px/1 "IBM Plex Sans KR", sans-serif;
}
.dg-avg {
  font-size: 12.5px;
  color: var(--ink3);
}
.dg-hint {
  font-size: 12.5px;
  line-height: 1.7;
  color: var(--ink3);
  margin: 0;
  max-width: 44ch;
}
.low-note {
  margin-top: 16px;
  padding: 12px 14px;
  border-radius: 6px;
  background: var(--watch-bg);
  display: flex;
  gap: 10px;
  align-items: flex-start;
}
.low-note .icon {
  font-size: 11px;
  color: var(--watch);
  line-height: 1.7;
}
.low-note strong {
  font-weight: 600;
  color: var(--watch);
}
.low-note span:last-child {
  font-size: 13px;
  line-height: 1.7;
  color: var(--ink2);
}
.back-btn {
  margin-top: 32px;
  height: 44px;
  padding: 0 16px;
  border-radius: 6px;
  border: 1px solid var(--rule);
  background: transparent;
  color: var(--ink2);
  font-size: 13.5px;
  cursor: pointer;
  transition: background 140ms ease;
}
.back-btn:hover {
  background: var(--tint);
}
</style>
