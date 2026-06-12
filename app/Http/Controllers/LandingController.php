<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Inertia\Inertia;
use Inertia\Response;

class LandingController extends Controller
{
    public function __invoke(): Response
    {
        $featuredProducts = Product::query()
            ->where('is_active', true)
            ->orderByDesc('is_clearance')
            ->orderByRaw('CASE WHEN image_path IS NULL THEN 1 ELSE 0 END')
            ->orderBy('name')
            ->limit(3)
            ->get()
            ->map(fn (Product $product): array => [
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
                'is_low_stock' => $product->stock <= 5 && $product->stock > 0,
                'is_sold_out' => $product->stock < 1,
                'image_path' => $product->image_path,
            ])
            ->values();

        return Inertia::render('Landing/Index', [
            'brand' => [
                'name' => 'Djaitin',
                'tagline' => 'Trusted convection partner for tailor custom, ready-to-wear, and bulk production.',
                'services' => [
                    'Tailor Custom',
                    'Ready-to-Wear',
                    'Bulk Convection',
                ],
            ],
            'catalog' => [
                'eyebrow' => 'Ready-to-Wear Catalog',
                'title' => 'Curated capsule, ready to ship.',
                'description' => 'A small set of pieces from our active stock. Stock and sizing stay live, so what you see is what is on hand.',
                'cta_label' => 'Open full catalog',
                'guest_cta_label' => 'Sign in to shop',
                'index_url' => route('customer.catalog.index'),
            ],
            'featuredProducts' => $featuredProducts,
        ]);
    }
}
