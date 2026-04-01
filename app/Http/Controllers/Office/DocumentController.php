<?php

namespace App\Http\Controllers\Office;

use App\Enums\PaymentStatus;
use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Payment;
use App\Services\DocumentService;
use Barryvdh\DomPDF\Facade\Pdf;
use Symfony\Component\HttpFoundation\Response;

class DocumentController extends Controller
{
    public function __construct(
        protected DocumentService $documentService,
    ) {}

    public function nota(Order $order): Response
    {
        $this->authorize('view', $order);

        abort_unless(
            $order->payments()->where('status', PaymentStatus::Verified)->exists(),
            403,
        );

        return Pdf::loadHTML($this->documentService->generateNota($order))
            ->setPaper('a4')
            ->download('nota-'.$order->order_number.'.pdf');
    }

    public function kwitansi(Payment $payment): Response
    {
        $this->authorize('view', $payment);

        abort_unless($payment->status === PaymentStatus::Verified, 403);

        return Pdf::loadHTML($this->documentService->generateKwitansi($payment))
            ->setPaper('a4')
            ->download('kwitansi-'.$payment->payment_number.'.pdf');
    }
}
