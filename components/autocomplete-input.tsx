import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Command as CommandPrimitive } from 'cmdk';
import {
  Popover,
  PopoverAnchor,
  PopoverContent,
} from '@/components/ui/popover';
import React, { useMemo, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Check, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

type Props<T extends string> = {
  searchValue: string;
  onSearchValueChange: (input: string) => void;
  selectedValue: T;
  onSelectedValueChange: (value: T) => void;
  dataFetchOnSelectionChange: (shouldTriggerQuery: boolean) => void;
  items: { value: T; label: string }[];
  isLoading?: boolean;
  emptyMessage?: string;
  placeholder?: string;
};

const AutocompleteInput = <T extends string>({
  searchValue,
  onSearchValueChange,
  selectedValue,
  onSelectedValueChange,
  dataFetchOnSelectionChange,
  items,
  isLoading,
  emptyMessage = 'No items.',
  placeholder = 'Search...',
}: Props<T>) => {
  const [open, setOpen] = useState(false);

  const labels = useMemo(
    () =>
      items.reduce((acc, item) => {
        acc[item.value] = item.label;
        return acc;
      }, {} as Record<string, string>),
    [items],
  );

  const reset = () => {
    onSelectedValueChange('' as T);
    onSearchValueChange('');
  };

  const onInputBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    if (
      !e.relatedTarget?.hasAttribute('cmdk-list') &&
      labels[selectedValue] !== searchValue
    ) {
      reset();
    }
  };

  const onSelectItem = (inputValue: string) => {
    if (inputValue === selectedValue) {
      dataFetchOnSelectionChange(false);
      reset();
    } else {
      dataFetchOnSelectionChange(true);
      onSelectedValueChange(inputValue as T);
      onSearchValueChange(labels[inputValue] ?? '');
    }
    setOpen(false);
  };

  return (
    <div className='flex items-center'>
      <Popover open={open} onOpenChange={setOpen}>
        <Command shouldFilter={false}>
          <PopoverAnchor asChild>
            <CommandPrimitive.Input
              asChild
              value={searchValue}
              onValueChange={onSearchValueChange}
              onKeyDown={(e) => setOpen(e.key !== 'Escape')}
              onMouseDown={() => setOpen((open) => !!searchValue || !open)}
              onFocus={() => setOpen(true)}
              onBlur={onInputBlur}
            >
              <Input
                placeholder={placeholder}
                className='bg-light-600 !important min-h-14 border border-gray-100 p-4 text-base font-semibold placeholder:font-normal placeholder:text-slate-500'
              />
            </CommandPrimitive.Input>
          </PopoverAnchor>
          {!open && <CommandList aria-hidden='true' className='hidden' />}
          <PopoverContent
            asChild
            onOpenAutoFocus={(e) => e.preventDefault()}
            onInteractOutside={(e) => {
              if (
                e.target instanceof Element &&
                e.target.hasAttribute('cmdk-input')
              ) {
                e.preventDefault();
              }
            }}
            className='w-[--radix-popover-trigger-width] p-0'
          >
            <CommandList>
              {isLoading && (
                <div className='justify-content flex h-28 items-center'>
                  <Loader2 className='size-6 animate-spin' />
                </div>
              )}
              {items.length > 0 && !isLoading ? (
                <CommandGroup>
                  {items.map((option) => (
                    <CommandItem
                      key={option.value}
                      value={option.value}
                      onMouseDown={(e) => e.preventDefault()}
                      onSelect={onSelectItem}
                    >
                      <Check
                        className={cn(
                          'mr-2 h-4 w-4',
                          selectedValue === option.value
                            ? 'opacity-100'
                            : 'opacity-0',
                        )}
                      />
                      {option.label}
                    </CommandItem>
                  ))}
                </CommandGroup>
              ) : null}
              {!isLoading ? <CommandEmpty>{emptyMessage}</CommandEmpty> : null}
            </CommandList>
          </PopoverContent>
        </Command>
      </Popover>
    </div>
  );
};

export default AutocompleteInput;
