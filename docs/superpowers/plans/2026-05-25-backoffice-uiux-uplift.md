# Djaitin Back Office UI/UX Uplift Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Upgrade Djaitin back office/CMS into a high-class, elegant, functional, systematic, and stable operator experience without AI-slop visual gimmicks.

**Architecture:** Keep the current Laravel 12 + Inertia v2 + React 19 + Tailwind v4 + shadcn structure. Build a small office design system layer first, then migrate the most painful pages into consistent primitives: page header, KPI tile, status badge, data table shell, filter bar, empty state, segmented tabs, and premium card surfaces. Avoid changing business logic unless needed for stable page data.

**Tech Stack:** Laravel 12, Inertia v2, React 19, TypeScript, Tailwind v4, shadcn/ui, Wayfinder, Pest 4, Vite.

---

## 0. Audit Summary

Current admin/back office lives under:

- Routes: `/office/*`, `/office/admin/*`
- Frontend: `resources/js/pages/Office/*`
- Layout: `resources/js/layouts/office-layout.tsx`
- Sidebar: `resources/js/components/app-sidebar.tsx`
- UI primitives: `resources/js/components/ui/*`

Top issues found:

1. Huge monolithic pages:
   - `Office/Orders/Show.tsx` ~1418 lines
   - `Office/Dashboard/Index.tsx` ~757 lines
   - `Office/Reports/Index.tsx` ~720 lines
   - `Office/Admin/Products/Index.tsx` ~547 lines
   - `Office/Admin/MasterData/Index.tsx` ~539 lines
2. Admin subnav weak: sidebar only shows “Admin” link to users; Products/Master Data/Discounts hidden.
3. Mixed language: English + Indonesian labels scattered.
4. Hardcoded colors: `#0F172A`, `#F8FAFF`, `#162044`, `#F9C11A` across pages/components.
5. Native form controls still used despite shadcn `Input`, `Select`, `Sheet`, `Dialog` existing.
6. No shared `DataTable`, `Pagination`, `EmptyState`, `StatusBadge`, `PageHeader`, `KpiTile`.
7. Order detail is too dense; needs sticky summary + tabbed/sectioned detail.
8. Master data inline editing is cluttered.
9. CMS dashboard is basically placeholder.
10. Office pages are visually behind customer UI, which already has stronger premium direction.

---

## 1. File Structure

### New shared office primitives

- `resources/js/components/office/page-header.tsx`
  - Standard page title, description, eyebrow, actions.
- `resources/js/components/office/premium-card.tsx`
  - Branded card surface: larger radius, soft border, clean padding.
- `resources/js/components/office/kpi-tile.tsx`
  - Metric tile for dashboard/report.
- `resources/js/components/office/status-badge.tsx`
  - Central status mapping for order/payment/shipment/production/user/product.
- `resources/js/components/office/empty-state.tsx`
  - Consistent empty state with icon/title/description/action.
- `resources/js/components/office/filter-bar.tsx`
  - Search + select filters + reset action layout.
- `resources/js/components/office/pagination.tsx`
  - Reusable Laravel paginator links.
- `resources/js/components/office/data-table.tsx`
  - Lightweight table shell, not TanStack dependency.
- `resources/js/components/office/segmented-tabs.tsx`
  - Premium tabs for master data/order detail/report sections.
- `resources/js/components/office/section-shell.tsx`
  - Section header + body wrapper for order detail.

### Modified shared layout/style

- `resources/css/app.css`
  - Promote brand colors into Tailwind v4 `@theme` tokens.
- `resources/js/components/app-sidebar.tsx`
  - Add Admin subnavigation for Users, Products, Master Data, Discounts.
- `resources/js/components/app-mobile-bottom-bar.tsx`
  - Remove hardcoded colors; optionally improve role-aware navigation.
- `resources/js/layouts/office-layout.tsx`
  - Keep current layout; no heavy rewrite.

### Modified pages, ordered by priority

- `resources/js/pages/Office/Dashboard/Index.tsx`
- `resources/js/pages/Office/Orders/Index.tsx`
- `resources/js/pages/Office/Orders/Show.tsx`
- `resources/js/pages/Office/Production/Index.tsx`
- `resources/js/pages/Office/Shipping/Index.tsx`
- `resources/js/pages/Office/Payments/Index.tsx`
- `resources/js/pages/Office/Customers/Index.tsx`
- `resources/js/pages/Office/Admin/Users/Index.tsx`
- `resources/js/pages/Office/Admin/Products/Index.tsx`
- `resources/js/pages/Office/Admin/MasterData/Index.tsx`
- `resources/js/pages/Office/Admin/Discounts/Index.tsx`
- `resources/js/pages/Office/Reports/Index.tsx`
- `resources/js/pages/Office/AuditLog/Index.tsx`
- `resources/js/pages/Office/Cms/Dashboard/Index.tsx`

### Tests

- `tests/Feature/OfficeNavigationTest.php`
- `tests/Feature/OfficeDashboardTest.php`
- `tests/Feature/OfficeAdminPagesTest.php`
- `tests/Feature/OfficeOrderDetailTest.php`

---

## 2. Design Direction

Use “atelier operations console” as the design language:

- Base: clean off-white/mist canvas.
- Sidebar: deep navy, premium, stable.
- Accent: restrained gold for priority/actions only.
- Primary: blue for navigational/current state.
- Cards: white/translucent, soft border, high radius, no noisy gradients unless hero/dashboard.
- Typography: Manrope for operational data. Bebas Neue only for display/eyebrow, not dense table headers.
- Density: admin users need scanability. Prefer compact table/list over oversized marketing cards.
- Copy: use Indonesian consistently for backoffice.

Avoid:

- Neon/glow overload.
- Random gradients everywhere.
- Generic “AI dashboard” cards with huge icons.
- Over-abstracted component architecture.
- Dependency additions unless absolutely necessary.

---

## Task 1: Add Office Design Tokens

**Files:**
- Modify: `resources/css/app.css`

### Goal
Make current brand palette available as stable Tailwind utilities instead of hardcoded hex.

- [ ] **Step 1: Add Tailwind v4 theme tokens**

In `resources/css/app.css`, inside existing `@theme inline`, add these mappings:

```css
--color-brand-navy: var(--landing-navy);
--color-brand-blue: var(--landing-primary);
--color-brand-blue-deep: var(--landing-blue-deep);
--color-brand-gold: var(--landing-gold);
--color-brand-mist: var(--landing-mist);
--color-brand-ink: var(--landing-ink);
--color-brand-surface: var(--landing-surface);
```

- [ ] **Step 2: Add office surface utility classes**

Below `@layer base`, add:

```css
@layer components {
    .office-shell {
        @apply min-h-screen bg-brand-mist text-brand-ink;
    }

    .office-surface {
        @apply rounded-2xl border border-border/70 bg-card text-card-foreground shadow-sm;
    }

    .office-surface-premium {
        @apply rounded-[1.5rem] border border-white/70 bg-white/90 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur;
    }

    .office-eyebrow {
        @apply text-xs font-semibold uppercase tracking-[0.22em] text-brand-blue-deep;
    }
}
```

- [ ] **Step 3: Build verify**

Run:

```bash
cd /mnt/c/laragon/www/djaitin
cmd.exe /c "npm run build"
```

Expected: Vite build passes.

- [ ] **Step 4: Commit**

```bash
git add resources/css/app.css
git commit -m "style: add office design tokens"
```

---

## Task 2: Create Core Office UI Primitives

**Files:**
- Create: `resources/js/components/office/page-header.tsx`
- Create: `resources/js/components/office/premium-card.tsx`
- Create: `resources/js/components/office/empty-state.tsx`
- Create: `resources/js/components/office/kpi-tile.tsx`

### Goal
Stop repeating page chrome and card styling manually.

- [ ] **Step 1: Create PageHeader**

Create `resources/js/components/office/page-header.tsx`:

```tsx
import { type ReactNode } from 'react';

interface PageHeaderProps {
    eyebrow?: string;
    title: string;
    description?: string;
    actions?: ReactNode;
}

export function PageHeader({ eyebrow, title, description, actions }: PageHeaderProps) {
    return (
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
                {eyebrow ? <p className="office-eyebrow mb-2">{eyebrow}</p> : null}
                <h1 className="text-3xl font-semibold tracking-tight text-brand-ink md:text-4xl">{title}</h1>
                {description ? <p className="mt-2 text-sm leading-6 text-muted-foreground md:text-base">{description}</p> : null}
            </div>
            {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
        </div>
    );
}
```

- [ ] **Step 2: Create PremiumCard**

Create `resources/js/components/office/premium-card.tsx`:

```tsx
import { cn } from '@/lib/utils';
import { type HTMLAttributes } from 'react';

interface PremiumCardProps extends HTMLAttributes<HTMLDivElement> {
    padded?: boolean;
}

export function PremiumCard({ className, padded = true, ...props }: PremiumCardProps) {
    return <div className={cn('office-surface-premium', padded && 'p-5 md:p-6', className)} {...props} />;
}
```

- [ ] **Step 3: Create EmptyState**

Create `resources/js/components/office/empty-state.tsx`:

```tsx
import { type LucideIcon } from 'lucide-react';
import { type ReactNode } from 'react';

interface EmptyStateProps {
    icon: LucideIcon;
    title: string;
    description: string;
    action?: ReactNode;
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
    return (
        <div className="flex min-h-48 flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-muted/30 px-6 py-10 text-center">
            <span className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-brand-blue/10 text-brand-blue">
                <Icon className="h-5 w-5" />
            </span>
            <h3 className="text-base font-semibold text-brand-ink">{title}</h3>
            <p className="mt-1 max-w-md text-sm leading-6 text-muted-foreground">{description}</p>
            {action ? <div className="mt-4">{action}</div> : null}
        </div>
    );
}
```

- [ ] **Step 4: Create KpiTile**

Create `resources/js/components/office/kpi-tile.tsx`:

```tsx
import { PremiumCard } from '@/components/office/premium-card';
import { cn } from '@/lib/utils';
import { type LucideIcon } from 'lucide-react';

interface KpiTileProps {
    label: string;
    value: string | number;
    icon: LucideIcon;
    helper?: string;
    tone?: 'blue' | 'gold' | 'green' | 'red' | 'slate';
}

const toneClasses = {
    blue: 'bg-brand-blue/10 text-brand-blue',
    gold: 'bg-brand-gold/20 text-brand-ink',
    green: 'bg-emerald-500/10 text-emerald-700',
    red: 'bg-red-500/10 text-red-700',
    slate: 'bg-slate-500/10 text-slate-700',
};

export function KpiTile({ label, value, icon: Icon, helper, tone = 'blue' }: KpiTileProps) {
    return (
        <PremiumCard className="relative overflow-hidden">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <p className="text-sm font-medium text-muted-foreground">{label}</p>
                    <p className="mt-2 text-3xl font-semibold tracking-tight text-brand-ink">{value}</p>
                    {helper ? <p className="mt-2 text-xs text-muted-foreground">{helper}</p> : null}
                </div>
                <span className={cn('inline-flex h-11 w-11 items-center justify-center rounded-2xl', toneClasses[tone])}>
                    <Icon className="h-5 w-5" />
                </span>
            </div>
        </PremiumCard>
    );
}
```

- [ ] **Step 5: Build verify**

```bash
cmd.exe /c "npm run build"
```

- [ ] **Step 6: Commit**

```bash
git add resources/js/components/office resources/css/app.css
git commit -m "feat: add office UI primitives"
```

---

## Task 3: Add StatusBadge + Pagination + FilterBar + DataTable

**Files:**
- Create: `resources/js/components/office/status-badge.tsx`
- Create: `resources/js/components/office/pagination.tsx`
- Create: `resources/js/components/office/filter-bar.tsx`
- Create: `resources/js/components/office/data-table.tsx`

### Goal
Create repeatable data-page patterns for orders, users, products, payments, shipping, and audit.

- [ ] **Step 1: Create StatusBadge**

Create `resources/js/components/office/status-badge.tsx`:

```tsx
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
    value: string;
    domain?: 'order' | 'payment' | 'shipment' | 'production' | 'user' | 'product';
}

const labels: Record<string, string> = {
    draft: 'Draft',
    awaiting_price: 'Menunggu Harga',
    pending_payment: 'Menunggu Pembayaran',
    in_progress: 'Diproses',
    done: 'Selesai Produksi',
    delivered: 'Dikirim',
    pickup: 'Siap Diambil',
    closed: 'Ditutup',
    cancelled: 'Dibatalkan',
    unpaid: 'Belum Dibayar',
    waiting_verification: 'Menunggu Verifikasi',
    paid: 'Lunas',
    refunded: 'Refund',
    rejected: 'Ditolak',
    active: 'Aktif',
    inactive: 'Nonaktif',
};

const tones: Record<string, string> = {
    draft: 'bg-slate-100 text-slate-700 border-slate-200',
    awaiting_price: 'bg-amber-100 text-amber-800 border-amber-200',
    pending_payment: 'bg-orange-100 text-orange-800 border-orange-200',
    waiting_verification: 'bg-blue-100 text-blue-800 border-blue-200',
    in_progress: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    done: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    delivered: 'bg-cyan-100 text-cyan-800 border-cyan-200',
    pickup: 'bg-brand-gold/25 text-brand-ink border-brand-gold/50',
    closed: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    cancelled: 'bg-red-100 text-red-800 border-red-200',
    unpaid: 'bg-slate-100 text-slate-700 border-slate-200',
    paid: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    refunded: 'bg-purple-100 text-purple-800 border-purple-200',
    rejected: 'bg-red-100 text-red-800 border-red-200',
    active: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    inactive: 'bg-slate-100 text-slate-700 border-slate-200',
};

export function StatusBadge({ value }: StatusBadgeProps) {
    const normalized = String(value).toLowerCase();

    return (
        <Badge variant="outline" className={cn('rounded-full px-2.5 py-1 text-xs font-semibold', tones[normalized] ?? 'bg-slate-100 text-slate-700 border-slate-200')}>
            {labels[normalized] ?? value}
        </Badge>
    );
}
```

- [ ] **Step 2: Create Pagination**

Create `resources/js/components/office/pagination.tsx`:

```tsx
import { Link } from '@inertiajs/react';
import { cn } from '@/lib/utils';

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface PaginationProps {
    links?: PaginationLink[];
}

function cleanLabel(label: string): string {
    return label.replace('&laquo;', '‹').replace('&raquo;', '›');
}

export function OfficePagination({ links = [] }: PaginationProps) {
    if (links.length <= 3) {
        return null;
    }

    return (
        <nav className="mt-5 flex flex-wrap items-center justify-end gap-2" aria-label="Pagination">
            {links.map((link, index) => {
                const className = cn(
                    'inline-flex h-9 min-w-9 items-center justify-center rounded-full border px-3 text-sm font-medium transition',
                    link.active ? 'border-brand-blue bg-brand-blue text-white' : 'border-border bg-white text-muted-foreground hover:border-brand-blue hover:text-brand-blue',
                    !link.url && 'pointer-events-none opacity-45',
                );

                return link.url ? (
                    <Link key={`${link.label}-${index}`} href={link.url} className={className} preserveState>
                        <span dangerouslySetInnerHTML={{ __html: cleanLabel(link.label) }} />
                    </Link>
                ) : (
                    <span key={`${link.label}-${index}`} className={className} dangerouslySetInnerHTML={{ __html: cleanLabel(link.label) }} />
                );
            })}
        </nav>
    );
}
```

- [ ] **Step 3: Create FilterBar**

Create `resources/js/components/office/filter-bar.tsx`:

```tsx
import { PremiumCard } from '@/components/office/premium-card';
import { type ReactNode } from 'react';

interface FilterBarProps {
    children: ReactNode;
}

export function FilterBar({ children }: FilterBarProps) {
    return <PremiumCard className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">{children}</PremiumCard>;
}
```

- [ ] **Step 4: Create DataTable shell**

Create `resources/js/components/office/data-table.tsx`:

```tsx
import { cn } from '@/lib/utils';
import { type ReactNode } from 'react';

interface DataTableProps {
    children: ReactNode;
    className?: string;
}

export function DataTable({ children, className }: DataTableProps) {
    return (
        <div className={cn('overflow-hidden rounded-2xl border border-border bg-white shadow-sm', className)}>
            <div className="overflow-x-auto">
                <table className="w-full text-sm">{children}</table>
            </div>
        </div>
    );
}

export function DataTableHead({ children }: { children: ReactNode }) {
    return <thead className="bg-muted/60 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{children}</thead>;
}

export function DataTableBody({ children }: { children: ReactNode }) {
    return <tbody className="divide-y divide-border/70">{children}</tbody>;
}

export function DataTableCell({ children, className }: { children: ReactNode; className?: string }) {
    return <td className={cn('px-4 py-3 align-middle', className)}>{children}</td>;
}

export function DataTableHeaderCell({ children, className }: { children: ReactNode; className?: string }) {
    return <th className={cn('px-4 py-3 text-left align-middle', className)}>{children}</th>;
}
```

- [ ] **Step 5: Build verify and commit**

```bash
cmd.exe /c "npm run build"
git add resources/js/components/office
git commit -m "feat: add office data primitives"
```

---

## Task 4: Improve Sidebar IA for Admin/CMS

**Files:**
- Modify: `resources/js/components/app-sidebar.tsx`
- Test: `tests/Feature/OfficeNavigationTest.php`

### Goal
Make admin tools discoverable: Users, Products, Master Data, Discounts.

- [ ] **Step 1: Add feature test for admin pages reachable**

Create `tests/Feature/OfficeNavigationTest.php`:

```php
<?php

use App\Enums\UserRole;
use App\Models\User;
use Spatie\Permission\Models\Role;

beforeEach(function (): void {
    Role::findOrCreate(UserRole::Admin->value);
});

test('admin can reach all office admin pages', function (): void {
    $admin = User::factory()->create();
    $admin->assignRole(UserRole::Admin->value);

    $this->actingAs($admin)->get(route('office.admin.users.index'))->assertOk();
    $this->actingAs($admin)->get(route('office.admin.products.index'))->assertOk();
    $this->actingAs($admin)->get(route('office.admin.garment-models.index'))->assertOk();
    $this->actingAs($admin)->get(route('office.admin.discounts.index'))->assertOk();
});
```

- [ ] **Step 2: Run test**

```bash
php artisan test tests/Feature/OfficeNavigationTest.php --compact
```

Expected: PASS if routes are already fine.

- [ ] **Step 3: Update sidebar nav items**

In `resources/js/components/app-sidebar.tsx`, replace single Admin nav with grouped admin section if the component supports nested nav. If not, add separate items visible only for admin/owner:

- Pengguna
- Produk Ready-to-Wear
- Master Data
- Diskon Loyalitas

Use existing Wayfinder imports from `@/routes/office/admin/...` if generated. If exact route helper names differ, inspect sibling imports in current file and match them.

Visual rule:

```tsx
{
    title: 'Produk',
    href: products.index.url(),
    icon: Package,
    roles: ['admin', 'owner'],
}
```

- [ ] **Step 4: Replace hardcoded mobile nav colors**

In `resources/js/components/app-mobile-bottom-bar.tsx`, replace:

- `#162044` → `brand-ink` / `brand-navy`
- `#F9C11A` → `brand-gold`

- [ ] **Step 5: Build + commit**

```bash
cmd.exe /c "npm run build"
git add resources/js/components/app-sidebar.tsx resources/js/components/app-mobile-bottom-bar.tsx tests/Feature/OfficeNavigationTest.php
git commit -m "feat: expose admin navigation"
```

---

## Task 5: Upgrade Office Dashboard

**Files:**
- Modify: `resources/js/pages/Office/Dashboard/Index.tsx`
- Test: `tests/Feature/OfficeDashboardTest.php`

### Goal
Make dashboard elegant, scannable, and operationally useful.

- [ ] **Step 1: Add feature test for dashboard data contract**

Create `tests/Feature/OfficeDashboardTest.php`:

```php
<?php

use App\Enums\UserRole;
use App\Models\User;
use Spatie\Permission\Models\Role;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function (): void {
    Role::findOrCreate(UserRole::Admin->value);
});

test('office dashboard exposes operational sections', function (): void {
    $admin = User::factory()->create();
    $admin->assignRole(UserRole::Admin->value);

    $this->actingAs($admin)
        ->get(route('office.dashboard'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Office/Dashboard/Index')
            ->has('metricCards')
            ->has('recentOrders')
            ->has('pendingPayments')
            ->has('productionPulse')
        );
});
```

- [ ] **Step 2: Refactor visual sections only**

In `Office/Dashboard/Index.tsx`:

- Import:

```tsx
import { PageHeader } from '@/components/office/page-header';
import { KpiTile } from '@/components/office/kpi-tile';
import { PremiumCard } from '@/components/office/premium-card';
import { EmptyState } from '@/components/office/empty-state';
import { StatusBadge } from '@/components/office/status-badge';
```

- Replace top title area with:

```tsx
<PageHeader
    eyebrow="Back Office"
    title="Dashboard Operasional"
    description="Pantau pesanan, pembayaran, produksi, dan pengiriman dari satu ruang kerja."
/>
```

- Map `metricCards` into `KpiTile` grid:

```tsx
<div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
    {metricCards.map((card) => (
        <KpiTile key={card.label} label={card.label} value={card.value} helper={card.helper} icon={resolveMetricIcon(card.icon)} tone={resolveMetricTone(card.tone)} />
    ))}
</div>
```

If current `metricCards` shape does not include `icon/tone`, keep existing icon resolver and only move markup.

- Use `PremiumCard` for recent orders, pending payments, production pulse.
- Use `StatusBadge` for every status text.
- Use `EmptyState` if arrays are empty.

- [ ] **Step 3: Keep business logic unchanged**

Do not touch `DashboardController` unless existing props are broken. This task is UI-only.

- [ ] **Step 4: Test/build/commit**

```bash
php artisan test tests/Feature/OfficeDashboardTest.php --compact
cmd.exe /c "npm run build"
git add resources/js/pages/Office/Dashboard/Index.tsx tests/Feature/OfficeDashboardTest.php
git commit -m "feat: refine office dashboard experience"
```

---

## Task 6: Upgrade Orders Index

**Files:**
- Modify: `resources/js/pages/Office/Orders/Index.tsx`

### Goal
Make order queue more operator-friendly: dense list, clear status, clean filters.

- [ ] **Step 1: Replace header with PageHeader**

Use:

```tsx
<PageHeader
    eyebrow="Pesanan"
    title="Antrian Pesanan"
    description="Kelola tailor, ready-to-wear, dan convection order dalam satu daftar operasional."
    actions={can.create ? <Button>Tambah Pesanan</Button> : null}
/>
```

Use existing create link/action in the file; do not invent route URL.

- [ ] **Step 2: Replace filter wrapper with FilterBar**

Use existing form/state, but wrap controls:

```tsx
<FilterBar>
    <div className="flex flex-1 flex-col gap-3 md:flex-row">
        {/* existing search + status */}
    </div>
</FilterBar>
```

Convert native input/select to existing `Input` and `Select` if imports already available; otherwise add from `@/components/ui/input` and `@/components/ui/select`.

- [ ] **Step 3: Use StatusBadge for order status**

Replace raw status text with:

```tsx
<StatusBadge value={order.status} domain="order" />
```

- [ ] **Step 4: Empty state**

If `orders.data.length === 0`, render:

```tsx
<EmptyState icon={Inbox} title="Belum ada pesanan" description="Pesanan yang cocok dengan filter akan tampil di sini." />
```

- [ ] **Step 5: Build + commit**

```bash
cmd.exe /c "npm run build"
git add resources/js/pages/Office/Orders/Index.tsx
git commit -m "feat: refine office order queue"
```

---

## Task 7: Order Detail Structure Pass

**Files:**
- Create: `resources/js/components/office/section-shell.tsx`
- Create: `resources/js/components/office/segmented-tabs.tsx`
- Modify: `resources/js/pages/Office/Orders/Show.tsx`
- Test: `tests/Feature/OfficeOrderDetailTest.php`

### Goal
Reduce clutter in the 1400-line order detail page with stable sections and better hierarchy.

- [ ] **Step 1: Add data contract test**

Create `tests/Feature/OfficeOrderDetailTest.php`:

```php
<?php

use App\Enums\UserRole;
use App\Models\Order;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;
use Spatie\Permission\Models\Role;

beforeEach(function (): void {
    Role::findOrCreate(UserRole::Admin->value);
});

test('office order detail exposes required sections', function (): void {
    $admin = User::factory()->create();
    $admin->assignRole(UserRole::Admin->value);
    $order = Order::factory()->create();

    $this->actingAs($admin)
        ->get(route('office.orders.show', $order))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Office/Orders/Show')
            ->has('order')
            ->has('statusOptions')
            ->has('productionStageOptions')
            ->has('paymentStatusOptions')
        );
});
```

- [ ] **Step 2: Create SectionShell**

Create `resources/js/components/office/section-shell.tsx`:

```tsx
import { PremiumCard } from '@/components/office/premium-card';
import { type ReactNode } from 'react';

interface SectionShellProps {
    title: string;
    description?: string;
    actions?: ReactNode;
    children: ReactNode;
}

export function SectionShell({ title, description, actions, children }: SectionShellProps) {
    return (
        <PremiumCard>
            <div className="mb-5 flex flex-col gap-3 border-b border-border/70 pb-4 md:flex-row md:items-start md:justify-between">
                <div>
                    <h2 className="text-lg font-semibold text-brand-ink">{title}</h2>
                    {description ? <p className="mt-1 text-sm text-muted-foreground">{description}</p> : null}
                </div>
                {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
            </div>
            {children}
        </PremiumCard>
    );
}
```

- [ ] **Step 3: Create SegmentedTabs**

Create `resources/js/components/office/segmented-tabs.tsx`:

```tsx
import { cn } from '@/lib/utils';

interface TabItem {
    value: string;
    label: string;
}

interface SegmentedTabsProps {
    items: TabItem[];
    value: string;
    onChange: (value: string) => void;
}

export function SegmentedTabs({ items, value, onChange }: SegmentedTabsProps) {
    return (
        <div className="inline-flex rounded-full border border-border bg-white p-1 shadow-sm">
            {items.map((item) => (
                <button
                    key={item.value}
                    type="button"
                    onClick={() => onChange(item.value)}
                    className={cn(
                        'rounded-full px-4 py-2 text-sm font-semibold transition',
                        value === item.value ? 'bg-brand-blue text-white shadow-sm' : 'text-muted-foreground hover:text-brand-ink',
                    )}
                >
                    {item.label}
                </button>
            ))}
        </div>
    );
}
```

- [ ] **Step 4: Apply section shells in order detail**

In `Office/Orders/Show.tsx`, do not rewrite all logic. Replace only outer wrappers for existing blocks:

- Summary header → `PageHeader` + `PremiumCard` sticky summary.
- Customer/Measurement block → `SectionShell title="Pelanggan & Ukuran"`.
- Items block → `SectionShell title="Item Pesanan"`.
- Payment block → `SectionShell title="Pembayaran"`.
- Shipment block → `SectionShell title="Pengiriman"`.
- Audit block → `SectionShell title="Riwayat Aktivitas"`.

Use `StatusBadge` for all raw statuses.

- [ ] **Step 5: Test/build/commit**

```bash
php artisan test tests/Feature/OfficeOrderDetailTest.php --compact
cmd.exe /c "npm run build"
git add resources/js/components/office/section-shell.tsx resources/js/components/office/segmented-tabs.tsx resources/js/pages/Office/Orders/Show.tsx tests/Feature/OfficeOrderDetailTest.php
git commit -m "feat: structure office order detail"
```

---

## Task 8: Upgrade Payments, Production, Shipping Operational Queues

**Files:**
- Modify: `resources/js/pages/Office/Payments/Index.tsx`
- Modify: `resources/js/pages/Office/Production/Index.tsx`
- Modify: `resources/js/pages/Office/Shipping/Index.tsx`

### Goal
Make operational queues consistent and fast to scan.

- [ ] **Step 1: Payments page**

Apply:

- `PageHeader` title `Pembayaran`
- Pending payment queue inside `PremiumCard`
- Payment history inside `DataTable`
- `StatusBadge` for payment status
- `EmptyState` for no pending payment

- [ ] **Step 2: Production page**

Apply:

- `PageHeader` title `Produksi`
- `FilterBar` for status/stage
- List/table wrapped in `PremiumCard`/`DataTable`
- `StatusBadge` for order status and production stage
- primary action buttons aligned right with `inline-flex items-center gap-2`

- [ ] **Step 3: Shipping page**

Apply:

- `PageHeader` title `Pengiriman`
- `FilterBar` for shipment status
- `DataTable` with recipient, courier, resi, status, action
- `StatusBadge` for shipment status
- Empty state if no shipment

- [ ] **Step 4: Build + commit**

```bash
cmd.exe /c "npm run build"
git add resources/js/pages/Office/Payments/Index.tsx resources/js/pages/Office/Production/Index.tsx resources/js/pages/Office/Shipping/Index.tsx
git commit -m "feat: refine office operational queues"
```

---

## Task 9: Upgrade Admin Users and Products

**Files:**
- Test: `tests/Feature/OfficeAdminPagesTest.php`
- Modify: `resources/js/pages/Office/Admin/Users/Index.tsx`
- Modify: `resources/js/pages/Office/Admin/Products/Index.tsx`

### Goal
Make admin management pages polished, dense, and consistent.

- [ ] **Step 1: Add page reachability test**

Create `tests/Feature/OfficeAdminPagesTest.php`:

```php
<?php

use App\Enums\UserRole;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;
use Spatie\Permission\Models\Role;

beforeEach(function (): void {
    Role::findOrCreate(UserRole::Admin->value);
});

test('office admin users page renders required props', function (): void {
    $admin = User::factory()->create();
    $admin->assignRole(UserRole::Admin->value);

    $this->actingAs($admin)
        ->get(route('office.admin.users.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Office/Admin/Users/Index')
            ->has('users')
            ->has('roles')
            ->has('can')
        );
});

test('office admin products page renders required props', function (): void {
    $admin = User::factory()->create();
    $admin->assignRole(UserRole::Admin->value);

    $this->actingAs($admin)
        ->get(route('office.admin.products.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Office/Admin/Products/Index')
            ->has('products')
            ->has('filters')
            ->has('can')
        );
});
```

- [ ] **Step 2: Users page visual pass**

In Users page:

- Replace page title with `PageHeader`.
- Use `FilterBar` for search/role filter.
- Use `DataTable` for user list.
- Use `StatusBadge value={user.is_active ? 'active' : 'inactive'}`.
- Use `OfficePagination` for `users.links`.
- Keep create/edit Sheet behavior unchanged.

- [ ] **Step 3: Products page visual pass**

In Products page:

- Replace page title with `PageHeader`.
- Shorten description copy.
- Use `FilterBar` for search/low_stock/clearance.
- Use `DataTable` for product list.
- Use strong price typography:
  - `final_price` main
  - `selling_price` muted/struck if discounted
- Use `OfficePagination` for `products.links`.
- Keep create/edit Sheet behavior unchanged.

- [ ] **Step 4: Test/build/commit**

```bash
php artisan test tests/Feature/OfficeAdminPagesTest.php --compact
cmd.exe /c "npm run build"
git add tests/Feature/OfficeAdminPagesTest.php resources/js/pages/Office/Admin/Users/Index.tsx resources/js/pages/Office/Admin/Products/Index.tsx
git commit -m "feat: refine office admin management pages"
```

---

## Task 10: Upgrade Master Data + Discounts

**Files:**
- Modify: `resources/js/pages/Office/Admin/MasterData/Index.tsx`
- Modify: `resources/js/pages/Office/Admin/Discounts/Index.tsx`

### Goal
Make settings/master-data pages feel controlled, not cluttered.

- [ ] **Step 1: Master Data page**

Apply:

- `PageHeader` title `Master Data`
- `SegmentedTabs` for garment models / fabrics / couriers
- Current active tab content inside one `PremiumCard`
- Replace inline dense form styling with cleaner top action + row action area
- Use `EmptyState` per tab if no records

- [ ] **Step 2: Discounts page**

Apply:

- `PageHeader` title `Diskon Loyalitas`
- Policy editor in `PremiumCard`
- History audit in `DataTable`
- Convert raw old/new values into readable labels:
  - `Minimal order loyalitas`
  - `Persentase diskon loyalitas`
- Keep update action unchanged.

- [ ] **Step 3: Build + commit**

```bash
cmd.exe /c "npm run build"
git add resources/js/pages/Office/Admin/MasterData/Index.tsx resources/js/pages/Office/Admin/Discounts/Index.tsx
git commit -m "feat: refine office settings experience"
```

---

## Task 11: Upgrade Reports + Audit Log

**Files:**
- Modify: `resources/js/pages/Office/Reports/Index.tsx`
- Modify: `resources/js/pages/Office/AuditLog/Index.tsx`

### Goal
Make analytical/admin traceability pages readable and premium.

- [ ] **Step 1: Reports page**

Apply:

- `PageHeader` title `Laporan`
- `KpiTile` for revenue/order/payment/production top metrics
- `PremiumCard` for each report group
- `SegmentedTabs` if the page has multiple report dimensions
- Keep current data props unchanged.

- [ ] **Step 2: Audit log page**

Apply:

- `PageHeader` title `Audit Log`
- `FilterBar` for user/action filters
- `DataTable` for logs
- Small pill for action type
- Old/new values collapsed by default if current file already supports expandable sections; otherwise show concise summary only.

- [ ] **Step 3: Build + commit**

```bash
cmd.exe /c "npm run build"
git add resources/js/pages/Office/Reports/Index.tsx resources/js/pages/Office/AuditLog/Index.tsx
git commit -m "feat: refine reports and audit log UI"
```

---

## Task 12: CMS Dashboard Page

**Files:**
- Modify: `resources/js/pages/Office/Cms/Dashboard/Index.tsx`

### Goal
Replace placeholder CMS dashboard with a useful entry point.

- [ ] **Step 1: Add polished CMS landing**

Use static links only if backend has no props:

- PageHeader: `CMS Dashboard`
- 3 PremiumCards:
  - `Konten Landing` — copy: kelola narasi homepage dan CTA.
  - `Katalog Ready-to-Wear` — link to products admin.
  - `Master Data` — link to garment/fabric/courier settings.

Use Wayfinder route helpers where available.

- [ ] **Step 2: Build + commit**

```bash
cmd.exe /c "npm run build"
git add resources/js/pages/Office/Cms/Dashboard/Index.tsx
git commit -m "feat: add cms dashboard entry points"
```

---

## Task 13: Final Consistency Sweep

**Files:**
- Modify only touched Office files.

### Goal
Remove obvious slop: hardcoded colors, mismatched copy, inconsistent button/icon spacing.

- [ ] **Step 1: Search hardcoded colors in Office pages**

```bash
cd /mnt/c/laragon/www/djaitin
python3 - <<'PY'
from pathlib import Path
for p in Path('resources/js/pages/Office').rglob('*.tsx'):
    text = p.read_text(errors='ignore')
    if '#0F172A' in text or '#F8FAFF' in text or '#162044' in text or '#F9C11A' in text:
        print(p)
PY
```

Replace only touched obvious cases with `brand-*` tokens.

- [ ] **Step 2: Search English office labels**

```bash
python3 - <<'PY'
from pathlib import Path
words = ['Orders', 'Product management', 'User management', 'Discount Policy', 'Customers']
for p in Path('resources/js/pages/Office').rglob('*.tsx'):
    text = p.read_text(errors='ignore')
    hits = [w for w in words if w in text]
    if hits:
        print(p, hits)
PY
```

Translate visible labels to Indonesian:

- Orders → Pesanan
- Product management → Manajemen Produk
- User management → Manajemen Pengguna
- Discount Policy → Kebijakan Diskon
- Customers → Pelanggan

- [ ] **Step 3: Normalize icon buttons**

Any button with icon + label must use:

```tsx
className="inline-flex items-center gap-2"
```

Icon class:

```tsx
className="h-4 w-4"
```

No `mr-1`, `mr-2` on icons in touched files.

- [ ] **Step 4: Build + commit**

```bash
cmd.exe /c "npm run build"
git add resources/js/pages/Office resources/js/components
git commit -m "style: polish office UI consistency"
```

---

## Task 14: Final Verification

### Goal
Prove stable before claiming done.

- [ ] **Step 1: Run targeted tests**

```bash
php artisan test tests/Feature/OfficeNavigationTest.php tests/Feature/OfficeDashboardTest.php tests/Feature/OfficeAdminPagesTest.php tests/Feature/OfficeOrderDetailTest.php --compact
```

- [ ] **Step 2: Run full frontend build**

```bash
cmd.exe /c "npm run build"
```

- [ ] **Step 3: Manual smoke route list**

Open/check in browser or Playwright:

- `/office/dashboard`
- `/office/orders`
- `/office/payments`
- `/office/production`
- `/office/shipping`
- `/office/customers`
- `/office/reports`
- `/office/audit-logs`
- `/office/admin/users`
- `/office/admin/products`
- `/office/admin/garment-models`
- `/office/admin/discounts`
- `/cms/dashboard`

- [ ] **Step 4: Git status**

```bash
git status --short
```

Confirm only intended files changed.

---

## Recommended Execution Strategy

### Fast path — 2 phases

1. **Design system + top-level pages**
   - Tasks 1–5
   - Gives immediate premium feel: sidebar, dashboard, primitives.

2. **Operational pages + consistency**
   - Tasks 6–14
   - Migrates real workflow screens without risky business logic changes.

### Risk control

- Do not rewrite controllers unless tests show missing props.
- Do not add dependencies.
- Do not convert every page at once; commit per group.
- Keep page behavior unchanged while upgrading hierarchy/styling.

---

## Open Decisions

1. Backoffice language: recommendation is **full Indonesian**.
2. Master Data editing: recommendation is **keep inline behavior for now**, just clean visual; modal/drawer edit can be phase 2.
3. Order detail: recommendation is **section shell now**, full tab rewrite later if still cluttered.
4. CMS dashboard: recommendation is **entry point dashboard**, not fake metrics.

---

## Self-Review

- Coverage: covers dashboard/CMS, admin pages, order/production/shipping/payment/customer/report/audit pages, sidebar IA, design tokens, primitives, tests, build verification.
- No placeholder dependencies: no new package required.
- Stability: business logic untouched except tests for route/data contracts.
- Anti-slop guard: explicit constraints against random gradients, generic AI dashboard cards, and visual gimmicks.
