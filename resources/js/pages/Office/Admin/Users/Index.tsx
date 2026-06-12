import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { Inbox } from 'lucide-react';
import DashboardController from '@/actions/App/Http/Controllers/Office/DashboardController';
import { FlashMessage } from '@/components/flash-message';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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

// Office Primitives
import { PageHeader } from '@/components/office/page-header';
import { FilterBar } from '@/components/office/filter-bar';
import { StatusBadge } from '@/components/office/status-badge';
import { EmptyState } from '@/components/office/empty-state';
import { DataTable, DataTableHead, DataTableBody, DataTableCell, DataTableHeaderCell } from '@/components/office/data-table';
import { OfficePagination } from '@/components/office/pagination';

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
    { title: 'Admin Pengguna', href: office.admin.users.index() },
];

export default function AdminUsersIndex({ filters, users, roles, can }: Props) {
    const [sheetState, setSheetState] = useState<UserSheetState>(null);
    const staffRoles = roles.filter((role) => role.value !== 'customer');

    return (
        <OfficeLayout breadcrumbs={breadcrumbs}>
            <Head title="Manajemen Pengguna" />

            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <FlashMessage />

                <PageHeader
                    eyebrow="Admin"
                    title="Manajemen Pengguna"
                    description="Kelola akses admin, kasir, dan staf produksi dari tabel pengguna terpusat."
                    actions={
                        can.create ? (
                            <Button
                                type="button"
                                className="rounded-xl bg-brand-blue text-white hover:bg-brand-blue-deep cursor-pointer"
                                onClick={() =>
                                    setSheetState({ mode: 'create' })
                                }
                            >
                                Tambah Pengguna
                            </Button>
                        ) : null
                    }
                />

                <FilterBar>
                    <form
                        className="grid gap-3 md:grid-cols-3 w-full"
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
                                                formData.get('search') ||
                                                    '',
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
                            placeholder="Cari pengguna"
                            className="h-10 rounded-xl border border-border bg-white px-3 text-sm text-brand-ink"
                        />
                        <select
                            name="role"
                            defaultValue={filters.role}
                            className="h-10 rounded-xl border border-border bg-white px-3 text-sm text-brand-ink cursor-pointer"
                        >
                            <option value="">Semua Role</option>
                            {roles.map((role) => (
                                <option key={role.value} value={role.value}>
                                    {role.label}
                                </option>
                            ))}
                        </select>
                        <Button type="submit" className="rounded-xl bg-brand-blue text-white hover:bg-brand-blue-deep cursor-pointer">
                            Filter
                        </Button>
                    </form>
                </FilterBar>

                {users.data.length === 0 ? (
                    <EmptyState
                        icon={Inbox}
                        title="Tidak ada pengguna"
                        description="Tidak ada pengguna yang cocok dengan filter saat ini."
                    />
                ) : (
                    <div>
                        <DataTable>
                            <DataTableHead>
                                <tr>
                                    <DataTableHeaderCell>Nama</DataTableHeaderCell>
                                    <DataTableHeaderCell>Email</DataTableHeaderCell>
                                    <DataTableHeaderCell>Role</DataTableHeaderCell>
                                    <DataTableHeaderCell>Status</DataTableHeaderCell>
                                    <DataTableHeaderCell className="text-right">Aksi</DataTableHeaderCell>
                                </tr>
                            </DataTableHead>
                            <DataTableBody>
                                {users.data.map((user) => (
                                    <tr key={user.id}>
                                        <DataTableCell>
                                            <p className="font-semibold text-brand-ink">
                                                {user.name}
                                            </p>
                                        </DataTableCell>
                                        <DataTableCell className="text-muted-foreground">
                                            {user.email}
                                        </DataTableCell>
                                        <DataTableCell>
                                            <Badge variant="outline" className="rounded-full bg-brand-mist/40 border-border/70 text-brand-ink">
                                                {user.role}
                                            </Badge>
                                        </DataTableCell>
                                        <DataTableCell>
                                            <StatusBadge value={user.is_active ? 'active' : 'inactive'} />
                                        </DataTableCell>
                                        <DataTableCell>
                                            <div className="flex justify-end gap-2">
                                                {can.update ? (
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        className="rounded-xl cursor-pointer"
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
                                                {can.delete && user.is_active ? (
                                                    <form
                                                        {...office.admin.users.destroy.form(
                                                            user.id,
                                                        )}
                                                    >
                                                        <Button
                                                            type="submit"
                                                            variant="outline"
                                                            className="border-red-200 text-red-700 rounded-xl cursor-pointer hover:bg-red-50"
                                                        >
                                                            Nonaktifkan
                                                        </Button>
                                                    </form>
                                                ) : null}
                                            </div>
                                        </DataTableCell>
                                    </tr>
                                ))}
                            </DataTableBody>
                        </DataTable>

                        <OfficePagination links={users.links} />
                    </div>
                )}
            </div>

            <Sheet
                open={sheetState !== null}
                onOpenChange={(open) => !open && setSheetState(null)}
            >
                <SheetContent className="w-full overflow-y-auto border-l border-border bg-brand-mist/50 sm:max-w-xl">
                    <SheetHeader className="border-b border-border/70 pb-4 text-left">
                        <SheetTitle className="text-xl font-bold text-brand-ink">
                            {sheetState?.mode === 'edit'
                                ? 'Edit Data Pengguna'
                                : 'Tambah Pengguna Baru'}
                        </SheetTitle>
                        <SheetDescription className="text-muted-foreground">
                            {sheetState?.mode === 'edit'
                                ? 'Perbarui data user, role, dan status aktif langsung dari panel.'
                                : 'Buat akun staf baru tanpa membuka registrasi publik.'}
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
            <div className="grid gap-4 py-6">
                <label className="grid gap-2 text-sm font-semibold text-brand-ink">
                    Nama Lengkap
                    <input
                        name="name"
                        defaultValue={user?.name ?? ''}
                        className="h-11 rounded-xl border border-border bg-white px-3 text-sm text-brand-ink"
                    />
                </label>
                <label className="grid gap-2 text-sm font-semibold text-brand-ink">
                    Email
                    <input
                        name="email"
                        type="email"
                        defaultValue={user?.email ?? ''}
                        className="h-11 rounded-xl border border-border bg-white px-3 text-sm text-brand-ink"
                    />
                </label>
                <label className="grid gap-2 text-sm font-semibold text-brand-ink">
                    Password
                    <input
                        name="password"
                        type="password"
                        placeholder={
                            sheetState.mode === 'edit'
                                ? 'Kosongkan jika tidak diubah'
                                : 'Password awal user'
                        }
                        className="h-11 rounded-xl border border-border bg-white px-3 text-sm text-brand-ink"
                    />
                </label>
                <label className="grid gap-2 text-sm font-semibold text-brand-ink">
                    Role
                    <select
                        name="role"
                        defaultValue={user?.role ?? roles[0]?.value}
                        className="h-11 rounded-xl border border-border bg-white px-3 text-sm text-brand-ink cursor-pointer"
                    >
                        {roles.map((role) => (
                            <option key={role.value} value={role.value}>
                                {role.label}
                            </option>
                        ))}
                    </select>
                </label>
                <div className="rounded-xl border border-border bg-white px-4 py-3">
                    <input type="hidden" name="is_active" value="0" />
                    <label className="flex items-center gap-3 text-sm font-semibold text-brand-ink cursor-pointer">
                        <input
                            type="checkbox"
                            name="is_active"
                            value="1"
                            defaultChecked={user?.is_active ?? true}
                            className="rounded border-border text-brand-blue cursor-pointer"
                        />
                        User Aktif
                    </label>
                </div>
            </div>
            <SheetFooter className="border-t border-border/70 pt-4">
                <Button type="submit" className="w-full rounded-xl bg-brand-blue text-white hover:bg-brand-blue-deep cursor-pointer">
                    {sheetState.mode === 'edit'
                        ? 'Simpan Perubahan'
                        : 'Buat User'}
                </Button>
            </SheetFooter>
        </form>
    );
}
