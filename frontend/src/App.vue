<script setup lang="ts">
import { computed } from "vue";
import { useRoute } from "vue-router";
import TheHeader from "@/components/layout/TheHeader.vue";
import TheSubHeader from "@/components/layout/TheSubHeader.vue";
import MobileTabBar from "@/components/layout/MobileTabBar.vue";
import { useTheme } from "@/composables/useTheme";

useTheme();
const route = useRoute();
const isDetail = computed(() => route.name === "stock-detail");
</script>

<template>
  <div class="app-shell">
    <TheHeader :class="{ 'hide-mobile': isDetail }" />
    <TheSubHeader :class="{ 'hide-mobile': isDetail }" />
    <main class="app-main">
      <router-view />
    </main>
    <MobileTabBar v-if="!isDetail" />
  </div>
</template>

<style scoped>
.app-shell {
  min-height: 100vh;
  background: var(--bg);
  color: var(--ink);
}
.app-main {
  padding-bottom: 0;
}
@media (max-width: 640px) {
  .app-main {
    padding-bottom: 72px;
  }
}
</style>
