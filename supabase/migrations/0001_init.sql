-- 브리핑형 주식 대시보드 — 백엔드 캐시 스키마.
--
-- 설계 원칙: 관심종목 목록은 계정 없이 프론트엔드 localStorage에만 저장된다.
-- 이 DB는 사용자 데이터를 갖지 않고, 모든 사용자에게 동일하게 제공되는
-- 시장 데이터(브리핑 스냅샷·지수)의 캐시 역할만 한다.
--
-- backend/src/providers/marketData.ts가 이 테이블을 읽고, 값이 없으면
-- mock 데이터로 채운 뒤 여기에 써 둔다(캐시 워밍). 실 데이터 소스(DART·뉴스·
-- 컨센서스·시세)가 연동되면 별도 수집 잡(cron 등)이 이 테이블을 갱신하면 된다.

create table if not exists securities (
  ticker text primary key,
  name text not null,
  sector text not null,
  updated_at timestamptz not null default now()
);

comment on table securities is '검색 자동완성 대상 종목 유니버스';

create table if not exists briefing_snapshots (
  ticker text primary key references securities (ticker) on delete cascade,
  payload jsonb not null,
  updated_at timestamptz not null default now()
);

comment on table briefing_snapshots is
  '종목별 오늘의 브리핑 — 뉴스/공시/컨센서스/수급/차트/신호를 하나의 JSON으로 캐시';
comment on column briefing_snapshots.payload is 'BriefingSnapshot 타입(backend/src/types.ts)과 1:1';

create table if not exists market_indices (
  id text primary key default 'latest',
  payload jsonb not null,
  updated_at timestamptz not null default now()
);

comment on table market_indices is '코스피/코스닥/나스닥 등 지수 띠 — 단일 로우(id=latest)로 최신값만 유지';

-- 신호 적중률(트랙레코드) 이력 — 종목×신호 조합별로 과거 20거래일 적중 여부를 쌓아
-- briefing_snapshots.payload.hitRate/sampleN을 재계산할 때 쓴다. 지금은 mock 값을
-- 그대로 caching만 하지만, 실 신호 엔진이 붙으면 이 테이블에 매일 한 행씩 적재하면 된다.
create table if not exists signal_outcomes (
  id bigint generated always as identity primary key,
  ticker text not null references securities (ticker) on delete cascade,
  verdict text not null,
  signaled_at date not null,
  evaluated_at date,
  was_correct boolean,
  created_at timestamptz not null default now()
);

create index if not exists signal_outcomes_ticker_idx on signal_outcomes (ticker, signaled_at desc);

comment on table signal_outcomes is '신호 적중률 트랙레코드 원장 — 종목×날짜별 신호와 사후 판정';
