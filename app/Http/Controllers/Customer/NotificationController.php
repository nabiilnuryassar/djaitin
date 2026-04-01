<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class NotificationController extends Controller
{
    public function index(Request $request): Response
    {
        $notifications = $request->user()
            ->notifications()
            ->latest()
            ->paginate(15)
            ->withQueryString()
            ->through(function ($notification): array {
                $data = $notification->data;

                return [
                    'id' => $notification->id,
                    'type' => $data['type'] ?? 'general',
                    'title' => $data['title'] ?? 'Notifikasi',
                    'message' => $data['message'] ?? '',
                    'order_id' => $data['order_id'] ?? null,
                    'order_number' => $data['order_number'] ?? null,
                    'payment_amount' => $data['payment_amount'] ?? null,
                    'rejection_reason' => $data['rejection_reason'] ?? null,
                    'tracking_number' => $data['tracking_number'] ?? null,
                    'courier_name' => $data['courier_name'] ?? null,
                    'read_at' => $notification->read_at?->format('Y-m-d H:i'),
                    'created_at' => $notification->created_at?->format('Y-m-d H:i'),
                ];
            });

        return Inertia::render('Customer/Notifications/Index', [
            'notifications' => $notifications,
        ]);
    }

    public function markRead(Request $request, string $id): RedirectResponse
    {
        $notification = $request->user()
            ->notifications()
            ->whereKey($id)
            ->firstOrFail();

        if ($notification->read_at === null) {
            $notification->markAsRead();
        }

        return back()->with('success', 'Notifikasi ditandai sudah dibaca.');
    }

    public function markAllRead(Request $request): RedirectResponse
    {
        $request->user()
            ->unreadNotifications
            ->markAsRead();

        return back()->with('success', 'Semua notifikasi ditandai sudah dibaca.');
    }
}
