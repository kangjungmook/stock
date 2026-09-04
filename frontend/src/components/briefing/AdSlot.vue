<script setup lang="ts">
/**
 * 구글 애드센스 자리. 계정 승인을 받기 전(VITE_ADSENSE_CLIENT_ID 또는 slotId가 비어 있으면)에는
 * 아무것도 렌더링하지 않는다 — 승인 안 된 빈 광고 박스를 사용자에게 보여주지 않기 위해서다.
 * 나중에 승인받으면 .env에 클라이언트 ID/슬롯 ID만 채우면 바로 노출된다.
 */
const props = defineProps<{
  slotId?: string;
  placement: "feed" | "rail";
}>();

const clientId = import.meta.env.VITE_ADSENSE_CLIENT_ID;
const enabled = Boolean(clientId && props.slotId);

function loadAdsenseScript(id: string) {
  if (document.querySelector("script[data-adsbygoogle]")) return;
  const script = document.createElement("script");
  script.async = true;
  script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${id}`;
  script.crossOrigin = "anonymous";
  script.dataset.adsbygoogle = "true";
  document.head.appendChild(script);
}

if (enabled) {
  loadAdsenseScript(clientId as string);
}

function requestAd() {
  try {
    ((window as unknown as { adsbygoogle: unknown[] }).adsbygoogle ??= []).push({});
  } catch {
    // 광고 스크립트가 차단됐거나 실패해도 나머지 화면엔 영향 없이 조용히 넘어간다.
  }
}
</script>

<template>
  <div v-if="enabled" class="ad-slot" :class="placement" @vue:mounted="requestAd">
    <span class="ad-label">스폰서</span>
    <ins
      class="adsbygoogle"
      style="display: block"
      :data-ad-client="clientId"
      :data-ad-slot="slotId"
      data-ad-format="auto"
      data-full-width-responsive="true"
    />
  </div>
</template>

<style scoped>
.ad-slot {
  margin: var(--s-8) 0;
  padding-top: var(--s-4);
  border-top: 1px solid var(--rule-soft);
}
.ad-label {
  display: block;
  font: 500 11px/1 "IBM Plex Mono", monospace;
  letter-spacing: 0.09em;
  text-transform: uppercase;
  color: var(--ink3);
  margin-bottom: var(--s-2);
}
.ad-slot.rail {
  margin-top: var(--s-6);
  margin-bottom: 0;
}
</style>
