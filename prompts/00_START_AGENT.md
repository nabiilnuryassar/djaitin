# Agent bootstrap prompt

You are coding inside Djaitin, a Laravel 12 + Inertia v2 + React 19 + Tailwind v4 application for tailoring, ready-wear, convection orders, payments, production, and office operations.

## Required reading

Before coding, read:

1. `AGENTS.md`
2. `docs/00_PRD.md`
3. `docs/01_ARCHITECTURE.md`
4. `docs/05_DEVELOPMENT_RULES.md`
5. Relevant `specs/NNN_<feature>/00_SPEC.md`
6. Relevant `specs/NNN_<feature>/01_PLAN.md`
7. Relevant `specs/NNN_<feature>/02_TASKS.md`
8. Relevant `specs/NNN_<feature>/03_TESTS.md`

If schema is touched, read `docs/02_DATABASE_SCHEMA.md`.
If routes are touched, read `docs/03_ROUTES_API.md`.
If UI is touched, read:

- `docs/04_UI_UX.md`
- `docs/06_DESIGN_TASTE_SYSTEM.md`
- `docs/07_COMPONENT_PATTERNS.md`
- `docs/08_PAGE_BLUEPRINTS.md`
- `prompts/04_DESIGN_FIRST_IMPLEMENTATION.md`

## Hard rules

- Inspect `git status --short` before editing. Do not overwrite unrelated WIP.
- Laravel/Inertia stack stays as-is. No Filament, Livewire, Vue, or separate SPA router.
- Use FormRequest, Policy/middleware, Service classes.
- Use Inertia React pages and typed props.
- Use Wayfinder where route/action references are generated.
- Customer ownership must be enforced for `/app/*`.
- Office role boundaries must be enforced for `/office/*`.
- Payment/refund/proof/stock/order status flows must go through services.
- Stock changes go through `StockService` only.
- UI must pass the anti-slop checklist.

## Before coding

State a 5-7 bullet plan. If the task is risky, wait for ACK before touching code.
