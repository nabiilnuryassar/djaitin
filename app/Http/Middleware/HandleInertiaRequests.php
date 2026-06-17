<?php

namespace App\Http\Middleware;

use App\Enums\PaymentStatus;
use App\Enums\UserRole;
use App\Models\Payment;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Notifications\DatabaseNotification;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        /** @var User|null $user */
        $user = $request->user();
        $isCustomer = $user?->hasRole(UserRole::Customer) ?? false;

        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'csrf_token' => csrf_token(),
            'auth' => [
                'user' => $user === null ? null : [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role->value,
                    'is_active' => $user->is_active,
                ],
            ],
            'flash' => [
                'success' => $request->session()->get('success'),
                'error' => $request->session()->get('error'),
            ],
            'unread_notifications_count' => $isCustomer
                ? $user->unreadNotifications()->count()
                : 0,
            'recent_notifications' => $isCustomer
                ? $user->notifications()
                    ->latest()
                    ->limit(8)
                    ->get()
                    ->map(fn (DatabaseNotification $notification): array => $this->serializeNotification($notification))
                    ->values()
                : [],
            'pending_transfer_count' => $user?->hasAnyRole([UserRole::Kasir, UserRole::Admin])
                ? Payment::query()
                    ->where('method', 'transfer')
                    ->where('status', PaymentStatus::PendingVerification)
                    ->count()
                : 0,
            'payment' => [
                'bank_accounts' => config('djaitin.payment.bank_accounts', []),
                'transfer_notes' => config('djaitin.payment.transfer_notes', []),
                'support_contact' => config('djaitin.payment.support_contact'),
            ],
            'cart_item_count' => $isCustomer
                ? $user->cart?->items()->sum('qty') ?? 0
                : 0,
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
        ];
    }

    /**
     * @return array<string, mixed>
     */
    protected function serializeNotification(DatabaseNotification $notification): array
    {
        $data = $notification->data;

        return [
            'id' => $notification->id,
            'type' => $data['type'] ?? 'general',
            'title' => $data['title'] ?? 'Notifikasi',
            'message' => $data['message'] ?? '',
            'order_id' => $data['order_id'] ?? null,
            'order_number' => $data['order_number'] ?? null,
            'read_at' => $notification->read_at?->format('Y-m-d H:i'),
            'created_at' => $notification->created_at?->format('Y-m-d H:i'),
        ];
    }
}
