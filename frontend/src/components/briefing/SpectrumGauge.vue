<script setup lang="ts">
import { computed } from "vue";
import type { AiVerdict } from "@/api/types";
import { useTheme } from "@/composables/useTheme";
import { SPECTRUM_STEPS, scoreToIndex, scoreToLabel, spectrumColor } from "@/lib/spectrum";

const props = defineProps<{ verdict: AiVerdict }>();
const { theme } = useTheme();

const activeIndex = computed(() => scoreToIndex(props.verdict.score));
const label = computed(() => scoreToLabel(props.verdict.score));
const steps = computed(() => Array.from({ length: SPECTRUM_STEPS }, (_, i) => spectrumColor(i, theme.value)));
const activeColor = computed(() => steps.value[activeIndex.value]);

const updatedLabel = computed(() => {
  const d = new Date(props.verdict.updatedAt);
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${hh}:${mm} 기준`;
});
</script>

<template>
  <div class="spectrum">
    <div class="spectrum-head">
      <span class="spectrum-label" :style="{ color: activeColor }">{{ label }}</span>
      <span class="spectrum-meta">{{ updatedLabel }}</span>
    </div>
    <p class="spectrum-summary">{{ verdict.summary }}</p>
    <div class="dots" role="img" :aria-label="`AI 신호 스펙트럼, 매수부터 매도까지 중 ${label} 위치`">
      <span
        v-for="(color, i) in steps"
        :key="i"
        class="dot"
        :class="{ active: i === activeIndex }"
        :style="{ background: color }"
      />
    </div>
    <div class="scale">
      <span>매수</span>
      <span>관망</span>
      <span>매도</span>
    </div>
    <p class="disclaimer">AI가 이미 수집된 근거·컨센서스·뉴스·수급만 보고 매긴 참고 점수이며, 매수·매도 권유가 아닙니다.</p>
  </div>
</template>

<style scoped>
.spectrum {
  padding: var(--s-4) 0 0;
}
.spectrum-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: var(--s-3);
  margin-bottom: var(--s-2);
}
.spectrum-label {
  font-size: var(--text-brief);
  font-weight: 600;
}
.spectrum-meta {
  font: 400 var(--text-micro) "IBM Plex Mono", monospace;
  color: var(--ink3);
  flex: none;
}
.spectrum-summary {
  font-size: var(--text-body);
  color: var(--ink2);
  line-height: 1.6;
  margin: 0 0 var(--s-6);
  max-width: 56ch;
}
.dots {
  display: flex;
  gap: var(--s-2);
  margin-bottom: var(--s-2);
}
.dot {
  flex: 1;
  height: 10px;
  border-radius: 3px;
  opacity: 0.38;
  transition: opacity 160ms ease, transform 160ms cubic-bezier(0.32, 0.72, 0, 1);
}
.dot.active {
  opacity: 1;
  transform: scaleY(1.6);
}
.scale {
  display: flex;
  justify-content: space-between;
  font-size: var(--text-micro);
  color: var(--ink3);
  margin-bottom: var(--s-4);
}
.disclaimer {
  font-size: var(--text-micro);
  line-height: 1.7;
  color: var(--ink3);
  margin: 0;
}
</style>
