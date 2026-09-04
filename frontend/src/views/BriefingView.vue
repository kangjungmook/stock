<script setup lang="ts">
import { computed, ref } from "vue";
import { useWatchlist } from "@/composables/useWatchlist";
import { useBriefing } from "@/composables/useBriefing";
import { usePolling } from "@/composables/usePolling";
import type { Verdict } from "@/api/types";
import SignalSummaryStrip from "@/components/briefing/SignalSummaryStrip.vue";
import DailyBrief from "@/components/briefing/DailyBrief.vue";
import EmptyState from "@/components/briefing/EmptyState.vue";
import LoadingSkeleton from "@/components/briefing/LoadingSkeleton.vue";
import BriefingBlock from "@/components/briefing/BriefingBlock.vue";
import SideRail from "@/components/briefing/SideRail.vue";
import PwaPrompt from "@/components/briefing/PwaPrompt.vue";
import AdSlot from "@/components/briefing/AdSlot.vue";

const adSlotFeed = import.meta.env.VITE_ADSENSE_SLOT_FEED;

const { list, add } = useWatchlist();
const { blocks, loading, lastUpdated, refresh, refreshSilently } = useBriefing(list);
const filter = ref<Verdict | null>(null);

// 사이드 레일에 "15분마다 자동"이라고 써 있는 만큼 실제로 그렇게 동작해야 한다.
// 화면을 깜빡이게 하지 않도록 조용히(silent) 갱신한다.
usePolling(refreshSilently, 15 * 60 * 1000).start();

const isEmpty = computed(() => list.value.length === 0);

const counts = computed(() => {
  const acc: Partial<Record<Verdict, number>> = {};
  for (const b of blocks.value) acc[b.verdict] = (acc[b.verdict] || 0) + 1;
  return acc;
});

const filteredBlocks = computed(() =>
  filter.value ? blocks.value.filter((b) => b.verdict === filter.value) : blocks.value
);

const noMatch = computed(() => !!filter.value && filteredBlocks.value.length === 0 && !loading.value && !isEmpty.value);

const seedChips = [
  { ticker: "005930", name: "삼성전자" },
  { ticker: "000660", name: "SK하이닉스" },
  { ticker: "035720", name: "카카오" },
  { ticker: "005380", name: "현대차" }
];
</script>

<template>
  <div class="briefing-layout">
    <main class="feed">
      <SignalSummaryStrip v-if="!isEmpty" v-model="filter" :counts="counts" />

      <DailyBrief v-if="!isEmpty && !loading" :blocks="blocks" />

      <EmptyState
        v-if="isEmpty"
        title="아직 지켜볼 종목이 없습니다"
        description="한 종목만 등록해도 오늘의 뉴스·공시·컨센서스·수급을 한 문단으로 정리해 드립니다. 계정은 필요 없고, 목록은 이 브라우저에만 저장됩니다."
      >
        <button v-for="s in seedChips" :key="s.ticker" class="seed-chip" @click="add(s.ticker)">
          <span class="plus">+</span>{{ s.name }}
        </button>
        <template #footnote>예시로 채워보기 · 언제든 칩의 ×로 지울 수 있습니다</template>
      </EmptyState>

      <LoadingSkeleton v-else-if="loading" />

      <template v-else>
        <div v-if="filter" class="filter-banner">
          <span>{{ filter }} 신호 {{ filteredBlocks.length }}개만 보고 있습니다</span>
          <button @click="filter = null">전체 종목 다시 보기</button>
        </div>

        <EmptyState
          v-if="noMatch"
          icon="◇"
          :title="`${filter} 신호가 있는 종목이 없습니다`"
          description="지금 등록된 종목 중에는 해당하는 신호가 없습니다. 신호는 장중에도 바뀔 수 있어요."
        >
          <button class="ghost-btn" @click="filter = null">전체 종목 다시 보기</button>
        </EmptyState>

        <BriefingBlock v-for="b in filteredBlocks" :key="b.ticker" :snapshot="b" />

        <AdSlot placement="feed" :slot-id="adSlotFeed" />

        <PwaPrompt v-if="!isEmpty" />

        <p v-if="filteredBlocks.length" class="disclaimer">
          신호와 신뢰도는 과거 데이터에 기반한 참고 지표이며 투자 권유가 아닙니다. 시세는 근접 실시간(약 15분 지연)입니다.
        </p>
      </template>
    </main>

    <SideRail
      v-if="!isEmpty"
      v-model="filter"
      :blocks="blocks"
      :counts="counts"
      :loading="loading"
      :last-updated="lastUpdated"
      @refresh="refresh"
      @open-support="$router.push('/support')"
    />
  </div>
</template>

<style scoped>
.briefing-layout {
  max-width: 1240px;
  margin: 0 auto;
  padding: 0 24px 96px;
  display: grid;
  grid-template-columns: minmax(0, 1fr) 300px;
  gap: 56px;
  align-items: start;
}
.feed {
  min-width: 0;
}
.seed-chip {
  height: 40px;
  padding: 0 14px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border-radius: 20px;
  border: 1px solid var(--brand-soft);
  background: transparent;
  color: var(--brand-soft);
  font-size: 13.5px;
  cursor: pointer;
  transition: background 140ms ease;
}
.seed-chip:hover {
  background: var(--up-bg);
}
.plus {
  font-size: 12px;
}
.filter-banner {
  margin-top: 32px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
  padding: 12px 14px;
  border-radius: 6px;
  background: var(--tint);
}
.filter-banner span {
  font-size: 13.5px;
  color: var(--ink2);
}
.filter-banner button {
  height: 36px;
  padding: 0 12px;
  border-radius: 4px;
  border: 0;
  background: transparent;
  color: var(--brand-soft);
  font-size: 13px;
  cursor: pointer;
}
.ghost-btn {
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
.ghost-btn:hover {
  background: var(--tint);
}
.disclaimer {
  font-size: 12.5px;
  line-height: 1.8;
  color: var(--ink3);
  margin: 48px 0 0;
  max-width: 52ch;
  border-top: 1px solid var(--rule-soft);
  padding-top: 16px;
}

@media (max-width: 1023px) {
  .briefing-layout {
    grid-template-columns: minmax(0, 1fr);
    gap: 0;
  }
}
@media (max-width: 640px) {
  .briefing-layout {
    padding: 0 16px 72px;
  }
}
</style>
