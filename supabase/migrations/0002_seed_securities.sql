-- backend/src/data/universe.ts의 UNIVERSE와 동일한 시드 데이터.
-- (백엔드도 briefing_snapshots를 쓰기 전에 upsert로 같은 행을 보장하므로,
--  이 시드는 Supabase 콘솔에서 바로 데이터를 확인하고 싶을 때를 위한 편의용이다.)

insert into securities (ticker, name, sector) values
  ('005930', '삼성전자', '반도체'),
  ('006400', '삼성SDI', '2차전지'),
  ('207940', '삼성바이오로직스', '바이오'),
  ('000660', 'SK하이닉스', '반도체'),
  ('035720', '카카오', '인터넷'),
  ('005380', '현대차', '자동차'),
  ('035420', 'NAVER', '인터넷'),
  ('373220', 'LG에너지솔루션', '2차전지'),
  ('068270', '셀트리온', '바이오'),
  ('267260', 'HD현대일렉트릭', '전력기기')
on conflict (ticker) do update set name = excluded.name, sector = excluded.sector;
