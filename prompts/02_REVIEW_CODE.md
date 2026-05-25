# Review code

Use this to review a local diff, branch, or PR.

## Review Checklist

### Spec compliance

- Does diff match the relevant `specs/NNN_*`?
- Are acceptance criteria satisfied?
- Are task checkboxes truthful?

### Backend

- Controller thin.
- FormRequest exists for mutations.
- Policy/middleware enforces role/ownership.
- Service layer owns business logic.
- Payment/refund/stock/status changes use correct service.
- Audit log written for sensitive office actions.

### Frontend

- Inertia page props typed.
- Wayfinder used where appropriate.
- Existing UI components reused.
- Design docs followed.
- No AI/marketing copy in operational UI.
- Loading/empty/error states exist.

### Security

- Customer cannot access another customer order/payment/address/measurement.
- Office roles cannot access forbidden actions.
- Payment proof URLs are protected.
- No secrets in props/logs.

### Tests

- Happy path.
- Validation failure.
- Authorization/ownership failure.
- Edge cases for payment/stock/status.
- Frontend typecheck/lint if relevant.

## Output

Verdict: APPROVED / CHANGES_REQUESTED / BLOCKED

Then list Critical, Major, Minor findings. Keep it direct.
