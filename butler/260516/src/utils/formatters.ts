import type { Company } from "../types";

export const formatMarketCap = (value: number) => `$${value.toLocaleString(undefined, { maximumFractionDigits: 1 })}B`;

export const formatValue = (value: number) => `$${value.toLocaleString(undefined, { maximumFractionDigits: 2 })}B`;

export const formatPrice = (company: Company) =>
  company.exchange === "KRX"
    ? `₩${company.price.toLocaleString()}`
    : company.price > 0
      ? `$${company.price.toFixed(2)}`
      : "N/A";
