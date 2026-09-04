<script setup lang="ts">
import { ref } from "vue";
import type { BriefingSnapshot } from "@/api/types";
import { moveColor, moveLabel } from "@/lib/signals";

const props = defineProps<{ snapshot: BriefingSnapshot }>();

const resolved = ref(false);
const skipped = ref(false);

const hasQuote = () => resolved.value || !props.snapshot.quoteError || skipped.value;

function retry() {
  resolved.value = true;
}
function skip() {
  skipped.value = true;
}
</script>

<template>
  <div v-if="hasQuote()" class="quote">
    <div class="price tabular">{{ snapshot.price }}</div>
    <div class="move tabular" :style="{ color: moveColor(snapshot.changePct) }">
      {{ moveLabel(snapshot.changePct) }}
    </div>
  </div>
  <div v-else class="quote-error">
    <span class="error-badge"><span class="icon">◈</span>시세 확인 필요</span>
    <div class="actions">
      <button class="retry" @click="retry">시세만 다시 받기</button>
      <button class="skip" @click="skip">지금은 넘어가기</button>
    </div>
  </div>
</template>

<style scoped>
.quote {
  text-align: right;
}
.price {
  font: 500 20px/1.2 "IBM Plex Mono", monospace;
}
.move {
  font: 400 13px/1.4 "IBM Plex Mono", monospace;
  margin-top: 4px;
}
.quote-error {
  text-align: right;
}
.error-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 28px;
  padding: 0 10px;
  border-radius: 4px;
  background: var(--watch-bg);
  color: var(--watch);
  font-size: 12.5px;
  font-weight: 500;
}
.icon {
  font-size: 11px;
}
.actions {
  display: flex;
  gap: 4px;
  justify-content: flex-end;
  margin-top: 8px;
}
.retry {
  height: 36px;
  padding: 0 12px;
  border-radius: 4px;
  border: 0;
  background: var(--brand);
  color: var(--brand-ink);
  font-size: 12.5px;
  cursor: pointer;
}
.skip {
  height: 36px;
  padding: 0 12px;
  border-radius: 4px;
  border: 0;
  background: transparent;
  color: var(--ink2);
  font-size: 12.5px;
  cursor: pointer;
  transition: background 140ms ease;
}
.skip:hover {
  background: var(--tint);
}
</style>
