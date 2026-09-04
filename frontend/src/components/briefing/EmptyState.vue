<script setup lang="ts">
withDefaults(defineProps<{ title: string; description: string; icon?: string }>(), { icon: "◇" });
</script>

<template>
  <section class="empty-state">
    <div class="icon-badge">{{ icon }}</div>
    <h2 class="title">{{ title }}</h2>
    <p class="description">{{ description }}</p>
    <div v-if="$slots.default" class="actions">
      <slot />
    </div>
    <p v-if="$slots.footnote" class="footnote"><slot name="footnote" /></p>
  </section>
</template>

<style scoped>
.empty-state {
  padding: 56px 0 0;
}
.icon-badge {
  width: 44px;
  height: 44px;
  border-radius: 22px;
  border: 1px dashed var(--rule);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--ink3);
  margin-bottom: 24px;
}
.title {
  font-family: var(--font-serif);
  font-weight: 700;
  font-size: clamp(22px, 2.6vw, 30px);
  line-height: 1.4;
  margin: 0 0 12px;
}
.description {
  font-size: 15px;
  line-height: 1.75;
  color: var(--ink2);
  margin: 0 0 24px;
  max-width: 44ch;
}
.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.footnote {
  font-size: 12.5px;
  color: var(--ink3);
  margin: 24px 0 0;
}
</style>
