# 데이터 provider

이 폴더는 프론트엔드가 요구하는 데이터 모양(`../types.ts`)과 실제 데이터 소스를 분리하는 자리다.

## 지금 상태 (mock)

- `../data/mockBriefings.ts`, `../data/mockProxy.ts`, `../data/mockIndices.ts`, `../data/universe.ts`가
  디자인 프로토타입(`design/Stock Briefing Dashboard.dc.html`)의 픽스처를 그대로 옮긴 목 데이터다.
- `marketData.ts`가 이 목 데이터를 감싸서 라우트에 노출한다. `SUPABASE_URL` /
  `SUPABASE_SERVICE_ROLE_KEY`가 설정돼 있으면 `briefing_snapshots` / `market_indices` /
  `securities` 테이블을 먼저 읽고, 없으면 목 데이터로 채운 뒤 그 값을 테이블에 써 둔다(캐시 워밍).
  즉 DB가 있든 없든 API 응답 모양은 동일하다.

## 실 데이터로 교체하는 법

뉴스·공시(DART)·컨센서스·시세(토스증권 등) API 키가 준비되면:

1. `env.ts`에서 해당 키를 읽어오게 하고 (`.env.example`에 이미 자리를 파 뒀다).
2. 이 폴더에 `live/newsProvider.ts` 같은 파일을 만들어 실제 API를 호출하고 `../types.ts`의 타입에
   맞춰 응답을 매핑한다.
3. `marketData.ts`의 해당 함수 내부에서 mock 호출 대신 live provider를 호출하도록 바꾼다
   (`env.dataProvider === "live"`일 때만 분기하면 mock/live를 환경변수로 즉시 전환할 수 있다).

프론트엔드는 REST 응답 모양만 보므로, 이 폴더 밖은 건드릴 필요가 없다.
