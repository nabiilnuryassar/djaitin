<?php

namespace App\Services;

use App\Enums\PaymentStatus;
use App\Models\Order;
use App\Models\Payment;
use Carbon\Carbon;
use Illuminate\Support\Arr;
use Illuminate\Support\Collection;

class DocumentService
{
    public function __construct(
        protected ReportService $reportService,
    ) {}

    public function generateNota(Order $order): string
    {
        $order->loadMissing(['customer', 'items', 'payments']);

        $verifiedPayments = $order->payments
            ->where('status', PaymentStatus::Verified)
            ->values();

        $rows = $order->items
            ->map(function ($item): string {
                return sprintf(
                    '<tr><td>%s</td><td style="text-align:center">%d</td><td style="text-align:right">%s</td><td style="text-align:right">%s</td></tr>',
                    e($item->item_name),
                    $item->qty,
                    $this->formatCurrency((float) $item->unit_price),
                    $this->formatCurrency((float) $item->subtotal),
                );
            })
            ->implode('');

        $paymentSummary = $verifiedPayments->isEmpty()
            ? '<p>Belum ada pembayaran terverifikasi.</p>'
            : '<ul>'.$verifiedPayments->map(function (Payment $payment): string {
                return sprintf(
                    '<li>%s • %s • %s</li>',
                    e($payment->payment_number),
                    e(str($payment->method->value)->replace('_', ' ')->title()),
                    $this->formatCurrency((float) $payment->amount),
                );
            })->implode('').'</ul>';

        return $this->wrapHtml('Nota Pesanan '.$order->order_number, '
            <h1>Nota Pesanan</h1>
            <p><strong>No. Order:</strong> '.e($order->order_number).'</p>
            <p><strong>Pelanggan:</strong> '.e($order->customer?->name ?? '-').'</p>
            <p><strong>Tanggal Cetak:</strong> '.e(now()->format('d M Y H:i')).'</p>

            <table>
                <thead>
                    <tr>
                        <th>Item</th>
                        <th>Qty</th>
                        <th>Harga</th>
                        <th>Subtotal</th>
                    </tr>
                </thead>
                <tbody>'.$rows.'</tbody>
            </table>

            <h2>Ringkasan</h2>
            <p>Subtotal: '.$this->formatCurrency((float) $order->subtotal).'</p>
            <p>Diskon: '.$this->formatCurrency((float) $order->discount_amount).'</p>
            <p>Total: '.$this->formatCurrency((float) $order->total_amount).'</p>
            <p>Sudah dibayar: '.$this->formatCurrency((float) $order->paid_amount).'</p>
            <p>Sisa tagihan: '.$this->formatCurrency((float) $order->outstanding_amount).'</p>

            <h2>Pembayaran Terverifikasi</h2>
            '.$paymentSummary.'
        ');
    }

    public function generateKwitansi(Payment $payment): string
    {
        $payment->loadMissing(['order.customer', 'verifiedBy']);

        return $this->wrapHtml('Kwitansi '.$payment->payment_number, '
            <h1>Kwitansi Pembayaran</h1>
            <p><strong>No. Pembayaran:</strong> '.e($payment->payment_number).'</p>
            <p><strong>No. Order:</strong> '.e($payment->order?->order_number ?? '-').'</p>
            <p><strong>Pelanggan:</strong> '.e($payment->order?->customer?->name ?? '-').'</p>
            <p><strong>Metode:</strong> '.e(str($payment->method->value)->replace('_', ' ')->title()).'</p>
            <p><strong>Status:</strong> '.e(str($payment->status->value)->replace('_', ' ')->title()).'</p>
            <p><strong>Nominal:</strong> '.$this->formatCurrency((float) $payment->amount).'</p>
            <p><strong>Referensi:</strong> '.e($payment->reference_number ?? '-').'</p>
            <p><strong>Tanggal Bayar:</strong> '.e($payment->payment_date?->format('d M Y H:i') ?? '-').'</p>
            <p><strong>Diverifikasi Oleh:</strong> '.e($payment->verifiedBy?->name ?? '-').'</p>
            <p><strong>Waktu Verifikasi:</strong> '.e($payment->verified_at?->format('d M Y H:i') ?? '-').'</p>
        ');
    }

    /**
     * @param  array<string, mixed>  $filters
     */
    public function exportReport(array $filters): string
    {
        /** @var Carbon $from */
        $from = Arr::get($filters, 'from', now()->startOfMonth());
        /** @var Carbon $to */
        $to = Arr::get($filters, 'to', now()->endOfDay());

        $revenue = $this->reportService->revenueByPeriod($from, $to);
        $breakdown = $this->reportService->paymentMethodBreakdown($from, $to);
        $loyalCustomers = $this->reportService->loyalCustomers();
        $lowStockProducts = $this->reportService->lowStockProducts();
        $repeatOrderRate = $this->reportService->repeatOrderRate($from, $to);
        $slaMetrics = $this->reportService->overdueMetrics($from, $to);
        $funnelMetrics = $this->reportService->funnelMetrics($from, $to);

        return $this->wrapHtml('Laporan Djaitin', '
            <h1>Laporan Operasional</h1>
            <p><strong>Periode:</strong> '.e($from->format('d M Y')).' - '.e($to->format('d M Y')).'</p>

            <h2>Omzet Harian</h2>
            '.$this->renderKeyValueTable($revenue->map(fn (array $row): array => [
            'label' => $row['date'],
            'value' => $this->formatCurrency((float) $row['amount']),
        ])).'

            <h2>Metode Pembayaran</h2>
            '.$this->renderKeyValueTable($breakdown->map(fn (array $row): array => [
            'label' => $row['method'],
            'value' => $this->formatCurrency((float) $row['amount']),
        ])).'

            <h2>Pelanggan Loyal</h2>
            '.$this->renderKeyValueTable($loyalCustomers->map(fn (array $customer): array => [
            'label' => $customer['name'],
            'value' => $customer['order_count'].' order',
        ])).'

            <h2>Repeat Order Rate</h2>
            '.$this->renderKeyValueTable(collect([
            [
                'label' => 'Repeat customers',
                'value' => (string) $repeatOrderRate['repeat_customers'],
            ],
            [
                'label' => 'One-time customers',
                'value' => (string) $repeatOrderRate['one_time_customers'],
            ],
            [
                'label' => 'Repeat rate',
                'value' => $repeatOrderRate['rate'].'%',
            ],
        ])).'

            <h2>SLA Monitoring</h2>
            '.$this->renderKeyValueTable(collect([
            [
                'label' => 'Open orders',
                'value' => (string) $slaMetrics['open_orders'],
            ],
            [
                'label' => 'Overdue orders',
                'value' => (string) $slaMetrics['overdue_orders'],
            ],
            [
                'label' => 'Due today',
                'value' => (string) $slaMetrics['due_today_orders'],
            ],
            [
                'label' => 'Overdue rate',
                'value' => $slaMetrics['overdue_rate'].'%',
            ],
        ])).'

            <h2>Order Funnel</h2>
            '.$this->renderKeyValueTable(collect([
            ['label' => 'Draft', 'value' => (string) $funnelMetrics['draft']],
            ['label' => 'Submitted', 'value' => (string) $funnelMetrics['submitted']],
            ['label' => 'Paid', 'value' => (string) $funnelMetrics['paid']],
            ['label' => 'Closed', 'value' => (string) $funnelMetrics['closed']],
        ])).'

            <h2>Produk Low Stock</h2>
            '.$this->renderKeyValueTable($lowStockProducts->map(fn ($product): array => [
            'label' => $product->name.' ('.$product->sku.')',
            'value' => (string) $product->stock,
        ])).'
        ');
    }

    protected function wrapHtml(string $title, string $body): string
    {
        return '<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="utf-8">
    <title>'.e($title).'</title>
    <style>
        body { font-family: Arial, sans-serif; color: #0f172a; margin: 32px; line-height: 1.5; }
        h1, h2 { margin-bottom: 8px; }
        table { width: 100%; border-collapse: collapse; margin: 16px 0; }
        th, td { border: 1px solid #cbd5e1; padding: 10px; text-align: left; }
        th { background: #eff6ff; }
        ul { padding-left: 18px; }
    </style>
</head>
<body>'.$body.'</body>
</html>';
    }

    /**
     * @param  Collection<int, array{label: string, value: string}>  $rows
     */
    protected function renderKeyValueTable(Collection $rows): string
    {
        if ($rows->isEmpty()) {
            return '<p>Tidak ada data.</p>';
        }

        return '<table><tbody>'.$rows->map(fn (array $row): string => sprintf(
            '<tr><td>%s</td><td style="text-align:right">%s</td></tr>',
            e($row['label']),
            e($row['value']),
        ))->implode('').'</tbody></table>';
    }

    protected function formatCurrency(float $value): string
    {
        return 'Rp '.number_format($value, 0, ',', '.');
    }
}
