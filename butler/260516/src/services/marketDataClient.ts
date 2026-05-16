import { companies, keyDevelopments, transactions } from "../data/mockData";
import type { DataMode, MarketDataClient } from "../types";

export const mockAdapter: MarketDataClient = {
  sourceName: "Mock adapter",
  loadCompanies: async () => companies,
  loadTransactions: async () => transactions,
  loadKeyDevelopments: async () => keyDevelopments,
};

export const spApiAdapter: MarketDataClient = {
  sourceName: "S&P API adapter",
  loadCompanies: async () => {
    throw new Error("S&P API credentials are not configured yet.");
  },
  loadTransactions: async () => {
    throw new Error("S&P API credentials are not configured yet.");
  },
  loadKeyDevelopments: async () => {
    throw new Error("S&P API credentials are not configured yet.");
  },
};

export const excelImportAdapter: MarketDataClient = {
  sourceName: "Excel export adapter",
  loadCompanies: async () => companies.filter((company) => company.country === "Korea" || company.industry.includes("Water")),
  loadTransactions: async () => transactions.filter((transaction) => transaction.type !== "Debt Financing"),
  loadKeyDevelopments: async () => keyDevelopments,
};

export function getMarketDataClient(dataMode: DataMode) {
  if (dataMode === "sp") return spApiAdapter;
  if (dataMode === "excel") return excelImportAdapter;
  return mockAdapter;
}
