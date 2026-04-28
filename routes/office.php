<?php

use App\Http\Controllers\Office\Admin\CourierController;
use App\Http\Controllers\Office\Admin\DiscountPolicyController;
use App\Http\Controllers\Office\Admin\FabricController;
use App\Http\Controllers\Office\Admin\GarmentModelController;
use App\Http\Controllers\Office\Admin\ProductController;
use App\Http\Controllers\Office\Admin\UserController;
use App\Http\Controllers\Office\AuditLogController;
use App\Http\Controllers\Office\CustomerController;
use App\Http\Controllers\Office\DashboardController;
use App\Http\Controllers\Office\DocumentController;
use App\Http\Controllers\Office\MeasurementController;
use App\Http\Controllers\Office\OrderController;
use App\Http\Controllers\Office\PaymentController;
use App\Http\Controllers\Office\ProductionController;
use App\Http\Controllers\Office\ReportController;
use App\Http\Controllers\Office\ShippingController;
use Illuminate\Support\Facades\Route;

Route::get('/', fn () => to_route('office.dashboard'))->name('home');
Route::get('dashboard', DashboardController::class)->name('dashboard');

Route::controller(OrderController::class)
    ->prefix('orders')
    ->name('orders.')
    ->group(function (): void {
        Route::get('/', 'index')->name('index');
        Route::get('tailor/create', 'createTailor')->name('tailor.create');
        Route::post('tailor', 'storeTailor')->name('tailor.store');
        Route::get('{order}', 'show')->name('show');
        Route::post('{order}/attachments', 'uploadAttachment')->name('attachments.store');
        Route::put('{order}/status', 'updateStatus')->name('status');
        Route::put('{order}/production-stage', 'updateProductionStage')->name('production-stage');
        Route::get('{order}/nota', [DocumentController::class, 'nota'])->name('nota');
    });

Route::controller(PaymentController::class)
    ->prefix('payments')
    ->name('payments.')
    ->group(function (): void {
        Route::get('/', 'index')->name('index');
        Route::post('{payment}/verify', 'verify')->name('verify');
        Route::post('{payment}/reject', 'reject')->name('reject');
        Route::get('{payment}/kwitansi', [DocumentController::class, 'kwitansi'])->name('kwitansi');
    });

Route::post('orders/{order}/payments', [PaymentController::class, 'store'])->name('payments.store');

Route::controller(CustomerController::class)
    ->prefix('customers')
    ->name('customers.')
    ->group(function (): void {
        Route::get('/', 'index')->name('index');
        Route::get('create', 'create')->name('create');
        Route::post('/', 'store')->name('store');
        Route::get('{customer}', 'show')->name('show');
        Route::put('{customer}', 'update')->name('update');
    });

Route::controller(MeasurementController::class)
    ->prefix('customers/{customer}/measurements')
    ->name('customers.measurements.')
    ->group(function (): void {
        Route::post('/', 'store')->name('store');
        Route::put('{measurement}', 'update')->name('update');
    });

Route::get('production', [ProductionController::class, 'index'])->name('production.index');

Route::controller(ShippingController::class)
    ->prefix('shipping')
    ->name('shipping.')
    ->group(function (): void {
        Route::get('/', 'index')->name('index');
    });

Route::put('shipments/{shipment}', [ShippingController::class, 'update'])->name('shipments.update');

Route::controller(ReportController::class)
    ->prefix('reports')
    ->name('reports.')
    ->group(function (): void {
        Route::get('/', 'index')->name('index');
        Route::get('export', 'export')->name('export');
    });

Route::get('audit-log', [AuditLogController::class, 'index'])->name('audit-log.index');

Route::prefix('admin')
    ->name('admin.')
    ->group(function (): void {
        Route::resource('users', UserController::class)->except(['show', 'create', 'edit']);
        Route::resource('products', ProductController::class)->except(['show', 'create', 'edit']);
        Route::resource('garment-models', GarmentModelController::class)->except(['show', 'create', 'edit']);
        Route::resource('fabrics', FabricController::class)->except(['show', 'create', 'edit']);
        Route::resource('couriers', CourierController::class)->except(['show', 'create', 'edit']);
        Route::get('discounts', [DiscountPolicyController::class, 'index'])->name('discounts.index');
        Route::put('discounts/{policy}', [DiscountPolicyController::class, 'update'])->name('discounts.update');
    });
