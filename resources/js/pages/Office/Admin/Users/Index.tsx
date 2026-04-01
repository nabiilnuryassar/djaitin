import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import DashboardController from '@/actions/App/Http/Controllers/Office/DashboardController';
import { FlashMessage } from '@/components/flash-message';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import OfficeLayout from '@/layouts/office-layout';
import office from '@/routes/office';
import type { BreadcrumbItem } from '@/types';

type PaginationLink = {
    url: string | null;
    label: string;
    active: boolean;
};

type UserRow = {
    id: number;
    name: string;
    email: string;
    role: string;
    is_active: boolean;
};

type UserSheetState =
    | { mode: 'create' }
    | { mode: 'edit'; user: UserRow }
    | null;

type Props = {
    filters: {
        search: string;
        role: string;
    };
    users: {
        data: UserRow[];
        links: PaginationLink[];
    };
    roles: Array<{ value: string; label: string }>;
    can: {
        create: boolean;
        update: boolean;
        delete: boolean;
    };
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: DashboardController() },
    { title: 'Admin Users', href: office.admin.users.index() },
];

export default function AdminUsersIndex({
    filters,
    users,
    roles,
    can,
}: Props) {
    const [sheetState, setSheetState] = useState<UserSheetState>(null);
    const staffRoles = roles.filter((role) => role.value !== 'customer');

    return (
        <OfficeLayout breadcrumbs={breadcrumbs}>
            <Head title="Admin Users" />

            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <FlashMessage />

                <Card className="rounded-2xl border-slate-200/80 shadow-sm">
                    <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div>
                            <CardTitle className="[font-family:var(--font-heading)] text-xl font-semibold text-[#0F172A]">
                                User management
                            </CardTitle>
                            <p className="text-sm text-slate-600">
                                Kelola akses admin, kasir, dan produksi dari
                                tabel staf terpusat.
                            </p>
                        </div>
                        {can.create ? (
                            <Button
                                type="button"
                                onClick={() => setSheetState({ mode: 'create' })}
                            >
                                Tambah user
                            </Button>
                        ) : null}
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <form
                            className="grid gap-3 md:grid-cols-3"
                            onSubmit={(event) => {
                                event.preventDefault();
                                const formData = new FormData(
                                    event.currentTarget,
                                );
                                router.get(
                                    office.admin.users.index.url({
                                        query: {
                                            search:
                                                String(
                                                    formData.get('search') || '',
                                                ) || null,
                                            role:
                                                String(
                                                    formData.get('role') || '',
                                                ) || null,
                                        },
                                    }),
                                    {},
                                    {
                                        preserveState: true,
                                        preserveScroll: true,
                                    },
                                );
                            }}
                        >
                            <input
                                name="search"
                                defaultValue={filters.search}
                                placeholder="Cari user"
                                className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-700"
                            />
                            <select
                                name="role"
                                defaultValue={filters.role}
                                className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-700"
                            >
                                <option value="">Semua role</option>
                                {roles.map((role) => (
                                    <option key={role.value} value={role.value}>
                                        {role.label}
                                    </option>
                                ))}
                            </select>
                            <Button type="submit">Filter</Button>
                        </form>

                        <div className="overflow-hidden rounded-2xl border border-slate-200/80">
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-slate-200 text-sm">
                                    <thead className="bg-slate-50">
                                        <tr>
                                            <th className="px-4 py-3 text-left font-semibold text-slate-600">
                                                Nama
                                            </th>
                                            <th className="px-4 py-3 text-left font-semibold text-slate-600">
                                                Email
                                            </th>
                                            <th className="px-4 py-3 text-left font-semibold text-slate-600">
                                                Role
                                            </th>
                                            <th className="px-4 py-3 text-left font-semibold text-slate-600">
                                                Status
                                            </th>
                                            <th className="px-4 py-3 text-right font-semibold text-slate-600">
                                                Aksi
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-200 bg-white">
                                        {users.data.length === 0 ? (
                                            <tr>
                                                <td
                                                    colSpan={5}
                                                    className="px-4 py-10 text-center text-slate-500"
                                                >
                                                    Tidak ada user yang cocok
                                                    dengan filter.
                                                </td>
                                            </tr>
                                        ) : (
                                            users.data.map((user) => (
                                                <tr key={user.id}>
                                                    <td className="px-4 py-4">
                                                        <p className="font-semibold text-[#0F172A]">
                                                            {user.name}
                                                        </p>
                                                    </td>
                                                    <td className="px-4 py-4 text-slate-600">
                                                        {user.email}
                                                    </td>
                                                    <td className="px-4 py-4">
                                                        <Badge variant="secondary">
                                                            {user.role}
                                                        </Badge>
                                                    </td>
                                                    <td className="px-4 py-4">
                                                        <Badge
                                                            className={
                                                                user.is_active
                                                                    ? 'bg-emerald-100 text-emerald-800'
                                                                    : 'bg-slate-100 text-slate-700'
                                                            }
                                                        >
                                                            {user.is_active
                                                                ? 'Aktif'
                                                                : 'Nonaktif'}
                                                        </Badge>
                                                    </td>
                                                    <td className="px-4 py-4">
                                                        <div className="flex justify-end gap-2">
                                                            {can.update ? (
                                                                <Button
                                                                    type="button"
                                                                    variant="outline"
                                                                    onClick={() =>
                                                                        setSheetState(
                                                                            {
                                                                                mode: 'edit',
                                                                                user,
                                                                            },
                                                                        )
                                                                    }
                                                                >
                                                                    Edit
                                                                </Button>
                                                            ) : null}
                                                            {can.delete &&
                                                            user.is_active ? (
                                                                <form
                                                                    {...office.admin.users.destroy.form(
                                                                        user.id,
                                                                    )}
                                                                >
                                                                    <Button
                                                                        type="submit"
                                                                        variant="outline"
                                                                        className="border-red-200 text-red-700"
                                                                    >
                                                                        Nonaktifkan
                                                                    </Button>
                                                                </form>
                                                            ) : null}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            {users.links.map((link) => (
                                <Button
                                    key={`${link.label}-${link.url ?? 'null'}`}
                                    asChild={link.url !== null}
                                    type="button"
                                    variant={link.active ? 'default' : 'outline'}
                                    className="min-w-11"
                                    disabled={link.url === null}
                                >
                                    {link.url === null ? (
                                        <span
                                            dangerouslySetInnerHTML={{
                                                __html: link.label,
                                            }}
                                        />
                                    ) : (
                                        <Link
                                            href={link.url}
                                            dangerouslySetInnerHTML={{
                                                __html: link.label,
                                            }}
                                        />
                                    )}
                                </Button>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Sheet
                open={sheetState !== null}
                onOpenChange={(open) => !open && setSheetState(null)}
            >
                <SheetContent className="w-full overflow-y-auto border-l-slate-200 bg-[#F8FAFF] sm:max-w-xl">
                    <SheetHeader className="border-b border-slate-200 pb-4 text-left">
                        <SheetTitle className="[font-family:var(--font-heading)] text-xl font-semibold text-[#0F172A]">
                            {sheetState?.mode === 'edit'
                                ? 'Edit user staff'
                                : 'Tambah user staff'}
                        </SheetTitle>
                        <SheetDescription className="text-slate-600">
                            {sheetState?.mode === 'edit'
                                ? 'Perbarui data user, role, dan status aktif langsung dari sheet.'
                                : 'Buat akun staff baru tanpa membuka registrasi publik.'}
                        </SheetDescription>
                    </SheetHeader>

                    {sheetState ? (
                        <UserSheetForm
                            key={
                                sheetState.mode === 'edit'
                                    ? `edit-${sheetState.user.id}`
                                    : 'create'
                            }
                            roles={staffRoles}
                            sheetState={sheetState}
                        />
                    ) : null}
                </SheetContent>
            </Sheet>
        </OfficeLayout>
    );
}

function UserSheetForm({
    sheetState,
    roles,
}: {
    sheetState: Exclude<UserSheetState, null>;
    roles: Array<{ value: string; label: string }>;
}) {
    const user = sheetState.mode === 'edit' ? sheetState.user : null;

    return (
        <form
            {...(sheetState.mode === 'edit'
                ? office.admin.users.update.form(sheetState.user.id)
                : office.admin.users.store.form())}
            className="flex h-full flex-col"
        >
            <div className="grid gap-4 px-4 py-6">
                <label className="grid gap-2 text-sm font-medium text-slate-700">
                    Nama lengkap
                    <input
                        name="name"
                        defaultValue={user?.name ?? ''}
                        className="h-11 rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-700"
                    />
                </label>
                <label className="grid gap-2 text-sm font-medium text-slate-700">
                    Email
                    <input
                        name="email"
                        type="email"
                        defaultValue={user?.email ?? ''}
                        className="h-11 rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-700"
                    />
                </label>
                <label className="grid gap-2 text-sm font-medium text-slate-700">
                    Password
                    <input
                        name="password"
                        type="password"
                        placeholder={
                            sheetState.mode === 'edit'
                                ? 'Kosongkan jika tidak diubah'
                                : 'Password awal user'
                        }
                        className="h-11 rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-700"
                    />
                </label>
                <label className="grid gap-2 text-sm font-medium text-slate-700">
                    Role
                    <select
                        name="role"
                        defaultValue={user?.role ?? roles[0]?.value}
                        className="h-11 rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-700"
                    >
                        {roles.map((role) => (
                            <option key={role.value} value={role.value}>
                                {role.label}
                            </option>
                        ))}
                    </select>
                </label>
                <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
                    <input type="hidden" name="is_active" value="0" />
                    <label className="flex items-center gap-3 text-sm font-medium text-slate-700">
                        <input
                            type="checkbox"
                            name="is_active"
                            value="1"
                            defaultChecked={user?.is_active ?? true}
                        />
                        User aktif
                    </label>
                </div>
            </div>
            <SheetFooter className="border-t border-slate-200">
                <Button type="submit" className="w-full">
                    {sheetState.mode === 'edit'
                        ? 'Simpan perubahan'
                        : 'Buat user'}
                </Button>
            </SheetFooter>
        </form>
    );
}
