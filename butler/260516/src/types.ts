export type Tab = "companies" | "transactions" | "watchlists" | "alerts";
export type Market = "All" | "Korea" | "United States" | "Europe";
export type ListingStatus = "All" | "Public" | "Private";
export type DataMode = "mock" | "sp" | "excel";

export type EventType =
  | "Financial Release"
  | "M&A Announcement"
  | "Transaction Cancelled"
  | "Bankruptcy"
  | "Investment"
  | "New Product"
  | "Major News";

export type Company = {
  id: string;
  ticker: string;
  name: string;
  country: string;
  exchange: string;
  sector: string;
  industry: string;
  listingStatus: Exclude<ListingStatus, "All">;
  price: number;
  changePct: number;
  marketCap: number;
  revenueGrowth: number;
  ebitdaGrowth: number;
  per: number;
  pbr: number;
  evEbitda: number;
  ipoYear?: number;
  parent?: string;
  portfolioExposure: string[];
};

export type Transaction = {
  id: string;
  announced: string;
  status: "Announced" | "Closed" | "Cancelled";
  type: "M&A" | "Investment" | "Debt Financing";
  target: string;
  buyer: string;
  targetIndustry: string;
  value: number;
  region: string;
  advisor?: string;
};

export type KeyDevelopment = {
  id: string;
  companyId: string;
  company: string;
  type: EventType;
  headline: string;
  source: string;
  timestamp: string;
  severity: "High" | "Medium" | "Low";
};

export type Watchlist = {
  id: string;
  name: string;
  companyIds: string[];
  source: "Screener" | "Manual" | "Excel Export";
};

export type AlertRule = {
  id: string;
  name: string;
  scope: string;
  triggers: EventType[];
  cadence: "Live" | "Daily 09:00" | "Mon/Wed/Fri 09:00";
  active: boolean;
};

export type MarketDataClient = {
  sourceName: string;
  loadCompanies: () => Promise<Company[]>;
  loadTransactions: () => Promise<Transaction[]>;
  loadKeyDevelopments: () => Promise<KeyDevelopment[]>;
};

export type CompanyFilters = {
  query: string;
  market: Market;
  listing: ListingStatus;
  sector: string;
  minMarketCap: number;
  minRevenueGrowth: number;
  maxPer: number;
};

export type TransactionFilters = {
  query: string;
  type: "All" | Transaction["type"];
  status: "All" | Transaction["status"];
  region: Market;
  minValue: number;
};
