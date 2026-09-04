<script setup lang="ts">
import { computed } from "vue";
import type { BriefingSnapshot, Verdict } from "@/api/types";
import { SIGNAL_FILTERS, moveColor, moveLabel } from "@/lib/signals";

const props = defineProps<{
  blocks: BriefingSnapshot[];
  counts: Partial<Record<Verdict, number>>;
  modelValue: Verdict | null;
  loading: boolean;
  lastUpdated: Date | null;
}>();
const emit = defineEmits<{
  (e: "update:modelValue", value: Verdict | null): void;
  (e: "refresh"): void;
  (e: "open-support"): void;
}>();

function pick(label: Verdict) {
  emit("update:modelValue", props.modelValue === label ? null : label);
}

const schedule = computed(() =>
  props.blocks
    .filter((b) => b.upcomingEvent)
    .map((b) => b.upcomingEvent!)
    .slice(0, 4)
);

const lastSyncLabel = computed(() => {
  if (props.loading) return "불러오는 중…";
  if (!props.lastUpdated) return "아직 갱신 전 · 15분마다 자동";
  const hh = String(props.lastUpdated.getHours()).padStart(2, "0");
  const mm = String(props.lastUpdated.getMinutes()).padStart(2, "0");
  return `마지막 갱신 ${hh}:${mm} · 15분마다 자동`;
});
</script>

<template>
  <aside class="rail" data-layout="rail">
    <div class="label">오늘의 신호</div>
    <div class="signal-list">
      <button v-for="s in SIGNAL_FILTERS" :key="s.label" class="signal-btn" :class="{ active: modelValue === s.label }" @click="pick(s.label)">
        <span class="signal-left">
          <span class="icon" :style="{ color: s.color }">{{ s.icon }}</span>{{ s.label }}만 보기
        </span>
        <span class="n">{{ counts[s.label] || 0 }}</span>
      </button>
    </div>

    <div class="label">등락</div>
    <div class="mini-list">
      <div v-for="b in blocks" :key="b.ticker" class="mini-row">
        <span class="mini-name">{{ b.name }}</span>
        <span class="mini-move tabular" :style="{ color: moveColor(b.changePct) }">{{ moveLabel(b.changePct) }}</span>
      </div>
    </div>

    <template v-if="schedule.length">
      <div class="label">예정된 일정</div>
      <div class="schedule-list">
        <div v-for="(e, i) in schedule" :key="i" class="schedule-row">
          <span class="schedule-date">{{ e.date }}</span>
          <span class="schedule-text">{{ e.text }}</span>
        </div>
      </div>
    </template>

    <div class="rail-foot">
      <div class="sync-label">{{ lastSyncLabel }}</div>
      <button class="refresh-btn" @click="emit('refresh')">지금 다시 불러오기</button>
      <button class="support-link" @click="emit('open-support')">커피 한 잔 보내기</button>
    </div>
  </aside>
</template>

<style scoped>
.rail {
  position: sticky;
  top: 132px;
  padding-top: 40px;
}
.label {
  font: 500 11px/1 "IBM Plex Mono", monospace;
  letter-spacing: 0.09em;
  text-transform: uppercase;
  color: var(--ink3);
  margin-bottom: 16px;
}
.signal-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 32px;
}
.signal-btn {
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 0 10px;
  margin: 0 -10px;
  border: 0;
  border-radius: 6px;
  background: transparent;
  cursor: pointer;
  transition: background 140ms ease;
}
.signal-btn:hover,
.signal-btn.active {
  background: var(--tint);
}
.signal-left {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 13.5px;
  color: var(--ink2);
  font-weight: 400;
}
.signal-btn.active .signal-left {
  font-weight: 600;
}
.icon {
  font-size: 10px;
}
.n {
  font: 500 13px "IBM Plex Mono", monospace;
}
.mini-list {
  display: flex;
  flex-direction: column;
  margin-bottom: 32px;
}
.mini-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 8px 0;
  border-bottom: 1px solid var(--rule-soft);
}
.mini-name {
  font-size: 13.5px;
}
.mini-move {
  font: 400 12.5px "IBM Plex Mono", monospace;
}
.schedule-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 32px;
}
.schedule-row {
  display: flex;
  gap: 12px;
}
.schedule-date {
  font: 400 11.5px/1.6 "IBM Plex Mono", monospace;
  color: var(--brand-soft);
  flex: none;
  width: 44px;
}
.schedule-text {
  font-size: 13px;
  line-height: 1.6;
  color: var(--ink2);
}
.rail-foot {
  padding-top: 16px;
  border-top: 1px solid var(--rule-soft);
}
.sync-label {
  font-size: 12.5px;
  color: var(--ink3);
  margin-bottom: 12px;
}
.refresh-btn {
  height: 44px;
  width: 100%;
  border-radius: 6px;
  border: 1px solid var(--rule);
  background: transparent;
  font-size: 13.5px;
  color: var(--ink2);
  cursor: pointer;
  transition: background 140ms ease;
}
.refresh-btn:hover {
  background: var(--tint);
}
.support-link {
  height: 44px;
  width: 100%;
  border-radius: 6px;
  border: 0;
  background: transparent;
  font-size: 13px;
  color: var(--ink3);
  cursor: pointer;
  text-align: left;
  padding: 0 4px;
  transition: color 140ms ease;
}
.support-link:hover {
  color: var(--brand-soft);
}

@media (max-width: 1023px) {
  .rail {
    position: static;
    order: 1;
    padding-top: 32px;
    border-top: 1px solid var(--rule);
    margin-top: 40px;
  }
}
</style>
