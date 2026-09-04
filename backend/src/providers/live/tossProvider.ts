import { TossInvestClient } from "tossinvest-openapi";
import { env } from "../../env.js";

/**
 * 토스증권 Open API — https://developers.tossinvest.com (OpenAPI 1.1.1)
 * `tossinvest-openapi` 비공식 SDK로 OAuth2 client-credentials 인증/토큰 캐시를 처리한다.
 *
 * PriceResponse에는 등락 정보가 없어(symbol/timestamp/lastPrice/currency만 제공),
 * 일봉 캔들의 전일 종가와 비교해 등락률을 직접 계산한다.
 *
 * 이 세션의 샌드박스에서는 openapi.tossinvest.com으로 나가는 아웃바운드가 막혀 있어
 * 실제 응답으로 검증하지 못했다 — 배포 후 에러가 나면 TossInvestApiError의 status/code를
 * 알려주면 된다.
 */

let client: TossInvestClient | null = null;
function getClient(): TossInvestClient {
  if (!client) {
    // SDK 기본 timeoutMs는 30초 — 그동안 /api/briefings 요청 전체가 멈춰 있으면 안 되므로 줄인다.
    client = new TossInvestClient({ clientId: env.tossClientId, clientSecret: env.tossClientSecret, timeoutMs: 8_000 });
  }
  return client;
}

export interface TossQuote {
  price: string;
  changePct: number;
  dir: "up" | "down";
  series: number[];
}

export async function fetchTossQuote(symbol: string): Promise<TossQuote | null> {
  const c = getClient();

  const [prices, candlePage] = await Promise.all([
    c.getPrices({ symbols: symbol }),
    c.getCandles({ symbol, interval: "1d", count: 31 })
  ]);

  const priceEntry = prices.find((p) => p.symbol === symbol) ?? prices[0];
  if (!priceEntry) return null;

  const last = Number(priceEntry.lastPrice);
  const candles = [...(candlePage.candles ?? [])].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );
  const series = candles.map((c2) => Number(c2.closePrice));

  // 마지막 캔들이 당일 진행 중인 캔들일 수 있어, 전일 종가는 뒤에서 두 번째 캔들을 우선 사용한다.
  const prevCloseCandle = candles.length >= 2 ? candles[candles.length - 2] : candles[candles.length - 1];
  const prevClose = prevCloseCandle ? Number(prevCloseCandle.closePrice) : last;
  const changePct = prevClose ? ((last - prevClose) / prevClose) * 100 : 0;

  return {
    price: Math.round(last).toLocaleString("ko-KR"),
    changePct: Number(changePct.toFixed(2)),
    dir: changePct >= 0 ? "up" : "down",
    series: series.length ? series : [last]
  };
}
