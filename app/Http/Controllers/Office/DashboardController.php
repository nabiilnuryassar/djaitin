<?php

namespace App\Http\Controllers\Office;

use App\Enums\PaymentStatus;
use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Models\Order;
use App\Models\Payment;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(Request $request): Response
    {
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

        return Inertia::render('Office/Dashboard/Index', [
            'metrics' => [
                'orders_today' => Order::query()->whereDate('created_at', today())->count(),
                'pending_payments' => Payment::query()
                    ->where('status', PaymentStatus::PendingVerification)
                    ->count(),
                'customers' => Customer::query()->count(),
                'revenue_today' => (float) Payment::query()
                    ->where('status', PaymentStatus::Verified)
                    ->whereDate('verified_at', today())
                    ->sum('amount'),
            ],
            'recentOrders' => $recentOrders,
        ]);
    }
}
