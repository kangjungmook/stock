import { computed, ref, shallowRef, watch, type Ref } from "vue";
import { api } from "@/api/client";
import type { ProxySeriesResponse, Timeframe } from "@/api/types";
import { summarizeDivergence } from "@/lib/proxyGap";

export function useProxy(target: Ref<string>, timeframe: Ref<Timeframe>) {
  const data = shallowRef<ProxySeriesResponse | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  async function load() {
    loading.value = true;
    error.value = null;
    try {
      data.value = await api.getProxySeries(target.value, timeframe.value);
    } catch (e) {
      error.value = e instanceof Error ? e.message : "불러오지 못했습니다";
    } finally {
      loading.value = false;
    }
  }

  watch([target, timeframe], load, { immediate: true });

  const divergence = computed(() => (data.value ? summarizeDivergence(data.value.est, data.value.act) : null));

  return { data, divergence, loading, error, refresh: load };
}
