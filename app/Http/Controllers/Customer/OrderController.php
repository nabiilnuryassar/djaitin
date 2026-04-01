<?php

namespace App\Http\Controllers\Customer;

use App\Enums\OrderStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Customer\SaveDraftRequest;
use App\Http\Requests\Customer\StoreTailorOrderRequest;
use App\Http\Requests\Customer\UploadAttachmentRequest;
use App\Models\Order;
use App\Models\OrderAttachment;
use App\Models\Payment;
use App\Services\AttachmentService;
use App\Services\DraftOrderService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class OrderController extends Controller
{
    public function __construct(
        protected DraftOrderService $draftOrderService,
        protected AttachmentService $attachmentService,
    ) {}

    public function index(Request $request): Response
    {
        $this->authorize('viewAny', Order::class);

        $customer = $request->user()?->customer()->firstOrFail();

        $orders = $customer->orders()
            ->with(['garmentModel:id,name', 'payments'])
            ->latest()
            ->get()
            ->map(fn (Order $order): array => [
                'id' => $order->id,
                'order_number' => $order->order_number,
                'order_type' => $order->order_type->value,
                'company_name' => $order->company_name,
                'status' => $order->status->value,
                'status_label' => $this->customerStatusLabel($order->status),
                'garment_model_name' => $order->garmentModel?->name,
                'due_date' => $order->due_date?->toDateString(),
                'total_amount' => (float) $order->total_amount,
                'outstanding_amount' => (float) $order->outstanding_amount,
                'latest_payment_status' => $order->payments->sortByDesc('created_at')->first()?->status?->value,
            ])->values();

        return Inertia::render('Customer/Orders/Index', [
            'orders' => $orders,
        ]);
    }

    public function show(Request $request, Order $order): Response
    {
        $this->authorize('view', $order);

        $order->load([
            'garmentModel',
            'fabric',
            'measurement',
            'items',
            'payments',
            'shipment.courier',
            'attachments.uploadedBy',
        ]);

        return Inertia::render('Customer/Orders/Show', [
            'order' => [
                'id' => $order->id,
                'order_number' => $order->order_number,
                'order_type' => $order->order_type->value,
                'company_name' => $order->company_name,
                'production_stage' => $order->production_stage?->value,
                'status' => $order->status->value,
                'status_label' => $this->customerStatusLabel($order->status),
                'measurement_mode' => $order->measurement_mode,
                'due_date' => $order->due_date?->toDateString(),
                'spec_notes' => $order->spec_notes,
                'subtotal' => (float) $order->subtotal,
                'discount_amount' => (float) $order->discount_amount,
                'total_amount' => (float) $order->total_amount,
                'paid_amount' => (float) $order->paid_amount,
                'outstanding_amount' => (float) $order->outstanding_amount,
                'garment_model' => $order->garmentModel?->only(['id', 'name']),
                'fabric' => $order->fabric?->only(['id', 'name']),
                'measurement' => $order->measurement?->only(['id', 'label']),
                'items' => $order->items->map(fn ($item): array => [
                    'id' => $item->id,
                    'item_name' => $item->item_name,
                    'size' => $item->size,
                    'qty' => $item->qty,
                    'unit_price' => (float) $item->unit_price,
                    'discount_amount' => (float) $item->discount_amount,
                    'subtotal' => (float) $item->subtotal,
                ])->values(),
                'payments' => $order->payments->map(fn (Payment $payment): array => [
                    'id' => $payment->id,
                    'payment_number' => $payment->payment_number,
                    'method' => $payment->method->value,
                    'status' => $payment->status->value,
                    'amount' => (float) $payment->amount,
                    'reference_number' => $payment->reference_number,
                    'proof_image_path' => $payment->proof_image_path,
                    'payment_date' => $payment->payment_date?->format('Y-m-d H:i'),
                    'rejection_reason' => $payment->rejection_reason,
                ])->values(),
                'attachments' => $order->attachments->map(fn (OrderAttachment $attachment): array => [
                    'id' => $attachment->id,
                    'file_name' => $attachment->file_name,
                    'file_type' => $attachment->file_type,
                    'url' => asset('storage/'.$attachment->file_path),
                    'uploaded_by' => $attachment->uploadedBy?->name,
                    'uploaded_at' => $attachment->created_at?->format('Y-m-d H:i'),
                ])->values(),
                'shipment' => $order->shipment === null
                    ? null
                    : [
                        'status' => $order->shipment->status->value,
                        'courier_name' => $order->shipment->courier?->name,
                        'recipient_name' => $order->shipment->recipient_name,
                        'recipient_address' => $order->shipment->recipient_address,
                        'recipient_phone' => $order->shipment->recipient_phone,
                        'shipping_cost' => (float) $order->shipment->shipping_cost,
                        'tracking_number' => $order->shipment->tracking_number,
                    ],
            ],
        ]);
    }

    public function uploadAttachment(
        UploadAttachmentRequest $request,
        Order $order,
    ): RedirectResponse {
        $this->authorize('view', $order);

        if ($order->order_type->value !== 'convection') {
            abort(404);
        }

        $this->attachmentService->upload(
            $order,
            $request->file('file'),
            $request->user(),
            $request->ip(),
        );

        return back()->with('success', 'Lampiran order berhasil diunggah.');
    }

    public function saveDraft(SaveDraftRequest $request): RedirectResponse
    {
        $customer = $request->user()?->customer()->firstOrFail();
        $draft = null;

        if ($request->filled('draft_id')) {
            $draft = $customer->orders()
                ->whereKey($request->integer('draft_id'))
                ->where('status', OrderStatus::Draft)
                ->firstOrFail();
        }

        $draftOrder = $this->draftOrderService->saveDraft(
            $request->user(),
            $customer,
            $request->validated(),
            $draft,
            $request->ip(),
        );

        return to_route('customer.tailor.configure')
            ->with('success', 'Draft order berhasil disimpan.')
            ->with('draft_id', $draftOrder->id);
    }

    public function storeTailor(StoreTailorOrderRequest $request): RedirectResponse
    {
        $customer = $request->user()?->customer()->firstOrFail();
        $draft = $this->draftOrderService->saveDraft(
            $request->user(),
            $customer,
            $request->validated(),
            null,
            $request->ip(),
        );

        $order = $this->draftOrderService->submitDraft(
            $draft,
            $request->user(),
            $request->validated(),
            $request->ip(),
        );

        return to_route('customer.orders.show', $order)
            ->with('success', 'Order tailor berhasil dibuat.');
    }

    public function submitDraft(StoreTailorOrderRequest $request, Order $order): RedirectResponse
    {
        $this->authorize('view', $order);

        $submittedOrder = $this->draftOrderService->submitDraft(
            $order,
            $request->user(),
            $request->validated(),
            $request->ip(),
        );

        return to_route('customer.orders.show', $submittedOrder)
            ->with('success', 'Draft order berhasil disubmit.');
    }

    protected function customerStatusLabel(OrderStatus $status): string
    {
        return match ($status) {
            OrderStatus::Draft => 'Draft',
            OrderStatus::PendingPayment => 'Menunggu Pembayaran',
            OrderStatus::InProgress => 'Sedang Diproses',
            OrderStatus::Done => 'Siap Diambil / Siap Dikirim',
            OrderStatus::Delivered => 'Dalam Pengiriman / Terkirim',
            OrderStatus::Pickup => 'Menunggu Pickup',
            OrderStatus::Closed => 'Selesai',
            OrderStatus::Cancelled => 'Dibatalkan',
        };
    }
}
