import { createRouter, createWebHistory, type RouteRecordRaw } from "vue-router";

const routes: RouteRecordRaw[] = [
  {
    path: "/",
    name: "briefing",
    component: () => import("@/views/BriefingView.vue")
  },
  {
    path: "/stock/:ticker",
    name: "stock-detail",
    component: () => import("@/views/StockDetailView.vue"),
    props: true
  },
  {
    path: "/proxy",
    name: "proxy",
    component: () => import("@/views/ProxyView.vue")
  },
  {
    path: "/support",
    name: "support",
    component: () => import("@/views/SupportView.vue")
  }
];

export const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 };
  }
});
