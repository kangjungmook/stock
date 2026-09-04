/// <reference types="vite/client" />

declare module "*.vue" {
  import type { DefineComponent } from "vue";
  const component: DefineComponent<{}, {}, unknown>;
  export default component;
}

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  readonly VITE_TOSS_SUPPORT_URL?: string;
  readonly VITE_KAKAOPAY_SUPPORT_URL?: string;
  readonly VITE_ADSENSE_CLIENT_ID?: string;
  readonly VITE_ADSENSE_SLOT_FEED?: string;
  readonly VITE_ADSENSE_SLOT_RAIL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
