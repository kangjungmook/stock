<script setup lang="ts">
import type { NewsItem } from "@/api/types";
import { TAG_TONE } from "@/lib/signals";

defineProps<{ news: NewsItem[] }>();
</script>

<template>
  <div class="news-list">
    <a v-for="(n, i) in news" :key="i" href="#" class="news-row" @click.prevent>
      <span class="time">{{ n.time }}</span>
      <span class="body">
        <span class="title">{{ n.title }}</span>
        <span class="meta">
          <span class="source">{{ n.source }}</span>
          <span class="tag" :style="{ background: TAG_TONE[n.tone].bg, color: TAG_TONE[n.tone].color }">
            <span class="icon">{{ TAG_TONE[n.tone].icon }}</span>{{ n.tag }}
          </span>
        </span>
      </span>
    </a>
  </div>
</template>

<style scoped>
.news-list {
  display: flex;
  flex-direction: column;
}
.news-row {
  display: flex;
  gap: 16px;
  padding: 14px 12px;
  margin: 0 -12px;
  border-radius: 6px;
  border-bottom: 1px solid var(--rule-soft);
  transition: background 140ms ease;
}
.news-row:hover {
  background: var(--tint);
}
.time {
  font: 400 11.5px/1.9 "IBM Plex Mono", monospace;
  color: var(--ink3);
  flex: none;
  width: 44px;
}
.body {
  min-width: 0;
}
.title {
  display: block;
  font-size: 14.5px;
  line-height: 1.6;
  color: var(--ink);
  margin-bottom: 6px;
}
.meta {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}
.source {
  font-size: 12px;
  color: var(--ink3);
}
.tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  height: 20px;
  padding: 0 7px;
  border-radius: 3px;
  font-size: 11px;
  font-weight: 500;
}
.icon {
  font-size: 9px;
}
</style>
