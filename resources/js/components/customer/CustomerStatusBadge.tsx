import { Badge } from '@/components/ui/badge';

const customerStatusMap: Record<string, string> = {
    draft: 'Draft',
    pending_payment: 'Menunggu Pembayaran',
    pending_verification: 'Menunggu Verifikasi',
    in_progress: 'Sedang Diproses',
    done: 'Siap Diambil / Siap Dikirim',
    delivered: 'Dalam Pengiriman / Terkirim',
    pickup: 'Menunggu Pickup',
    verified: 'Terverifikasi',
    rejected: 'Ditolak',
    closed: 'Selesai',
    cancelled: 'Dibatalkan',
};

export default function CustomerStatusBadge({
    status,
    label,
}: {
    status: string;
    label?: string | null;
}) {
    return <Badge variant="secondary">{label ?? customerStatusMap[status] ?? status}</Badge>;
}
