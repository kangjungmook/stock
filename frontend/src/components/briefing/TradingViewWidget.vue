<script setup lang="ts">
/**
 * TradingView의 무료 임베드 위젯("Advanced Real-Time Chart") — 우리 서버를 거치지 않고
 * TradingView가 직접 브라우저에 그려주는 남의 iframe이다. 그래서 화면은 실시간처럼
 * 움직여도, 그 안의 숫자를 우리 코드가 읽어올 방법은 없다(Same-Origin Policy) —
 * 그래서 아래 "판단 근거"·"차트 분석" 섹션은 이 위젯과 무관하게 별도 데이터로 계산된다.
 *
 * 이 세션 샌드박스에서는 tradingview.com으로 나가는 아웃바운드가 막혀 있어 실제 렌더링을
 * 직접 확인하지 못했다 — 배포 후 화면에 안 뜨면 콘솔 에러를 알려주면 된다.
 */
import { ref, watch, onMounted, onBeforeUnmount } from "vue";
import { useTheme } from "@/composables/useTheme";

const props = defineProps<{ ticker: string }>();
const { theme } = useTheme();
const container = ref<HTMLElement | null>(null);

function mountWidget() {
  if (!container.value) return;
  container.value.innerHTML = "";

  const widgetSlot = document.createElement("div");
  widgetSlot.className = "tradingview-widget-container__widget";
  container.value.appendChild(widgetSlot);

  const script = document.createElement("script");
  script.type = "text/javascript";
  script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
  script.async = true;
  script.text = JSON.stringify({
    autosize: true,
    symbol: `KRX:${props.ticker}`,
    interval: "D",
    timezone: "Asia/Seoul",
    theme: theme.value === "dark" ? "dark" : "light",
    style: "1",
    locale: "kr",
    enable_publishing: false,
    hide_top_toolbar: false,
    hide_legend: false,
    allow_symbol_change: false,
    support_host: "https://www.tradingview.com"
  });
  container.value.appendChild(script);
}

// 위젯은 스크립트가 로드되는 시점의 설정으로 고정돼서, 종목/테마가 바뀌면
// 다시 그리는 수밖에 없다(설정을 나중에 갱신하는 API가 따로 없음).
onMounted(mountWidget);
watch([() => props.ticker, theme], mountWidget);
onBeforeUnmount(() => {
  if (container.value) container.value.innerHTML = "";
});
</script>

<template>
  <div class="tv-wrap">
    <div ref="container" class="tv-widget-container" />
    <p class="tv-note">TradingView 제공 위젯이며, 아래 판단 근거·차트 분석은 별도 데이터로 계산됩니다.</p>
  </div>
</template>

<style scoped>
.tv-wrap {
  border-radius: 6px;
  overflow: hidden;
}
.tv-widget-container {
  height: 420px;
}
.tv-note {
  font-size: var(--text-micro);
  color: var(--ink3);
  margin: var(--s-2) 0 0;
}
</style>
