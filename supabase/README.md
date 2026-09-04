# Supabase 스키마

`migrations/0001_init.sql`, `migrations/0002_seed_securities.sql`를 순서대로 Supabase SQL
Editor에 붙여넣어 실행하거나, Supabase CLI가 있다면:

```bash
supabase link --project-ref <프로젝트 ref>
supabase db push
```

적용 후 백엔드 `.env`에 `SUPABASE_URL`과 `SUPABASE_SERVICE_ROLE_KEY`(anon key 아님 — 서버에서만
씀)를 채우면, `backend/src/providers/marketData.ts`가 mock 데이터 대신 이 DB를 캐시로 사용한다.
값을 비워두면 자동으로 mock 데이터로 동작하므로, Supabase 프로젝트를 만들기 전에도 프론트엔드
전체 화면을 확인할 수 있다.
