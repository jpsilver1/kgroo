import { useEffect, useMemo, useState } from "react";
import {
  Bell,
  BriefcaseBusiness,
  Building2,
  ChevronDown,
  CircleAlert,
  Database,
  FileSpreadsheet,
  Filter,
  LineChart,
  Newspaper,
  Plus,
  RefreshCw,
  Search,
  Settings2,
  Star,
  TableProperties,
  TrendingUp,
} from "lucide-react";
import { AppSelect } from "./components/AppSelect";
import { StatTile } from "./components/StatTile";
import {
  companies,
  defaultAlerts,
  defaultCompanyFilters,
  defaultTransactionFilters,
  defaultVisibleColumns,
  defaultWatchlists,
  keyDevelopments,
  transactions,
} from "./data/mockData";
import { useLocalState } from "./hooks/useLocalState";
import { getMarketDataClient } from "./services/marketDataClient";
import type { AlertRule, Company, CompanyFilters, DataMode, ListingStatus, Market, Tab, TransactionFilters, Watchlist } from "./types";
import { formatMarketCap, formatPrice, formatValue } from "./utils/formatters";

const companyColumns = ["ticker", "price", "changePct", "marketCap", "revenueGrowth", "per", "evEbitda"];
const dashboardWidgets = ["Company list", "Price / volume table", "Financial metrics", "News and filings", "M&A summary", "Company profile"];

export function App() {
  const [activeTab, setActiveTab] = useState<Tab>("companies");
  const [dataMode, setDataMode] = useState<DataMode>("mock");
  const [companyFilters, setCompanyFilters] = useState<CompanyFilters>(defaultCompanyFilters);
  const [transactionFilters, setTransactionFilters] = useState<TransactionFilters>(defaultTransactionFilters);
  const [companyData, setCompanyData] = useState(companies);
  const [transactionData, setTransactionData] = useState(transactions);
  const [developmentData, setDevelopmentData] = useState(keyDevelopments);
  const [selectedCompanyId, setSelectedCompanyId] = useState("dupont");
  const [statusMessage, setStatusMessage] = useState("Mock adapter loaded. S&P API adapter is ready for credentials.");
  const [watchlists, setWatchlists] = useLocalState<Watchlist[]>("sp-monitor-watchlists", defaultWatchlists);
  const [alerts, setAlerts] = useLocalState<AlertRule[]>("sp-monitor-alerts", defaultAlerts);
  const [visibleColumns, setVisibleColumns] = useLocalState<string[]>("sp-monitor-columns", defaultVisibleColumns);

  const client = getMarketDataClient(dataMode);

  const refreshData = async () => {
    try {
      const [loadedCompanies, loadedTransactions, loadedDevelopments] = await Promise.all([
        client.loadCompanies(),
        client.loadTransactions(),
        client.loadKeyDevelopments(),
      ]);
      setCompanyData(loadedCompanies);
      setTransactionData(loadedTransactions);
      setDevelopmentData(loadedDevelopments);
      setStatusMessage(`${client.sourceName} loaded ${loadedCompanies.length} companies and ${loadedTransactions.length} transactions.`);
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : "Unknown data adapter error.");
    }
  };

  useEffect(() => {
    void refreshData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataMode]);

  const sectors = useMemo(() => ["All", ...Array.from(new Set(companyData.map((company) => company.sector)))], [companyData]);

  const filteredCompanies = useMemo(() => {
    const query = companyFilters.query.trim().toLowerCase();
    return companyData
      .filter((company) => {
        const matchesQuery =
          !query ||
          company.name.toLowerCase().includes(query) ||
          company.ticker.toLowerCase().includes(query) ||
          company.industry.toLowerCase().includes(query);
        const matchesMarket = companyFilters.market === "All" || company.country === companyFilters.market;
        const matchesListing = companyFilters.listing === "All" || company.listingStatus === companyFilters.listing;
        const matchesSector = companyFilters.sector === "All" || company.sector === companyFilters.sector;
        const matchesCap = company.marketCap >= companyFilters.minMarketCap;
        const matchesGrowth = company.revenueGrowth >= companyFilters.minRevenueGrowth;
        const matchesPer = company.per === 0 || company.per <= companyFilters.maxPer;
        return matchesQuery && matchesMarket && matchesListing && matchesSector && matchesCap && matchesGrowth && matchesPer;
      })
      .sort((a, b) => b.marketCap - a.marketCap);
  }, [companyData, companyFilters]);

  const filteredTransactions = useMemo(() => {
    const query = transactionFilters.query.trim().toLowerCase();
    return transactionData
      .filter((transaction) => {
        const matchesQuery =
          !query ||
          transaction.target.toLowerCase().includes(query) ||
          transaction.buyer.toLowerCase().includes(query) ||
          transaction.targetIndustry.toLowerCase().includes(query) ||
          (transaction.advisor ?? "").toLowerCase().includes(query);
        const matchesType = transactionFilters.type === "All" || transaction.type === transactionFilters.type;
        const matchesStatus = transactionFilters.status === "All" || transaction.status === transactionFilters.status;
        const matchesRegion = transactionFilters.region === "All" || transaction.region === transactionFilters.region;
        const matchesValue = transaction.value >= transactionFilters.minValue;
        return matchesQuery && matchesType && matchesStatus && matchesRegion && matchesValue;
      })
      .sort((a, b) => Date.parse(b.announced) - Date.parse(a.announced));
  }, [transactionData, transactionFilters]);

  const selectedCompany = companyData.find((company) => company.id === selectedCompanyId) ?? companyData[0];
  const selectedDevelopments = developmentData.filter((event) => event.companyId === selectedCompany?.id);
  const activeAlertCount = alerts.filter((alert) => alert.active).length;
  const watchlistCompanies = watchlists.flatMap((watchlist) =>
    watchlist.companyIds.map((id) => companyData.find((company) => company.id === id)).filter(Boolean),
  ) as Company[];

  const saveFilteredAsWatchlist = () => {
    const nextList: Watchlist = {
      id: `watchlist-${Date.now()}`,
      name: `${companyFilters.sector === "All" ? "Screened" : companyFilters.sector} ${companyFilters.market} list`,
      companyIds: filteredCompanies.map((company) => company.id),
      source: dataMode === "excel" ? "Excel Export" : "Screener",
    };
    setWatchlists([nextList, ...watchlists]);
    setActiveTab("watchlists");
  };

  const addAlertRule = () => {
    const scope = watchlists[0]?.name ?? "Current screener";
    const nextRule: AlertRule = {
      id: `alert-${Date.now()}`,
      name: `${scope} key development monitor`,
      scope,
      triggers: ["Financial Release", "M&A Announcement", "New Product", "Major News"],
      cadence: "Live",
      active: true,
    };
    setAlerts([nextRule, ...alerts]);
    setActiveTab("alerts");
  };

  const addCompanyToPrimaryWatchlist = (companyId: string) => {
    const primary = watchlists[0];
    if (!primary) {
      setWatchlists([{ id: "manual-list", name: "Manual Watchlist", companyIds: [companyId], source: "Manual" }]);
      return;
    }
    if (primary.companyIds.includes(companyId)) return;
    setWatchlists([{ ...primary, companyIds: [companyId, ...primary.companyIds] }, ...watchlists.slice(1)]);
  };

  const toggleColumn = (column: string) => {
    setVisibleColumns(
      visibleColumns.includes(column) ? visibleColumns.filter((item) => item !== column) : [...visibleColumns, column],
    );
  };

  return (
    <main className="terminal-shell">
      <header className="topbar">
        <div className="brand-block">
          <span className="brand-mark">
            <LineChart size={20} />
          </span>
          <div>
            <strong>S&P Screener Monitor</strong>
            <small>Capital IQ Pro workflow rebuilt for custom monitoring</small>
          </div>
        </div>
        <label className="global-search">
          <Search size={17} />
          <input
            value={companyFilters.query}
            onChange={(event) => setCompanyFilters({ ...companyFilters, query: event.target.value })}
            placeholder="기업명, 티커, 산업 검색"
          />
        </label>
        <div className="top-actions">
          <select value={dataMode} onChange={(event) => setDataMode(event.target.value as DataMode)}>
            <option value="mock">Mock API</option>
            <option value="sp">S&P API</option>
            <option value="excel">Excel Export</option>
          </select>
          <button type="button" className="icon-button" onClick={refreshData} aria-label="Refresh data">
            <RefreshCw size={17} />
          </button>
          <button type="button" className="status-pill">
            <Bell size={16} />
            {activeAlertCount}
          </button>
        </div>
      </header>

      <section className="status-strip">
        <span>
          <Database size={15} />
          {statusMessage}
        </span>
        <span>
          <FileSpreadsheet size={15} />
          Excel source: 20250130 S&P_v1.2.xlsx
        </span>
        <span>
          <CircleAlert size={15} />
          Official API credentials pending
        </span>
      </section>

      <nav className="tabbar" aria-label="Main workflows">
        {[
          ["companies", "Company Screener", Building2],
          ["transactions", "Transaction Screener", BriefcaseBusiness],
          ["watchlists", "Watchlists", Star],
          ["alerts", "Alerts", Bell],
        ].map(([id, label, Icon]) => (
          <button key={id as string} className={activeTab === id ? "active" : ""} onClick={() => setActiveTab(id as Tab)} type="button">
            <Icon size={17} />
            {label as string}
          </button>
        ))}
      </nav>

      <section className="dashboard-grid">
        <aside className="filter-panel">
          <div className="panel-title">
            <Filter size={18} />
            <h2>{activeTab === "transactions" ? "Deal Criteria" : "Company Criteria"}</h2>
          </div>

          {activeTab === "transactions" ? (
            <>
              <label className="field">
                <span>Keyword</span>
                <input
                  value={transactionFilters.query}
                  onChange={(event) => setTransactionFilters({ ...transactionFilters, query: event.target.value })}
                  placeholder="target, buyer, advisor"
                />
              </label>
              <AppSelect
                label="Transaction Type"
                value={transactionFilters.type}
                onChange={(value) => setTransactionFilters({ ...transactionFilters, type: value as TransactionFilters["type"] })}
              >
                <option>All</option>
                <option>M&A</option>
                <option>Investment</option>
                <option>Debt Financing</option>
              </AppSelect>
              <AppSelect
                label="Status"
                value={transactionFilters.status}
                onChange={(value) => setTransactionFilters({ ...transactionFilters, status: value as TransactionFilters["status"] })}
              >
                <option>All</option>
                <option>Announced</option>
                <option>Closed</option>
                <option>Cancelled</option>
              </AppSelect>
              <AppSelect
                label="Region"
                value={transactionFilters.region}
                onChange={(value) => setTransactionFilters({ ...transactionFilters, region: value as Market })}
              >
                <option>All</option>
                <option>Korea</option>
                <option>United States</option>
                <option>Europe</option>
              </AppSelect>
              <label className="field">
                <span>Minimum Value: {formatValue(transactionFilters.minValue)}</span>
                <input
                  type="range"
                  min="0"
                  max="5"
                  step="0.25"
                  value={transactionFilters.minValue}
                  onChange={(event) => setTransactionFilters({ ...transactionFilters, minValue: Number(event.target.value) })}
                />
              </label>
            </>
          ) : (
            <>
              <AppSelect
                label="Market"
                value={companyFilters.market}
                onChange={(value) => setCompanyFilters({ ...companyFilters, market: value as Market })}
              >
                <option>All</option>
                <option>Korea</option>
                <option>United States</option>
                <option>Europe</option>
              </AppSelect>
              <AppSelect
                label="Listing Status"
                value={companyFilters.listing}
                onChange={(value) => setCompanyFilters({ ...companyFilters, listing: value as ListingStatus })}
              >
                <option>All</option>
                <option>Public</option>
                <option>Private</option>
              </AppSelect>
              <AppSelect label="Sector" value={companyFilters.sector} onChange={(value) => setCompanyFilters({ ...companyFilters, sector: value })}>
                {sectors.map((sector) => (
                  <option key={sector}>{sector}</option>
                ))}
              </AppSelect>
              <label className="field">
                <span>Minimum Market Cap: {formatMarketCap(companyFilters.minMarketCap)}</span>
                <input
                  type="range"
                  min="0"
                  max="900"
                  step="10"
                  value={companyFilters.minMarketCap}
                  onChange={(event) => setCompanyFilters({ ...companyFilters, minMarketCap: Number(event.target.value) })}
                />
              </label>
              <label className="field">
                <span>Minimum Revenue Growth: {companyFilters.minRevenueGrowth}%</span>
                <input
                  type="range"
                  min="0"
                  max="30"
                  step="1"
                  value={companyFilters.minRevenueGrowth}
                  onChange={(event) => setCompanyFilters({ ...companyFilters, minRevenueGrowth: Number(event.target.value) })}
                />
              </label>
              <label className="field">
                <span>Maximum PER: {companyFilters.maxPer}x</span>
                <input
                  type="range"
                  min="5"
                  max="80"
                  step="1"
                  value={companyFilters.maxPer}
                  onChange={(event) => setCompanyFilters({ ...companyFilters, maxPer: Number(event.target.value) })}
                />
              </label>
            </>
          )}

          <div className="column-picker">
            <button type="button">
              <Settings2 size={16} />
              Display Columns
              <ChevronDown size={15} />
            </button>
            <div>
              {companyColumns.map((column) => (
                <label key={column}>
                  <input type="checkbox" checked={visibleColumns.includes(column)} onChange={() => toggleColumn(column)} />
                  {column}
                </label>
              ))}
            </div>
          </div>
        </aside>

        <section className="workspace">
          <div className="kpi-row">
            <StatTile label="Screened Companies" value={String(filteredCompanies.length)} detail="Company screener result" />
            <StatTile label="Deal Pipeline" value={String(filteredTransactions.length)} detail="Filtered transactions" />
            <StatTile label="Watchlist Names" value={String(watchlists.length)} detail="Stored reusable lists" />
            <StatTile label="Active Alerts" value={String(activeAlertCount)} detail="Internal alert rules" tone="up" />
          </div>

          {activeTab === "companies" && (
            <section className="panel">
              <div className="panel-header">
                <div>
                  <h2>Company Screener</h2>
                  <p>산업, 지역, 상장 여부, 재무지표, IPO/모회사/투자 노출을 기준으로 기업을 추립니다.</p>
                </div>
                <div className="button-row">
                  <button type="button" onClick={saveFilteredAsWatchlist}>
                    <Plus size={16} />
                    Save as Watchlist
                  </button>
                  <button type="button" onClick={addAlertRule}>
                    <Bell size={16} />
                    Create Alert
                  </button>
                </div>
              </div>
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Company</th>
                      {visibleColumns.includes("ticker") && <th>Ticker</th>}
                      <th>Industry</th>
                      {visibleColumns.includes("price") && <th>Price</th>}
                      {visibleColumns.includes("changePct") && <th>Chg %</th>}
                      {visibleColumns.includes("marketCap") && <th>Market Cap</th>}
                      {visibleColumns.includes("revenueGrowth") && <th>Revenue Growth</th>}
                      {visibleColumns.includes("per") && <th>PER</th>}
                      {visibleColumns.includes("evEbitda") && <th>EV/EBITDA</th>}
                      <th />
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCompanies.map((company) => (
                      <tr key={company.id} className={selectedCompany?.id === company.id ? "selected" : ""} onClick={() => setSelectedCompanyId(company.id)}>
                        <td>
                          <strong>{company.name}</strong>
                          <span>
                            {company.country} / {company.exchange} / {company.listingStatus}
                          </span>
                        </td>
                        {visibleColumns.includes("ticker") && <td>{company.ticker}</td>}
                        <td>{company.industry}</td>
                        {visibleColumns.includes("price") && <td>{formatPrice(company)}</td>}
                        {visibleColumns.includes("changePct") && <td className={company.changePct >= 0 ? "up" : "down"}>{company.changePct.toFixed(1)}%</td>}
                        {visibleColumns.includes("marketCap") && <td>{formatMarketCap(company.marketCap)}</td>}
                        {visibleColumns.includes("revenueGrowth") && <td>{company.revenueGrowth.toFixed(1)}%</td>}
                        {visibleColumns.includes("per") && <td>{company.per ? `${company.per.toFixed(1)}x` : "N/A"}</td>}
                        {visibleColumns.includes("evEbitda") && <td>{company.evEbitda.toFixed(1)}x</td>}
                        <td>
                          <button
                            type="button"
                            className="row-action"
                            onClick={(event) => {
                              event.stopPropagation();
                              addCompanyToPrimaryWatchlist(company.id);
                            }}
                          >
                            <Star size={15} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {activeTab === "transactions" && (
            <section className="panel">
              <div className="panel-header">
                <div>
                  <h2>Transaction Screener</h2>
                  <p>M&A, 투자, 발표일, 종결 상태, 거래가치, buyer, target, advisor를 기준으로 거래를 추립니다.</p>
                </div>
              </div>
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Announced</th>
                      <th>Target</th>
                      <th>Buyer</th>
                      <th>Type</th>
                      <th>Status</th>
                      <th>Industry</th>
                      <th>Value</th>
                      <th>Advisor</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTransactions.map((transaction) => (
                      <tr key={transaction.id}>
                        <td>{transaction.announced}</td>
                        <td>
                          <strong>{transaction.target}</strong>
                          <span>{transaction.region}</span>
                        </td>
                        <td>{transaction.buyer}</td>
                        <td>{transaction.type}</td>
                        <td>
                          <span className={`status ${transaction.status.toLowerCase()}`}>{transaction.status}</span>
                        </td>
                        <td>{transaction.targetIndustry}</td>
                        <td>{formatValue(transaction.value)}</td>
                        <td>{transaction.advisor ?? "N/A"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {activeTab === "watchlists" && (
            <section className="panel card-grid-panel">
              <div className="panel-header">
                <div>
                  <h2>Watchlists</h2>
                  <p>스크리너 결과를 저장하고 대시보드 위젯과 알림 규칙의 기준으로 사용합니다.</p>
                </div>
              </div>
              <div className="watchlist-grid">
                {watchlists.map((watchlist) => (
                  <article className="watchlist-card" key={watchlist.id}>
                    <span>{watchlist.source}</span>
                    <h3>{watchlist.name}</h3>
                    <p>{watchlist.companyIds.length} companies connected to dashboard widgets.</p>
                    <div>
                      {watchlist.companyIds.slice(0, 5).map((id) => {
                        const company = companyData.find((item) => item.id === id);
                        return company ? <strong key={id}>{company.ticker}</strong> : null;
                      })}
                    </div>
                  </article>
                ))}
              </div>
            </section>
          )}

          {activeTab === "alerts" && (
            <section className="panel card-grid-panel">
              <div className="panel-header">
                <div>
                  <h2>Alerts</h2>
                  <p>리스트, 산업, 지역 조건에 Key Development 트리거를 연결하는 내부 알림 센터입니다.</p>
                </div>
                <button type="button" onClick={addAlertRule}>
                  <Plus size={16} />
                  New Alert
                </button>
              </div>
              <div className="alert-list">
                {alerts.map((alert) => (
                  <article className="alert-card" key={alert.id}>
                    <button
                      type="button"
                      className={alert.active ? "toggle on" : "toggle"}
                      onClick={() => setAlerts(alerts.map((item) => (item.id === alert.id ? { ...item, active: !item.active } : item)))}
                    >
                      {alert.active ? "Active" : "Paused"}
                    </button>
                    <h3>{alert.name}</h3>
                    <p>
                      {alert.scope} / {alert.cadence}
                    </p>
                    <div>
                      {alert.triggers.map((trigger) => (
                        <span key={trigger}>{trigger}</span>
                      ))}
                    </div>
                  </article>
                ))}
              </div>
            </section>
          )}
        </section>

        <aside className="right-rail">
          <section className="panel compact">
            <div className="panel-title">
              <TableProperties size={17} />
              <h2>Dashboard Widgets</h2>
            </div>
            <div className="widget-list">
              {dashboardWidgets.map((widget) => (
                <span key={widget}>{widget}</span>
              ))}
            </div>
          </section>

          <section className="panel compact">
            <div className="panel-title">
              <Building2 size={17} />
              <h2>Selected Company</h2>
            </div>
            {selectedCompany && (
              <div className="company-detail">
                <strong>{selectedCompany.name}</strong>
                <span>
                  {selectedCompany.sector} / {selectedCompany.industry}
                </span>
                <dl>
                  <div>
                    <dt>Market Cap</dt>
                    <dd>{formatMarketCap(selectedCompany.marketCap)}</dd>
                  </div>
                  <div>
                    <dt>Revenue Growth</dt>
                    <dd>{selectedCompany.revenueGrowth.toFixed(1)}%</dd>
                  </div>
                  <div>
                    <dt>EBITDA Growth</dt>
                    <dd>{selectedCompany.ebitdaGrowth.toFixed(1)}%</dd>
                  </div>
                  <div>
                    <dt>Parent</dt>
                    <dd>{selectedCompany.parent ?? "N/A"}</dd>
                  </div>
                </dl>
                <div className="exposure-list">
                  {selectedCompany.portfolioExposure.map((item) => (
                    <span key={item}>{item}</span>
                  ))}
                </div>
              </div>
            )}
          </section>

          <section className="panel compact">
            <div className="panel-title">
              <Newspaper size={17} />
              <h2>Key Developments</h2>
            </div>
            <div className="news-feed">
              {(selectedDevelopments.length ? selectedDevelopments : developmentData).slice(0, 4).map((item) => (
                <article key={item.id}>
                  <span className={`severity ${item.severity.toLowerCase()}`}>{item.type}</span>
                  <strong>{item.headline}</strong>
                  <small>
                    {item.company} / {item.timestamp}
                  </small>
                </article>
              ))}
            </div>
          </section>

          <section className="panel compact">
            <div className="panel-title">
              <TrendingUp size={17} />
              <h2>Watchlist Movers</h2>
            </div>
            <div className="mover-list">
              {watchlistCompanies.slice(0, 5).map((company) => (
                <div key={company.id}>
                  <span>{company.ticker}</span>
                  <strong className={company.changePct >= 0 ? "up" : "down"}>{company.changePct.toFixed(1)}%</strong>
                </div>
              ))}
            </div>
          </section>
        </aside>
      </section>
    </main>
  );
}
