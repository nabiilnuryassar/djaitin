<?php

namespace App\Http\Controllers\Office;

use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Http\Requests\Office\RejectPaymentRequest;
use App\Http\Requests\Office\StorePaymentRequest;
use App\Models\Order;
use App\Models\Payment;
use App\Services\PaymentService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PaymentController extends Controller
{
    public function __construct(
        protected PaymentService $paymentService,
    ) {}

    public function index(Request $request): Response
    {
        $this->authorize('viewAny', Payment::class);

        $pendingPayments = Payment::query()
            ->with(['order.customer', 'refundedBy'])
            ->where('status', \App\Enums\PaymentStatus::PendingVerification)
            ->latest()
            ->get()
            ->map(fn (Payment $payment): array => $this->serializePayment($payment))
            ->values();

        $payments = Payment::query()
            ->with(['order.customer', 'refundedBy'])
            ->latest()
            ->paginate(15)
            ->withQueryString()
            ->through(fn (Payment $payment): array => $this->serializePayment($payment));

        return Inertia::render('Office/Payments/Index', [
            'pendingPayments' => $pendingPayments,
            'payments' => $payments,
            'can' => [
                'verify' => $request->user()?->hasAnyRole([UserRole::Kasir, UserRole::Admin]) ?? false,
                'reject' => $request->user()?->hasRole(UserRole::Admin) ?? false,
                'refund' => $request->user()?->hasRole(UserRole::Admin) ?? false,
            ],
        ]);
    }

    public function store(StorePaymentRequest $request, Order $order): RedirectResponse
    {
        $this->authorize('view', $order);
        $payload = $request->validated();
        $payload['proof_image_path'] = $request->file('proof')?->store('payments/proofs', 'public');
        unset($payload['proof']);

        $this->paymentService->record(
            $order,
            $payload,
            $request->user(),
            $request->ip(),
        );

        return back()->with('success', 'Pembayaran berhasil dicatat.');
    }

    public function verify(Request $request, Payment $payment): RedirectResponse
    {
        $this->authorize('verify', $payment);

        $this->paymentService->verifyTransfer($payment, $request->user(), $request->ip());

        return back()->with('success', 'Transfer berhasil diverifikasi.');
    }

    public function reject(
        RejectPaymentRequest $request,
        Payment $payment,
    ): RedirectResponse {
        $this->authorize('reject', $payment);

        $this->paymentService->reject(
            $payment,
            $request->user(),
            $request->string('rejection_reason')->value(),
            $request->ip(),
        );

        return back()->with('success', 'Transfer berhasil ditolak.');
    }

    /**
     * @return array<string, mixed>
     */
    protected function serializePayment(Payment $payment): array
    {
        return [
            'id' => $payment->id,
            'payment_number' => $payment->payment_number,
            'status' => $payment->status->value,
            'method' => $payment->method->value,
            'amount' => (float) $payment->amount,
            'reference_number' => $payment->reference_number,
            'rejection_reason' => $payment->rejection_reason,
            'proof_image_path' => $payment->proof_image_path,
            'proof_image_url' => $payment->proof_image_path
                ? asset('storage/'.$payment->proof_image_path)
                : null,
            'notes' => $payment->notes,
            'order' => [
                'id' => $payment->order?->id,
                'order_number' => $payment->order?->order_number,
                'customer_name' => $payment->order?->customer?->name,
            ],
            'payment_date' => $payment->payment_date?->format('Y-m-d H:i'),
            'verified_at' => $payment->verified_at?->format('Y-m-d H:i'),
            'refunded_at' => $payment->refunded_at?->format('Y-m-d H:i'),
            'refunded_by_name' => $payment->refundedBy?->name,
            'refund_reason' => $payment->refund_reason,
        ];
    }
}
