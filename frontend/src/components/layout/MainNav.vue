<script setup lang="ts">
import { useRoute } from "vue-router";

const items = [
  { to: "/", label: "브리핑", match: "briefing" },
  { to: "/proxy", label: "개장 전 추정가", match: "proxy" },
  { to: "/support", label: "커피 한 잔", match: "support" }
];

const route = useRoute();
function isActive(match: string) {
  if (match === "briefing") return route.name === "briefing" || route.name === "stock-detail";
  return route.name === match;
}
</script>

<template>
  <nav class="main-nav">
    <router-link
      v-for="item in items"
      :key="item.to"
      :to="item.to"
      class="nav-item"
      :class="{ active: isActive(item.match) }"
      :aria-current="isActive(item.match) ? 'page' : undefined"
    >
      {{ item.label }}
    </router-link>
  </nav>
</template>

<style scoped>
.main-nav {
  display: flex;
  gap: 2px;
}
.nav-item {
  height: 44px;
  padding: 0 12px;
  display: flex;
  align-items: center;
  border-radius: 6px;
  color: var(--ink3);
  font-size: 13.5px;
  font-weight: 400;
  white-space: nowrap;
  transition: background 140ms ease;
}
.nav-item:hover {
  background: var(--tint);
  color: var(--ink2);
}
.nav-item.active {
  background: var(--tint);
  color: var(--ink);
  font-weight: 600;
}
</style>
