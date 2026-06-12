import { cn } from '@/lib/utils';

interface TabItem {
    value: string;
    label: string;
}

interface SegmentedTabsProps {
    items: TabItem[];
    value: string;
    onChange: (value: string) => void;
}

export function SegmentedTabs({ items, value, onChange }: SegmentedTabsProps) {
    return (
        <div className="inline-flex rounded-full border border-border bg-white p-1 shadow-sm">
            {items.map((item) => (
                <button
                    key={item.value}
                    type="button"
                    onClick={() => onChange(item.value)}
                    className={cn(
                        'cursor-pointer rounded-full px-4 py-2 text-sm font-semibold transition',
                        value === item.value ? 'bg-brand-blue text-white shadow-sm' : 'text-muted-foreground hover:text-brand-ink',
                    )}
                >
                    {item.label}
                </button>
            ))}
        </div>
    );
}
