import {
  Command,
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
import React, { useMemo, useRef, useState } from 'react';
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
    // Only reset if focus moved to another element on the page (not when switching tabs/apps)
    // When switching tabs/apps, relatedTarget is null
    if (
      e.relatedTarget &&
      !e.relatedTarget.hasAttribute('cmdk-list') &&
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

  const showDropdown = open && searchValue.length > 0;
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div ref={containerRef} className='relative w-full'>
      <Popover open={showDropdown} onOpenChange={setOpen}>
        <Command shouldFilter={false} className='w-full'>
          <PopoverAnchor asChild>
            <CommandPrimitive.Input
              asChild
              value={searchValue}
              onValueChange={onSearchValueChange}
              onKeyDown={(e) => setOpen(e.key !== 'Escape')}
              onMouseDown={() => setOpen(true)}
              onFocus={() => setOpen(true)}
              onBlur={onInputBlur}
            >
              <Input
                placeholder={placeholder}
                className='h-12 w-full border text-base placeholder:text-muted-foreground'
              />
            </CommandPrimitive.Input>
          </PopoverAnchor>
          {!showDropdown && <CommandList aria-hidden='true' className='hidden' />}
          <PopoverContent
            asChild
            align='start'
            sideOffset={4}
            onOpenAutoFocus={(e) => e.preventDefault()}
            onInteractOutside={(e) => {
              if (
                e.target instanceof Element &&
                e.target.hasAttribute('cmdk-input')
              ) {
                e.preventDefault();
              }
            }}
            className='p-0'
            style={{ width: containerRef.current?.offsetWidth }}
          >
            <CommandList>
              {isLoading && (
                <div className='flex h-12 items-center justify-center'>
                  <Loader2 className='h-5 w-5 animate-spin text-muted-foreground' />
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
                      className='cursor-pointer'
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
              {!isLoading && items.length === 0 && searchValue.length > 0 ? (
                <div className='py-6 text-center text-sm text-muted-foreground'>
                  {emptyMessage}
                </div>
              ) : null}
            </CommandList>
          </PopoverContent>
        </Command>
      </Popover>
    </div>
  );
};

export default AutocompleteInput;
