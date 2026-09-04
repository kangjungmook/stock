<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { api } from "@/api/client";
import type { Security } from "@/api/types";
import { useWatchlist } from "@/composables/useWatchlist";

const { list, add } = useWatchlist();
const query = ref("");
const results = ref<Security[]>([]);
let debounceHandle: ReturnType<typeof setTimeout> | null = null;

watch(query, (q) => {
  if (debounceHandle) clearTimeout(debounceHandle);
  const trimmed = q.trim();
  if (!trimmed) {
    results.value = [];
    return;
  }
  debounceHandle = setTimeout(async () => {
    try {
      results.value = await api.searchSecurities(trimmed);
    } catch {
      results.value = [];
    }
  }, 150);
});

const suggestions = computed(() =>
  results.value.slice(0, 6).map((s) => ({
    ...s,
    added: list.value.includes(s.ticker)
  }))
);

function pick(ticker: string) {
  add(ticker);
  query.value = "";
  results.value = [];
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === "Enter") {
    const first = suggestions.value[0];
    if (first && !first.added) pick(first.ticker);
  }
}
</script>

<template>
  <div class="search-wrap">
    <input
      v-model="query"
      type="text"
      placeholder="종목명 또는 티커로 검색 — 삼성전자, 005930"
      aria-label="종목 검색"
      class="search-input"
      @keydown="onKeydown"
    />
    <div v-if="suggestions.length" class="suggestions">
      <button
        v-for="s in suggestions"
        :key="s.ticker"
        class="suggestion"
        :disabled="s.added"
        @click="pick(s.ticker)"
      >
        <span :style="{ color: s.added ? 'var(--ink3)' : 'var(--ink)' }">{{ s.name }}</span>
        <span class="meta">
          <span class="ticker">{{ s.ticker }}</span>
          <span class="hint">{{ s.added ? "등록됨" : "추가" }}</span>
        </span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.search-wrap {
  position: relative;
  flex: 1 1 280px;
  min-width: 220px;
}
.search-input {
  width: 100%;
  height: 44px;
  padding: 0 14px;
  border-radius: 6px;
  border: 1px solid var(--rule);
  background: var(--surface);
  font-size: 14.5px;
  transition: border-color 160ms ease;
}
.search-input:focus {
  border-color: var(--brand-soft);
  outline: none;
}
.suggestions {
  position: absolute;
  top: 52px;
  left: 0;
  right: 0;
  z-index: 25;
  background: var(--surface);
  border: 1px solid var(--rule);
  border-radius: 6px;
  padding: 4px;
  box-shadow: 0 8px 24px oklch(0.2 0.02 170 / 0.1);
}
.suggestion {
  width: 100%;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 0 12px;
  background: transparent;
  border: 0;
  border-radius: 4px;
  cursor: pointer;
  text-align: left;
  font-size: 14.5px;
  transition: background 140ms ease;
}
.suggestion:hover:not(:disabled) {
  background: var(--tint);
}
.suggestion:disabled {
  cursor: default;
}
.meta {
  display: flex;
  align-items: center;
  gap: 10px;
}
.ticker {
  font: 400 12px "IBM Plex Mono", monospace;
  color: var(--ink3);
}
.hint {
  font-size: 11.5px;
  color: var(--ink3);
}
</style>
