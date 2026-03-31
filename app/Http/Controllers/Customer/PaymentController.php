<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Http\Requests\Customer\StorePaymentRequest;
use App\Http\Requests\Customer\UploadPaymentProofRequest;
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
    ) {
    }

    public function index(Request $request): Response
    {
        $this->authorize('viewAny', Payment::class);

        $payments = Payment::query()
            ->with('order')
            ->whereHas('order.customer', fn ($query) => $query->where('user_id', $request->user()?->id))
            ->latest()
            ->get()
            ->map(fn (Payment $payment): array => [
                'id' => $payment->id,
                'payment_number' => $payment->payment_number,
                'status' => $payment->status->value,
                'method' => $payment->method->value,
                'amount' => (float) $payment->amount,
                'reference_number' => $payment->reference_number,
                'rejection_reason' => $payment->rejection_reason,
                'payment_date' => $payment->payment_date?->format('Y-m-d H:i'),
                'order' => [
                    'id' => $payment->order?->id,
                    'order_number' => $payment->order?->order_number,
                ],
            ])->values();

        return Inertia::render('Customer/Payments/Index', [
            'payments' => $payments,
        ]);
    }

    public function store(StorePaymentRequest $request, Order $order): RedirectResponse
    {
        $this->authorize('view', $order);

        $proofPath = $request->file('proof')?->store('payments/proofs', 'public');

        $this->paymentService->record($order, [
            ...$request->validated(),
            'proof_image_path' => $proofPath,
        ], $request->user(), $request->ip());

        return back()->with('success', 'Pembayaran berhasil dikirim.');
    }

    public function uploadProof(
        UploadPaymentProofRequest $request,
        Payment $payment,
    ): RedirectResponse {
        $this->paymentService->uploadProof(
            $payment,
            $request->file('proof'),
            $request->user(),
            $request->ip(),
        );

        return back()->with('success', 'Bukti transfer berhasil diunggah.');
    }
}
