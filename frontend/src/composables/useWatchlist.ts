import { ref } from "vue";

const STORAGE_KEY = "stock-briefing:watchlist";

function loadInitial(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((v) => typeof v === "string") : [];
  } catch {
    return [];
  }
}

/** 관심종목은 계정 없이 이 브라우저에만 저장된다 (설계 원칙: 로컬 우선). */
const list = ref<string[]>(loadInitial());

function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list.value));
  } catch {
    /* 저장 실패는 조용히 무시 — 세션 동안은 메모리 상태로 계속 동작 */
  }
}

export function useWatchlist() {
  function add(ticker: string) {
    if (list.value.includes(ticker)) return;
    list.value = [...list.value, ticker];
    persist();
  }

  function remove(ticker: string) {
    list.value = list.value.filter((t) => t !== ticker);
    persist();
  }

  function reorder(from: number, to: number) {
    if (from === to || from < 0 || from >= list.value.length) return;
    const next = [...list.value];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    list.value = next;
    persist();
  }

  return { list, add, remove, reorder };
}
