<?php

namespace App\Http\Controllers\Office\Admin;

use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Http\Requests\Office\Admin\UpdateDiscountPolicyRequest;
use App\Models\AuditLog;
use App\Models\DiscountPolicy;
use App\Services\AuditLogService;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class DiscountPolicyController extends Controller
{
    public function __construct(
        protected AuditLogService $auditLogService,
    ) {}

    public function index(): Response
    {
        abort_unless(request()->user()?->hasAnyRole([UserRole::Admin, UserRole::Owner]), 403);

        $thresholdPolicy = DiscountPolicy::query()->firstOrCreate(
            ['key' => 'loyalty_order_threshold'],
            ['value' => '5', 'description' => 'Diskon aktif setelah order tailor closed lebih dari threshold ini.'],
        );

        $discountPolicy = DiscountPolicy::query()->firstOrCreate(
            ['key' => 'loyalty_discount_percent'],
            ['value' => '20', 'description' => 'Diskon loyal customer dalam persen.'],
        );

        return Inertia::render('Office/Admin/Discounts/Index', [
            'policyId' => $discountPolicy->id,
            'values' => [
                'loyalty_order_threshold' => (int) $thresholdPolicy->value,
                'loyalty_discount_percent' => (int) $discountPolicy->value,
            ],
            'history' => AuditLog::query()
                ->with('user:id,name')
                ->where('action', 'discount_policy.updated')
                ->latest('created_at')
                ->limit(10)
                ->get()
                ->map(fn (AuditLog $log): array => [
                    'id' => $log->id,
                    'user_name' => $log->user?->name,
                    'created_at' => optional($log->created_at)?->format('Y-m-d H:i'),
                    'old_values' => $log->old_values,
                    'new_values' => $log->new_values,
                    'notes' => $log->notes,
                ])->values(),
            'can' => [
                'update' => request()->user()?->hasRole(UserRole::Admin) ?? false,
            ],
        ]);
    }

    public function update(UpdateDiscountPolicyRequest $request, DiscountPolicy $policy): RedirectResponse
    {
        $thresholdPolicy = DiscountPolicy::query()->firstOrCreate(
            ['key' => 'loyalty_order_threshold'],
            ['value' => '5', 'description' => 'Diskon aktif setelah order tailor closed lebih dari threshold ini.'],
        );

        $discountPolicy = DiscountPolicy::query()->firstOrCreate(
            ['key' => 'loyalty_discount_percent'],
            ['value' => '20', 'description' => 'Diskon loyal customer dalam persen.'],
        );

        $oldValues = [
            'loyalty_order_threshold' => (int) $thresholdPolicy->value,
            'loyalty_discount_percent' => (int) $discountPolicy->value,
        ];

        $thresholdPolicy->update(['value' => (string) $request->integer('loyalty_order_threshold')]);
        $discountPolicy->update(['value' => (string) $request->integer('loyalty_discount_percent')]);

        $this->auditLogService->log(
            user: $request->user(),
            action: 'discount_policy.updated',
            auditable: $policy,
            oldValues: $oldValues,
            newValues: [
                'loyalty_order_threshold' => $request->integer('loyalty_order_threshold'),
                'loyalty_discount_percent' => $request->integer('loyalty_discount_percent'),
            ],
            notes: 'Policy diskon loyal customer diperbarui.',
            ipAddress: $request->ip(),
        );

        return back()->with('success', 'Policy diskon berhasil diperbarui.');
    }
}
