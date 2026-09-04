import { ref } from "vue";
import { api } from "@/api/client";
import type { Security } from "@/api/types";

const cache = ref<Map<string, Security>>(new Map());
let loadPromise: Promise<void> | null = null;

function ensureLoaded() {
  if (!loadPromise) {
    loadPromise = api
      .listSecurities()
      .then((list) => {
        cache.value = new Map(list.map((s) => [s.ticker, s]));
      })
      .catch(() => {
        loadPromise = null;
      });
  }
  return loadPromise;
}

/** 티커 → 종목명/섹터 조회. 칩·검색 등 여러 곳에서 공유하는 캐시. */
export function useSecurityNames() {
  ensureLoaded();

  function nameOf(ticker: string): string {
    return cache.value.get(ticker)?.name ?? ticker;
  }

  function sectorOf(ticker: string): string {
    return cache.value.get(ticker)?.sector ?? "";
  }

  return { nameOf, sectorOf, all: cache };
}
