<?php

use App\Http\Controllers\Office\CustomerController;
use App\Http\Controllers\Office\DashboardController;
use App\Http\Controllers\Office\MeasurementController;
use App\Http\Controllers\Office\OrderController;
use App\Http\Controllers\Office\PaymentController;
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
        Route::put('{order}/status', 'updateStatus')->name('status');
    });

Route::controller(PaymentController::class)
    ->prefix('payments')
    ->name('payments.')
    ->group(function (): void {
        Route::get('/', 'index')->name('index');
        Route::post('{payment}/verify', 'verify')->name('verify');
        Route::post('{payment}/reject', 'reject')->name('reject');
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
