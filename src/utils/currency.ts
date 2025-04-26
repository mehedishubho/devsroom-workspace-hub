import { Currency } from "@/types";

export const currencies: Currency[] = [
  { code: "USD", name: "US Dollar", symbol: "$" },
  { code: "BDT", name: "Bangladeshi Taka", symbol: "৳" },
  { code: "GBP", name: "British Pound", symbol: "£" },
  { code: "EUR", name: "Euro", symbol: "€" },
  { code: "CAD", name: "Canadian Dollar", symbol: "C$" },
];

export const exchangeRates: Record<string, number> = {
  USD: 1,
  BDT: 0.0091,
  GBP: 1.29,
  EUR: 1.09,
  CAD: 0.74,
};

export const convertCurrency = (
  amount: number,
  fromCurrency: string,
  toCurrency: string = "USD"
): number => {
  if (amount == null) return 0;
  if (!fromCurrency || !toCurrency) return 0;
  if (fromCurrency === toCurrency) return amount;

  const fromRate = exchangeRates[fromCurrency] || 1;
  const toRate = exchangeRates[toCurrency] || 1;

  try {
    const amountInUsd = amount * fromRate;
    const convertedAmount = amountInUsd / toRate;
    return parseFloat(convertedAmount.toFixed(2));
  } catch (error) {
    console.error("Error converting currency:", error);
    return 0;
  }
};

export const formatCurrency = (
  amount: number = 0,
  currencyCode: string = "USD"
): string => {
  if (amount == null) amount = 0;
  const currency = currencies.find(c => c.code === currencyCode);
  if (!currency) {
    return `$${amount.toFixed(2)}`;
  }
  return `${currency.symbol}${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

export const getCurrencySymbol = (currencyCode: string): string => {
  if (!currencyCode) return "$";
  const currency = currencies.find(c => c.code === currencyCode);
  return currency?.symbol || "$";
};
