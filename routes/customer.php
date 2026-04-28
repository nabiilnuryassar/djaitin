<?php

use App\Http\Controllers\Customer\AddressController;
use App\Http\Controllers\Customer\CartController;
use App\Http\Controllers\Customer\CartItemController;
use App\Http\Controllers\Customer\CatalogController;
use App\Http\Controllers\Customer\CheckoutController;
use App\Http\Controllers\Customer\ConvectionController;
use App\Http\Controllers\Customer\DashboardController;
use App\Http\Controllers\Customer\HomeController;
use App\Http\Controllers\Customer\MeasurementController;
use App\Http\Controllers\Customer\NotificationController;
use App\Http\Controllers\Customer\OrderController;
use App\Http\Controllers\Customer\PaymentController;
use App\Http\Controllers\Customer\ProfileController;
use App\Http\Controllers\Customer\ServiceController;
use App\Http\Controllers\Customer\TailorConfiguratorController;
use Illuminate\Support\Facades\Route;

Route::get('/', HomeController::class)->name('home');
Route::get('catalog', [CatalogController::class, 'index'])->name('catalog.index');
Route::get('catalog/{product}', [CatalogController::class, 'show'])->name('catalog.show');
Route::get('services/tailor', [ServiceController::class, 'tailor'])->name('services.tailor');
Route::get('services/ready-to-wear', [ServiceController::class, 'readyToWear'])->name('services.rtw');
Route::get('services/convection', [ServiceController::class, 'convection'])->name('services.convection');
Route::get('tailor/configure', TailorConfiguratorController::class)->name('tailor.configure');

Route::middleware(['auth', 'role:customer'])
    ->group(function (): void {
        Route::get('dashboard', DashboardController::class)->name('dashboard');
        Route::get('cart', [CartController::class, 'index'])->name('cart.index');
        Route::post('cart/items', [CartItemController::class, 'store'])->name('cart.items.store');
        Route::put('cart/items/{item}', [CartItemController::class, 'update'])->name('cart.items.update');
        Route::delete('cart/items/{item}', [CartItemController::class, 'destroy'])->name('cart.items.destroy');
        Route::get('checkout', [CheckoutController::class, 'index'])->name('checkout.index');
        Route::post('checkout', [CheckoutController::class, 'store'])->name('checkout.store');
        Route::get('convection/request', [ConvectionController::class, 'create'])->name('convection.create');
        Route::post('convection', [ConvectionController::class, 'store'])->name('convection.store');
        Route::get('orders', [OrderController::class, 'index'])->name('orders.index');
        Route::get('orders/{order}', [OrderController::class, 'show'])->name('orders.show');
        Route::post('orders/{order}/attachments', [OrderController::class, 'uploadAttachment'])->name('orders.attachments.store');

        Route::post('orders/tailor', [OrderController::class, 'storeTailor'])->name('orders.tailor.store');
        Route::post('orders/draft', [OrderController::class, 'saveDraft'])->name('orders.draft.store');
        Route::post('orders/{order}/submit', [OrderController::class, 'submitDraft'])->name('orders.draft.submit');
        Route::get('notifications', [NotificationController::class, 'index'])->name('notifications.index');
        Route::post('notifications/{id}/read', [NotificationController::class, 'markRead'])->name('notifications.read');
        Route::post('notifications/read-all', [NotificationController::class, 'markAllRead'])->name('notifications.read-all');
        Route::get('payments', [PaymentController::class, 'index'])->name('payments.index');
        Route::post('orders/{order}/payments', [PaymentController::class, 'store'])->name('payments.store');
        Route::post('payments/{payment}/proof', [PaymentController::class, 'uploadProof'])->name('payments.upload-proof');
        Route::get('measurements', [MeasurementController::class, 'index'])->name('measurements.index');
        Route::post('measurements', [MeasurementController::class, 'store'])->name('measurements.store');
        Route::put('measurements/{measurement}', [MeasurementController::class, 'update'])->name('measurements.update');
        Route::get('addresses', [AddressController::class, 'index'])->name('addresses.index');
        Route::post('addresses', [AddressController::class, 'store'])->name('addresses.store');
        Route::put('addresses/{address}', [AddressController::class, 'update'])->name('addresses.update');
        Route::post('addresses/{address}/set-default', [AddressController::class, 'setDefault'])->name('addresses.set-default');
        Route::get('profile', [ProfileController::class, 'edit'])->name('profile.edit');
        Route::put('profile', [ProfileController::class, 'update'])->name('profile.update');
    });
