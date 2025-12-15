import * as React from 'react';

import { cn } from '@/lib/utils';

function DollarInput({ className, ...props }: React.ComponentProps<'input'>) {
  const [displayValue, setDisplayValue] = React.useState('');

  // Format number with commas
  const formatWithCommas = (value: string): string => {
    // Remove all non-digit characters except decimal point
    const cleaned = value.replace(/[^\d.]/g, '');

    // Prevent multiple decimal points
    const parts = cleaned.split('.');
    if (parts.length > 2) {
      return displayValue; // Return previous valid value
    }

    // Add commas to integer part
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');

    // Rejoin with decimal (limit to 2 decimal places)
    return parts.length > 1 ? `${parts[0]}.${parts[1].slice(0, 2)}` : parts[0];
  };

  // Remove commas to get raw number
  const removeCommas = (value: string): string => {
    return value.replace(/,/g, '');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    const formatted = formatWithCommas(rawValue);
    setDisplayValue(formatted);

    // Update the actual input value without commas for form submission
    const numericValue = removeCommas(formatted);

    // Create a synthetic event with the numeric value
    const syntheticEvent = {
      ...e,
      target: {
        ...e.target,
        value: numericValue,
      },
    } as React.ChangeEvent<HTMLInputElement>;

    props.onChange?.(syntheticEvent);
  };

  React.useEffect(() => {
    if (props.value !== undefined) {
      setDisplayValue(formatWithCommas(String(props.value)));
    }
  }, [props.value]);

  return (
    <div className='relative'>
      <span className='pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground'>
        $
      </span>
      <input
        type='text'
        inputMode='decimal'
        data-slot='input'
        className={cn(
          'file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 pl-7 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
          'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
          'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive',
          className,
        )}
        {...props}
        onChange={handleChange}
        value={displayValue}
      />
    </div>
  );
}

export { DollarInput };
