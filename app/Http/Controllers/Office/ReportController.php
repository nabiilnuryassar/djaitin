<?php

namespace App\Http\Controllers\Office;

use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Services\DocumentService;
use App\Services\ReportService;
use Barryvdh\DomPDF\Facade\Pdf;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\Response as SymfonyResponse;

class ReportController extends Controller
{
    public function __construct(
        protected ReportService $reportService,
        protected DocumentService $documentService,
    ) {}

    public function index(Request $request): Response
    {
        abort_unless($request->user()?->hasAnyRole([UserRole::Admin, UserRole::Owner]), 403);

        [$from, $to, $preset] = $this->resolvePeriod($request);
        $revenue = $this->reportService->revenueByPeriod($from, $to);
        $paymentBreakdown = $this->reportService->paymentMethodBreakdown($from, $to);
        $loyalCustomers = $this->reportService->loyalCustomers();
        $lowStockProducts = $this->reportService->lowStockProducts();
        $repeatOrderRate = $this->reportService->repeatOrderRate($from, $to);
        $slaMetrics = $this->reportService->overdueMetrics($from, $to);
        $funnelMetrics = $this->reportService->funnelMetrics($from, $to);

        return Inertia::render('Office/Reports/Index', [
            'filters' => [
                'preset' => $preset,
                'from' => $from->toDateString(),
                'to' => $to->toDateString(),
            ],
            'summary' => [
                'total_revenue' => round($revenue->sum('amount'), 2),
                'total_transactions' => $paymentBreakdown->sum(fn (array $item): int => $item['amount'] > 0 ? 1 : 0),
                'loyal_customers' => $loyalCustomers->count(),
                'low_stock_products' => $lowStockProducts->count(),
            ],
            'revenueSeries' => $revenue,
            'paymentBreakdown' => $paymentBreakdown,
            'loyalCustomers' => $loyalCustomers,
            'repeatOrderRate' => $repeatOrderRate,
            'slaMetrics' => $slaMetrics,
            'funnelMetrics' => $funnelMetrics,
            'lowStockProducts' => $lowStockProducts->map(fn ($product): array => [
                'id' => $product->id,
                'sku' => $product->sku,
                'name' => $product->name,
                'stock' => $product->stock,
                'final_price' => $product->finalPrice(),
            ])->values(),
        ]);
    }

    public function export(Request $request): SymfonyResponse
    {
        abort_unless($request->user()?->hasAnyRole([UserRole::Admin, UserRole::Owner]), 403);

        [$from, $to] = $this->resolvePeriod($request);
        $format = (string) $request->string('format', 'pdf');

        if ($format === 'csv') {
            $revenue = $this->reportService->revenueByPeriod($from, $to);

            return response()->streamDownload(function () use ($revenue): void {
                echo "tanggal,omzet\n";

                foreach ($revenue as $row) {
                    echo "{$row['date']},{$row['amount']}\n";
                }
            }, 'laporan-'.now()->format('YmdHis').'.csv', [
                'Content-Type' => 'text/csv; charset=UTF-8',
            ]);
        }

        return Pdf::loadHTML($this->documentService->exportReport([
            'from' => $from,
            'to' => $to,
        ]))
            ->setPaper('a4')
            ->download('laporan-'.now()->format('YmdHis').'.pdf');
    }

    /**
     * @return array{0: Carbon, 1: Carbon, 2: string}
     */
    protected function resolvePeriod(Request $request): array
    {
        $preset = (string) $request->string('preset', '30d');

        return match ($preset) {
            'today' => [now()->startOfDay(), now()->endOfDay(), $preset],
            '7d' => [now()->subDays(6)->startOfDay(), now()->endOfDay(), $preset],
            'custom' => [
                Carbon::parse((string) $request->string('from', now()->startOfMonth()->toDateString()))->startOfDay(),
                Carbon::parse((string) $request->string('to', now()->toDateString()))->endOfDay(),
                $preset,
            ],
            default => [now()->subDays(29)->startOfDay(), now()->endOfDay(), '30d'],
        };
    }
}
