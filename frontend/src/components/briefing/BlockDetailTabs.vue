<script setup lang="ts">
import { ref } from "vue";
import type { BriefingSnapshot } from "@/api/types";
import NewsList from "./NewsList.vue";
import FilingsList from "./FilingsList.vue";
import ConsensusPanel from "./ConsensusPanel.vue";
import PriceChart from "./PriceChart.vue";
import FlowsTable from "./FlowsTable.vue";

const props = defineProps<{ snapshot: BriefingSnapshot }>();

const TABS = [
  { key: "news", label: "뉴스" },
  { key: "filings", label: "공시" },
  { key: "consensus", label: "컨센서스" },
  { key: "chart", label: "차트" },
  { key: "flows", label: "수급" }
] as const;
type TabKey = (typeof TABS)[number]["key"];

const tab = ref<TabKey>("news");

function count(key: TabKey) {
  if (key === "news") return props.snapshot.news.length;
  if (key === "filings") return props.snapshot.filings.length;
  if (key === "flows") return "5일";
  return "";
}
</script>

<template>
  <div>
    <div role="tablist" class="tab-row">
      <button
        v-for="t in TABS"
        :key="t.key"
        role="tab"
        :aria-selected="tab === t.key"
        class="tab-btn"
        :class="{ active: tab === t.key }"
        @click="tab = t.key"
      >
        <span class="tab-label">{{ t.label }}<span class="tab-count">{{ count(t.key) }}</span></span>
        <span v-if="tab === t.key" class="tab-underline"></span>
      </button>
    </div>

    <NewsList v-if="tab === 'news'" :news="snapshot.news" />
    <FilingsList v-else-if="tab === 'filings'" :filings="snapshot.filings" show-dart-note />
    <ConsensusPanel v-else-if="tab === 'consensus'" :consensus="snapshot.consensus" :opinions="snapshot.opinions" :price="snapshot.price" />
    <PriceChart v-else-if="tab === 'chart'" :series="snapshot.series" />
    <FlowsTable v-else-if="tab === 'flows'" :flows="snapshot.flows" />
  </div>
</template>

<style scoped>
.tab-row {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
  margin: 20px 0;
  border-bottom: 1px solid var(--rule-soft);
}
.tab-btn {
  position: relative;
  height: 44px;
  padding: 0 12px;
  background: transparent;
  border: 0;
  cursor: pointer;
  font-size: 13.5px;
  font-weight: 400;
  color: var(--ink3);
  transition: color 140ms ease;
}
.tab-btn.active {
  color: var(--ink);
  font-weight: 600;
}
.tab-label {
  display: inline-flex;
  align-items: baseline;
  gap: 6px;
}
.tab-count {
  font: 400 11px "IBM Plex Mono", monospace;
  color: var(--ink3);
}
.tab-underline {
  position: absolute;
  left: 8px;
  right: 8px;
  bottom: -1px;
  height: 2px;
  background: var(--brand);
  border-radius: 1px;
}
</style>
