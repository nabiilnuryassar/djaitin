import { CheckCheck, Palette, Package, Scissors, ShieldCheck, Truck } from 'lucide-react';

type Props = {
    stage: string | null;
};

const stages = [
    {
        value: 'design',
        label: 'Desain',
        description: 'Review brief dan referensi desain.',
        icon: Palette,
    },
    {
        value: 'material',
        label: 'Persiapan Bahan',
        description: 'Menyiapkan bahan dan kebutuhan produksi.',
        icon: Package,
    },
    {
        value: 'production',
        label: 'Produksi',
        description: 'Masuk ke proses jahit dan pengerjaan utama.',
        icon: Scissors,
    },
    {
        value: 'qc',
        label: 'Quality Control',
        description: 'Pengecekan hasil sebelum packing.',
        icon: ShieldCheck,
    },
    {
        value: 'packing',
        label: 'Packing',
        description: 'Pesanan dirapikan dan disiapkan untuk serah terima.',
        icon: CheckCheck,
    },
    {
        value: 'shipping',
        label: 'Pengiriman / Pickup',
        description: 'Tahap terakhir sebelum diterima customer.',
        icon: Truck,
    },
];

export default function ProductionStageTracker({ stage }: Props) {
    const currentIndex = Math.max(
        stages.findIndex((item) => item.value === stage),
        0,
    );

    return (
        <div className="grid gap-3">
            {stages.map((item, index) => {
                const isActive = index === currentIndex;
                const isCompleted = index < currentIndex;

                return (
                    <div
                        key={item.value}
                        className={
                            isActive
                                ? 'rounded-[1.5rem] border border-[#2563EB] bg-[#EFF4FF] p-4 shadow-[0_12px_30px_rgba(37,99,235,0.08)]'
                                : isCompleted
                                  ? 'rounded-[1.5rem] border border-emerald-200 bg-emerald-50 p-4'
                                  : 'rounded-[1.5rem] border border-[#DBEAFE] bg-white p-4'
                        }
                    >
                        <div className="flex items-start gap-3">
                            <div
                                className={
                                    isActive
                                        ? 'rounded-2xl bg-[#2563EB] p-3 text-white'
                                        : isCompleted
                                          ? 'rounded-2xl bg-emerald-500 p-3 text-white'
                                          : 'rounded-2xl bg-slate-100 p-3 text-slate-500'
                                }
                            >
                                <item.icon className="size-5" />
                            </div>
                            <div className="space-y-1">
                                <p className="font-medium text-[#0F172A]">
                                    {item.label}
                                </p>
                                <p className="text-sm leading-6 text-slate-600">
                                    {item.description}
                                </p>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
