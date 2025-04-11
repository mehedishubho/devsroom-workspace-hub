
import { useState, useEffect, useMemo } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { currencies } from "@/utils/currency";

export interface CurrencySelectorProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

const CurrencySelector = ({ value, onChange, className }: CurrencySelectorProps) => {
  const [open, setOpen] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState(value || "USD");
  
  // Ensure currencies is always an array
  const safeCurrencies = useMemo(() => {
    return Array.isArray(currencies) && currencies.length > 0 
      ? currencies 
      : [{ code: "USD", name: "US Dollar", symbol: "$" }];
  }, []);

  // Update internal state when prop changes
  useEffect(() => {
    if (value) {
      setSelectedCurrency(value);
    }
  }, [value]);

  // Safe handler for currency selection
  const handleSelect = (currentValue: string) => {
    if (!currentValue || typeof currentValue !== 'string') return; // Enhanced safety check
    setSelectedCurrency(currentValue);
    onChange(currentValue);
    setOpen(false);
  };

  // Find selected currency with fallbacks
  const selectedOption = useMemo(() => {
    const found = safeCurrencies.find(currency => currency.code === selectedCurrency);
    if (found) return found;
    
    const defaultUSD = safeCurrencies.find(currency => currency.code === "USD");
    if (defaultUSD) return defaultUSD;
    
    return safeCurrencies[0] || { code: "USD", name: "US Dollar", symbol: "$" };
  }, [selectedCurrency, safeCurrencies]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("justify-between w-full", className)}
        >
          {selectedOption ? (
            <span>
              {selectedOption.symbol} {selectedOption.code} - {selectedOption.name}
            </span>
          ) : (
            "Select currency"
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0 w-[300px]" align="start" sideOffset={5}>
        <Command>
          <CommandInput placeholder="Search currency..." />
          <CommandEmpty>No currency found.</CommandEmpty>
          <CommandGroup className="max-h-64 overflow-y-auto">
            {safeCurrencies.map((currency) => (
              <CommandItem
                key={currency.code}
                value={currency.code}
                onSelect={handleSelect}
                className="cursor-pointer"
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    selectedCurrency === currency.code
                      ? "opacity-100"
                      : "opacity-0"
                  )}
                />
                <span className="mr-2">{currency.symbol}</span>
                <span>
                  {currency.code} - {currency.name}
                </span>
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default CurrencySelector;
