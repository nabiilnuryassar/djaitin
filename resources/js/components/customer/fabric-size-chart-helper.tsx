import { HelpCircle, Info, Ruler } from 'lucide-react';
import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

type Gender = 'female' | 'male';

type SizeRow = {
    size: string;
    height: string;
    chest: string;
    waist: string;
    hips: string;
    shoulder: string;
    sleeve: string;
    shirt: string;
    inseam: string;
    trouser: string;
};

const FEMALE_CHART: SizeRow[] = [
    {
        size: 'XS',
        height: '145–155 cm / 38–45 kg',
        chest: '76–82',
        waist: '58–64',
        hips: '82–88',
        shoulder: '34–36',
        sleeve: '54–56',
        shirt: '58–61',
        inseam: '66–70',
        trouser: '58–64',
    },
    {
        size: 'S',
        height: '150–160 cm / 45–52 kg',
        chest: '82–88',
        waist: '64–70',
        hips: '88–94',
        shoulder: '36–38',
        sleeve: '56–58',
        shirt: '61–64',
        inseam: '68–72',
        trouser: '64–70',
    },
    {
        size: 'M',
        height: '155–165 cm / 52–60 kg',
        chest: '88–94',
        waist: '70–76',
        hips: '94–100',
        shoulder: '38–40',
        sleeve: '58–60',
        shirt: '64–67',
        inseam: '70–74',
        trouser: '70–76',
    },
    {
        size: 'L',
        height: '160–170 cm / 60–68 kg',
        chest: '94–102',
        waist: '76–84',
        hips: '100–108',
        shoulder: '40–42',
        sleeve: '59–61',
        shirt: '67–70',
        inseam: '72–76',
        trouser: '76–84',
    },
    {
        size: 'XL',
        height: '165–175 cm / 68–78 kg',
        chest: '102–110',
        waist: '84–92',
        hips: '108–116',
        shoulder: '42–44',
        sleeve: '60–62',
        shirt: '70–73',
        inseam: '74–78',
        trouser: '84–92',
    },
    {
        size: 'XXL',
        height: '168–178 cm / 78–90 kg',
        chest: '110–120',
        waist: '92–104',
        hips: '116–126',
        shoulder: '44–46',
        sleeve: '61–63',
        shirt: '72–75',
        inseam: '76–80',
        trouser: '92–104',
    },
];

const MALE_CHART: SizeRow[] = [
    {
        size: 'XS',
        height: '155–165 cm / 45–55 kg',
        chest: '82–88',
        waist: '68–74',
        hips: '84–90',
        shoulder: '40–42',
        sleeve: '56–58',
        shirt: '65–68',
        inseam: '68–72',
        trouser: '68–74',
    },
    {
        size: 'S',
        height: '160–170 cm / 55–65 kg',
        chest: '88–94',
        waist: '74–80',
        hips: '90–96',
        shoulder: '42–44',
        sleeve: '58–60',
        shirt: '68–71',
        inseam: '70–74',
        trouser: '74–80',
    },
    {
        size: 'M',
        height: '165–175 cm / 65–75 kg',
        chest: '94–100',
        waist: '80–86',
        hips: '96–102',
        shoulder: '44–46',
        sleeve: '60–62',
        shirt: '71–74',
        inseam: '72–76',
        trouser: '80–86',
    },
    {
        size: 'L',
        height: '170–180 cm / 75–85 kg',
        chest: '100–108',
        waist: '86–94',
        hips: '102–110',
        shoulder: '46–48',
        sleeve: '61–63',
        shirt: '74–77',
        inseam: '74–78',
        trouser: '86–94',
    },
    {
        size: 'XL',
        height: '175–185 cm / 85–98 kg',
        chest: '108–116',
        waist: '94–104',
        hips: '110–118',
        shoulder: '48–50',
        sleeve: '62–64',
        shirt: '77–80',
        inseam: '76–80',
        trouser: '94–104',
    },
    {
        size: 'XXL',
        height: '180–190 cm / 98–112 kg',
        chest: '116–126',
        waist: '104–116',
        hips: '118–128',
        shoulder: '50–52',
        sleeve: '63–65',
        shirt: '80–83',
        inseam: '78–82',
        trouser: '104–116',
    },
];

function BodyDiagram() {
    return (
        <svg
            viewBox="0 0 220 320"
            className="h-full w-full"
            role="img"
            aria-label="Diagram titik pengukuran badan"
        >
            <defs>
                <linearGradient id="bodyGradient" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#dbe7fb" />
                    <stop offset="100%" stopColor="#f4f8ff" />
                </linearGradient>
            </defs>

            {/* Body silhouette */}
            <path
                d="M110 18 C 130 18 138 32 134 50 C 132 60 132 64 138 70 C 152 76 162 92 158 110 L 152 124 C 158 138 162 152 162 168 L 156 198 L 152 244 C 152 256 148 280 142 304 L 124 304 L 122 250 L 116 220 L 110 250 L 108 304 L 90 304 C 84 280 80 256 80 244 L 76 198 L 70 168 C 70 152 74 138 80 124 L 74 110 C 70 92 80 76 94 70 C 100 64 100 60 98 50 C 94 32 102 18 110 18 Z"
                fill="url(#bodyGradient)"
                stroke="#9bb6e3"
                strokeWidth="1.5"
            />

            {/* Shoulder line */}
            <line
                x1="74"
                y1="84"
                x2="158"
                y2="84"
                stroke="#1d5fd3"
                strokeWidth="1.2"
                strokeDasharray="3 2"
            />
            <text x="6" y="84" fontSize="9" fill="#1d5fd3" fontWeight="600">
                Bahu
            </text>

            {/* Chest line */}
            <line
                x1="68"
                y1="118"
                x2="164"
                y2="118"
                stroke="#1d5fd3"
                strokeWidth="1.2"
                strokeDasharray="3 2"
            />
            <text x="6" y="118" fontSize="9" fill="#1d5fd3" fontWeight="600">
                Dada
            </text>

            {/* Waist line */}
            <line
                x1="74"
                y1="160"
                x2="158"
                y2="160"
                stroke="#1d5fd3"
                strokeWidth="1.2"
                strokeDasharray="3 2"
            />
            <text x="6" y="160" fontSize="9" fill="#1d5fd3" fontWeight="600">
                Pinggang
            </text>

            {/* Hips line */}
            <line
                x1="72"
                y1="200"
                x2="160"
                y2="200"
                stroke="#1d5fd3"
                strokeWidth="1.2"
                strokeDasharray="3 2"
            />
            <text x="6" y="200" fontSize="9" fill="#1d5fd3" fontWeight="600">
                Pinggul
            </text>

            {/* Sleeve marker */}
            <line
                x1="158"
                y1="84"
                x2="172"
                y2="172"
                stroke="#0f9d58"
                strokeWidth="1.2"
                strokeDasharray="3 2"
            />
            <text x="176" y="138" fontSize="9" fill="#0f9d58" fontWeight="600">
                Lengan
            </text>

            {/* Inseam marker */}
            <line
                x1="116"
                y1="218"
                x2="116"
                y2="304"
                stroke="#d97706"
                strokeWidth="1.2"
                strokeDasharray="3 2"
            />
            <text x="178" y="270" fontSize="9" fill="#d97706" fontWeight="600">
                Inseam
            </text>
            <line
                x1="124"
                y1="270"
                x2="176"
                y2="270"
                stroke="#d97706"
                strokeWidth="0.8"
            />

            {/* Shirt length */}
            <line
                x1="50"
                y1="84"
                x2="50"
                y2="218"
                stroke="#7c3aed"
                strokeWidth="1.2"
                strokeDasharray="3 2"
            />
            <text x="6" y="150" fontSize="9" fill="#7c3aed" fontWeight="600">
                Pjg
            </text>
            <text x="6" y="160" fontSize="9" fill="#7c3aed" fontWeight="600">
                Baju
            </text>
        </svg>
    );
}

function SizeTable({ rows }: { rows: SizeRow[] }) {
    return (
        <div className="overflow-x-auto rounded-2xl border border-[#e6ecf5]">
            <table className="w-full min-w-[760px] border-collapse text-left text-xs">
                <thead className="bg-[#f4f7fc] text-[11px] font-semibold tracking-wide text-slate-500 uppercase">
                    <tr>
                        <th className="px-3 py-2.5">Size</th>
                        <th className="px-3 py-2.5">Tinggi / Berat</th>
                        <th className="px-3 py-2.5 text-right">Dada</th>
                        <th className="px-3 py-2.5 text-right">Pinggang</th>
                        <th className="px-3 py-2.5 text-right">Pinggul</th>
                        <th className="px-3 py-2.5 text-right">Bahu</th>
                        <th className="px-3 py-2.5 text-right">Lengan</th>
                        <th className="px-3 py-2.5 text-right">Pjg Baju</th>
                        <th className="px-3 py-2.5 text-right">Inseam</th>
                        <th className="px-3 py-2.5 text-right">Pgg Celana</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-[#e6ecf5] text-slate-600">
                    {rows.map((row) => (
                        <tr key={row.size} className="hover:bg-[#f9fbff]">
                            <td className="px-3 py-2.5 font-semibold text-[#1d5fd3]">
                                {row.size}
                            </td>
                            <td className="px-3 py-2.5 text-[11px] leading-relaxed">
                                {row.height}
                            </td>
                            <td className="px-3 py-2.5 text-right">
                                {row.chest}
                            </td>
                            <td className="px-3 py-2.5 text-right">
                                {row.waist}
                            </td>
                            <td className="px-3 py-2.5 text-right">
                                {row.hips}
                            </td>
                            <td className="px-3 py-2.5 text-right">
                                {row.shoulder}
                            </td>
                            <td className="px-3 py-2.5 text-right">
                                {row.sleeve}
                            </td>
                            <td className="px-3 py-2.5 text-right">
                                {row.shirt}
                            </td>
                            <td className="px-3 py-2.5 text-right">
                                {row.inseam}
                            </td>
                            <td className="px-3 py-2.5 text-right">
                                {row.trouser}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <p className="border-t border-[#e6ecf5] bg-[#f9fbff] px-3 py-2 text-[11px] text-slate-400">
                Semua angka dalam centimeter (cm).
            </p>
        </div>
    );
}

export function FabricSizeChartHelper() {
    const [open, setOpen] = useState(false);
    const [gender, setGender] = useState<Gender>('female');

    const rows = gender === 'female' ? FEMALE_CHART : MALE_CHART;

    return (
        <section className="rounded-[24px] border border-[#e6ecf5] bg-gradient-to-br from-[#f4f8ff] via-white to-white p-5">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div className="flex items-start gap-3">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-[#1d5fd3]/10 text-[#1d5fd3]">
                        <Ruler className="size-5" />
                    </div>
                    <div>
                        <p className="text-[11px] font-semibold tracking-[0.18em] text-[#1d5fd3] uppercase">
                            Panduan Ukuran
                        </p>
                        <h3 className="mt-1 [font-family:var(--font-heading)] text-lg font-semibold text-[#1a243d]">
                            Bingung soal ukuran detail badan?
                        </h3>
                        <p className="mt-1 max-w-xl text-sm leading-6 text-slate-500">
                            Tenang. Kalau kamu hanya tahu tinggi dan berat
                            badan, kami sudah menyiapkan size chart yang bisa
                            kamu pakai sebagai patokan awal sebelum mengisi
                            ukuran detail.
                        </p>
                    </div>
                </div>

                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <button
                            type="button"
                            className="inline-flex items-center gap-2 self-start rounded-full border border-[#1d5fd3] bg-white px-4 py-2 text-sm font-semibold text-[#1d5fd3] transition hover:bg-[#1d5fd3] hover:text-white"
                            aria-label="Buka panduan size chart"
                        >
                            <HelpCircle className="size-4" />
                            <span>Lihat Panduan</span>
                            <span
                                className="ms-1 inline-flex size-5 items-center justify-center rounded-full bg-[#1d5fd3]/10 text-xs font-bold"
                                aria-hidden
                            >
                                ?
                            </span>
                        </button>
                    </DialogTrigger>

                    <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
                        <DialogHeader>
                            <DialogTitle className="[font-family:var(--font-heading)] text-2xl">
                                Panduan Ukuran Djaitin
                            </DialogTitle>
                            <DialogDescription>
                                Hanya tahu tinggi dan berat badan? Ikuti tiga
                                langkah singkat di bawah untuk memperkirakan
                                ukuran detail kamu.
                            </DialogDescription>
                        </DialogHeader>

                        <ol className="grid gap-3 md:grid-cols-3">
                            {[
                                {
                                    n: '1',
                                    title: 'Pilih kategori tubuh',
                                    desc: 'Pilih chart Perempuan atau Laki-laki sesuai kebutuhan ukuran kamu.',
                                },
                                {
                                    n: '2',
                                    title: 'Cocokkan tinggi & berat',
                                    desc: 'Cari baris yang paling dekat dengan tinggi/berat kamu pada kolom paling kiri.',
                                },
                                {
                                    n: '3',
                                    title: 'Pakai angka ukuran detail',
                                    desc: 'Salin nilai dada, pinggang, pinggul, dst. ke step ukuran (input manual).',
                                },
                            ].map((step) => (
                                <li
                                    key={step.n}
                                    className="rounded-2xl border border-[#e6ecf5] bg-[#f9fbff] p-4"
                                >
                                    <span className="inline-flex size-7 items-center justify-center rounded-full bg-[#1d5fd3] text-sm font-semibold text-white">
                                        {step.n}
                                    </span>
                                    <p className="mt-3 text-sm font-semibold text-[#1a243d]">
                                        {step.title}
                                    </p>
                                    <p className="mt-1 text-xs leading-5 text-slate-500">
                                        {step.desc}
                                    </p>
                                </li>
                            ))}
                        </ol>

                        <div className="mt-2 flex flex-wrap items-center gap-2">
                            <span className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
                                Kategori:
                            </span>
                            <div className="inline-flex rounded-full border border-[#e6ecf5] bg-white p-1">
                                {(
                                    [
                                        { v: 'female', label: 'Perempuan' },
                                        { v: 'male', label: 'Laki-laki' },
                                    ] as const
                                ).map((opt) => (
                                    <button
                                        key={opt.v}
                                        type="button"
                                        onClick={() => setGender(opt.v)}
                                        className={cn(
                                            'rounded-full px-4 py-1.5 text-xs font-semibold transition',
                                            gender === opt.v
                                                ? 'bg-[#1d5fd3] text-white shadow-sm'
                                                : 'text-slate-500 hover:text-[#1d5fd3]',
                                        )}
                                    >
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <SizeTable rows={rows} />

                        <div className="flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-800">
                            <Info className="mt-0.5 size-4 shrink-0" />
                            <div className="space-y-1 text-xs leading-5">
                                <p className="font-semibold">Catatan penting</p>
                                <p>
                                    Angka di chart adalah estimasi rata-rata.
                                    Hasil paling presisi tetap diperoleh dengan
                                    pengukuran langsung. Bila ragu, pilih opsi{' '}
                                    <span className="font-semibold">
                                        Ukur Offline
                                    </span>{' '}
                                    di step Measurement supaya tim Djaitin yang
                                    membantu mengukur di toko.
                                </p>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="mt-5 grid gap-5 md:grid-cols-[180px_1fr] md:items-center">
                <div className="mx-auto h-64 w-44 md:mx-0">
                    <BodyDiagram />
                </div>
                <ul className="grid gap-2 text-sm text-slate-600 md:grid-cols-2">
                    {[
                        {
                            color: '#1d5fd3',
                            label: 'Lingkar Dada',
                            tip: 'Bagian dada terlebar.',
                        },
                        {
                            color: '#1d5fd3',
                            label: 'Lingkar Pinggang',
                            tip: 'Bagian pinggang ternarrow.',
                        },
                        {
                            color: '#1d5fd3',
                            label: 'Lingkar Pinggul',
                            tip: 'Bagian pinggul terlebar.',
                        },
                        {
                            color: '#1d5fd3',
                            label: 'Lebar Bahu',
                            tip: 'Ujung tulang bahu kiri ke kanan.',
                        },
                        {
                            color: '#0f9d58',
                            label: 'Panjang Lengan',
                            tip: 'Bahu sampai pergelangan tangan.',
                        },
                        {
                            color: '#7c3aed',
                            label: 'Panjang Baju',
                            tip: 'Bahu hingga ujung bawah baju.',
                        },
                        {
                            color: '#d97706',
                            label: 'Inseam',
                            tip: 'Pangkal paha sampai mata kaki.',
                        },
                        {
                            color: '#1d5fd3',
                            label: 'Pinggang Celana',
                            tip: 'Lingkar pinggang khusus celana.',
                        },
                    ].map((item) => (
                        <li
                            key={item.label}
                            className="flex items-start gap-2 rounded-xl bg-white/70 p-2.5 ring-1 ring-[#e6ecf5]"
                        >
                            <span
                                aria-hidden
                                className="mt-1 size-2.5 shrink-0 rounded-full"
                                style={{ backgroundColor: item.color }}
                            />
                            <div>
                                <p className="text-xs font-semibold text-[#1a243d]">
                                    {item.label}
                                </p>
                                <p className="text-[11px] leading-4 text-slate-500">
                                    {item.tip}
                                </p>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </section>
    );
}
