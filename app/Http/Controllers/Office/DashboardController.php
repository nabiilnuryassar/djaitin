<?php

namespace App\Http\Controllers\Office;

use App\Enums\OrderStatus;
use App\Enums\PaymentStatus;
use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Models\Order;
use App\Models\Payment;
use App\Services\ReportService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __construct(
        protected ReportService $reportService,
    ) {}

    public function __invoke(Request $request): Response
    {
        $user = $request->user();
        $recentOrders = Order::query()
            ->with(['customer:id,name'])
            ->latest()
            ->limit(5)
            ->get()
            ->map(fn (Order $order): array => [
                'id' => $order->id,
                'order_number' => $order->order_number,
                'status' => $order->status->value,
                'customer_name' => $order->customer?->name,
                'total_amount' => (float) $order->total_amount,
                'outstanding_amount' => (float) $order->outstanding_amount,
            ])
            ->values();

        $recentRevenue = $this->reportService->revenueByPeriod(
            now()->subDays(29)->startOfDay(),
            now()->endOfDay(),
        );

        return Inertia::render('Office/Dashboard/Index', [
            'role' => $user?->role?->value,
            'metricCards' => $this->metricCards($user?->role),
            'recentOrders' => $recentOrders,
            'alerts' => [
                'overdue_orders' => Order::query()
                    ->where('status', OrderStatus::InProgress)
                    ->whereDate('due_date', '<', today())
                    ->count(),
                'low_stock_products' => $this->reportService->lowStockProducts()->count(),
                'revenue_30_days' => round($recentRevenue->sum('amount'), 2),
                'loyal_customers' => $this->reportService->loyalCustomers()->count(),
            ],
        ]);
    }

    /**
     * @return array<int, array{key: string, label: string, value: string, hint: string, icon: string}>
     */
    protected function metricCards(?UserRole $role): array
    {
        return match ($role) {
            UserRole::Kasir => [
                [
                    'key' => 'pending_orders',
                    'label' => 'Order Pending',
                    'value' => (string) Order::query()->where('status', OrderStatus::PendingPayment)->count(),
                    'hint' => 'Order yang masih menunggu pembayaran.',
                    'icon' => 'orders',
                ],
                [
                    'key' => 'pending_transfer',
                    'label' => 'Transfer Pending',
                    'value' => (string) Payment::query()->where('status', PaymentStatus::PendingVerification)->count(),
                    'hint' => 'Perlu verifikasi kasir atau admin.',
                    'icon' => 'payments',
                ],
                [
                    'key' => 'revenue_today',
                    'label' => 'Bayar Hari Ini',
                    'value' => 'Rp '.number_format((float) Payment::query()
                        ->where('status', PaymentStatus::Verified)
                        ->whereDate('verified_at', today())
                        ->sum('amount'), 0, ',', '.'),
                    'hint' => 'Pembayaran verified hari ini.',
                    'icon' => 'revenue',
                ],
                [
                    'key' => 'customers',
                    'label' => 'Pelanggan',
                    'value' => (string) Customer::query()->count(),
                    'hint' => 'Pelanggan yang sudah terdaftar.',
                    'icon' => 'customers',
                ],
            ],
            UserRole::Produksi => [
                [
                    'key' => 'in_progress',
                    'label' => 'Sedang Diproses',
                    'value' => (string) Order::query()->where('status', OrderStatus::InProgress)->count(),
                    'hint' => 'Order aktif yang sedang dikerjakan.',
                    'icon' => 'orders',
                ],
                [
                    'key' => 'overdue',
                    'label' => 'Terlambat',
                    'value' => (string) Order::query()
                        ->where('status', OrderStatus::InProgress)
                        ->whereDate('due_date', '<', today())
                        ->count(),
                    'hint' => 'Melewati due date dan butuh perhatian.',
                    'icon' => 'alert',
                ],
                [
                    'key' => 'convection',
                    'label' => 'Konveksi Aktif',
                    'value' => (string) Order::query()
                        ->where('status', OrderStatus::InProgress)
                        ->where('order_type', \App\Enums\OrderType::Convection)
                        ->count(),
                    'hint' => 'Order konveksi yang sedang berjalan.',
                    'icon' => 'production',
                ],
                [
                    'key' => 'done_today',
                    'label' => 'Selesai Hari Ini',
                    'value' => (string) Order::query()
                        ->where('status', OrderStatus::Done)
                        ->whereDate('updated_at', today())
                        ->count(),
                    'hint' => 'Order yang selesai hari ini.',
                    'icon' => 'done',
                ],
            ],
            UserRole::Owner => [
                [
                    'key' => 'revenue_30_days',
                    'label' => 'Omzet 30 Hari',
                    'value' => 'Rp '.number_format($this->reportService->revenueByPeriod(now()->subDays(29)->startOfDay(), now()->endOfDay())->sum('amount'), 0, ',', '.'),
                    'hint' => 'Akumulasi pembayaran verified 30 hari terakhir.',
                    'icon' => 'revenue',
                ],
                [
                    'key' => 'loyal_customers',
                    'label' => 'Pelanggan Loyal',
                    'value' => (string) $this->reportService->loyalCustomers()->count(),
                    'hint' => 'Pelanggan dengan frekuensi order tertinggi.',
                    'icon' => 'customers',
                ],
                [
                    'key' => 'pending_transfer',
                    'label' => 'Transfer Pending',
                    'value' => (string) Payment::query()->where('status', PaymentStatus::PendingVerification)->count(),
                    'hint' => 'Perlu tindak lanjut verifikasi.',
                    'icon' => 'payments',
                ],
                [
                    'key' => 'low_stock',
                    'label' => 'Low Stock',
                    'value' => (string) $this->reportService->lowStockProducts()->count(),
                    'hint' => 'Produk yang perlu restock segera.',
                    'icon' => 'inventory',
                ],
            ],
            default => [
                [
                    'key' => 'orders_today',
                    'label' => 'Order Hari Ini',
                    'value' => (string) Order::query()->whereDate('created_at', today())->count(),
                    'hint' => 'Order baru yang masuk hari ini.',
                    'icon' => 'orders',
                ],
                [
                    'key' => 'pending_payments',
                    'label' => 'Transfer Pending',
                    'value' => (string) Payment::query()->where('status', PaymentStatus::PendingVerification)->count(),
                    'hint' => 'Menunggu verifikasi kasir atau admin.',
                    'icon' => 'payments',
                ],
                [
                    'key' => 'customers',
                    'label' => 'Pelanggan',
                    'value' => (string) Customer::query()->count(),
                    'hint' => 'Total pelanggan aktif di sistem.',
                    'icon' => 'customers',
                ],
                [
                    'key' => 'low_stock',
                    'label' => 'Low Stock',
                    'value' => (string) $this->reportService->lowStockProducts()->count(),
                    'hint' => 'Produk RTW yang perlu perhatian stok.',
                    'icon' => 'inventory',
                ],
            ],
        };
    }
}
