<script setup lang="ts">
import { useRoute } from "vue-router";

const items = [
  { to: "/", label: "브리핑", icon: "◇", match: "briefing" },
  { to: "/proxy", label: "추정가", icon: "◈", match: "proxy" },
  { to: "/support", label: "커피 한 잔", icon: "◆", match: "support" }
];

const route = useRoute();
function isActive(match: string) {
  if (match === "briefing") return route.name === "briefing" || route.name === "stock-detail";
  return route.name === match;
}
</script>

<template>
  <nav class="tab-bar" aria-label="주요 메뉴">
    <router-link
      v-for="item in items"
      :key="item.to"
      :to="item.to"
      class="tab-item"
      :class="{ active: isActive(item.match) }"
    >
      <span class="tab-icon">{{ item.icon }}</span>
      <span>{{ item.label }}</span>
    </router-link>
  </nav>
</template>

<style scoped>
.tab-bar {
  display: none;
}
@media (max-width: 640px) {
  .tab-bar {
    display: flex;
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 30;
    background: var(--bg);
    border-top: 1px solid var(--rule);
    padding: 8px 8px calc(env(safe-area-inset-bottom, 0px) + 8px);
  }
}
.tab-item {
  flex: 1;
  min-height: 44px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 3px;
  font-size: 11px;
  color: var(--ink3);
}
.tab-item.active {
  color: var(--brand);
  font-weight: 600;
}
.tab-icon {
  font-size: 14px;
}
</style>
