<script setup lang="ts">
import { usePwaInstall } from "@/composables/usePwaInstall";

const { dismissed, promptInstall, dismiss } = usePwaInstall();
</script>

<template>
  <div v-if="!dismissed" class="pwa-prompt" data-layout="pwa">
    <div class="pwa-title">홈 화면에 두면 매일 아침 바로 열립니다</div>
    <p class="pwa-desc">브리핑 마지막 화면은 오프라인에서도 남아 있습니다. 계정은 필요 없습니다.</p>
    <div class="pwa-actions">
      <button class="primary" @click="promptInstall">홈 화면에 추가</button>
      <button class="ghost" @click="dismiss">지금은 넘어가기</button>
    </div>
  </div>
</template>

<style scoped>
.pwa-prompt {
  display: none;
}
@media (max-width: 1023px) {
  .pwa-prompt {
    display: block;
    margin-top: 40px;
    padding: 16px;
    border-radius: 8px;
    background: var(--surface);
  }
}
.pwa-title {
  font-family: var(--font-serif);
  font-size: 16px;
  line-height: 1.5;
  margin-bottom: 8px;
}
.pwa-desc {
  font-size: 13px;
  line-height: 1.7;
  color: var(--ink2);
  margin: 0 0 16px;
}
.pwa-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
.primary {
  height: 44px;
  padding: 0 16px;
  border-radius: 6px;
  border: 0;
  background: var(--brand);
  color: var(--brand-ink);
  font-size: 13.5px;
  cursor: pointer;
}
.ghost {
  height: 44px;
  padding: 0 16px;
  border-radius: 6px;
  border: 0;
  background: transparent;
  color: var(--ink2);
  font-size: 13.5px;
  cursor: pointer;
}
</style>
