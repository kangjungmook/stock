<script setup lang="ts">
import { computed } from "vue";
import type { BriefingSnapshot } from "@/api/types";

const props = defineProps<{ blocks: BriefingSnapshot[] }>();

const counts = computed(() => {
  const acc: Record<string, number> = {};
  for (const b of props.blocks) acc[b.verdict] = (acc[b.verdict] || 0) + 1;
  return acc;
});

const todayLabel = computed(() => {
  const d = new Date();
  const weekday = ["일", "월", "화", "수", "목", "금", "토"][d.getDay()];
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일 ${weekday}요일`;
});

const headline = computed(() => {
  const positive = counts.value["긍정 우위"] || 0;
  const caution = counts.value["주의"] || 0;
  if (positive === 0 && caution === 0) return "오늘은 특별히 강한 신호가 없습니다.";
  if (positive > 0 && caution > 0) return "긍정 신호와 주의 신호가 함께 잡혔습니다. 아래에서 근거를 확인해 보세요.";
  if (positive > 0) return "관심종목 전반에서 긍정적인 흐름이 이어지고 있습니다.";
  return "주의가 필요한 신호가 잡힌 종목이 있습니다.";
});

const sub = computed(
  () =>
    `관심종목 ${props.blocks.length}개 중 ${counts.value["긍정 우위"] || 0}개에서 긍정 우위, ${
      counts.value["주의"] || 0
    }개에서 주의 신호가 잡혔습니다. 각 종목의 판단 근거와 과거 적중률은 상세를 펼쳐 확인할 수 있습니다.`
);
</script>

<template>
  <section class="daily-brief">
    <div class="today-label">{{ todayLabel }} · 장 마감</div>
    <p class="headline">{{ headline }}</p>
    <p class="sub">{{ sub }}</p>
  </section>
</template>

<style scoped>
.daily-brief {
  padding: 40px 0 8px;
}
.today-label {
  font: 500 11px/1 "IBM Plex Mono", monospace;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--brand-soft);
  margin-bottom: 16px;
}
.headline {
  font-family: var(--font-serif);
  font-size: var(--text-h2);
  line-height: 1.5;
  margin: 0;
  max-width: 34ch;
}
.sub {
  font-size: 14.5px;
  line-height: 1.75;
  color: var(--ink2);
  margin: 16px 0 0;
  max-width: 56ch;
}
</style>
