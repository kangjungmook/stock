<script setup lang="ts">
import { computed, ref } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();

const PRESETS = [
  { key: "coffee", label: "자판기 커피", amount: 1000, note: "가장 많이 보내주시는 금액" },
  { key: "lunch", label: "커피 한 잔", amount: 2500, note: "넉넉하게" },
  { key: "free", label: "자유 금액", note: "500원부터" }
] as const;

const selected = ref<(typeof PRESETS)[number]["key"]>("coffee");
const customAmount = ref("");

function onCustomInput(e: Event) {
  customAmount.value = (e.target as HTMLInputElement).value.replace(/[^0-9]/g, "");
}

const sendLabel = computed(() => {
  if (selected.value === "free") {
    return customAmount.value ? Number(customAmount.value).toLocaleString("ko-KR") + "원 보내기" : "금액을 입력해 주세요";
  }
  const preset = PRESETS.find((p) => p.key === selected.value);
  return (preset && "amount" in preset ? preset.amount.toLocaleString("ko-KR") : "0") + "원 보내기";
});

// 실제 송금 링크는 준비되는 대로 환경변수로 주입 (토스/카카오페이 송금 링크).
const tossLink = import.meta.env.VITE_TOSS_SUPPORT_URL || "#";
const kakaoLink = import.meta.env.VITE_KAKAOPAY_SUPPORT_URL || "#";
</script>

<template>
  <div class="support-page">
    <h1 class="title">쓰다가 마음에 들면,<br />커피 한 잔 정도만</h1>
    <p class="lede">이 대시보드는 혼자 만들고 있습니다. 후원은 순수하게 응원이고, 안 하셔도 기능은 하나도 안 잠깁니다.</p>
    <p class="note">후원자 전용 기능이나 특전은 없습니다. 모든 기능은 누구에게나 똑같이 열려 있습니다.</p>

    <div class="presets">
      <button
        v-for="p in PRESETS"
        :key="p.key"
        class="preset"
        :class="{ selected: selected === p.key }"
        @click="selected = p.key"
      >
        <span class="preset-label">{{ p.label }}</span>
        <span class="preset-amount tabular">{{ "amount" in p ? p.amount.toLocaleString("ko-KR") + "원" : "직접 입력" }}</span>
        <span class="preset-note">{{ p.note }}</span>
      </button>
    </div>

    <div v-if="selected === 'free'" class="custom-amount">
      <label class="custom-label" for="support-amount">보내실 금액</label>
      <div class="custom-input-row">
        <input
          id="support-amount"
          :value="customAmount"
          inputmode="numeric"
          placeholder="4,500"
          aria-label="후원 금액"
          class="custom-input tabular"
          @input="onCustomInput"
        />
        <span>원</span>
      </div>
    </div>

    <div class="send-buttons">
      <a :href="tossLink" class="send-btn primary" target="_blank" rel="noopener">
        <span class="dot"></span>토스로 {{ sendLabel }}
      </a>
      <a :href="kakaoLink" class="send-btn secondary" target="_blank" rel="noopener">
        <span class="dot dark"></span>카카오페이로 보내기
      </a>
    </div>
    <p class="fine-print">송금 앱으로 이동합니다. 카드 정보를 저장하지 않고, 후원 내역은 계정과 연결되지 않습니다.</p>

    <button class="back-btn" @click="router.push('/')">브리핑으로 돌아가기</button>
  </div>
</template>

<style scoped>
.support-page {
  max-width: 720px;
  margin: 0 auto;
  padding: 48px 24px 96px;
}
.title {
  font-family: var(--font-serif);
  font-weight: 700;
  font-size: clamp(24px, 3vw, 32px);
  line-height: 1.35;
  margin: 0 0 12px;
}
.lede {
  font-size: 15px;
  line-height: 1.75;
  color: var(--ink2);
  margin: 0 0 8px;
  max-width: 52ch;
}
.note {
  font-size: 13.5px;
  line-height: 1.75;
  color: var(--ink3);
  margin: 0 0 32px;
  max-width: 52ch;
}
.presets {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 12px;
  margin-bottom: 24px;
}
.preset {
  min-height: 96px;
  padding: 16px;
  border: 1px solid var(--rule);
  background: transparent;
  border-radius: 8px;
  cursor: pointer;
  text-align: left;
  display: flex;
  flex-direction: column;
  gap: 6px;
  transition: background 140ms ease, border-color 140ms ease;
}
.preset:hover {
  background: var(--tint);
}
.preset.selected {
  border-color: var(--brand-soft);
  background: var(--tint);
}
.preset-label {
  font-size: 14.5px;
  color: var(--ink);
}
.preset-amount {
  font: 500 18px/1.2 "IBM Plex Sans KR", sans-serif;
}
.preset-note {
  font-size: 11.5px;
  color: var(--ink3);
}
.custom-amount {
  margin-bottom: 24px;
}
.custom-label {
  display: block;
  font-size: 13px;
  color: var(--ink2);
  margin-bottom: 8px;
}
.custom-input-row {
  display: flex;
  align-items: center;
  gap: 8px;
  max-width: 280px;
}
.custom-input {
  flex: 1;
  height: 44px;
  padding: 0 12px;
  border-radius: 6px;
  border: 1px solid var(--rule);
  background: var(--surface);
  font: 500 15px "IBM Plex Sans KR", sans-serif;
}
.custom-input:focus {
  border-color: var(--brand-soft);
  outline: none;
}
.send-buttons {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 16px;
}
.send-btn {
  height: 48px;
  padding: 0 20px;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
}
.send-btn.primary {
  background: var(--brand);
  color: var(--brand-ink);
}
.send-btn.secondary {
  border: 1px solid var(--rule);
  color: var(--ink);
  font-weight: 400;
}
.dot {
  width: 18px;
  height: 18px;
  border-radius: 4px;
  background: var(--brand-ink);
  opacity: 0.25;
  display: inline-block;
}
.dot.dark {
  background: var(--ink3);
  opacity: 0.4;
}
.fine-print {
  font-size: 12.5px;
  line-height: 1.7;
  color: var(--ink3);
  margin: 0 0 48px;
}
.back-btn {
  margin-top: 32px;
  height: 44px;
  padding: 0 16px;
  border-radius: 6px;
  border: 1px solid var(--rule);
  background: transparent;
  color: var(--ink2);
  font-size: 13.5px;
  cursor: pointer;
  transition: background 140ms ease;
}
.back-btn:hover {
  background: var(--tint);
}
</style>
