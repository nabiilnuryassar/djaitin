# 05 — Development Rules

> Hard rules for agents working in Djaitin.

---

## 1. Before Editing

Run/read:

```bash
git status --short
git branch --show-current
```

Current repo has WIP files. Do not overwrite unrelated changes. If a target file already has user changes, inspect before patching.

---

## 2. Stack Rules

- Laravel 12.
- PHP 8.4.
- Inertia v2 + React 19.
- Tailwind v4.
- Fortify for auth.
- Wayfinder for route/action references.
- Pest 4.
- DomPDF for PDFs.

Do not add Filament, Livewire, Vue, or a separate client router.

---

## 3. Backend Rules

- Controllers stay thin.
- Validation uses FormRequest.
- Authorization uses policies/middleware.
- Business logic goes in Services.
- Status transitions go through dedicated service (`OrderStatusService`, `PaymentService`, etc).
- Stock changes go through `StockService`.
- Audit sensitive office mutations.
- Use explicit return types and parameter types.
- Use PHP 8 constructor property promotion.

---

## 4. Frontend Rules

- Pages live in `resources/js/pages`.
- Shared UI components live in `resources/js/components`.
- Use TypeScript types for page props.
- Use Inertia `Link`, `router`, `useForm`, or `<Form>` patterns correctly.
- Use Wayfinder for generated routes/actions where project convention supports it.
- Reuse existing UI primitives before creating new ones.
- Follow `docs/06_DESIGN_TASTE_SYSTEM.md` for visual taste.

---

## 5. Payment Rules

- Customer cannot upload proof to another customer's order.
- Payment amount validation must protect DP ratio and overpayment thresholds.
- Payment proof visibility requires policy/authorization.
- Refund must go through `PaymentRefundService`.
- Payment status and order status are separate.

---

## 6. Order and Stock Rules

- Order create/update should be transaction-safe.
- Ready-wear stock reservation/release must be concurrency-safe.
- Cancellation releases reserved stock where applicable.
- Production stage changes must be role-checked and audited.

---

## 7. Testing Rules

Backend:

```bash
vendor/bin/pint --test
php artisan test --compact --filter=RelevantTest
php artisan test --compact
```

Frontend:

```bash
npm run lint:check
npm run format:check
npm run types:check
npm run build
```

For any change:

- Add/update Pest tests for changed behavior.
- For frontend page-only changes, at least typecheck + lint + existing route/page test.
- Do not remove tests to make CI green.

---

## 8. Documentation Rules

When implementing a spec:

- Update `specs/NNN_*/02_TASKS.md` checkboxes.
- Update relevant docs if behavior changes.
- Keep docs direct and anti-slop. No filler prose.

---

## 9. Forbidden Actions

- Do not commit `.env`.
- Do not expose payment proof files publicly without controller authorization.
- Do not mutate stock directly in controller.
- Do not bypass policies for office/customer access.
- Do not overwrite WIP uncommitted changes outside the requested scope.
- Do not add major dependencies without approval.
- Do not replace existing design system with random template/components.

---

## 10. Commit Rules

Only commit when user asks. If committing docs/specs only, do not stage unrelated WIP files. Use precise commit message.
