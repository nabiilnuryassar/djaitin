<?php

namespace App\Http\Controllers\Office\Admin;

use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Http\Requests\Office\Admin\StoreUserRequest;
use App\Http\Requests\Office\Admin\UpdateUserRequest;
use App\Models\User;
use App\Services\UserService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    public function __construct(
        protected UserService $userService,
    ) {}

    public function index(Request $request): Response
    {
        $this->authorize('viewAny', User::class);

        $search = trim((string) $request->string('search'));
        $role = trim((string) $request->string('role'));

        $users = User::query()
            ->when($search !== '', function ($query) use ($search): void {
                $query->where(function ($builder) use ($search): void {
                    $builder
                        ->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%");
                });
            })
            ->when($role !== '', fn ($query) => $query->where('role', $role))
            ->orderBy('name')
            ->paginate(15)
            ->withQueryString()
            ->through(fn (User $user): array => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role->value,
                'is_active' => $user->is_active,
            ]);

        return Inertia::render('Office/Admin/Users/Index', [
            'filters' => [
                'search' => $search,
                'role' => $role,
            ],
            'users' => $users,
            'roles' => collect(UserRole::cases())->map(fn (UserRole $item): array => [
                'value' => $item->value,
                'label' => str($item->value)->title()->value(),
            ])->values(),
            'can' => [
                'create' => $request->user()?->can('create', User::class) ?? false,
                'update' => $request->user()?->hasRole(UserRole::Admin) ?? false,
                'delete' => $request->user()?->hasRole(UserRole::Admin) ?? false,
            ],
        ]);
    }

    public function store(StoreUserRequest $request): RedirectResponse
    {
        $this->userService->create([
            ...$request->validated(),
            'is_active' => $request->boolean('is_active', true),
        ], $request->user(), $request->ip());

        return back()->with('success', 'User berhasil dibuat.');
    }

    public function update(UpdateUserRequest $request, User $user): RedirectResponse
    {
        $payload = $request->validated();

        if (($payload['password'] ?? null) === null) {
            unset($payload['password']);
        }

        $this->userService->update($user, $payload, $request->user(), $request->ip());

        return back()->with('success', 'User berhasil diperbarui.');
    }

    public function destroy(User $user, Request $request): RedirectResponse
    {
        $this->authorize('delete', $user);

        $this->userService->toggleActive($user, $request->user(), false, $request->ip());

        return back()->with('success', 'User berhasil dinonaktifkan.');
    }
}
