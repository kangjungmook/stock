<script setup lang="ts">
import { useTheme } from "@/composables/useTheme";
import MainNav from "./MainNav.vue";
import TickerSearch from "./TickerSearch.vue";
import WatchlistChips from "./WatchlistChips.vue";
import MarketIndexBar from "./MarketIndexBar.vue";

const { theme, toggleTheme } = useTheme();
</script>

<template>
  <header class="the-header">
    <div class="head-row" data-layout="head">
      <div class="head-top">
        <div class="brand-nav">
          <router-link to="/" class="logo">브리핑</router-link>
          <MainNav />
        </div>
        <TickerSearch />
        <button class="theme-toggle" aria-label="화면 밝기 전환" @click="toggleTheme">
          <span>◐</span><span>{{ theme === "dark" ? "밝게 보기" : "어둡게 보기" }}</span>
        </button>
      </div>
      <WatchlistChips />
    </div>
    <MarketIndexBar />
  </header>
</template>

<style scoped>
.the-header {
  position: sticky;
  top: 0;
  z-index: 20;
  background: var(--bg);
  border-bottom: 1px solid var(--rule);
  padding-top: env(safe-area-inset-top, 0px);
}
.head-row {
  max-width: 1240px;
  margin: 0 auto;
  padding: 16px 24px 12px;
}
.head-top {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}
.brand-nav {
  display: flex;
  align-items: center;
  gap: 16px;
  flex: none;
}
.logo {
  font-family: var(--font-serif);
  font-weight: 700;
  font-size: 19px;
  letter-spacing: -0.01em;
  color: var(--ink);
}
.theme-toggle {
  height: 44px;
  min-width: 44px;
  padding: 0 14px;
  display: flex;
  align-items: center;
  gap: 8px;
  background: transparent;
  border: 1px solid var(--rule);
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  color: var(--ink2);
  transition: background 140ms ease, border-color 140ms ease;
}
.theme-toggle:hover {
  background: var(--tint);
  border-color: var(--ink3);
}

.hide-mobile {
  /* 모바일 종목 상세 화면은 자체 헤더(뒤로가기)만 쓰고 전역 헤더는 숨긴다 */
}
@media (max-width: 640px) {
  .head-row {
    padding: 12px 16px 10px;
  }
  .hide-mobile {
    display: none;
  }
}
</style>
