<script setup lang="ts">
import { computed, ref } from "vue";
import type { BriefingSnapshot } from "@/api/types";
import { VERDICTS } from "@/lib/signals";
import SignalBadge from "./SignalBadge.vue";
import PriceReadout from "./PriceReadout.vue";
import VerdictPanel from "./VerdictPanel.vue";
import BlockDetailTabs from "./BlockDetailTabs.vue";

const props = defineProps<{ snapshot: BriefingSnapshot }>();

const isOpen = ref(false);
const verdict = computed(() => VERDICTS[props.snapshot.verdict]);
const quiet = computed(() => !!props.snapshot.quiet && !isOpen.value);
const showToggle = computed(() => !props.snapshot.quiet || isOpen.value);
const evidenceCount = computed(() => props.snapshot.news.length + props.snapshot.filings.length);
const toggleLabel = computed(() =>
  isOpen.value ? "브리핑만 보기" : "뉴스·공시·컨센서스·차트·수급 펼치기"
);
</script>

<template>
  <section class="block">
    <div class="block-head">
      <div class="head-main">
        <div class="title-row">
          <h2 class="name">
            <router-link :to="`/stock/${snapshot.ticker}`" class="name-link">{{ snapshot.name }}</router-link>
          </h2>
          <span class="ticker">{{ snapshot.ticker }}</span>
          <span class="sector">{{ snapshot.sector }}</span>
        </div>
        <SignalBadge :icon="verdict.icon" :label="snapshot.verdict" :color="verdict.color" :bg="verdict.bg" />
      </div>
      <PriceReadout :snapshot="snapshot" />
    </div>

    <p class="headline">{{ snapshot.headline }}</p>

    <div v-if="quiet" class="quiet-box">
      <p class="quiet-text">새로 들어온 뉴스나 공시가 없습니다. 마지막 소식은 3일 전 배당 관련 공시였어요.</p>
      <button class="ghost-btn" @click="isOpen = true">지난 소식 보기</button>
    </div>

    <button
      v-if="showToggle"
      class="toggle-btn"
      :aria-expanded="isOpen"
      @click="isOpen = !isOpen"
    >
      <span class="toggle-left">
        <span class="evidence">근거 {{ evidenceCount }}건</span>
        <span>{{ toggleLabel }}</span>
      </span>
      <span class="caret" :style="{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }">⌄</span>
    </button>

    <div v-if="isOpen" class="detail">
      <VerdictPanel
        :factors="snapshot.factors"
        :hit-rate="snapshot.hitRate"
        :sample-n="snapshot.sampleN"
        class="verdict-block"
      />
      <BlockDetailTabs :snapshot="snapshot" />
      <div class="detail-foot">
        <span class="updated">{{ snapshot.updated }}</span>
        <button class="ghost-btn" @click="isOpen = false">브리핑만 보기 ⌃</button>
      </div>
    </div>
  </section>
</template>

<style scoped>
.block {
  border-top: 2px solid var(--rule);
  margin-top: 40px;
  padding-top: 20px;
}
.block-head {
  display: flex;
  justify-content: space-between;
  gap: 24px;
  align-items: flex-start;
  flex-wrap: wrap;
}
.head-main {
  min-width: 0;
  flex: 1 1 260px;
}
.title-row {
  display: flex;
  align-items: baseline;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 12px;
}
.name {
  font-size: 19px;
  font-weight: 600;
  line-height: 1.3;
  margin: 0;
}
.name-link {
  color: inherit;
  border-bottom: 1px solid transparent;
  transition: border-color 140ms ease;
}
.name-link:hover {
  border-bottom-color: var(--brand-soft);
}
.ticker {
  font: 400 12px "IBM Plex Mono", monospace;
  color: var(--ink3);
}
.sector {
  font-size: 12px;
  color: var(--ink3);
}
.headline {
  font-family: var(--font-serif);
  font-size: var(--text-brief);
  line-height: 1.55;
  margin: 20px 0 0;
  max-width: 44ch;
}
.quiet-box {
  margin-top: 16px;
}
.quiet-text {
  font-size: 14.5px;
  line-height: 1.75;
  color: var(--ink2);
  margin: 0 0 16px;
  max-width: 48ch;
}
.ghost-btn {
  height: 40px;
  padding: 0 14px;
  border-radius: 4px;
  border: 1px solid var(--rule);
  background: transparent;
  font-size: 13.5px;
  cursor: pointer;
  color: var(--ink2);
  transition: background 140ms ease;
}
.ghost-btn:hover {
  background: var(--tint);
}
.toggle-btn {
  margin-top: 20px;
  height: 44px;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 14px 0 12px;
  border-radius: 6px;
  border: 1px solid var(--rule-soft);
  background: transparent;
  cursor: pointer;
  font-size: 13.5px;
  color: var(--ink2);
  transition: background 160ms ease, border-color 160ms ease;
}
.toggle-btn:hover {
  background: var(--tint);
  border-color: var(--rule);
}
.toggle-left {
  display: flex;
  align-items: center;
  gap: 10px;
}
.evidence {
  font: 500 11px "IBM Plex Mono", monospace;
  color: var(--brand-soft);
}
.caret {
  font-size: 12px;
  color: var(--ink3);
  display: inline-block;
  transition: transform 200ms cubic-bezier(0.32, 0.72, 0, 1);
}
.detail {
  margin-top: 16px;
  background: var(--surface);
  border-radius: 8px;
  padding: 24px;
  animation: flash 200ms cubic-bezier(0.32, 0.72, 0, 1);
}
.verdict-block {
  padding-bottom: 24px;
  border-bottom: 1px solid var(--rule-soft);
}
.detail-foot {
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid var(--rule-soft);
  display: flex;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
  align-items: center;
}
.updated {
  font-size: 12.5px;
  color: var(--ink3);
}

@media (max-width: 640px) {
  .detail {
    padding: 20px 16px;
  }
}
</style>
