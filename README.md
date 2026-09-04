# 포트폴리오 주식 대시보드 — 브리핑형 개인 대시보드

관심종목만 등록하면 뉴스·공시·컨센서스·수급·차트를 "오늘 이 종목에서 벌어진 일" 한 줄로
브리핑해주는 개인화 대시보드. 계정 없음, 관심종목은 브라우저 로컬에만 저장됩니다.

디자인 근거 문서: Claude Design에서 내려받은 핸드오프 번들이 `design/` 아래 원본으로 보존되어
있습니다 (`design/Stock Briefing - Design Spec.dc.html`가 확정 스펙, `design/Stock Briefing
Dashboard.dc.html` / `design/Mobile Screens.dc.html`가 픽셀 단위 참조 프로토타입).

## 구조

```
frontend/   Vue 3 + Vite + TypeScript. 브리핑 피드, 종목 상세, 개장 전 추정가, 커피 한 잔.
backend/    Express + TypeScript API (Railway 배포 대상). 데이터는 provider 추상화 뒤에 있고,
            기본은 프로토타입과 동일한 목(mock) 데이터로 동작합니다.
supabase/   목(mock) 데이터를 대체할 실 데이터 캐시용 스키마 (briefing_snapshots, securities 등).
design/     Claude Design 핸드오프 원본 (읽기 전용 참조자료).
```

## 왜 이렇게 나눴는가

- **관심종목 목록은 계정 없이 localStorage에만 저장됩니다** (설계 원칙: 로컬 우선). 백엔드는
  사용자 데이터를 갖지 않고, 모든 사용자에게 동일한 시장 데이터(뉴스·공시·컨센서스·시세·지수·
  추정가)를 제공하는 캐시/프록시 역할만 합니다.
- 뉴스·공시(DART)·컨센서스·시세(토스증권) 같은 실제 데이터 소스는 이번 세션에서 연동할 API
  키가 없어 **mock 데이터로 동작**합니다. `backend/src/providers`에 실 데이터 소스로 교체할
  자리를 인터페이스로 분리해 뒀습니다 — 자세한 내용은 `backend/README.md` 참고.

## 로컬 실행

```bash
# 백엔드
cd backend
cp .env.example .env
npm install
npm run dev        # http://localhost:8787

# 프론트엔드 (새 터미널)
cd frontend
cp .env.example .env
npm install
npm run dev         # http://localhost:5173
```

## 배포

- **백엔드 → Railway**: `backend/railway.json` + `Procfile` 포함. Railway 프로젝트에 이 저장소를
  연결하고 루트 디렉터리를 `backend`로 지정하세요. 환경변수는 `backend/.env.example` 참고.
- **DB → Supabase**: `supabase/migrations/0001_init.sql`을 Supabase SQL Editor에서 실행하거나
  `supabase db push`로 적용한 뒤, 백엔드에 `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY`를
  넣어주면 mock 데이터 대신 Supabase 캐시를 우선 사용합니다. 값이 없으면 자동으로 mock
  데이터로 동작하므로, DB 없이도 전체 화면을 확인할 수 있습니다.
- **프론트엔드**: 정적 빌드(`npm run build` → `frontend/dist`)라 Vercel/Netlify/Cloudflare Pages
  등 어디에나 올릴 수 있습니다. 호스팅은 아직 정하지 않으셨다고 해서 특정 플랫폼에 묶어두지
  않았습니다 — 정해지면 `frontend/.env`의 `VITE_API_BASE_URL`만 배포된 백엔드 주소로 바꾸면
  됩니다.

## 실 데이터 연동이 필요할 때

뉴스/공시/컨센서스/시세 API 키가 준비되면 알려주세요. `backend/src/providers/types.ts`의
인터페이스에 맞춰 mock provider를 실 provider로 교체하면 프론트엔드 변경 없이 바로 반영됩니다.
