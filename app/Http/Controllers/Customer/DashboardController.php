<?php

namespace App\Http\Controllers\Customer;

use App\Enums\OrderStatus;
use App\Http\Controllers\Controller;
use App\Models\Payment;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(Request $request): Response
    {
        $customer = $request->user()?->customer;

        return Inertia::render('Customer/Dashboard/Index', [
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
            ],
        ]);
    }
}
