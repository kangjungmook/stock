<template>
  <section class="loading">
    <div v-for="i in 2" :key="i" class="skeleton-block">
      <div class="row">
        <div class="bar" style="width: 120px"></div>
        <div class="bar" style="width: 92px"></div>
      </div>
      <div class="bar big" style="width: 26%"></div>
      <div class="bar" style="width: 88%"></div>
      <div class="bar" style="width: 52%"></div>
    </div>
    <p class="note">뉴스·공시·컨센서스·수급을 모으고 있습니다</p>
  </section>
</template>

<style scoped>
.loading {
  padding: 32px 0 0;
}
.skeleton-block {
  border-top: 2px solid var(--rule);
  padding: 20px 0 40px;
  animation: pulse 1.6s ease-in-out infinite;
}
.row {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 16px;
}
.bar {
  height: 12px;
  border-radius: 3px;
  background: var(--sunken);
  margin-bottom: 8px;
}
.bar.big {
  height: 22px;
  margin-bottom: 16px;
}
.row .bar {
  height: 18px;
  margin-bottom: 0;
}
.note {
  font-size: 13px;
  color: var(--ink3);
  margin: 0;
}
</style>
