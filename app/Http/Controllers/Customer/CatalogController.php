<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CatalogController extends Controller
{
    public function index(Request $request): Response
    {
        $productsQuery = Product::query()
            ->where('is_active', true);

        if ($request->filled('category')) {
            $productsQuery->where('category', $request->string('category')->value());
        }

        if ($request->filled('size')) {
            $productsQuery->where('size', $request->string('size')->value());
        }

        $products = $productsQuery
            ->orderByDesc('is_clearance')
            ->orderBy('name')
            ->paginate(12)
            ->withQueryString()
            ->through(fn (Product $product): array => $this->serializeProduct($product));

        return Inertia::render('Customer/Catalog/Index', [
            'filters' => [
                'category' => $request->string('category')->value(),
                'size' => $request->string('size')->value(),
            ],
            'categories' => Product::query()
                ->where('is_active', true)
                ->select('category')
                ->distinct()
                ->orderBy('category')
                ->pluck('category')
                ->values(),
            'sizes' => Product::query()
                ->where('is_active', true)
                ->select('size')
                ->distinct()
                ->orderBy('size')
                ->pluck('size')
                ->values(),
            'products' => $products,
        ]);
    }

    public function show(Request $request, Product $product): Response
    {
        abort_unless($product->is_active, 404);

        $variants = Product::query()
            ->where('is_active', true)
            ->where('name', $product->name)
            ->where('category', $product->category)
            ->orderBy('size')
            ->get()
            ->map(fn (Product $variant): array => $this->serializeProduct($variant))
            ->values();

        return Inertia::render('Customer/Catalog/Show', [
            'product' => $this->serializeProduct($product),
            'variants' => $variants,
        ]);
    }

    protected function serializeProduct(Product $product): array
    {
        return [
            'id' => $product->id,
            'sku' => $product->sku,
            'name' => $product->name,
            'description' => $product->description,
            'category' => $product->category,
            'size' => $product->size,
            'selling_price' => (float) $product->selling_price,
            'discount_amount' => (float) $product->discount_amount,
            'final_price' => $product->finalPrice(),
            'is_clearance' => $product->is_clearance,
            'stock' => $product->stock,
            'is_low_stock' => $product->stock <= 5,
            'image_path' => $product->image_path,
        ];
    }
}
