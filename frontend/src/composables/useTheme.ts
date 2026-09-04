import { ref, watchEffect } from "vue";

const STORAGE_KEY = "stock-briefing:theme";
export type ThemeName = "dark" | "light";

const stored = (typeof localStorage !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null) as ThemeName | null;
const theme = ref<ThemeName>(stored === "light" ? "light" : "dark");

watchEffect(() => {
  document.documentElement.dataset.theme = theme.value;
  try {
    localStorage.setItem(STORAGE_KEY, theme.value);
  } catch {
    /* 프라이빗 모드 등에서 저장 실패는 무시 */
  }
});

export function useTheme() {
  function toggleTheme() {
    theme.value = theme.value === "dark" ? "light" : "dark";
  }
  return { theme, toggleTheme };
}
