import AdmZip from "adm-zip";
import { XMLParser } from "fast-xml-parser";
import { env } from "../../env.js";
import { fetchWithTimeout } from "../../lib/fetchWithTimeout.js";
import type { FilingItem } from "../../types.js";

/**
 * DART(전자공시시스템) Open API — https://opendart.fss.or.kr/guide/main.do
 *
 * 1) corpCode.xml: 전체 상장/비상장 법인의 8자리 corp_code ↔ 6자리 stock_code(종목코드) 매핑을
 *    zip으로 내려준다. 프로세스 시작 후 최초 호출 시 1회 받아서 메모리에 캐시한다(24시간 재사용).
 *    파일이 커서(전체 법인) 첫 호출은 몇 초 걸릴 수 있다 — 타임아웃을 넉넉히 둔다.
 * 2) list.json: corp_code + 기간으로 공시 목록을 검색한다.
 *
 * 이 세션의 샌드박스에서는 opendart.fss.or.kr로 나가는 아웃바운드가 막혀 있어 실제 응답으로
 * 검증하지 못했다 — 배포 후 첫 호출에서 에러가 나면 로그의 status/message를 보고 알려주면 된다.
 */

const CORP_CODE_URL = "https://opendart.fss.or.kr/api/corpCode.xml";
const LIST_URL = "https://opendart.fss.or.kr/api/list.json";
const VIEWER_URL = "https://dart.fss.or.kr/dsaf001/main.do";
const CORP_CODE_TIMEOUT_MS = 15_000;
const LIST_TIMEOUT_MS = 8_000;

interface DartListItem {
  corp_code: string;
  corp_name: string;
  stock_code: string;
  corp_cls: string;
  report_nm: string;
  rcept_no: string;
  flr_nm: string;
  rcept_dt: string; // YYYYMMDD
  rm: string;
}

interface DartListResponse {
  status: string;
  message: string;
  list?: DartListItem[];
}

let corpCodeMap: Map<string, string> | null = null;
let corpCodeLoadedAt = 0;
let corpCodeInFlight: Promise<Map<string, string>> | null = null;
const CORP_CODE_TTL_MS = 24 * 60 * 60 * 1000;

async function fetchCorpCodeMap(): Promise<Map<string, string>> {
  const res = await fetchWithTimeout(`${CORP_CODE_URL}?crtfc_key=${env.dartApiKey}`, {}, CORP_CODE_TIMEOUT_MS);
  if (!res.ok) throw new Error(`DART corpCode.xml HTTP ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  const zip = new AdmZip(buf);
  const entry = zip.getEntries().find((e) => e.entryName.toUpperCase().endsWith("CORPCODE.XML"));
  if (!entry) throw new Error("DART corpCode.xml: zip에 CORPCODE.xml 없음");
  const xml = entry.getData().toString("utf-8");
  const parsed = new XMLParser().parse(xml) as {
    result?: { list?: { corp_code: string; stock_code?: string }[] };
  };
  const list = parsed.result?.list ?? [];
  const map = new Map<string, string>();
  for (const item of list) {
    const stockCode = String(item.stock_code ?? "").trim();
    if (stockCode.length === 6) map.set(stockCode, String(item.corp_code));
  }
  return map;
}

async function loadCorpCodeMap(): Promise<Map<string, string>> {
  if (corpCodeMap && Date.now() - corpCodeLoadedAt < CORP_CODE_TTL_MS) {
    return corpCodeMap;
  }
  // 여러 종목을 한꺼번에(getBriefings 배치) 요청하면 동시에 여러 번 이 큰 파일을 받으러
  // 가지 않도록, 진행 중인 요청을 공유한다.
  if (!corpCodeInFlight) {
    corpCodeInFlight = fetchCorpCodeMap()
      .then((map) => {
        corpCodeMap = map;
        corpCodeLoadedAt = Date.now();
        return map;
      })
      .finally(() => {
        corpCodeInFlight = null;
      });
  }
  return corpCodeInFlight;
}

function yyyymmdd(d: Date): string {
  return d.toISOString().slice(0, 10).replace(/-/g, "");
}

export async function fetchDartFilings(ticker: string, days = 120): Promise<FilingItem[]> {
  const map = await loadCorpCodeMap();
  const corpCode = map.get(ticker);
  if (!corpCode) return [];

  const end = new Date();
  const begin = new Date(end.getTime() - days * 24 * 60 * 60 * 1000);
  const params = new URLSearchParams({
    crtfc_key: env.dartApiKey,
    corp_code: corpCode,
    bgn_de: yyyymmdd(begin),
    end_de: yyyymmdd(end),
    page_no: "1",
    page_count: "10",
    sort: "date",
    sort_mth: "desc"
  });

  const res = await fetchWithTimeout(`${LIST_URL}?${params.toString()}`, {}, LIST_TIMEOUT_MS);
  if (!res.ok) throw new Error(`DART list.json HTTP ${res.status}`);
  const data = (await res.json()) as DartListResponse;

  // status "013" = 조회된 데이터 없음(정상) — 그 외 실패 코드는 에러로 취급
  if (data.status === "013") return [];
  if (data.status !== "000") throw new Error(`DART list.json ${data.status}: ${data.message}`);

  return (data.list ?? []).map((item) => ({
    date: `${item.rcept_dt.slice(4, 6)}.${item.rcept_dt.slice(6, 8)}`,
    title: item.report_nm,
    meta: item.flr_nm + (item.rm ? ` · ${item.rm}` : ""),
    url: `${VIEWER_URL}?rcpNo=${item.rcept_no}`
  }));
}
