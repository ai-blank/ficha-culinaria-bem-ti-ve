
import * as React from "react"
import { cn } from "@/lib/utils"

interface InputCurrencyProps extends Omit<React.ComponentProps<"input">, 'onChange' | 'value'> {
  value?: number;
  onChange?: (value: number) => void;
}

const InputCurrency = React.forwardRef<HTMLInputElement, InputCurrencyProps>(
  ({ className, value = 0, onChange, ...props }, ref) => {
    const [displayValue, setDisplayValue] = React.useState('');

    // Formatador de moeda
    const formatCurrency = (value: number) => {
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        minimumFractionDigits: 2,
      }).format(value);
    };

    // Converter string para número
    const parseCurrency = (value: string) => {
      const numericValue = value.replace(/[^\d]/g, '');
      return parseFloat(numericValue) / 100;
    };

    // Atualizar display quando value prop muda
    React.useEffect(() => {
      if (value !== undefined) {
        setDisplayValue(formatCurrency(value));
      }
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value;
      
      // Permitir apenas números
      const numericValue = inputValue.replace(/[^\d]/g, '');
      
      if (numericValue === '') {
        setDisplayValue('');
        onChange?.(0);
        return;
      }

      // Converter para valor monetário
      const currencyValue = parseFloat(numericValue) / 100;
      const formattedValue = formatCurrency(currencyValue);
      
      setDisplayValue(formattedValue);
      onChange?.(currencyValue);
    };

    const handleBlur = () => {
      if (displayValue === '' || value === 0) {
        setDisplayValue(formatCurrency(0));
      }
    };

    return (
      <input
        type="text"
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className
        )}
        ref={ref}
        value={displayValue}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder="R$ 0,00"
        {...props}
      />
    )
  }
)
InputCurrency.displayName = "InputCurrency"

export { InputCurrency }
