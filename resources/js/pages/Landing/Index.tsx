import { Head, usePage } from '@inertiajs/react';
import {
    ArrowRight,
    BadgeCheck,
    Boxes,
    ChartColumnBig,
    ShieldCheck,
    Sparkles,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import LandingLayout from '@/layouts/landing-layout';
import { login } from '@/routes';
import office from '@/routes/office';
import type { User } from '@/types';
import { CountUpStat } from './components/CountUpStat';
import { FloatingNavbar } from './components/FloatingNavbar';
import { LenisProvider } from './components/LenisProvider';
import { MagneticButton } from './components/MagneticButton';
import { RoleSurfaceShowcase } from './components/RoleSurfaceShowcase';
import { SequenceScroll } from './components/SequenceScroll';
import { TestimonialSlider } from './components/TestimonialSlider';
import { TextReveal } from './components/TextReveal';
import { WorkflowTimeline } from './components/WorkflowTimeline';
import type {
    LandingFeatureStory,
    LandingHeroCue,
    LandingNavItem,
    LandingPersonaQuote,
    LandingRoleSurface,
    LandingServiceCard,
    LandingStat,
    LandingWorkflowLane,
} from './types';

const frameModules = import.meta.glob('../../../images/sequence/*.jpg', {
    eager: true,
    import: 'default',
}) as Record<string, string>;

const heroFrameSources = Object.entries(frameModules)
    .sort(([left], [right]) =>
        left.localeCompare(right, undefined, { numeric: true }),
    )
    .map(([, source]) => source);

const navItems: LandingNavItem[] = [
    { id: 'hero', label: 'Beranda', kicker: '01' },
    { id: 'manifesto', label: 'Manifesto', kicker: '02' },
    { id: 'services', label: 'Layanan', kicker: '03' },
    { id: 'roles', label: 'Peran', kicker: '04' },
    { id: 'workflow', label: 'Alur Kerja', kicker: '05' },
    { id: 'reports', label: 'Laporan', kicker: '06' },
    { id: 'cta', label: 'Demo', kicker: '07' },
];

const heroCues: LandingHeroCue[] = [
    {
        start: 0,
        end: 0.21,
        align: 'center',
        eyebrow: 'Scrollytelling public site',
        title: 'Operasional konveksi yang akhirnya rapi.',
        description:
            'Dari order tailor, stok ready-to-wear, pembayaran, hingga laporan owner. Semua berada dalam satu sistem yang lebih jelas dibaca dan lebih tenang dioperasikan.',
        badges: [
            'Tailor order wizard',
            'Payment verification',
            'Owner visibility',
        ],
    },
    {
        start: 0.22,
        end: 0.47,
        align: 'left',
        eyebrow: 'Tailor custom',
        title: 'DP minimal 50% tervalidasi sebelum produksi berjalan.',
        description:
            'Wizard order mencatat pelanggan, ukuran, model, bahan, loyalti, due date, dan DP secara terstruktur. Produksi tidak dimulai dari asumsi.',
        badges: ['DP Gate 50%', 'Loyalty badge', 'Due date'],
    },
    {
        start: 0.48,
        end: 0.73,
        align: 'right',
        eyebrow: 'Ready-to-wear',
        title: 'Stok real-time, checkout lebih cepat, clearance tetap terkendali.',
        description:
            'Kasir bisa menjual lebih cepat tanpa menebak stok. Barang tidak turun sebelum pembayaran terverifikasi, jadi angka inventori tetap bisa dipercaya.',
        badges: ['No negative stock', 'Cart + size chips', 'Clearance aware'],
    },
    {
        start: 0.74,
        end: 0.88,
        align: 'left',
        eyebrow: 'Konveksi massal',
        title: 'Produksi baru bergerak setelah pembayaran 100% verified.',
        description:
            'Pesanan massal mengikuti gerbang operasional yang jelas: PIC, item, qty, desain, QC, packing, lalu pengiriman. Tidak ada mulai dulu, bayar belakangan.',
        badges: ['Payment Gate 100%', 'QC timeline', 'Company/PIC records'],
    },
    {
        start: 0.89,
        end: 1,
        align: 'center',
        eyebrow: 'Single operating system',
        title: 'Pantau order, pembayaran, stok, dan laporan dalam satu alur.',
        description:
            'Lebih rapi untuk kasir. Lebih jelas untuk produksi. Lebih tenang untuk owner yang akhirnya bisa membaca kesehatan bisnis tanpa mengejar status manual.',
        badges: ['4 peran operasional', 'Audit trail', 'Export-ready reports'],
    },
];

const serviceCards: LandingServiceCard[] = [
    {
        badge: 'Tailor',
        title: 'Custom order yang ingat ukuran, loyalitas, dan due date.',
        description:
            'Semua data pelanggan dan garment history tersimpan untuk repeat order yang lebih cepat dan lebih akurat.',
        highlights: ['Wizard 4 langkah', 'Ukuran history', 'DP gate 50%'],
        accentClassName:
            'from-[rgba(108,99,255,0.22)] to-[rgba(168,156,255,0.04)]',
    },
    {
        badge: 'Ready-to-Wear',
        title: 'Penjualan stok yang tetap cepat tanpa membuat inventori berbohong.',
        description:
            'Size chips, cart, clearance, dan validasi stok real-time dirancang untuk meja kasir yang sibuk.',
        highlights: [
            'Stock-aware checkout',
            'Clearance badge',
            'Shipping optional',
        ],
        accentClassName:
            'from-[rgba(14,165,233,0.18)] to-[rgba(240,249,255,0.08)]',
    },
    {
        badge: 'Konveksi',
        title: 'Bulk production dengan payment gate dan tahapan produksi yang tegas.',
        description:
            'Company/PIC, daftar item, full payment, QC, packing, sampai pengiriman berada di satu permukaan kerja.',
        highlights: ['Payment gate 100%', 'Production stages', 'PIC + company'],
        accentClassName:
            'from-[rgba(139,92,246,0.22)] to-[rgba(76,29,149,0.05)]',
    },
];

const roleSurfaces: LandingRoleSurface[] = [
    {
        role: 'Kasir / Front Office',
        device: 'Mobile surface',
        navStyle: 'Bottom nav + create FAB',
        headline:
            'Flow entry order dan pembayaran dibuat cepat untuk area depan toko.',
        description:
            'Permukaan ini fokus pada create order, scan ringkasan, input pembayaran cash/transfer, dan cetak dokumen tanpa tenggelam dalam data yang tidak relevan.',
        chips: ['Tailor entry', 'RTW checkout', 'Transfer pending'],
    },
    {
        role: 'Tim Produksi',
        device: 'Tablet surface',
        navStyle: 'Compact rail',
        headline:
            'Produksi cukup melihat apa yang sedang berjalan dan apa yang sudah clear secara pembayaran.',
        description:
            'Status berjalan per order, due date hari ini, dan catatan desain tetap terlihat tanpa mengganggu ritme kerja di area produksi.',
        chips: ['In progress', 'QC queue', 'Due today'],
    },
    {
        role: 'Admin',
        device: 'Desktop surface',
        navStyle: 'Wide sidebar + topbar',
        headline:
            'Verifikasi pembayaran, master data, dan audit trail berada dalam satu panel kontrol.',
        description:
            'Admin perlu membaca detail, memverifikasi transfer, menolak bukti yang salah, dan menjaga konsistensi data tanpa berpindah-pindah konteks.',
        chips: ['Verify / reject', 'Master data', 'Audit log'],
    },
    {
        role: 'Owner / Manager',
        device: 'Desktop analytics',
        navStyle: 'Read-only overview',
        headline:
            'Owner tidak mengelola detail harian, tetapi akhirnya bisa melihat bisnis secara utuh.',
        description:
            'Omzet, pending transfer, stok kritis, dan loyal customer tampil sebagai ringkasan yang bisa dibaca cepat sebelum mengambil keputusan.',
        chips: ['Revenue overview', 'Low stock', 'Loyal customers'],
    },
];

const workflowLanes: LandingWorkflowLane[] = [
    {
        label: 'Tailor',
        gate: 'DP minimal 50%',
        accentClassName: 'border-indigo-200 bg-indigo-50 text-indigo-700',
        steps: [
            'DRAFT: data pelanggan, model, bahan, ukuran, dan due date dirangkum.',
            'PENDING_PAYMENT: sistem menunggu DP verified dengan nominal minimal 50%.',
            'IN_PROGRESS: produksi baru berjalan setelah gerbang DP terpenuhi.',
            'DONE hingga CLOSED: pelunasan wajib lunas sebelum serah terima dan penutupan order.',
        ],
    },
    {
        label: 'Ready-to-Wear',
        gate: 'Stok negatif = 0',
        accentClassName: 'border-sky-200 bg-sky-50 text-sky-700',
        steps: [
            'Produk dipilih per size chip dengan stok saat ini.',
            'Checkout tetap cepat karena kasir melihat validasi stok langsung.',
            'Transfer masuk sebagai pending verification jika belum terkonfirmasi.',
            'Stok baru dikurangi setelah pembayaran verified, bukan saat cart dibuat.',
        ],
    },
    {
        label: 'Konveksi',
        gate: 'Full payment 100%',
        accentClassName: 'border-violet-200 bg-violet-50 text-violet-700',
        steps: [
            'PIC dan item produksi dikunci dari awal sebagai sumber koordinasi.',
            'Pembayaran penuh wajib verified sebelum status produksi aktif.',
            'Tahap desain, bahan, produksi, QC, dan packing terbaca jelas.',
            'Pengiriman atau pickup terjadi setelah pipeline selesai dan tercatat.',
        ],
    },
];

const stats: LandingStat[] = [
    {
        label: 'Layanan inti',
        value: 3,
        description:
            'Tailor, ready-to-wear, dan konveksi tidak hidup sebagai modul terpisah.',
    },
    {
        label: 'Peran operasional',
        value: 4,
        description:
            'Kasir, produksi, admin, dan owner masing-masing punya permukaan kerja sendiri.',
    },
    {
        label: 'DP tailor',
        value: 50,
        suffix: '%',
        description:
            'Produksi tidak bergerak tanpa minimal DP verified sesuai aturan bisnis.',
    },
    {
        label: 'Gate konveksi',
        value: 100,
        suffix: '%',
        description:
            'Konveksi baru masuk ke tahap produksi setelah pembayaran penuh terkonfirmasi.',
    },
    {
        label: 'Stok negatif',
        value: 0,
        description:
            'Checkout RTW menolak kuantitas yang melebihi stok yang benar-benar tersedia.',
    },
];

const featureStories: LandingFeatureStory[] = [
    {
        badge: 'Pelanggan & Ukuran',
        title: 'Riwayat ukuran dan preferensi tersusun untuk repeat order yang lebih cepat.',
        description: 'Tidak perlu mencari catatan lama di buku atau chat.',
    },
    {
        badge: 'Tailor Wizard',
        title: 'Wizard order menuntun kasir dari pelanggan sampai DP tanpa blind spot.',
        description: 'Semua langkah penting divalidasi sejak awal.',
    },
    {
        badge: 'Inventori',
        title: 'RTW tetap cepat dijual tanpa membuat stok menjadi asumsi.',
        description: 'Size, clearance, dan qty dibaca dalam satu grid kerja.',
    },
    {
        badge: 'Verifikasi',
        title: 'Cash langsung verified, transfer tetap menunggu pengecekan.',
        description: 'Audit trail siapa dan kapan tetap tercatat.',
    },
    {
        badge: 'Pengiriman',
        title: 'Pickup, kurir, dan biaya kirim tidak lagi tercecer di luar sistem.',
        description: 'Order detail tetap menjadi single source of truth.',
    },
    {
        badge: 'Audit Log',
        title: 'Perubahan status penting tidak hilang karena semua aksi kritikal dibaca ulang.',
        description: 'Reject transfer dan override diskon tetap punya jejak.',
    },
    {
        badge: 'Dashboard KPI',
        title: 'Owner dan admin melihat kesehatan bisnis dari ringkasan yang relevan.',
        description: 'Omzet, pending transfer, low stock, loyal customer.',
    },
    {
        badge: 'Export',
        title: 'Laporan tidak berhenti di layar, tetapi siap dibagikan lewat PDF atau CSV.',
        description: 'Visibilitas lebih mudah diteruskan ke keputusan.',
    },
];

const personaQuotes: LandingPersonaQuote[] = [
    {
        role: 'Kasir',
        label: 'Front office',
        quote: 'Yang paling terasa bukan tampilannya, tapi saya tidak lagi bingung order mana yang sudah cukup DP dan mana yang masih menunggu verifikasi transfer.',
        focus: 'Kecepatan input tanpa kehilangan validasi bisnis.',
    },
    {
        role: 'Admin',
        label: 'Control panel',
        quote: 'Saat ada bukti transfer masuk, saya bisa lihat statusnya jelas, verifikasi atau tolak dengan alasan, lalu semuanya langsung tercatat.',
        focus: 'Operasional rapi dan mudah diaudit.',
    },
    {
        role: 'Owner',
        label: 'Read-only visibility',
        quote: 'Akhirnya saya bisa membaca omzet, stok kritis, dan pembayaran pending tanpa menanyakan satu per satu ke tim.',
        focus: 'Ketenangan membaca kesehatan bisnis secara cepat.',
    },
    {
        role: 'Produksi',
        label: 'Workshop surface',
        quote: 'Kami hanya mengerjakan order yang memang sudah clear dan bisa langsung lihat stage berikutnya tanpa menebak-nebak dari chat.',
        focus: 'Status produksi yang lebih jelas di lantai kerja.',
    },
];

function SectionHeading({
    eyebrow,
    title,
    description,
    light = false,
}: {
    description: string;
    eyebrow: string;
    light?: boolean;
    title: string;
}) {
    return (
        <div className="max-w-3xl">
            <p
                className={`text-xs font-semibold tracking-[0.28em] uppercase ${
                    light
                        ? 'text-[var(--landing-accent)]'
                        : 'text-[var(--landing-primary)]'
                }`}
            >
                {eyebrow}
            </p>
            <h2
                className={`mt-4 [font-family:var(--landing-heading-font)] text-3xl leading-tight font-bold md:text-5xl ${
                    light ? 'text-white' : 'text-[#1A1830]'
                }`}
            >
                {title}
            </h2>
            <p
                className={`mt-5 text-base leading-7 md:text-lg ${
                    light ? 'text-white/72' : 'text-slate-600'
                }`}
            >
                {description}
            </p>
        </div>
    );
}

function ReportsShowcase() {
    return (
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-[2.5rem] bg-[#101320] p-8 text-white shadow-[0_40px_120px_rgba(26,24,48,0.18)]">
                <div className="flex flex-wrap items-center gap-3">
                    <Badge className="rounded-full bg-emerald-400/18 px-3 py-1 text-emerald-200">
                        Owner visibility
                    </Badge>
                    <Badge className="rounded-full bg-white/10 px-3 py-1 text-white/75">
                        Export PDF / CSV
                    </Badge>
                </div>
                <p className="mt-6 [font-family:var(--landing-heading-font)] text-4xl font-semibold">
                    Visibility yang akhirnya terasa unlocked.
                </p>
                <div className="mt-8 grid gap-4 md:grid-cols-3">
                    {[
                        { label: 'Omzet bulan ini', value: 'Rp 48,2 jt' },
                        { label: 'Transfer pending', value: '7 transaksi' },
                        { label: 'Stok kritis', value: '3 SKU' },
                    ].map((item) => (
                        <div
                            className="rounded-[1.5rem] border border-white/10 bg-white/6 p-5"
                            key={item.label}
                        >
                            <p className="text-sm text-white/60">
                                {item.label}
                            </p>
                            <p className="mt-4 [font-family:var(--landing-heading-font)] text-2xl font-semibold">
                                {item.value}
                            </p>
                        </div>
                    ))}
                </div>
                <div className="mt-6 rounded-[1.8rem] border border-white/10 bg-white/6 p-5">
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-white/65">
                            Breakdown pembayaran
                        </p>
                        <ChartColumnBig className="size-5 text-[var(--landing-accent)]" />
                    </div>
                    <div className="mt-6 space-y-4">
                        <div>
                            <div className="flex justify-between text-sm text-white/70">
                                <span>Cash verified</span>
                                <span>62%</span>
                            </div>
                            <div className="mt-2 h-3 rounded-full bg-white/10">
                                <div className="h-3 w-[62%] rounded-full bg-emerald-400" />
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between text-sm text-white/70">
                                <span>Transfer verified</span>
                                <span>28%</span>
                            </div>
                            <div className="mt-2 h-3 rounded-full bg-white/10">
                                <div className="h-3 w-[28%] rounded-full bg-[var(--landing-accent)]" />
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between text-sm text-white/70">
                                <span>Pending verification</span>
                                <span>10%</span>
                            </div>
                            <div className="mt-2 h-3 rounded-full bg-white/10">
                                <div className="h-3 w-[10%] rounded-full bg-amber-300" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="grid gap-5">
                {[
                    {
                        icon: ShieldCheck,
                        title: 'Pending transfer alerts',
                        text: 'Admin tahu mana transfer yang harus dicek sebelum order bergerak lebih jauh.',
                    },
                    {
                        icon: Boxes,
                        title: 'Low stock watchlist',
                        text: 'Produk yang mendekati habis terlihat cepat sebelum menjadi masalah kasir.',
                    },
                    {
                        icon: BadgeCheck,
                        title: 'Loyal customer view',
                        text: 'Threshold loyalitas dan diskon terbaca sebagai keputusan sistem, bukan ingatan tim.',
                    },
                    {
                        icon: Sparkles,
                        title: 'Export action surface',
                        text: 'Data siap dibawa keluar untuk pelaporan tanpa memecah konteks kerja.',
                    },
                ].map((item, index) => (
                    <div
                        className={`rounded-[2rem] p-6 shadow-[0_20px_70px_rgba(26,24,48,0.08)] ${
                            index % 2 === 0 ? 'bg-white' : 'bg-[#e8f0ff]'
                        }`}
                        key={item.title}
                    >
                        <item.icon className="size-6 text-[var(--landing-primary)]" />
                        <p className="mt-5 [font-family:var(--landing-heading-font)] text-xl font-semibold text-[#1A1830]">
                            {item.title}
                        </p>
                        <p className="mt-3 text-sm leading-7 text-slate-600">
                            {item.text}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default function LandingIndex() {
    const { auth } = usePage<{ auth: { user: User | null } }>().props;
    const actionHref = !auth.user
        ? login()
        : auth.user.role === 'customer'
          ? '/app/dashboard'
          : office.dashboard();
    const actionLabel = auth.user ? 'Dashboard' : 'Masuk';

    function scrollToSection(sectionId: string) {
        document.getElementById(sectionId)?.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
        });
    }

    return (
        <LandingLayout>
            <LenisProvider>
                <Head title="djaitin">
                    <meta
                        content="Sistem informasi konveksi, tailor, dan ready-to-wear dengan alur order, pembayaran, stok, dan laporan yang lebih rapi."
                        name="description"
                    />
                    <meta content="djaitin" property="og:title" />
                    <meta
                        content="Operating system untuk bisnis garmen dengan payment gate, stok real-time, dan visibilitas owner."
                        property="og:description"
                    />
                </Head>
                <div className="bg-[#05030A] [font-family:var(--landing-body-font)] text-white">
                    <FloatingNavbar
                        actionHref={actionHref}
                        actionLabel={actionLabel}
                        navItems={navItems}
                        onNavigate={scrollToSection}
                    />
                    <SequenceScroll
                        cues={heroCues}
                        frameSources={heroFrameSources}
                        onPrimaryAction={() => scrollToSection('cta')}
                        onSecondaryAction={() => scrollToSection('services')}
                    />
                    <main className="relative z-20 -mt-16 overflow-hidden rounded-t-[2.5rem] bg-[#f1efe9] text-[#1A1830] shadow-[0_-30px_90px_rgba(0,0,0,0.12)] md:-mt-24 md:rounded-t-[4rem]">
                        <section
                            className="relative overflow-hidden px-6 py-24 md:px-10"
                            id="manifesto"
                        >
                            <div className="absolute top-8 right-[-4rem] size-48 rounded-full bg-[#d7d1fb] blur-3xl" />
                            <div className="absolute bottom-8 left-[-5rem] size-56 rounded-full bg-[#f6dfe9] blur-3xl" />
                            <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
                                <div>
                                    <SectionHeading
                                        description="djaitin bukan toko fashion dan bukan startup dashboard generik. Ini adalah operating system untuk alur kerja konveksi yang selama ini tercecer di buku, chat, dan asumsi."
                                        eyebrow="Manifesto"
                                        title="Dari operasional yang serba manual menjadi cerita kerja yang jauh lebih terbaca."
                                    />
                                    <div className="mt-8 rounded-[2rem] border border-black/6 bg-white/70 p-7 shadow-[0_24px_80px_rgba(26,24,48,0.08)] backdrop-blur-xl">
                                        <TextReveal text="Catatan di buku. Status di grup WhatsApp. DP belum masuk tapi produksi sudah jalan. Stok ready-to-wear minus satu dan tidak ada yang benar-benar tahu angkanya. djaitin menyusun ulang semua itu menjadi satu alur yang lebih jelas, lebih tegas, dan lebih mudah dipercaya." />
                                    </div>
                                </div>
                                <div className="relative min-h-[34rem] overflow-hidden rounded-[3rem] bg-[#7ea4ff] p-8 shadow-[0_40px_140px_rgba(71,97,181,0.28)]">
                                    <div className="absolute top-8 right-8 rounded-full border border-white/40 bg-white/75 px-4 py-2 text-xs font-semibold tracking-[0.22em] text-[#3158c7] uppercase">
                                        verified flow
                                    </div>
                                    <div className="max-w-xs">
                                        <p className="text-xs font-semibold tracking-[0.28em] text-white/80 uppercase">
                                            Editorial product layout
                                        </p>
                                        <h3 className="mt-4 max-w-sm [font-family:var(--landing-heading-font)] text-4xl leading-tight font-bold text-white">
                                            Sistem yang membuat operasional
                                            terlihat kreatif sekaligus rapi.
                                        </h3>
                                    </div>
                                    <div className="absolute right-10 bottom-10 left-10 grid gap-4 md:grid-cols-[0.9fr_1.1fr]">
                                        <div className="rounded-[2rem] border border-black/6 bg-white p-5 shadow-[0_20px_60px_rgba(26,24,48,0.12)]">
                                            <p className="text-sm font-semibold text-[#1A1830]">
                                                Tailor wizard
                                            </p>
                                            <div className="mt-4 space-y-3">
                                                <div className="h-3 w-24 rounded-full bg-[#d7d1fb]" />
                                                <div className="h-2 rounded-full bg-slate-200" />
                                                <div className="h-2 w-5/6 rounded-full bg-slate-200" />
                                                <div className="h-11 rounded-[1rem] bg-[#101320]" />
                                            </div>
                                        </div>
                                        <div className="rounded-[2rem] border border-white/20 bg-[#e9eefb] p-5 shadow-[0_22px_70px_rgba(26,24,48,0.12)]">
                                            <div className="grid gap-3 sm:grid-cols-3">
                                                <div className="rounded-[1.2rem] bg-white p-4">
                                                    <div className="h-10 rounded-xl bg-[#ff6b7a]" />
                                                </div>
                                                <div className="rounded-[1.2rem] bg-white p-4">
                                                    <div className="h-10 rounded-xl bg-[#91a8ff]" />
                                                </div>
                                                <div className="rounded-[1.2rem] bg-white p-4">
                                                    <div className="h-10 rounded-xl bg-[#ffd56f]" />
                                                </div>
                                            </div>
                                            <p className="mt-4 text-sm leading-6 text-slate-600">
                                                Order, pembayaran, dan stok
                                                tidak lagi berdiri sendiri.
                                                Semuanya berada di satu
                                                permukaan kerja yang sama.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section
                            className="bg-white px-6 py-24 md:px-10"
                            id="services"
                        >
                            <div className="mx-auto max-w-7xl">
                                <div className="grid gap-8 lg:grid-cols-[0.82fr_1.18fr] lg:items-start">
                                    <div>
                                        <SectionHeading
                                            description="Tiga alur utama dibangun dengan identitas visual berbeda, tetapi tetap berjalan di bawah aturan bisnis yang sama."
                                            eyebrow="Layanan inti"
                                            title="Layout modular, tapi cerita produknya tetap satu."
                                        />
                                        <div className="mt-8 rounded-[2.2rem] bg-[#d7ff69] p-8 shadow-[0_24px_80px_rgba(169,203,38,0.28)]">
                                            <p className="text-xs font-semibold tracking-[0.24em] text-[#5a7400] uppercase">
                                                Why this matters
                                            </p>
                                            <p className="mt-4 [font-family:var(--landing-heading-font)] text-3xl font-semibold text-[#1A1830]">
                                                Kasir, produksi, admin, dan
                                                owner membaca bisnis dari sudut
                                                pandang yang memang relevan bagi
                                                mereka.
                                            </p>
                                        </div>
                                    </div>
                                    <div className="grid gap-6 md:grid-cols-2">
                                        {serviceCards.map((card, index) => (
                                            <Card
                                                className={`overflow-hidden rounded-[2.2rem] border-black/6 bg-[#121420] text-white shadow-[0_24px_80px_rgba(26,24,48,0.16)] ${index === 0 ? 'md:col-span-2' : ''}`}
                                                key={card.badge}
                                            >
                                                <CardContent className="p-0">
                                                    <div
                                                        className={`h-48 bg-gradient-to-br ${card.accentClassName} p-6`}
                                                    >
                                                        <Badge className="rounded-full bg-black/40 px-3 py-1 text-white">
                                                            {card.badge}
                                                        </Badge>
                                                        <div className="mt-8 grid gap-3 sm:grid-cols-3">
                                                            <div className="rounded-[1.3rem] bg-white/70 p-4">
                                                                <div className="h-10 rounded-xl bg-[#0f1320]/12" />
                                                            </div>
                                                            <div className="rounded-[1.3rem] bg-white/70 p-4">
                                                                <div className="h-10 rounded-xl bg-[#0f1320]/12" />
                                                            </div>
                                                            <div className="rounded-[1.3rem] bg-white/70 p-4">
                                                                <div className="h-10 rounded-xl bg-[#0f1320]/12" />
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="p-6">
                                                        <h3 className="[font-family:var(--landing-heading-font)] text-2xl font-semibold">
                                                            {card.title}
                                                        </h3>
                                                        <p className="mt-4 text-sm leading-7 text-white/72">
                                                            {card.description}
                                                        </p>
                                                        <div className="mt-6 flex flex-wrap gap-2">
                                                            {card.highlights.map(
                                                                (highlight) => (
                                                                    <Badge
                                                                        className="rounded-full bg-white/10 px-3 py-1 text-white/86"
                                                                        key={
                                                                            highlight
                                                                        }
                                                                        variant="secondary"
                                                                    >
                                                                        {
                                                                            highlight
                                                                        }
                                                                    </Badge>
                                                                ),
                                                            )}
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                </div>
                                <div className="mt-10 rounded-[2.6rem] bg-[#101320] p-6 md:p-8">
                                    <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
                                        <div>
                                            <p className="text-xs font-semibold tracking-[0.24em] text-[var(--landing-accent)] uppercase">
                                                Grounded metrics
                                            </p>
                                            <p className="mt-3 [font-family:var(--landing-heading-font)] text-3xl font-semibold text-white">
                                                Aturan bisnis inti ditampilkan
                                                sebagai struktur, bukan
                                                tempelan.
                                            </p>
                                        </div>
                                        <Badge className="rounded-full bg-white/10 px-4 py-2 text-white">
                                            3 layanan · 4 peran · 0 stok negatif
                                        </Badge>
                                    </div>
                                    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-5">
                                        {stats.map((stat) => (
                                            <CountUpStat
                                                description={stat.description}
                                                key={stat.label}
                                                label={stat.label}
                                                suffix={stat.suffix}
                                                value={stat.value}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section
                            className="relative overflow-hidden bg-[#ebe7f4] px-6 py-24 md:px-10"
                            id="roles"
                        >
                            <div className="absolute -top-12 left-0 h-40 w-40 rounded-br-[3rem] bg-[#d4cbff]" />
                            <div className="mx-auto max-w-7xl">
                                <div className="grid gap-8 lg:grid-cols-[0.78fr_1.22fr]">
                                    <div className="space-y-6">
                                        <SectionHeading
                                            description="Setiap peran membutuhkan surface yang berbeda. Itulah kenapa layout internal tidak dipaksakan seragam."
                                            eyebrow="Role surfaces"
                                            title="Empat peran, empat permukaan kerja yang terasa spesifik."
                                        />
                                        <div className="rounded-[2rem] bg-white p-6 shadow-[0_20px_70px_rgba(26,24,48,0.08)]">
                                            <p className="text-sm leading-7 text-slate-600">
                                                Kasir fokus ke create order dan
                                                pembayaran. Produksi fokus ke
                                                status dan due date. Admin fokus
                                                ke verifikasi dan master data.
                                                Owner fokus ke membaca ringkasan
                                                bisnis.
                                            </p>
                                        </div>
                                    </div>
                                    <div className="rounded-[2.6rem] bg-[#101320] p-5 md:p-7">
                                        <RoleSurfaceShowcase
                                            surfaces={roleSurfaces}
                                        />
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section
                            className="bg-white px-6 py-24 md:px-10"
                            id="workflow"
                        >
                            <div className="mx-auto max-w-7xl">
                                <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
                                    <div className="space-y-6">
                                        <SectionHeading
                                            description="DP tailor, full-payment konveksi, dan stok RTW tidak ditinggalkan sebagai SOP saja. Semuanya diikat ke alur sistem."
                                            eyebrow="Workflow"
                                            title="Gerbang operasional utama dibangun sebagai perjalanan status yang tegas."
                                        />
                                        <div className="rounded-[2.2rem] bg-[#f1eff8] p-7">
                                            <p className="text-xs font-semibold tracking-[0.24em] text-[#5d4fe6] uppercase">
                                                Critical gates
                                            </p>
                                            <div className="mt-5 space-y-4">
                                                {[
                                                    'DP minimal 50% untuk tailor sebelum produksi.',
                                                    'Konveksi wajib 100% verified sebelum status aktif.',
                                                    'Order tidak bisa ditutup saat outstanding belum nol.',
                                                ].map((item) => (
                                                    <div
                                                        className="flex gap-3"
                                                        key={item}
                                                    >
                                                        <span className="mt-2 size-2 rounded-full bg-[#5d4fe6]" />
                                                        <p className="text-sm leading-6 text-slate-700">
                                                            {item}
                                                        </p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                    <WorkflowTimeline lanes={workflowLanes} />
                                </div>
                            </div>
                        </section>

                        <section className="bg-[#f5dde7] px-6 py-24 md:px-10">
                            <div className="mx-auto max-w-7xl">
                                <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
                                    <div>
                                        <SectionHeading
                                            description="Setiap card adalah potongan cerita produk, bukan daftar fitur polos."
                                            eyebrow="Feature bento"
                                            title="Susunan section sesudah hero kini lebih modular dan editorial."
                                        />
                                        <div className="mt-10 grid gap-5 md:grid-cols-2">
                                            {featureStories.map(
                                                (feature, index) => (
                                                    <article
                                                        className={`rounded-[2rem] border border-black/6 p-6 shadow-[0_20px_70px_rgba(26,24,48,0.08)] ${
                                                            index % 4 === 0
                                                                ? 'bg-white'
                                                                : index % 4 ===
                                                                    1
                                                                  ? 'bg-[#e8f0ff]'
                                                                  : index %
                                                                          4 ===
                                                                      2
                                                                    ? 'bg-[#fff0d7]'
                                                                    : 'bg-[#efe7ff]'
                                                        }`}
                                                        key={feature.title}
                                                    >
                                                        <Badge className="rounded-full bg-[#101320] px-3 py-1 text-white">
                                                            {feature.badge}
                                                        </Badge>
                                                        <p className="mt-5 [font-family:var(--landing-heading-font)] text-xl font-semibold text-[#1A1830]">
                                                            {feature.title}
                                                        </p>
                                                        <p className="mt-4 text-sm leading-7 text-slate-600">
                                                            {
                                                                feature.description
                                                            }
                                                        </p>
                                                    </article>
                                                ),
                                            )}
                                        </div>
                                    </div>
                                    <div className="space-y-6">
                                        <div className="rounded-[2.6rem] bg-[#101320] p-6">
                                            <TestimonialSlider
                                                quotes={personaQuotes}
                                            />
                                        </div>
                                        <div className="rounded-[2.2rem] bg-white p-8 shadow-[0_20px_70px_rgba(26,24,48,0.08)]">
                                            <p className="text-xs font-semibold tracking-[0.24em] text-[#f04b64] uppercase">
                                                Product tone
                                            </p>
                                            <p className="mt-4 [font-family:var(--landing-heading-font)] text-3xl font-semibold text-[#1A1830]">
                                                Landing ini menjual ketenangan
                                                operasional, bukan kemewahan
                                                visual kosong.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section
                            className="bg-[#f1efe9] px-6 py-24 md:px-10"
                            id="reports"
                        >
                            <div className="mx-auto max-w-7xl">
                                <SectionHeading
                                    description="Bagian owner dan admin harus terasa seperti visibilitas yang akhirnya terbuka, bukan spreadsheet yang dipoles."
                                    eyebrow="Reports showcase"
                                    title="Revenue, pending transfer, loyal customer, dan stok kritis dibaca dalam panel yang lebih hidup."
                                />
                                <div className="mt-10">
                                    <ReportsShowcase />
                                </div>
                            </div>
                        </section>

                        <section
                            className="bg-[#f1efe9] px-6 py-24 md:px-10"
                            id="cta"
                        >
                            <div className="mx-auto max-w-7xl">
                                <div className="relative overflow-hidden rounded-[2.8rem] bg-[#ff3e58] px-8 py-14 text-white shadow-[0_40px_120px_rgba(255,62,88,0.28)] md:px-12 md:py-18">
                                    <div className="absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.2),transparent_60%)]" />
                                    <div className="relative grid gap-10 lg:grid-cols-[1fr_0.34fr] lg:items-end">
                                        <div>
                                            <p className="text-xs font-semibold tracking-[0.28em] text-white/78 uppercase">
                                                CTA
                                            </p>
                                            <h2 className="mt-4 max-w-3xl [font-family:var(--landing-heading-font)] text-3xl leading-tight font-bold md:text-5xl">
                                                Semua alur kerja konveksi,
                                                tailor, dan RTW dalam satu
                                                sistem.
                                            </h2>
                                            <p className="mt-5 max-w-2xl text-base leading-7 text-white/82">
                                                Lebih rapi untuk kasir. Lebih
                                                jelas untuk produksi. Lebih
                                                tenang untuk owner yang akhirnya
                                                bisa membaca bisnis tanpa
                                                mengejar status manual.
                                            </p>
                                            <div className="mt-8 flex flex-wrap gap-3">
                                                <MagneticButton
                                                    href={actionHref}
                                                >
                                                    {actionLabel === 'Masuk'
                                                        ? 'Jadwalkan Demo'
                                                        : 'Buka Dashboard'}
                                                </MagneticButton>
                                                <MagneticButton
                                                    className="border-white/35 bg-white/12 text-white hover:bg-white/18"
                                                    href="#services"
                                                    variant="outline"
                                                >
                                                    Lihat Modul
                                                </MagneticButton>
                                            </div>
                                        </div>
                                        <div className="rounded-[2rem] bg-black/14 p-6 backdrop-blur-md">
                                            <p className="text-xs font-semibold tracking-[0.24em] text-white/70 uppercase">
                                                What happens next
                                            </p>
                                            <div className="mt-5 space-y-4">
                                                {[
                                                    'Telaah alur order yang saat ini masih tercecer.',
                                                    'Petakan payment gate dan status produksi yang wajib tegas.',
                                                    'Susun permukaan kerja kasir, admin, produksi, dan owner.',
                                                ].map((item) => (
                                                    <div
                                                        className="flex gap-3"
                                                        key={item}
                                                    >
                                                        <span className="mt-1.5 size-2 rounded-full bg-white" />
                                                        <p className="text-sm leading-6 text-white/78">
                                                            {item}
                                                        </p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </main>
                    <footer className="bg-[#05030a] px-6 pb-12 md:px-10">
                        <div className="mx-auto max-w-7xl rounded-[2rem] border border-white/10 bg-white/6 px-6 py-8 shadow-[0_20px_70px_rgba(0,0,0,0.26)] backdrop-blur-xl">
                            <div className="grid gap-8 md:grid-cols-[1.1fr_0.45fr_0.45fr]">
                                <div>
                                    <div className="flex items-center gap-3">
                                        <span className="flex size-10 items-center justify-center rounded-full bg-[var(--landing-primary)] text-sm font-bold text-white">
                                            dj
                                        </span>
                                        <div>
                                            <p className="[font-family:var(--landing-heading-font)] font-semibold text-white">
                                                djaitin
                                            </p>
                                            <p className="text-sm text-white/48">
                                                Sistem informasi konveksi &
                                                tailor
                                            </p>
                                        </div>
                                    </div>
                                    <p className="mt-5 max-w-md text-sm leading-7 text-white/68">
                                        Operating system untuk bisnis garmen
                                        yang membutuhkan alur order, pembayaran,
                                        stok, dan laporan yang lebih rapi.
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-white">
                                        Navigasi
                                    </p>
                                    <div className="mt-4 space-y-3">
                                        {navItems.slice(1).map((item) => (
                                            <button
                                                className="block text-sm text-white/68 transition hover:text-[var(--landing-accent)]"
                                                key={item.id}
                                                onClick={() =>
                                                    scrollToSection(item.id)
                                                }
                                                type="button"
                                            >
                                                {item.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-white">
                                        Aksi
                                    </p>
                                    <div className="mt-4 space-y-3 text-sm text-white/68">
                                        <a
                                            className="inline-flex items-center gap-2 hover:text-[var(--landing-accent)]"
                                            href={
                                                typeof actionHref === 'string'
                                                    ? actionHref
                                                    : actionHref.url
                                            }
                                        >
                                            {actionLabel}
                                            <ArrowRight className="size-4" />
                                        </a>
                                        <p>hello@djaitin.app</p>
                                        <p>
                                            © 2026 djaitin. All rights reserved.
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <Separator className="my-8 bg-white/10" />
                            <div className="flex flex-wrap gap-3">
                                <Badge className="rounded-full bg-indigo-400/12 px-3 py-1 text-indigo-200">
                                    Tailor
                                </Badge>
                                <Badge className="rounded-full bg-sky-400/12 px-3 py-1 text-sky-200">
                                    Ready-to-Wear
                                </Badge>
                                <Badge className="rounded-full bg-violet-400/12 px-3 py-1 text-violet-200">
                                    Konveksi
                                </Badge>
                                <Badge className="rounded-full bg-emerald-400/12 px-3 py-1 text-emerald-200">
                                    Verified workflow
                                </Badge>
                            </div>
                        </div>
                    </footer>
                </div>
            </LenisProvider>
        </LandingLayout>
    );
}
