<script setup lang="ts">
import type { FilingItem } from "@/api/types";

defineProps<{ filings: FilingItem[]; showDartNote?: boolean }>();
</script>

<template>
  <div class="filings">
    <a v-for="(f, i) in filings" :key="i" href="#" class="filing-row" @click.prevent>
      <span class="date">{{ f.date }}</span>
      <span class="body">
        <span class="title">{{ f.title }}</span>
        <span class="meta">{{ f.meta }}</span>
      </span>
    </a>
    <p v-if="showDartNote" class="note">DART 원문으로 이동합니다 · 요약은 원문 기준</p>
  </div>
</template>

<style scoped>
.filings {
  display: flex;
  flex-direction: column;
}
.filing-row {
  display: flex;
  gap: 16px;
  padding: 14px 12px;
  margin: 0 -12px;
  border-radius: 6px;
  border-bottom: 1px solid var(--rule-soft);
  transition: background 140ms ease;
}
.filing-row:hover {
  background: var(--tint);
}
.date {
  font: 400 11.5px/1.9 "IBM Plex Mono", monospace;
  color: var(--ink3);
  flex: none;
  width: 64px;
}
.body {
  min-width: 0;
}
.title {
  display: block;
  font-size: 14.5px;
  line-height: 1.6;
  margin-bottom: 6px;
  color: var(--ink);
}
.meta {
  font-size: 12px;
  color: var(--ink3);
}
.note {
  font-size: 12.5px;
  color: var(--ink3);
  margin: 16px 0 0;
}
</style>
