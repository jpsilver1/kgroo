import { useMemo, useState } from "react";
import {
  Bell,
  Bot,
  ChevronRight,
  Newspaper,
  Plus,
  ShieldCheck,
  Sparkles,
  Star,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useLocation } from "react-router-dom";
import { AppLayout } from "./components/AppLayout";
import "./styles.css";

type Screen =
  | "home"
  | "portfolio"
  | "screener"
  | "watchlist"
  | "ai"
  | "newsReports"
  | "disclosureIr"
  | "alerts"
  | "plans"
  | "settings";
type Market = "kr" | "us";

type Stock = {
  rank: number;
  name: string;
  ticker: string;
  price: string;
  change: number;
  marketCap: string;
  sector: string;
  market: Market;
  per: number;
  pbr: number;
  roe: number;
  dividend: number;
};

type ScreenerFilters = {
  market: Market;
  minMarketCap: number;
  sector: string;
  minPer: number;
  maxPer: number;
  minPbr: number;
  maxPbr: number;
  minRoe: number;
  minDividend: number;
};

type AssetKey = "cash" | "stock" | "gold" | "dollar" | "other";

type AssetAllocation = Record<AssetKey, number>;

type AIAdviceResult = {
  advice: string;
  recommended_portfolio: AssetAllocation;
  reason: string;
};

const API_BASE_URL = ((import.meta as unknown as { env?: Record<string, string> }).env?.VITE_API_URL) ?? "http://127.0.0.1:8000";

type Holding = {
  rank: number;
  name: string;
  ticker: string;
  market: Market;
  price: string;
  weight: string;
  rate: number;
  qty: number;
  evalAmount: string;
  buyAmount: string;
};

const marketIndices = [
  { name: "코스피", value: "2,734.18", change: 0.61 },
  { name: "코스닥", value: "849.82", change: -0.21 },
  { name: "나스닥", value: "18,635.22", change: 0.9 },
  { name: "다우존스", value: "39,501.24", change: -0.16 },
  { name: "S&P500", value: "5,063.46", change: 0.6 },
];

const feedItems = [
  { type: "기업설명회", company: "삼성전자", title: "AI 메모리 수요와 파운드리 회복 계획 공유", time: "09:10" },
  { type: "분기보고서", company: "HD현대", title: "조선 수주잔고 증가와 에너지 설비 마진 개선", time: "10:35" },
  { type: "대량보유", company: "LG화학", title: "기관 투자자 보유비중 1.3%p 증가", time: "11:20" },
];

const stocks: Stock[] = [
  { rank: 1, name: "삼성전자", ticker: "005930", price: "74,300원", change: 1.7, marketCap: "443.6조", sector: "반도체", market: "kr", per: 14.2, pbr: 1.28, roe: 9.1, dividend: 2.1 },
  { rank: 2, name: "SK하이닉스", ticker: "000660", price: "181,900원", change: 2.8, marketCap: "132.4조", sector: "반도체", market: "kr", per: 18.8, pbr: 2.1, roe: 13.6, dividend: 1.1 },
  { rank: 3, name: "현대차", ticker: "005380", price: "247,500원", change: -0.6, marketCap: "51.8조", sector: "자동차", market: "kr", per: 6.1, pbr: 0.72, roe: 12.3, dividend: 4.4 },
  { rank: 4, name: "NAVER", ticker: "035420", price: "187,200원", change: 0.4, marketCap: "30.1조", sector: "플랫폼", market: "kr", per: 24.6, pbr: 1.15, roe: 7.8, dividend: 0.7 },
  { rank: 5, name: "LG화학", ticker: "051910", price: "314,500원", change: -0.8, marketCap: "22.2조", sector: "소재", market: "kr", per: 21.6, pbr: 0.92, roe: 5.4, dividend: 2.9 },
  { rank: 6, name: "Tesla", ticker: "TSLA", price: "$259.81", change: 3.3, marketCap: "$829.4B", sector: "EV", market: "us", per: 54.7, pbr: 9.2, roe: 16.4, dividend: 0 },
  { rank: 7, name: "Apple", ticker: "AAPL", price: "$189.54", change: 0.9, marketCap: "$2.9T", sector: "테크", market: "us", per: 29.4, pbr: 39.1, roe: 148.2, dividend: 0.5 },
  { rank: 8, name: "NVIDIA", ticker: "NVDA", price: "$923.40", change: 4.2, marketCap: "$2.3T", sector: "반도체", market: "us", per: 68.5, pbr: 46.3, roe: 69.2, dividend: 0.1 },
  { rank: 9, name: "Microsoft", ticker: "MSFT", price: "$421.90", change: -0.2, marketCap: "$3.1T", sector: "테크", market: "us", per: 35.2, pbr: 12.8, roe: 38.7, dividend: 0.7 },
  { rank: 10, name: "JPMorgan", ticker: "JPM", price: "$198.36", change: 1.1, marketCap: "$571.2B", sector: "금융", market: "us", per: 12.0, pbr: 1.9, roe: 15.2, dividend: 2.3 },
];

const screenerStocks: Stock[] = Array.from({ length: 60 }, (_, index) => {
  const sectors = ["반도체", "바이오", "금융", "에너지", "자동차", "플랫폼"];
  const market: Market = index % 2 === 0 ? "kr" : "us";
  const sector = sectors[index % sectors.length];
  const cap = market === "kr" ? 1.5 + ((index * 7) % 98) : 8 + ((index * 37) % 900);
  const change = Number((((index * 13) % 90) / 10 - 4.2).toFixed(1));
  const priceNumber = market === "kr" ? 12000 + index * 4300 : 45 + index * 8.7;
  return {
    rank: index + 1,
    name: market === "kr" ? `${sector}코어 ${index + 1}` : `${sector} Global ${index + 1}`,
    ticker: market === "kr" ? `${String(100000 + index).slice(0, 6)}` : `NJ${index + 10}`,
    price: market === "kr" ? `${Math.round(priceNumber).toLocaleString()}원` : `$${priceNumber.toFixed(2)}`,
    change,
    marketCap: market === "kr" ? `${cap.toFixed(1)}조` : `$${cap.toFixed(1)}B`,
    sector,
    market,
    per: Number((6 + ((index * 5) % 55) + (index % 3) * 0.4).toFixed(1)),
    pbr: Number((0.4 + ((index * 3) % 35) / 10).toFixed(1)),
    roe: Number((3 + ((index * 11) % 280) / 10).toFixed(1)),
    dividend: Number((((index * 7) % 70) / 10).toFixed(1)),
  };
});

const defaultScreenerFilters: ScreenerFilters = {
  market: "kr",
  minMarketCap: 0,
  sector: "전체",
  minPer: 0,
  maxPer: 80,
  minPbr: 0,
  maxPbr: 50,
  minRoe: 0,
  minDividend: 0,
};

const portfolioAssets = [
  { name: "주식", value: 45, target: 40, color: "#664efa" },
  { name: "현금", value: 22, target: 25, color: "#22c55e" },
  { name: "달러", value: 14, target: 15, color: "#0ea5e9" },
  { name: "금", value: 9, target: 10, color: "#f59e0b" },
  { name: "예금", value: 5, target: 5, color: "#3b82f6" },
  { name: "보험", value: 3, target: 3, color: "#8888aa" },
  { name: "부동산", value: 2, target: 2, color: "#14b8a6" },
];

const holdings: Holding[] = [
  { rank: 1, name: "삼성전자", ticker: "005930", market: "kr", price: "74,300원", weight: "25.3%", rate: 8.6, qty: 36, evalAmount: "2,674,800원", buyAmount: "2,463,000원" },
  { rank: 2, name: "SK하이닉스", ticker: "000660", market: "kr", price: "181,900원", weight: "20.1%", rate: 7.7, qty: 50, evalAmount: "9,095,000원", buyAmount: "8,440,000원" },
  { rank: 3, name: "현대차", ticker: "005380", market: "kr", price: "247,500원", weight: "12.4%", rate: -2.1, qty: 18, evalAmount: "4,455,000원", buyAmount: "4,550,000원" },
  { rank: 4, name: "LG화학", ticker: "051910", market: "kr", price: "314,500원", weight: "7.8%", rate: -4.3, qty: 11, evalAmount: "3,459,500원", buyAmount: "3,615,000원" },
  { rank: 5, name: "Tesla", ticker: "TSLA", market: "us", price: "$259.81", weight: "13.2%", rate: 12.4, qty: 18, evalAmount: "$4,676.58", buyAmount: "$4,160.00" },
  { rank: 6, name: "NVIDIA", ticker: "NVDA", market: "us", price: "$923.40", weight: "11.8%", rate: 18.7, qty: 6, evalAmount: "$5,540.40", buyAmount: "$4,668.00" },
  { rank: 7, name: "Microsoft", ticker: "MSFT", market: "us", price: "$421.90", weight: "9.4%", rate: 3.2, qty: 10, evalAmount: "$4,219.00", buyAmount: "$4,088.00" },
];

const disclosures = [
  { date: "2026-05-15", time: "15:42", company: "삼성전자", title: "기업설명회(IR) 개최", submitter: "삼성전자" },
  { date: "2026-05-15", time: "14:05", company: "LG화학", title: "분기보고서 제출", submitter: "LG화학" },
  { date: "2026-05-14", time: "17:21", company: "현대차", title: "대량보유상황보고서", submitter: "국민연금" },
];

const reports = [
  { company: "SK하이닉스", title: "HBM 공급 확대, 목표주가 상향", target: "230,000원", current: "181,900원", house: "미래에셋", rating: "BUY" },
  { company: "현대차", title: "환율 효과와 미국 판매 믹스 개선", target: "310,000원", current: "247,500원", house: "NH투자", rating: "BUY" },
  { company: "NAVER", title: "광고 회복은 완만, 커머스는 견조", target: "230,000원", current: "187,200원", house: "KB증권", rating: "HOLD" },
];

const news = [
  { company: "NVIDIA", source: "Bloomberg", title: "AI 칩 수요 강세로 데이터센터 매출 전망 상향", tag: "AI" },
  { company: "삼성전자", source: "연합", title: "차세대 HBM 공급 협상 진전", tag: "반도체" },
  { company: "JPMorgan", source: "Reuters", title: "금리 인하 지연에도 은행 순이자마진 방어", tag: "금융" },
];

const watchlistGroups = [
  { name: "AI 반도체 핵심", count: 4, tickers: ["005930", "000660", "NVDA", "MSFT"], note: "HBM, 데이터센터, 클라우드 노출" },
  { name: "배당 현금흐름", count: 3, tickers: ["005380", "JPM", "051910"], note: "배당수익률 2% 이상 중심" },
  { name: "방어형 자산 후보", count: 5, tickers: ["GLD", "UUP", "KO", "KRW", "CASH"], note: "금, 달러, 현금성 비중 점검" },
];

const routeScreens: Record<string, { id: Screen; title: string }> = {
  "/": { id: "home", title: "Dashboard" },
  "/portfolio": { id: "portfolio", title: "Portfolio" },
  "/screener": { id: "screener", title: "Screener" },
  "/watchlist": { id: "watchlist", title: "Watchlist" },
  "/ai": { id: "ai", title: "AI 조언" },
  "/news-reports": { id: "newsReports", title: "News & Reports" },
  "/disclosure-ir": { id: "disclosureIr", title: "공시/IR" },
  "/alerts": { id: "alerts", title: "자동매매 알림" },
  "/plans": { id: "plans", title: "구독플랜" },
  "/settings": { id: "settings", title: "설정" },
};

function Change({ value }: { value: number }) {
  const Icon = value >= 0 ? TrendingUp : TrendingDown;
  return (
    <span className={value >= 0 ? "change up" : "change down"}>
      <Icon size={14} />
      {value >= 0 ? "+" : ""}{value.toFixed(1)}%
    </span>
  );
}

function DonutChart() {
  const gradient = portfolioAssets.slice(0, 5).map((asset, index) => {
    const start = portfolioAssets.slice(0, index).reduce((sum, item) => sum + item.value, 0);
    const end = start + asset.value;
    return `${asset.color} ${start}% ${end}%`;
  }).join(", ");

  return (
    <div className="donut css-donut" style={{ background: `conic-gradient(${gradient})` }} aria-label="자산 비중 차트" />
  );
}

function AllocationBarChart() {
  return (
    <div className="allocation-bars-chart" aria-label="현재비중 목표비중 비교 차트">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={portfolioAssets} layout="vertical" margin={{ top: 8, right: 18, bottom: 8, left: 8 }}>
          <CartesianGrid stroke="#2a2a3a" horizontal={false} />
          <XAxis type="number" domain={[0, 60]} tick={{ fill: "#8888aa", fontSize: 11 }} tickLine={false} axisLine={false} />
          <YAxis dataKey="name" type="category" tick={{ fill: "#f0f0f0", fontSize: 12 }} tickLine={false} axisLine={false} width={58} />
          <Tooltip
            contentStyle={{ background: "#1a1a24", border: "1px solid #2a2a3a", borderRadius: 8, color: "#f0f0f0" }}
            formatter={(value, name) => [`${value}%`, name === "value" ? "현재" : "목표"]}
          />
          <Bar dataKey="target" fill="#2a2a3a" radius={[0, 6, 6, 0]} barSize={10} name="목표" />
          <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={10} name="현재">
            {portfolioAssets.map((asset) => <Cell key={asset.name} fill={asset.color} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function App() {
  const location = useLocation();
  const route = routeScreens[location.pathname] ?? routeScreens["/"];
  const activeScreen = route.id;
  const [market, setMarket] = useState<Market>("kr");
  const [portfolioTab, setPortfolioTab] = useState("자산현황");
  const [query, setQuery] = useState("");
  const [rightPanelOpen, setRightPanelOpen] = useState(true);
  const [targetModalOpen, setTargetModalOpen] = useState(false);
  const [draftFilters, setDraftFilters] = useState<ScreenerFilters>(defaultScreenerFilters);
  const [appliedFilters, setAppliedFilters] = useState<ScreenerFilters>(defaultScreenerFilters);
  const [screenerLoading, setScreenerLoading] = useState(false);
  const [screenerSort, setScreenerSort] = useState<"marketCap" | "change">("marketCap");
  const [screenerPage, setScreenerPage] = useState(1);
  const [selectedScreenerTicker, setSelectedScreenerTicker] = useState<string | null>(null);
  const [age, setAge] = useState(32);
  const [monthlyIncome, setMonthlyIncome] = useState(420);
  const [investmentStyle, setInvestmentStyle] = useState("중립형");

  const filteredScreenerStocks = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return screenerStocks
      .filter((stock) => {
      const cap = Number.parseFloat(stock.marketCap.replace(/[^0-9.]/g, ""));
      const marketMatch = stock.market === appliedFilters.market;
      const sectorMatch = appliedFilters.sector === "전체" || stock.sector === appliedFilters.sector;
      const queryMatch = !normalized || stock.name.toLowerCase().includes(normalized) || stock.ticker.toLowerCase().includes(normalized);
      const capMatch = cap >= appliedFilters.minMarketCap;
      const perMatch = stock.per >= appliedFilters.minPer && stock.per <= appliedFilters.maxPer;
      const pbrMatch = stock.pbr >= appliedFilters.minPbr && stock.pbr <= appliedFilters.maxPbr;
      const roeMatch = stock.roe >= appliedFilters.minRoe;
      const dividendMatch = stock.dividend >= appliedFilters.minDividend;
      return marketMatch && sectorMatch && queryMatch && capMatch && perMatch && pbrMatch && roeMatch && dividendMatch;
    })
    .sort((a, b) => {
      if (screenerSort === "change") return b.change - a.change;
      return Number.parseFloat(b.marketCap.replace(/[^0-9.]/g, "")) - Number.parseFloat(a.marketCap.replace(/[^0-9.]/g, ""));
    });
  }, [appliedFilters, query, screenerSort]);

  const updateScreenerSort = (nextSort: "marketCap" | "change") => {
    setScreenerSort(nextSort);
    setScreenerPage(1);
  };

  const screenerSectors = ["전체", ...Array.from(new Set(screenerStocks.filter((stock) => stock.market === draftFilters.market).map((stock) => stock.sector)))];
  const pagedScreenerStocks = filteredScreenerStocks.slice((screenerPage - 1) * 20, screenerPage * 20);
  const screenerTotalPages = Math.max(1, Math.ceil(filteredScreenerStocks.length / 20));
  const activeTitle = route.title;

  const applyScreenerFilters = () => {
    setScreenerLoading(true);
    window.setTimeout(() => {
      setAppliedFilters(draftFilters);
      setScreenerPage(1);
      setSelectedScreenerTicker(null);
      setScreenerLoading(false);
    }, 900);
  };

  const resetScreenerFilters = () => {
    setDraftFilters(defaultScreenerFilters);
    setAppliedFilters(defaultScreenerFilters);
    setScreenerPage(1);
    setSelectedScreenerTicker(null);
  };

  return (
    <AppLayout
      title={activeTitle}
      query={query}
      onQueryChange={setQuery}
      rightPanelOpen={rightPanelOpen}
      onToggleRightPanel={() => setRightPanelOpen(!rightPanelOpen)}
      marketStrip={
        <section className="market-strip">
          {marketIndices.map((item) => (
            <article key={item.name}>
              <span>{item.name}</span>
              <strong>{item.value}</strong>
              <Change value={item.change} />
            </article>
          ))}
        </section>
      }
      rightRail={<RightRail />}
    >
          {activeScreen === "home" && (
            <div className="dashboard-view">
              <section className="panel portfolio-snapshot">
                <div className="panel-heading compact-heading">
                  <h2>내 자산 비중</h2>
                  <Sparkles size={18} />
                </div>
                <div className="asset-grid">
                  <DonutChart />
                  <div className="asset-legend">
                    {portfolioAssets.slice(0, 5).map((asset) => (
                      <div key={asset.name}>
                        <span><i style={{ background: asset.color }} />{asset.name}</span>
                        <strong>{asset.value}%</strong>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              <section className="dashboard-side">
                <article className="panel ai-daily-card">
                  <div className="ai-daily-icon"><Sparkles size={20} /></div>
                  <div>
                    <span>AI 오늘의 한줄 조언</span>
                    <p>현금 비중을 8%p 늘리면 변동성 방어력이 좋아집니다.</p>
                  </div>
                </article>
                <div className="dashboard-summary-grid">
                  <SummaryCard label="총 자산" value="45,230,000원" detail="전일 대비 +124,000원" />
                  <SummaryCard label="오늘 수익" value="+124,000원" detail="+0.27%" tone="up" />
                  <SummaryCard label="수익률" value="+8.2%" detail="누적 평가손익" tone="up" />
                </div>
              </section>

              <StockTable title="인기 검색기업 TOP 10" stocks={stocks.slice(0, 10)} onMarketChange={setMarket} market={market} />
            </div>
          )}

          {activeScreen === "portfolio" && (
            <div className="portfolio-view">
              <div className="summary-row">
                <SummaryCard label="총 자산" value="45,230,000원" detail="전체계좌 3개" />
                <SummaryCard label="평가손익" value="+3,420,000원" detail="+8.2%" tone="up" />
                <SummaryCard label="오늘 수익" value="+124,000원" detail="+0.27%" tone="up" />
              </div>
              <section className="panel">
                <div className="panel-heading">
                  <div>
                    <h2>자산현황</h2>
                    <p>현재 비중과 목표 비중을 비교합니다.</p>
                  </div>
                  <div className="panel-actions">
                    <button type="button" className="ghost-action" onClick={() => setTargetModalOpen(true)}>목표비중 설정</button>
                    <div className="segmented">
                      {["자산현황", "보유종목"].map((tab) => (
                        <button key={tab} type="button" className={portfolioTab === tab ? "active" : ""} onClick={() => setPortfolioTab(tab)}>{tab}</button>
                      ))}
                    </div>
                  </div>
                </div>
                {portfolioTab === "자산현황" ? (
                  <div className="allocation-layout">
                    <section className="allocation-chart-card">
                      <h3>현재 자산 배분</h3>
                      <DonutChart />
                      <div className="asset-legend compact-legend">
                        {portfolioAssets.map((asset) => (
                          <div key={asset.name}>
                            <span><i style={{ background: asset.color }} />{asset.name}</span>
                            <strong>{asset.value}%</strong>
                          </div>
                        ))}
                      </div>
                    </section>
                    <section className="allocation-compare-card">
                      <h3>현재비중 vs 목표비중</h3>
                      <AllocationBarChart />
                      <div className="target-list">
                        {portfolioAssets.map((asset) => {
                          const gap = asset.value - asset.target;
                          const status = gap > 2 ? "초과" : gap < -2 ? "부족" : "적정";
                          return (
                            <div key={asset.name} className={gap > 2 ? "over" : gap < -2 ? "under" : "balanced"}>
                              <span>{asset.name}</span>
                              <div className="bar-track"><i style={{ width: `${asset.value}%`, background: asset.color }} /></div>
                              <strong>{status} {gap > 0 ? "+" : ""}{gap}%</strong>
                            </div>
                          );
                        })}
                      </div>
                    </section>
                  </div>
                ) : (
                  <HoldingsTable holdings={holdings} market={market} onMarketChange={setMarket} />
                )}
              </section>
              {targetModalOpen && (
                <div className="modal-backdrop" role="presentation" onClick={() => setTargetModalOpen(false)}>
                  <section className="target-modal" role="dialog" aria-modal="true" aria-label="목표비중 설정" onClick={(event) => event.stopPropagation()}>
                    <h2>목표비중 설정</h2>
                    <p>다음 단계에서 슬라이더 기반 목표비중 편집을 연결할 예정입니다. 현재는 계획값을 기준으로 비교합니다.</p>
                    <button type="button" onClick={() => setTargetModalOpen(false)}>확인</button>
                  </section>
                </div>
              )}
            </div>
          )}

          {activeScreen === "screener" && (
            <div className="screener-view">
              <aside className="filter-card">
                <h2>카테고리 필터</h2>
                <div className="radio-row">
                  <span>시장</span>
                  <label><input type="radio" checked={draftFilters.market === "kr"} onChange={() => setDraftFilters({ ...draftFilters, market: "kr", sector: "전체" })} /> 국내</label>
                  <label><input type="radio" checked={draftFilters.market === "us"} onChange={() => setDraftFilters({ ...draftFilters, market: "us", sector: "전체" })} /> 미국</label>
                </div>
                <label>시가총액 {draftFilters.minMarketCap}조 이상
                  <input type="range" min="0" max="100" value={draftFilters.minMarketCap} onChange={(event) => setDraftFilters({ ...draftFilters, minMarketCap: Number(event.target.value) })} />
                </label>
                <label>업종
                  <select value={draftFilters.sector} onChange={(event) => setDraftFilters({ ...draftFilters, sector: event.target.value })}>
                    {screenerSectors.map((item) => <option key={item}>{item}</option>)}
                  </select>
                </label>
                <div className="range-pair">
                  <span>PER</span>
                  <input type="number" value={draftFilters.minPer} onChange={(event) => setDraftFilters({ ...draftFilters, minPer: Number(event.target.value) })} />
                  <input type="number" value={draftFilters.maxPer} onChange={(event) => setDraftFilters({ ...draftFilters, maxPer: Number(event.target.value) })} />
                </div>
                <div className="range-pair">
                  <span>PBR</span>
                  <input type="number" value={draftFilters.minPbr} onChange={(event) => setDraftFilters({ ...draftFilters, minPbr: Number(event.target.value) })} />
                  <input type="number" value={draftFilters.maxPbr} onChange={(event) => setDraftFilters({ ...draftFilters, maxPbr: Number(event.target.value) })} />
                </div>
                <label>ROE {draftFilters.minRoe}% 이상<input type="range" min="0" max="30" value={draftFilters.minRoe} onChange={(event) => setDraftFilters({ ...draftFilters, minRoe: Number(event.target.value) })} /></label>
                <label>배당수익률 {draftFilters.minDividend}% 이상<input type="range" min="0" max="8" step="0.5" value={draftFilters.minDividend} onChange={(event) => setDraftFilters({ ...draftFilters, minDividend: Number(event.target.value) })} /></label>
                <div className="filter-actions">
                  <button type="button" className="ghost-action" onClick={resetScreenerFilters}>필터 초기화</button>
                  <button type="button" onClick={applyScreenerFilters}>검색 적용</button>
                </div>
              </aside>
              <ScreenerResults
                stocks={pagedScreenerStocks}
                total={filteredScreenerStocks.length}
                loading={screenerLoading}
                sort={screenerSort}
                onSortChange={updateScreenerSort}
                page={screenerPage}
                totalPages={screenerTotalPages}
                onPageChange={setScreenerPage}
                selectedTicker={selectedScreenerTicker}
                onSelectTicker={setSelectedScreenerTicker}
              />
            </div>
          )}

          {activeScreen === "watchlist" && <WatchlistPanel />}
          {activeScreen === "ai" && (
            <AIAdvicePanel
              age={age}
              monthlyIncome={monthlyIncome}
              investmentStyle={investmentStyle}
              onAgeChange={setAge}
              onIncomeChange={setMonthlyIncome}
              onStyleChange={setInvestmentStyle}
            />
          )}
          {activeScreen === "newsReports" && <NewsReportsPanel />}
          {activeScreen === "disclosureIr" && <DisclosureIrPanel />}
          {activeScreen === "alerts" && <AlertAutomationPanel />}
          {activeScreen === "plans" && <PlansPanel />}
          {activeScreen === "settings" && <SettingsPanel />}
    </AppLayout>
  );
}

function RightRail() {
  return (
    <aside className="right-rail">
      <section className="panel mini-panel">
        <div className="panel-heading compact-heading"><h2>전체기업</h2><ChevronRight size={16} /></div>
        <div className="company-chips">
          {stocks.slice(0, 7).map((stock) => <button key={stock.ticker} type="button">{stock.name}</button>)}
        </div>
      </section>
      <section className="panel mini-panel">
        <div className="panel-heading compact-heading"><h2>관심기업 변동</h2><Star size={16} /></div>
        <div className="mover-list">
          {stocks.slice(0, 5).map((stock) => (
            <div key={stock.ticker}><span>{stock.ticker}</span><Change value={stock.change} /></div>
          ))}
        </div>
      </section>
      <section className="panel mini-panel">
        <div className="panel-heading compact-heading"><h2>주요 알림</h2><Bell size={16} /></div>
        <p className="rail-copy">보유종목 2개가 목표 비중을 초과했습니다. AI 조언에서 리밸런싱안을 확인하세요.</p>
      </section>
    </aside>
  );
}

function SummaryCard({ label, value, detail, tone }: { label: string; value: string; detail: string; tone?: "up" | "down" }) {
  return <article className="summary-card"><span>{label}</span><strong className={tone}>{value}</strong><small>{detail}</small></article>;
}

function StockTable({ title, stocks: tableStocks, market, onMarketChange, compact = false }: { title: string; stocks: Stock[]; market: Market; onMarketChange: (market: Market) => void; compact?: boolean }) {
  const displayedStocks = tableStocks.filter((stock) => stock.market === market);
  const rows = displayedStocks.length ? displayedStocks : tableStocks;

  return (
    <section className="panel stock-panel">
      <div className="panel-heading">
        <div><h2>{title}</h2><p>순위 / 기업명 / 현재가 / 변동률 / 시가총액</p></div>
        <div className="segmented">
          <button type="button" className={market === "kr" ? "active" : ""} onClick={() => onMarketChange("kr")}>국내</button>
          <button type="button" className={market === "us" ? "active" : ""} onClick={() => onMarketChange("us")}>미국</button>
        </div>
      </div>
      <div className="table-wrap">
        <table className={compact ? "compact-table" : ""}>
          <thead><tr><th>순위</th><th>기업명</th><th>현재가</th><th>변동률</th><th>시가총액</th><th>PER</th><th>ROE</th></tr></thead>
          <tbody>
            {rows.map((stock) => (
              <tr key={`${stock.market}-${stock.ticker}`}>
                <td>{stock.rank}</td>
                <td><strong>{stock.name}</strong><span>{stock.ticker} / {stock.sector}</span></td>
                <td>{stock.price}</td>
                <td><Change value={stock.change} /></td>
                <td>{stock.marketCap}</td>
                <td>{stock.per.toFixed(1)}x</td>
                <td>{stock.roe.toFixed(1)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function HoldingsTable({ holdings: tableHoldings, market, onMarketChange }: { holdings: Holding[]; market: Market; onMarketChange: (market: Market) => void }) {
  const rows = tableHoldings.filter((holding) => holding.market === market);

  return (
    <section className="holdings-section">
      <div className="holdings-toolbar">
        <div>
          <h3>보유종목</h3>
          <p>순위 / 종목명 / 현재가 / 비중 / 수익률 / 보유수량 / 평가금액 / 매입금액</p>
        </div>
        <div className="segmented">
          <button type="button" className={market === "kr" ? "active" : ""} onClick={() => onMarketChange("kr")}>국내</button>
          <button type="button" className={market === "us" ? "active" : ""} onClick={() => onMarketChange("us")}>미국</button>
        </div>
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>순위</th>
              <th>종목명</th>
              <th>현재가</th>
              <th>비중</th>
              <th>수익률</th>
              <th>보유수량</th>
              <th>평가금액</th>
              <th>매입금액</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((holding) => (
              <tr key={holding.ticker}>
                <td>{holding.rank}</td>
                <td><strong>{holding.name}</strong><span>{holding.ticker}</span></td>
                <td>{holding.price}</td>
                <td>{holding.weight}</td>
                <td><Change value={holding.rate} /></td>
                <td>{holding.qty.toLocaleString()}</td>
                <td>{holding.evalAmount}</td>
                <td>{holding.buyAmount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button type="button" className="add-holding-button"><Plus size={16} /> 종목 추가</button>
    </section>
  );
}

function ScreenerResults({
  stocks: rows,
  total,
  loading,
  sort,
  onSortChange,
  page,
  totalPages,
  onPageChange,
  selectedTicker,
  onSelectTicker,
}: {
  stocks: Stock[];
  total: number;
  loading: boolean;
  sort: "marketCap" | "change";
  onSortChange: (value: "marketCap" | "change") => void;
  page: number;
  totalPages: number;
  onPageChange: (value: number) => void;
  selectedTicker: string | null;
  onSelectTicker: (value: string | null) => void;
}) {
  return (
    <section className="panel screener-results-panel">
      <div className="panel-heading screener-results-heading">
        <div>
          <h2>검색된 기업 {total}개</h2>
          <p>20개씩 페이지네이션됩니다. 행 클릭 시 관심기업 추가 버튼이 표시됩니다.</p>
        </div>
        <label className="sort-select">정렬 기준
          <select value={sort} onChange={(event) => onSortChange(event.target.value as "marketCap" | "change")}>
            <option value="marketCap">시가총액순</option>
            <option value="change">변동률순</option>
          </select>
        </label>
      </div>
      {loading ? (
        <div className="loading-state"><span className="spinner" /> 필터 적용 중</div>
      ) : (
        <>
          <div className="table-wrap">
            <table>
              <thead><tr><th>순위</th><th>기업명</th><th>현재가</th><th>변동률</th><th>시가총액</th><th>액션</th></tr></thead>
              <tbody>
                {rows.map((stock) => (
                  <tr key={stock.ticker} className={selectedTicker === stock.ticker ? "selected-row" : ""} onClick={() => onSelectTicker(selectedTicker === stock.ticker ? null : stock.ticker)}>
                    <td>{stock.rank}</td>
                    <td><strong>{stock.name}</strong><span>{stock.ticker} / {stock.sector}</span></td>
                    <td>{stock.price}</td>
                    <td><Change value={stock.change} /></td>
                    <td>{stock.marketCap}</td>
                    <td>{selectedTicker === stock.ticker && <button type="button" className="watch-add-button"><Star size={15} /> 관심기업 추가</button>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="pagination">
            <button type="button" disabled={page === 1} onClick={() => onPageChange(page - 1)}>이전</button>
            <span>{page} / {totalPages}</span>
            <button type="button" disabled={page === totalPages} onClick={() => onPageChange(page + 1)}>다음</button>
          </div>
        </>
      )}
    </section>
  );
}

function DividendTable() {
  const rows = stocks.filter((stock) => stock.dividend >= 2).slice(0, 4);
  return (
    <section className="panel stock-panel">
      <div className="panel-heading"><div><h2>배당소득 분리과세 수혜기업</h2><p>배당수익률과 이익 안정성을 함께 봅니다.</p></div></div>
      <div className="table-wrap"><table><thead><tr><th>기업명</th><th>배당수익률</th><th>PBR</th><th>ROE</th><th>메모</th></tr></thead><tbody>{rows.map((stock) => <tr key={stock.ticker}><td><strong>{stock.name}</strong><span>{stock.ticker}</span></td><td>{stock.dividend.toFixed(1)}%</td><td>{stock.pbr.toFixed(2)}x</td><td>{stock.roe.toFixed(1)}%</td><td>현금흐름 점검 필요</td></tr>)}</tbody></table></div>
    </section>
  );
}

function DataPanel({ title, rows, columns }: { title: string; rows: Record<string, string>[]; columns: string[] }) {
  const labels: Record<string, string> = { date: "날짜", time: "시간", company: "기업명", title: "보고서명", submitter: "제출인" };
  return <section className="panel full-panel"><div className="panel-heading"><div><h2>{title}</h2><p>날짜 / 시간 / 기업명 / 보고서명 / 제출인</p></div></div><div className="table-wrap"><table><thead><tr>{columns.map((column) => <th key={column}>{labels[column]}</th>)}</tr></thead><tbody>{rows.map((row) => <tr key={`${row.date}-${row.title}`}>{columns.map((column) => <td key={column}>{row[column]}</td>)}</tr>)}</tbody></table></div></section>;
}

function WatchlistPanel() {
  return (
    <section className="watchlist-view">
      {watchlistGroups.map((group) => (
        <article className="panel watch-card" key={group.name}>
          <div className="watch-card-head">
            <div>
              <span>관심기업 그룹</span>
              <h2>{group.name}</h2>
            </div>
            <strong>{group.count}개</strong>
          </div>
          <p>{group.note}</p>
          <div className="ticker-cloud">
            {group.tickers.map((ticker) => <span key={ticker}>{ticker}</span>)}
          </div>
          <button type="button"><Plus size={16} /> 종목 추가</button>
        </article>
      ))}
    </section>
  );
}

function AIAdvicePanel({
  age,
  monthlyIncome,
  investmentStyle,
  onAgeChange,
  onIncomeChange,
  onStyleChange,
}: {
  age: number;
  monthlyIncome: number;
  investmentStyle: string;
  onAgeChange: (value: number) => void;
  onIncomeChange: (value: number) => void;
  onStyleChange: (value: string) => void;
}) {
  const [job, setJob] = useState("직장인");
  const [currentAssets, setCurrentAssets] = useState<AssetAllocation>({ cash: 22, stock: 45, gold: 9, dollar: 14, other: 10 });
  const [result, setResult] = useState<AIAdviceResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const assetLabels: Record<AssetKey, string> = { cash: "현금", stock: "주식", gold: "금", dollar: "달러", other: "기타" };
  const assetTotal = Object.values(currentAssets).reduce((sum, value) => sum + value, 0);
  const recommended = result?.recommended_portfolio ?? (
    investmentStyle === "공격형"
      ? { cash: 18, stock: 58, gold: 8, dollar: 12, other: 4 }
      : investmentStyle === "안정형"
        ? { cash: 38, stock: 30, gold: 12, dollar: 15, other: 5 }
        : { cash: 30, stock: 40, gold: 10, dollar: 15, other: 5 }
  );
  const rows = [
    { key: "cash" as const, name: "현금", current: currentAssets.cash, next: recommended.cash },
    { key: "stock" as const, name: "주식", current: currentAssets.stock, next: recommended.stock },
    { key: "gold" as const, name: "금", current: currentAssets.gold, next: recommended.gold },
    { key: "dollar" as const, name: "달러", current: currentAssets.dollar, next: recommended.dollar },
    { key: "other" as const, name: "기타", current: currentAssets.other, next: recommended.other },
  ];

  const updateAsset = (key: AssetKey, value: number) => {
    setCurrentAssets((previous) => {
      const next = { ...previous, [key]: value };
      const subtotal = Object.entries(next)
        .filter(([assetKey]) => assetKey !== "other")
        .reduce((sum, [, assetValue]) => sum + assetValue, 0);
      if (key !== "other") {
        next.other = Math.max(0, 100 - subtotal);
      }
      return next;
    });
  };

  const requestAdvice = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`${API_BASE_URL}/api/ai/advice`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          age,
          job,
          monthly_income: monthlyIncome * 10000,
          investment_style: investmentStyle,
          current_assets: currentAssets,
        }),
      });
      if (!response.ok) {
        throw new Error("AI 조언 API 응답이 올바르지 않습니다.");
      }
      const data = await response.json() as AIAdviceResult;
      setResult(data);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "AI 조언 요청 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="ai-view">
      <form className="panel ai-form">
        <div className="panel-heading compact-heading"><h2>개인 정보 입력</h2><Bot size={18} /></div>
        <label>나이<input type="number" value={age} onChange={(event) => onAgeChange(Number(event.target.value))} /></label>
        <label>직업<select value={job} onChange={(event) => setJob(event.target.value)}><option>직장인</option><option>자영업자</option><option>학생</option><option>주부</option><option>기타</option></select></label>
        <label>월소득<input type="number" value={monthlyIncome} onChange={(event) => onIncomeChange(Number(event.target.value))} /><small>만원 단위</small></label>
        <div className="style-options">
          {["안정형", "중립형", "공격형"].map((style) => (
            <button key={style} type="button" className={investmentStyle === style ? "active" : ""} onClick={() => onStyleChange(style)}>{style}</button>
          ))}
        </div>
        <div className="asset-slider-list">
          <div className="asset-total"><span>현재 자산 비중</span><strong className={assetTotal === 100 ? "up" : "down"}>{assetTotal}%</strong></div>
          {(Object.keys(assetLabels) as AssetKey[]).map((key) => (
            <label key={key}>{assetLabels[key]} {currentAssets[key]}%
              <input type="range" min="0" max="100" value={currentAssets[key]} onChange={(event) => updateAsset(key, Number(event.target.value))} />
            </label>
          ))}
        </div>
        {error && <p className="form-error">{error}</p>}
        <button type="button" className="primary-action" onClick={requestAdvice} disabled={loading || assetTotal !== 100}>
          {loading ? <span className="spinner small-spinner" /> : <Sparkles size={16} />}
          {loading ? "분석 중" : "AI 분석"}
        </button>
      </form>

      <section className="panel ai-result">
        <div className="panel-heading">
          <div>
            <h2>AI 맞춤 포트폴리오 제안</h2>
            <p>{age}세, 월소득 {monthlyIncome}만원, {investmentStyle} 기준</p>
          </div>
          <span className="ai-badge">{result ? "API 응답" : "추천 미리보기"}</span>
        </div>
        <div className="advice-copy">
          <Sparkles size={18} />
          <p>{result?.advice ?? "AI 분석 버튼을 누르면 현재 입력값을 기반으로 맞춤 포트폴리오를 추천합니다."}</p>
        </div>
        <div className="compare-list">
          {rows.map((row) => (
            <div key={row.key}>
              <span>{row.name}</span>
              <div className="compare-bars">
                <i style={{ width: `${row.current}%` }} />
                <b style={{ width: `${row.next}%` }} />
              </div>
              <strong>{row.current}% → {row.next}%</strong>
            </div>
          ))}
        </div>
        <div className="reason-card">
          <strong>추천 이유</strong>
          <p>{result?.reason ?? "투자성향과 현금흐름, 현재 자산 비중을 함께 고려해 결과를 표시합니다."}</p>
        </div>
      </section>
    </section>
  );
}

function NewsReportsPanel() {
  return (
    <section className="news-reports-view">
      <section className="news-grid">
        {news.map((item) => <article className="news-card" key={item.title}><div className="news-thumb"><Newspaper size={30} /></div><span>{item.tag}</span><h2>{item.title}</h2><p>{item.company} / {item.source}</p></article>)}
      </section>
      <section className="panel full-panel">
        <div className="panel-heading"><div><h2>증권사리포트</h2><p>뉴스와 리포트를 한 화면에서 확인합니다.</p></div></div>
        <div className="table-wrap"><table><thead><tr><th>기업명</th><th>제목</th><th>목표주가</th><th>현재가</th><th>증권사</th><th>RATING</th></tr></thead><tbody>{reports.map((report) => <tr key={report.title}><td><strong>{report.company}</strong></td><td>{report.title}</td><td>{report.target}</td><td>{report.current}</td><td>{report.house}</td><td><span className="rating">{report.rating}</span></td></tr>)}</tbody></table></div>
      </section>
    </section>
  );
}

function DisclosureIrPanel() {
  return (
    <section className="disclosure-ir-view">
      <DataPanel title="공시목록" rows={disclosures} columns={["date", "time", "company", "title", "submitter"]} />
      <section className="panel full-panel"><div className="panel-heading"><div><h2>IR 일정</h2><p>수행일 / 시간 / 기업명 / 내용 / 대상자 / 방법 / 담당자</p></div></div><div className="table-wrap"><table><thead><tr><th>수행일</th><th>시간</th><th>기업명</th><th>내용</th><th>대상자</th><th>방법</th><th>담당자</th></tr></thead><tbody>{["삼성전자", "SK하이닉스", "현대차"].map((company, index) => <tr key={company}><td>2026-05-{18 + index}</td><td>{index + 9}:00</td><td>{company}</td><td>분기 실적 설명회</td><td>기관투자자</td><td>컨퍼런스콜</td><td>IR팀</td></tr>)}</tbody></table></div></section>
    </section>
  );
}

function AlertAutomationPanel() {
  return (
    <section className="alert-automation-view">
      {[
        ["삼성전자", "현재가 72,000원 이하", "매수 관심 알림"],
        ["현대차", "비중 18% 초과", "리밸런싱 알림"],
        ["달러", "환율 1,320원 이하", "환전 검토 알림"],
      ].map(([target, condition, action]) => (
        <article className="panel alert-rule" key={target}>
          <span>모의투자 알림</span>
          <h2>{target}</h2>
          <p>{condition}</p>
          <strong>{action}</strong>
        </article>
      ))}
    </section>
  );
}

function SettingsPanel() {
  return (
    <section className="panel settings-panel">
      <div className="panel-heading"><div><h2>설정</h2><p>데이터, 알림, 배포 환경을 관리합니다.</p></div></div>
      <div className="settings-grid">
        <article><strong>데이터 소스</strong><p>FinanceDataReader 무료 데이터 우선, KIS API는 추후 연결</p></article>
        <article><strong>AI Provider</strong><p>Anthropic Claude API 연결 예정</p></article>
        <article><strong>배포</strong><p>Vercel 프론트, Railway 백엔드, Supabase DB</p></article>
      </div>
    </section>
  );
}

function PlansPanel() {
  return <section className="plans-grid">{[{ name: "무료", price: "0원", features: ["시장지수", "기본 대시보드"] }, { name: "베이직", price: "월 4,900원", features: ["포트폴리오", "스크리너", "관심기업"] }, { name: "프리미엄", price: "월 9,900원", features: ["AI 조언", "자동매매 알림", "리포트 요약"] }].map((plan) => <article className="plan-card" key={plan.name}><ShieldCheck size={22} /><h2>{plan.name}</h2><strong>{plan.price}</strong>{plan.features.map((feature) => <p key={feature}>{feature}</p>)}<button type="button">선택</button></article>)}</section>;
}
