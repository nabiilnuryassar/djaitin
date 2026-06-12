<?php

use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

test('customer payment-related pages expose configured bank accounts', function () {
    $user = User::factory()->customer()->create();
    $customer = $user->customer()->firstOrFail();

    $product = Product::factory()->create([
        'is_active' => true,
        'stock' => 5,
    ]);

    $cart = Cart::query()->create(['user_id' => $user->id]);
    CartItem::query()->create([
        'cart_id' => $cart->id,
        'product_id' => $product->id,
        'qty' => 1,
    ]);

    $order = Order::factory()->for($customer)->create();

    $expectedAccounts = config('djaitin.payment.bank_accounts');

    $assertBankAccounts = function (Assert $page) use ($expectedAccounts): void {
        $page->has('bank_accounts', count($expectedAccounts))
            ->where('bank_accounts.0.bank', $expectedAccounts[0]['bank'])
            ->where('bank_accounts.0.account_number', $expectedAccounts[0]['account_number'])
            ->where('bank_accounts.0.account_holder', $expectedAccounts[0]['account_holder'])
            ->has('transfer_notes')
            ->etc();
    };

    $this->actingAs($user)
        ->get(route('customer.payments.index'))
        ->assertSuccessful()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Customer/Payments/Index')
            ->has('payment', $assertBankAccounts)
        );

    $this->actingAs($user)
        ->get(route('customer.checkout.index'))
        ->assertSuccessful()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Customer/Checkout/Index')
            ->has('payment', $assertBankAccounts)
        );

    $this->actingAs($user)
        ->get(route('customer.convection.create'))
        ->assertSuccessful()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Customer/Convection/Create')
            ->has('payment', $assertBankAccounts)
        );

    $this->actingAs($user)
        ->get(route('customer.tailor.configure'))
        ->assertSuccessful()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Customer/Tailor/Configurator')
            ->has('payment', $assertBankAccounts)
        );

    $this->actingAs($user)
        ->get(route('customer.orders.show', $order))
        ->assertSuccessful()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Customer/Orders/Show')
            ->has('payment', $assertBankAccounts)
        );
});
