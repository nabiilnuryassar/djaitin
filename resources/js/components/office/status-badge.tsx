import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
    value: string;
    domain?: 'order' | 'payment' | 'shipment' | 'production' | 'user' | 'product';
}

const labels: Record<string, string> = {
    draft: 'Draft',
    awaiting_price: 'Menunggu Harga',
    pending_payment: 'Menunggu Pembayaran',
    in_progress: 'Diproses',
    done: 'Selesai Produksi',
    delivered: 'Dikirim',
    pickup: 'Siap Diambil',
    closed: 'Ditutup',
    cancelled: 'Dibatalkan',
    unpaid: 'Belum Dibayar',
    waiting_verification: 'Menunggu Verifikasi',
    paid: 'Lunas',
    refunded: 'Refund',
    rejected: 'Ditolak',
    active: 'Aktif',
    inactive: 'Nonaktif',
};

const tones: Record<string, string> = {
    draft: 'bg-slate-100 text-slate-700 border-slate-200',
    awaiting_price: 'bg-amber-100 text-amber-800 border-amber-200',
    pending_payment: 'bg-orange-100 text-orange-800 border-orange-200',
    waiting_verification: 'bg-blue-100 text-blue-800 border-blue-200',
    in_progress: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    done: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    delivered: 'bg-cyan-100 text-cyan-800 border-cyan-200',
    pickup: 'bg-brand-gold/25 text-brand-ink border-brand-gold/50',
    closed: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    cancelled: 'bg-red-100 text-red-800 border-red-200',
    unpaid: 'bg-slate-100 text-slate-700 border-slate-200',
    paid: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    refunded: 'bg-purple-100 text-purple-800 border-purple-200',
    rejected: 'bg-red-100 text-red-800 border-red-200',
    active: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    inactive: 'bg-slate-100 text-slate-700 border-slate-200',
};

export function StatusBadge({ value }: StatusBadgeProps) {
    const normalized = String(value).toLowerCase();

    return (
        <Badge variant="outline" className={cn('rounded-full px-2.5 py-1 text-xs font-semibold', tones[normalized] ?? 'bg-slate-100 text-slate-700 border-slate-200')}>
            {labels[normalized] ?? value}
        </Badge>
    );
}
