<script setup lang="ts">
import WatchlistChips from "./WatchlistChips.vue";
import MarketIndexBar from "./MarketIndexBar.vue";
</script>

<template>
  <div class="sub-header">
    <div class="chips-wrap">
      <WatchlistChips />
    </div>
    <MarketIndexBar />
  </div>
</template>

<style scoped>
/* sticky인 TheHeader 바로 아래, 본문과 함께 스크롤되는 관심종목 칩 + 시장 지수 띠. */
.chips-wrap {
  max-width: 1240px;
  margin: 0 auto;
  padding: 12px 24px;
}

.hide-mobile {
  /* 모바일 종목 상세 화면에서는 전역 헤더와 함께 숨긴다 */
}
@media (max-width: 640px) {
  .chips-wrap {
    padding: 10px 16px;
  }
  .hide-mobile {
    display: none;
  }
}
</style>
