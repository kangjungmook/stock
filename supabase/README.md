# Supabase 스키마

**배포된 프로젝트**: `stock-briefing` (ref `acrwvfipjtclrqdpadce`, ap-northeast-2). 마이그레이션
`0001_init.sql`, `0002_seed_securities.sql`은 이미 적용되어 있다.

다른 프로젝트에 새로 적용하려면 SQL Editor에 순서대로 붙여넣어 실행하거나, CLI로:

```bash
supabase link --project-ref <프로젝트 ref>
supabase db push
```

## 키: service_role이 아니라 publishable(anon) 키를 쓴다

`backend/.env`의 `SUPABASE_SERVICE_ROLE_KEY`에 실제로는 **publishable(anon) 키**가 들어 있다 —
이름과 다르게 동작해서 헷갈릴 수 있어 짚어둔다.

이유: 이 테이블들(`securities`/`briefing_snapshots`/`market_indices`/`signal_outcomes`)은
전부 계정 없이 누구에게나 동일하게 보이는 공개 시장 데이터 캐시이고, RLS(Row Level Security)를
켜지 않았다. Supabase는 테이블에 RLS를 켜지 않으면 PostgREST를 통한 접근이 anon 키든
service_role 키든 동일하게 전체 허용되므로, 굳이 노출되면 위험한 service_role 시크릿을 쓸
필요가 없다 — publishable 키로 충분하고, 새는 키의 피해 범위도 "공개 데이터 캐시가 지저분해질
수 있다" 정도로 훨씬 작다.

**나중에 사용자 계정·결제처럼 진짜 민감한 데이터가 생기면** 그 테이블들은 RLS를 켜고
service_role 키로 분리해야 한다 — 지금 이 4개 테이블에는 해당 사항 없음.

## mock 폴백

`SUPABASE_URL`/`SUPABASE_SERVICE_ROLE_KEY`를 비워두면 자동으로 mock 데이터로 동작하므로,
Supabase 프로젝트 없이도 프론트엔드 전체 화면을 확인할 수 있다.
