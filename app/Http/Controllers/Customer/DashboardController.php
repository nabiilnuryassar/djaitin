<?php

namespace App\Http\Controllers\Customer;

use App\Enums\OrderStatus;
use App\Enums\OrderType;
use App\Enums\PaymentStatus;
use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Payment;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(Request $request): Response
    {
        $customer = $request->user()?->customer;
        $recentOrders = $customer?->orders()
            ->with(['garmentModel:id,name'])
            ->latest()
            ->limit(3)
            ->get()
            ->map(fn (Order $order): array => [
                'id' => $order->id,
                'order_number' => $order->order_number,
                'product_name' => $order->garmentModel?->name ?? $this->fallbackProductName($order),
                'status' => $order->status->value,
            ])
            ->values() ?? collect();
        $recentPayments = $customer === null
            ? collect()
            : Payment::query()
                ->whereHas('order', fn ($query) => $query->where('customer_id', $customer->id))
                ->latest()
                ->limit(2)
                ->get()
                ->map(fn (Payment $payment): array => [
                    'id' => $payment->id,
                    'amount' => (float) $payment->amount,
                    'status' => $payment->status->value,
                    'payment_date' => $payment->payment_date?->format('d M Y'),
                ])
                ->values();
        $verifiedPaymentsTotal = $customer === null
            ? 0
            : Payment::query()
                ->whereHas('order', fn ($query) => $query->where('customer_id', $customer->id))
                ->where('status', PaymentStatus::Verified)
                ->sum('amount');

        return Inertia::render('Customer/Dashboard/Index', [
            'customerProfile' => [
                'name' => $customer?->name ?? $request->user()?->name ?? 'Customer',
                'member_label' => $customer?->is_loyalty_eligible ? 'Premium Member' : 'Member Customer',
            ],
            'summary' => [
                'active_orders' => $customer?->orders()
                    ->whereNotIn('status', [
                        OrderStatus::Draft,
                        OrderStatus::Closed,
                        OrderStatus::Cancelled,
                    ])
                    ->count() ?? 0,
                'pending_payments' => $customer === null
                    ? 0
                    : Payment::query()
                        ->whereHas('order', fn ($query) => $query->where('customer_id', $customer->id))
                        ->whereIn('status', ['pending_verification', 'rejected'])
                        ->count(),
                'saved_measurements' => $customer?->measurements()->count() ?? 0,
                'total_spending' => (float) $verifiedPaymentsTotal,
            ],
            'recentOrders' => $recentOrders,
            'recentPayments' => $recentPayments,
        ]);
    }

    protected function fallbackProductName(Order $order): string
    {
        return match ($order->order_type) {
            OrderType::Tailor => 'Pesanan Tailor',
            OrderType::ReadyWear => 'Produk Ready-to-Wear',
            OrderType::Convection => $order->company_name ?: 'Request Konveksi',
        };
    }
}
