<script setup lang="ts">
import type { DivergenceSummary } from "@/lib/proxyGap";

defineProps<{ divergence: DivergenceSummary }>();
</script>

<template>
  <div>
    <div class="strip" :style="{ border: divergence.wide ? '2px solid var(--ink3)' : '1px solid var(--rule)' }">
      <span class="badge">괴리 정보</span>
      <span class="text">추정가 − 실제가</span>
      <span class="value tabular" :style="{ fontWeight: divergence.wide ? 600 : 400 }">{{ divergence.nowLabel }}</span>
      <span class="fx">환율 보정 반영</span>
      <span class="state">{{ divergence.state }}</span>
    </div>
    <p class="disclaimer">괴리는 매수·매도 신호가 아니라 두 가격의 차이를 보여주는 참고 지표입니다. 호재·악재 신호와는 무관합니다.</p>
  </div>
</template>

<style scoped>
.strip {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 16px;
  padding: 8px 12px;
  border-radius: 6px;
  width: fit-content;
}
.badge {
  height: 20px;
  padding: 0 7px;
  display: inline-flex;
  align-items: center;
  border-radius: 3px;
  background: var(--tint);
  color: var(--ink2);
  font-size: 10.5px;
  font-weight: 500;
}
.text {
  font-size: 13px;
  color: var(--ink2);
}
.value {
  font-size: 14px;
  font-family: "IBM Plex Sans KR", sans-serif;
}
.fx {
  font-size: 11px;
  color: var(--ink3);
  border-left: 1px solid var(--rule-soft);
  padding-left: 10px;
}
.state {
  font-size: 11px;
  color: var(--ink3);
}
.disclaimer {
  font-size: 12px;
  line-height: 1.7;
  color: var(--ink3);
  margin: -8px 0 20px;
  max-width: 52ch;
}
</style>
