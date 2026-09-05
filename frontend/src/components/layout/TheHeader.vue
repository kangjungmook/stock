<script setup lang="ts">
import { useTheme } from "@/composables/useTheme";
import MainNav from "./MainNav.vue";
import TickerSearch from "./TickerSearch.vue";

const { theme, toggleTheme } = useTheme();
</script>

<template>
  <header class="the-header">
    <div class="head-top" data-layout="head">
      <div class="brand-nav">
        <router-link to="/" class="logo">브리핑</router-link>
        <MainNav />
      </div>
      <TickerSearch />
      <button class="theme-toggle" aria-label="화면 밝기 전환" @click="toggleTheme">
        <span>◐</span><span>{{ theme === "dark" ? "밝게 보기" : "어둡게 보기" }}</span>
      </button>
    </div>
  </header>
</template>

<style scoped>
/*
  이 컴포넌트는 nav+검색 한 줄만 담는다 — 관심종목 칩·시장 지수 띠는 TheSubHeader로
  뺐다. sticky 요소가 "계속" 붙어 있으려면 그 부모 박스가 페이지 전체 높이만큼
  커야 한다(부모 박스 높이만큼만 붙어 있을 수 있는 게 sticky의 동작 방식) — 그래서
  이 header를 짧은 박스 안에 다른 스크롤 콘텐츠와 함께 두면 안 되고, App.vue에서
  .app-shell(페이지 전체)의 바로 아래 형제로 둬야 한다.
*/
.the-header {
  position: sticky;
  top: 0;
  z-index: 20;
  background: var(--bg);
  border-bottom: 1px solid var(--rule-soft);
  padding-top: env(safe-area-inset-top, 0px);
}
.head-top {
  max-width: 1240px;
  margin: 0 auto;
  padding: 16px 24px;
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
  .head-top {
    padding: 12px 16px;
  }
  .hide-mobile {
    display: none;
  }
}
</style>
