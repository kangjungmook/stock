import { onBeforeUnmount, onMounted, ref } from "vue";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const DISMISSED_KEY = "stock-briefing:pwa-dismissed";

/** "홈 화면에 추가" 안내는 1회 노출 + "지금은 넘어가기"로 즉시 닫을 수 있어야 한다. */
export function usePwaInstall() {
  const deferredPrompt = ref<BeforeInstallPromptEvent | null>(null);
  const dismissed = ref(localStorage.getItem(DISMISSED_KEY) === "1");

  function onBeforeInstall(e: Event) {
    e.preventDefault();
    deferredPrompt.value = e as BeforeInstallPromptEvent;
  }

  onMounted(() => {
    window.addEventListener("beforeinstallprompt", onBeforeInstall);
  });
  onBeforeUnmount(() => {
    window.removeEventListener("beforeinstallprompt", onBeforeInstall);
  });

  async function promptInstall() {
    if (!deferredPrompt.value) {
      dismiss();
      return;
    }
    await deferredPrompt.value.prompt();
    await deferredPrompt.value.userChoice;
    deferredPrompt.value = null;
    dismiss();
  }

  function dismiss() {
    dismissed.value = true;
    localStorage.setItem(DISMISSED_KEY, "1");
  }

  return { canPrompt: deferredPrompt, dismissed, promptInstall, dismiss };
}
