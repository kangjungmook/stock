# 데이터 provider — 현재 상태

각 데이터 도메인은 독립적으로 mock ↔ 실 데이터를 전환한다 (`env.ts`의 `liveProvidersConfigured`).
해당 키가 `.env`에 있으면 실 provider를 시도하고, 없거나 호출이 실패하면 조용히 mock으로
폴백한다 — 그래서 하나가 안 되도 나머지 화면은 정상 동작한다.

| 도메인 | 상태 | 소스 | 신뢰도 |
| --- | --- | --- | --- |
| 시세·차트 (§ 등락·차트) | **live** | 토스증권 Open API (`live/tossProvider.ts`, `tossinvest-openapi` SDK) | 높음 — SDK 소스를 직접 읽고 구현. 다만 이 세션에서 실제 응답으로 검증은 못 함 |
| 공시 (§ 공시) | **live** | DART Open API (`live/dartProvider.ts`) | 높음 — 안정적인 공개 API, 오래전부터 알려진 스펙 |
| 컨센서스 (§ 목표주가·투자의견) | **best-effort** | WiseReport 크롤링 (`live/consensusProvider.ts`) | 낮음 — 셀렉터 미검증, 실패 시 자동으로 mock 폴백 |
| 수급 (§ 외국인·기관 순매수) | **미구현 (stub)** | KRX Open API (`live/krxFlowsProvider.ts`) | 엔드포인트 스펙을 확인 못해 항상 mock 폴백 — 실제 요청/응답 예시가 오면 완성 가능 |
| 뉴스 | **live** | Gemini API + Google Search grounding (`live/newsProvider.ts`) | 중간 — grounding으로 실제 검색된 사건만 다루도록 강제했지만, 이 세션에서 실제 응답으로 검증은 못 함. 순수 생성(grounding 없이)은 의도적으로 안 씀 — 실제 언론사 이름을 출처로 붙인 가짜 기사 위험 때문 |
| AI 신호 스펙트럼 (§ 매수~매도 게이지) | **live** | Gemini API, grounding 없이 순수 reasoning (`live/aiVerdictProvider.ts`) | 중간 — 이미 모아둔 판단근거·컨센서스·뉴스·수급만 프롬프트에 넣고 새 사실은 못 지어내게 제한. 실패하면 필드를 아예 비워서 프론트가 위젯을 숨김(근거 없는 점수를 보여주지 않기 위함) |
| 시장 지수 / 개장 전 추정가(EWY) | mock | — | 나중으로 미룸 (사용자 결정) |

## 왜 이렇게 나눴는가

- `marketData.ts`가 mock 데이터를 기본 뼈대(헤드라인·판단근거·적중률처럼 신호 엔진이 필요한
  값)로 깔고, 그 위에 실 provider 결과를 도메인별로 덮어쓴다. 신호 엔진 자체는 별도 프로젝트라
  헤드라인/판단근거는 당분간 계속 mock이다 — 그래서 실제 가격은 실 데이터인데 브리핑 문장은
  가상의 스토리인 상태가 당분간 이어진다.
- 외부 API를 매 요청마다 부르면 rate limit에 걸리거나 느려지므로, `lib/cache.ts`의 짧은
  in-memory TTL 캐시를 거친다 (시세 1분 · 공시 30분 · 컨센서스 1시간 · 수급 30분).

## 다음 단계

- **컨센서스**: 배포 후 로그에 `[consensus] selectors did not match` 경고가 계속 뜨면, 실제로
  받은 HTML 일부를 알려주면 셀렉터를 맞춘다.
- **수급(KRX)**: `openapi.krx.co.kr`에서 "투자자별 거래실적" 신청 후 나오는 요청 예시(curl)나
  응답 JSON 샘플을 알려주면 바로 붙인다.
- **뉴스**: 배포 후 실제 그라운딩 응답 형식이 다르면(예: `google_search` 대신 다른 tool 이름을
  요구하거나 Interactions API로 완전히 넘어갔다는 에러가 나면) 에러 메시지를 알려주면 맞춘다.
