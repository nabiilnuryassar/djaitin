<?php

namespace App\Http\Controllers\Office\Admin;

use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Http\Requests\Office\Admin\StoreProductRequest;
use App\Http\Requests\Office\Admin\UpdateProductRequest;
use App\Models\Product;
use App\Services\AuditLogService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ProductController extends Controller
{
    public function __construct(
        protected AuditLogService $auditLogService,
    ) {}

    public function index(Request $request): Response
    {
        $this->authorize('viewAny', Product::class);

        $search = trim((string) $request->string('search'));
        $lowStock = $request->boolean('low_stock');
        $clearance = $request->boolean('clearance');

        $products = Product::query()
            ->when($search !== '', function ($query) use ($search): void {
                $query->where(function ($builder) use ($search): void {
                    $builder
                        ->where('name', 'like', "%{$search}%")
                        ->orWhere('sku', 'like', "%{$search}%");
                });
            })
            ->when($lowStock, fn ($query) => $query->where('stock', '<=', 5))
            ->when($clearance, fn ($query) => $query->where('is_clearance', true))
            ->orderBy('name')
            ->paginate(15)
            ->withQueryString()
            ->through(fn (Product $product): array => [
                'id' => $product->id,
                'sku' => $product->sku,
                'name' => $product->name,
                'description' => $product->description,
                'category' => $product->category,
                'size' => $product->size,
                'stock' => $product->stock,
                'base_price' => (float) $product->base_price,
                'selling_price' => (float) $product->selling_price,
                'discount_amount' => (float) $product->discount_amount,
                'discount_percent' => (float) $product->discount_percent,
                'final_price' => $product->finalPrice(),
                'is_clearance' => $product->is_clearance,
                'image_path' => $product->image_path,
                'is_active' => $product->is_active,
            ]);

        return Inertia::render('Office/Admin/Products/Index', [
            'filters' => [
                'search' => $search,
                'low_stock' => $lowStock,
                'clearance' => $clearance,
            ],
            'products' => $products,
            'can' => [
                'create' => $request->user()?->can('create', Product::class) ?? false,
                'update' => $request->user()?->hasRole(UserRole::Admin) ?? false,
                'delete' => $request->user()?->hasRole(UserRole::Admin) ?? false,
            ],
        ]);
    }

    public function store(StoreProductRequest $request): RedirectResponse
    {
        $product = Product::query()->create([
            ...$request->validated(),
            'discount_amount' => $request->input('discount_amount', 0),
            'discount_percent' => $request->input('discount_percent', 0),
            'is_clearance' => $request->boolean('is_clearance'),
            'is_active' => $request->boolean('is_active', true),
        ]);

        $this->auditLogService->log(
            user: $request->user(),
            action: 'product.created',
            auditable: $product,
            newValues: $product->only(['sku', 'name', 'stock', 'selling_price']),
            notes: 'Produk baru ditambahkan.',
            ipAddress: $request->ip(),
        );

        return back()->with('success', 'Produk berhasil ditambahkan.');
    }

    public function update(UpdateProductRequest $request, Product $product): RedirectResponse
    {
        $oldValues = $product->only(['sku', 'name', 'stock', 'selling_price', 'is_active']);

        $product->update($request->validated());

        $this->auditLogService->log(
            user: $request->user(),
            action: 'product.updated',
            auditable: $product,
            oldValues: $oldValues,
            newValues: $product->only(['sku', 'name', 'stock', 'selling_price', 'is_active']),
            notes: 'Produk diperbarui.',
            ipAddress: $request->ip(),
        );

        return back()->with('success', 'Produk berhasil diperbarui.');
    }

    public function destroy(Product $product, Request $request): RedirectResponse
    {
        $this->authorize('delete', $product);

        $oldValues = $product->only(['is_active']);
        $product->update(['is_active' => false]);

        $this->auditLogService->log(
            user: $request->user(),
            action: 'product.deactivated',
            auditable: $product,
            oldValues: $oldValues,
            newValues: ['is_active' => false],
            notes: 'Produk dinonaktifkan.',
            ipAddress: $request->ip(),
        );

        return back()->with('success', 'Produk berhasil dinonaktifkan.');
    }
}
