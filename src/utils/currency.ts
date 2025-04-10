
import { Currency } from "@/types";

export const currencies: Currency[] = [
  { code: "USD", name: "US Dollar", symbol: "$" },
  { code: "BDT", name: "Bangladeshi Taka", symbol: "৳" },
  { code: "GBP", name: "British Pound", symbol: "£" },
  { code: "EUR", name: "Euro", symbol: "€" },
  { code: "CAD", name: "Canadian Dollar", symbol: "C$" },
];

// Default exchange rates relative to USD
// These would ideally come from an API in a real app
export const exchangeRates: Record<string, number> = {
  USD: 1,
  BDT: 0.0091, // 1 BDT = 0.0091 USD
  GBP: 1.29,   // 1 GBP = 1.29 USD
  EUR: 1.09,   // 1 EUR = 1.09 USD
  CAD: 0.74,   // 1 CAD = 0.74 USD
};

// Convert amount from source currency to target currency
export const convertCurrency = (
  amount: number,
  fromCurrency: string,
  toCurrency: string = "USD"
): number => {
  if (!amount || !fromCurrency || !toCurrency) return amount;
  if (fromCurrency === toCurrency) return amount;

  const fromRate = exchangeRates[fromCurrency] || 1;
  const toRate = exchangeRates[toCurrency] || 1;

  // Convert to USD first (base currency) then to target currency
  const amountInUsd = amount * fromRate;
  const convertedAmount = amountInUsd / toRate;

  return parseFloat(convertedAmount.toFixed(2));
};

// Format currency for display
export const formatCurrency = (
  amount: number,
  currencyCode: string = "USD"
): string => {
  const currency = currencies.find(c => c.code === currencyCode);
  
  if (!currency) {
    return `$${amount.toFixed(2)}`;
  }

  return `${currency.symbol}${amount.toFixed(2)}`;
};

// Get currency symbol by code
export const getCurrencySymbol = (currencyCode: string): string => {
  const currency = currencies.find(c => c.code === currencyCode);
  return currency?.symbol || "$";
};
