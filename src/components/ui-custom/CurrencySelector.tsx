
import { useState, useEffect } from "react";
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

  useEffect(() => {
    if (value) {
      setSelectedCurrency(value);
    }
  }, [value]);

  const handleSelect = (currentValue: string) => {
    setSelectedCurrency(currentValue);
    onChange(currentValue);
    setOpen(false);
  };

  const selectedOption = currencies.find(
    (currency) => currency.code === selectedCurrency
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("justify-between", className)}
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
      <PopoverContent className="p-0" align="start" sideOffset={5}>
        <Command>
          <CommandInput placeholder="Search currency..." />
          <CommandEmpty>No currency found.</CommandEmpty>
          <CommandGroup className="max-h-64 overflow-y-auto">
            {currencies.map((currency) => (
              <CommandItem
                key={currency.code}
                value={currency.code}
                onSelect={handleSelect}
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
