import { createApp } from "vue";
import App from "./App.vue";
import { router } from "./router";
import "./styles/tokens.css";
import "./styles/base.css";

createApp(App).use(router).mount("#app");

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => {
      /* 오프라인 캐시는 부가 기능 — 등록 실패해도 앱은 정상 동작 */
    });
  });
}
