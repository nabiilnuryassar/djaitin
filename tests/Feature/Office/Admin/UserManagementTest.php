<?php

use App\Enums\UserRole;
use App\Models\User;

test('admin can create edit and deactivate staff users', function () {
    $admin = User::factory()->admin()->create();

    $this->actingAs($admin)->post(route('office.admin.users.store'), [
        'name' => 'Staff Kasir',
        'email' => 'staff-kasir@example.com',
        'password' => 'password',
        'role' => UserRole::Kasir->value,
        'is_active' => true,
    ])->assertRedirect();

    $managedUser = User::query()->where('email', 'staff-kasir@example.com')->firstOrFail();

    expect($managedUser->role)->toBe(UserRole::Kasir)
        ->and($managedUser->is_active)->toBeTrue();

    $this->actingAs($admin)->put(route('office.admin.users.update', $managedUser), [
        'name' => 'Staff Produksi',
        'email' => 'staff-kasir@example.com',
        'role' => UserRole::Produksi->value,
        'is_active' => true,
    ])->assertRedirect();

    expect($managedUser->refresh()->role)->toBe(UserRole::Produksi);

    $this->actingAs($admin)
        ->delete(route('office.admin.users.destroy', $managedUser))
        ->assertRedirect();

    expect($managedUser->refresh()->is_active)->toBeFalse();
});

test('owner cannot create or update users', function () {
    $owner = User::factory()->owner()->create();
    $managedUser = User::factory()->kasir()->create();

    $this->actingAs($owner)->post(route('office.admin.users.store'), [
        'name' => 'Nope',
        'email' => 'nope@example.com',
        'password' => 'password',
        'role' => UserRole::Kasir->value,
    ])->assertForbidden();

    $this->actingAs($owner)->put(route('office.admin.users.update', $managedUser), [
        'name' => 'Updated',
        'email' => $managedUser->email,
        'role' => UserRole::Admin->value,
        'is_active' => true,
    ])->assertForbidden();
});

test('kasir cannot access admin modules', function () {
    $kasir = User::factory()->kasir()->create();

    $this->actingAs($kasir)
        ->get(route('office.admin.users.index'))
        ->assertForbidden();
});
