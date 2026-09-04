import { onBeforeUnmount, ref } from "vue";

/** 지수·시세를 일정 주기로 다시 불러오기 위한 얇은 폴링 헬퍼. */
export function usePolling(callback: () => void, intervalMs = 15 * 60 * 1000) {
  const lastRun = ref<Date | null>(null);
  let handle: ReturnType<typeof setInterval> | null = null;

  function tick() {
    callback();
    lastRun.value = new Date();
  }

  function start() {
    stop();
    handle = setInterval(tick, intervalMs);
  }

  function stop() {
    if (handle) {
      clearInterval(handle);
      handle = null;
    }
  }

  onBeforeUnmount(stop);

  return { start, stop, tick, lastRun };
}
