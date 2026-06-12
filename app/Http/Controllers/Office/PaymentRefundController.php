<?php

namespace App\Http\Controllers\Office;

use App\Http\Controllers\Controller;
use App\Http\Requests\Office\RefundPaymentRequest;
use App\Models\Payment;
use App\Services\PaymentRefundService;
use Illuminate\Http\RedirectResponse;

class PaymentRefundController extends Controller
{
    public function __construct(
        protected PaymentRefundService $paymentRefundService,
    ) {}

    public function __invoke(RefundPaymentRequest $request, Payment $payment): RedirectResponse
    {
        $this->paymentRefundService->refund(
            $payment,
            $request->string('reason')->value(),
            $request->user(),
            $request->ip(),
        );

        return back()->with('success', 'Pembayaran berhasil direfund. Order dibatalkan.');
    }
}
