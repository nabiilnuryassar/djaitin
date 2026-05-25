# Fix a bug

Use this when debugging Djaitin.

## Required steps

1. Reproduce or read exact failure.
2. Inspect logs/test output/browser logs if relevant.
3. Trace from route/controller → request/policy → service → model → page props.
4. Identify root cause, not symptom.
5. Add failing test first when possible.
6. Patch smallest safe area.
7. Run targeted test/check.
8. Update docs/spec if behavior contract changed.

## Rules

- Do not silence exceptions to hide the bug.
- Do not delete tests.
- Do not bypass policy.
- Do not mutate stock/payment/order status outside the service layer.
- Do not overwrite unrelated WIP files.

## Output

- Diagnosis.
- Fix summary.
- Files changed.
- Tests run.
- Remaining risk.
