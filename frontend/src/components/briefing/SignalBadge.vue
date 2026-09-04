<script setup lang="ts">
withDefaults(
  defineProps<{
    icon: string;
    label: string;
    color: string;
    bg: string;
    size?: "sm" | "md";
  }>(),
  { size: "md" }
);
</script>

<template>
  <span class="badge" :class="size" :style="{ background: bg, color }">
    <span class="icon">{{ icon }}</span>{{ label }}
  </span>
</template>

<style scoped>
.badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border-radius: 4px;
  font-weight: 500;
  width: fit-content;
}
.badge.md {
  height: 28px;
  padding: 0 10px;
  font-size: 12.5px;
}
.badge.sm {
  height: 20px;
  padding: 0 7px;
  font-size: 11px;
}
.icon {
  font-size: 11px;
}
.badge.sm .icon {
  font-size: 9px;
}
</style>
