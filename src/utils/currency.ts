
import { Currency } from "@/types";

// Ensure currencies is always defined and has at least one item
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

// Convert amount from source currency to target currency with error handling
export const convertCurrency = (
  amount: number, 
  fromCurrency: string, 
  toCurrency: string = "USD"
): number => {
  if (amount === undefined || amount === null) return 0;
  if (!fromCurrency || !toCurrency) return amount;
  if (fromCurrency === toCurrency) return amount;
  
  // Get exchange rates with defaults
  const fromRate = exchangeRates[fromCurrency] || 1;
  const toRate = exchangeRates[toCurrency] || 1;
  
  try {
    // Convert to USD first (base currency) then to target currency
    const amountInUsd = amount * fromRate;
    const convertedAmount = amountInUsd / toRate;
    
    return parseFloat(convertedAmount.toFixed(2));
  } catch (error) {
    console.error("Error converting currency:", error);
    return amount;
  }
};

// Format currency for display with better error handling
export const formatCurrency = (
  amount: number = 0,
  currencyCode: string = "USD"
): string => {
  if (amount === undefined || amount === null) amount = 0;
  
  // Find the currency or use a default
  const currency = Array.isArray(currencies) ? 
    currencies.find(c => c.code === currencyCode) : null;
  
  if (!currency) {
    return `$${amount.toFixed(2)}`;
  }
  
  return `${currency.symbol}${amount.toFixed(2)}`;
};

// Get currency symbol by code with error handling
export const getCurrencySymbol = (currencyCode: string): string => {
  if (!currencyCode) return "$";
  
  // Find the currency or use a default
  const currency = Array.isArray(currencies) ? 
    currencies.find(c => c.code === currencyCode) : null;
    
  return currency?.symbol || "$";
};
