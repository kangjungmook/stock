<script setup lang="ts">
defineProps<{ act: string; est: string }>();
</script>

<template>
  <div class="badges">
    <span class="badge act">
      <span class="swatch act-swatch"></span>
      <span class="label">토스증권 실제가</span>
      <span class="value tabular">{{ act }}</span>
    </span>
    <span class="badge est">
      <span class="swatch est-swatch"></span>
      <span class="label">EWY 추정가</span>
      <span class="value tabular">{{ est }}</span>
    </span>
  </div>
</template>

<style scoped>
.badges {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
.badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  height: 28px;
  padding: 0 10px;
  border-radius: 4px;
  font-size: 12.5px;
}
.badge.act {
  background: var(--proxy-act-bg);
}
.badge.est {
  background: var(--proxy-est-bg);
}
.label {
  color: var(--ink2);
}
.value {
  font-weight: 500;
}
.swatch {
  width: 14px;
  display: inline-block;
}
.act-swatch {
  height: 2px;
  background: var(--proxy-act);
}
.est-swatch {
  height: 0;
  border-top: 2px dashed var(--proxy-est);
}
</style>
