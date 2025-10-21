import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import { format } from 'date-fns';
import type { DateRange } from './DateRangePicker';

interface FilterChip {
  type: 'single' | 'multi' | 'date';
  label: string;
  value: string | string[] | DateRange;
  onRemove: () => void;
}

interface FilterChipsProps {
  filters: FilterChip[];
  onClearAll?: () => void;
}

export function FilterChips({ filters, onClearAll }: FilterChipsProps) {
  if (filters.length === 0) return null;

  const renderChipContent = (filter: FilterChip) => {
    if (filter.type === 'date') {
      const range = filter.value as DateRange;
      if (range.from && range.to) {
        return `${filter.label}: ${format(range.from, 'MMM dd')} - ${format(range.to, 'MMM dd')}`;
      }
      if (range.from) {
        return `${filter.label}: ${format(range.from, 'MMM dd')}`;
      }
    }
    
    if (filter.type === 'multi') {
      const values = filter.value as string[];
      return `${filter.label} (${values.length})`;
    }
    
    return `${filter.label}: ${filter.value}`;
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm text-muted-foreground">Active filters:</span>
      {filters.map((filter, index) => (
        <Badge
          key={index}
          variant="secondary"
          className="flex items-center gap-1 pl-2 pr-1"
        >
          {renderChipContent(filter)}
          <button
            onClick={filter.onRemove}
            className="ml-1 rounded-full p-0.5 hover:bg-muted-foreground/20"
          >
            <X className="h-3 w-3" />
          </button>
        </Badge>
      ))}
      {onClearAll && filters.length > 1 && (
        <button
          onClick={onClearAll}
          className="text-sm text-muted-foreground hover:text-foreground underline"
        >
          Clear all
        </button>
      )}
    </div>
  );
}
