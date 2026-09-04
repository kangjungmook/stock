<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from "vue";
import type { ProxyPoint } from "@/api/types";
import { useTheme } from "@/composables/useTheme";
import { createProxyChart, toLineData, type ProxyChartHandle } from "@/lib/tradingviewProxyChart";

const props = defineProps<{ est: ProxyPoint[]; act: ProxyPoint[] }>();
const { theme } = useTheme();

const el = ref<HTMLDivElement | null>(null);
let handle: ProxyChartHandle | null = null;
const failed = ref(false);

onMounted(async () => {
  if (!el.value) return;
  try {
    const LightweightCharts = await import("lightweight-charts");
    handle = createProxyChart(el.value, theme.value, LightweightCharts);
    handle.setData(toLineData(props.est), toLineData(props.act));
  } catch {
    failed.value = true;
  }
});

onBeforeUnmount(() => handle?.destroy());

watch(
  () => [props.est, props.act],
  () => {
    if (handle) handle.setData(toLineData(props.est), toLineData(props.act));
  }
);
watch(theme, (t) => handle?.setTheme(t));
</script>

<template>
  <div class="chart-wrap">
    <div ref="el" class="chart-el"></div>
    <p v-if="failed" class="fallback-note">차트를 불러오지 못했습니다. 새로고침해 주세요.</p>
  </div>
</template>

<style scoped>
.chart-wrap {
  position: relative;
}
.chart-el {
  width: 100%;
  height: 300px;
}
.fallback-note {
  font-size: 12px;
  color: var(--ink3);
}
@media (max-width: 640px) {
  .chart-el {
    height: 200px;
  }
}
</style>
