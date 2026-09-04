import { ref, shallowRef, watch, type Ref } from "vue";
import { api } from "@/api/client";
import type { BriefingSnapshot } from "@/api/types";

/** 관심종목 목록에 대한 브리핑 데이터 페치. tickers가 바뀌면 다시 불러온다. */
export function useBriefing(tickers: Ref<string[]>) {
  const blocks = shallowRef<BriefingSnapshot[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const lastUpdated = ref<Date | null>(null);

  // silent=true는 15분 자동 갱신용 — 화면 전체가 로딩 스켈레톤으로 깜빡이지 않게
  // loading 플래그를 건드리지 않는다. 사용자가 누르는 "지금 다시 불러오기"는 항상 loading을 보여준다.
  async function load(silent = false) {
    if (tickers.value.length === 0) {
      blocks.value = [];
      return;
    }
    if (!silent) loading.value = true;
    error.value = null;
    try {
      const data = await api.getBriefings(tickers.value);
      // 서버가 순서를 보장하지 않을 수 있어 관심종목 순서(드래그 재정렬)를 기준으로 재정렬
      const byTicker = new Map(data.map((b) => [b.ticker, b]));
      blocks.value = tickers.value.map((t) => byTicker.get(t)).filter((b): b is BriefingSnapshot => !!b);
      lastUpdated.value = new Date();
    } catch (e) {
      error.value = e instanceof Error ? e.message : "불러오지 못했습니다";
    } finally {
      if (!silent) loading.value = false;
    }
  }

  watch(tickers, () => load(), { immediate: true, deep: true });

  return { blocks, loading, error, lastUpdated, refresh: () => load(), refreshSilently: () => load(true) };
}

export function useSingleBriefing(ticker: Ref<string>) {
  const snapshot = shallowRef<BriefingSnapshot | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  async function load() {
    loading.value = true;
    error.value = null;
    try {
      snapshot.value = await api.getBriefing(ticker.value);
    } catch (e) {
      error.value = e instanceof Error ? e.message : "불러오지 못했습니다";
      snapshot.value = null;
    } finally {
      loading.value = false;
    }
  }

  watch(ticker, load, { immediate: true });

  return { snapshot, loading, error, refresh: load };
}
