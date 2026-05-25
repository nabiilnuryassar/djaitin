# Implement a spec task

Use this prompt to implement one task from `specs/NNN_<feature>/02_TASKS.md`.

## Inputs

- Feature folder: `specs/NNN_<feature>/`
- Task ID/title: e.g. `T-003: Harden payment verification`

## Workflow

1. Read required docs from `prompts/00_START_AGENT.md`.
2. Inspect `git status --short` and current branch.
3. Inspect related current code before writing.
4. Map task to existing implementation; do not duplicate classes.
5. State plan in 5-7 bullets.
6. Implement smallest safe change.
7. Add/update tests.
8. Run targeted checks:
   ```bash
   vendor/bin/pint --test
   php artisan test --compact --filter=RelevantTest
   npm run types:check
   npm run lint:check
   npm run format:check
   ```
   Only run frontend checks when frontend changed.
9. Update `02_TASKS.md` checkbox and relevant docs.
10. Report files changed, tests run, and risks.

## Coding expectations

- Controller thin.
- FormRequest validates.
- Policy/middleware authorizes.
- Service implements business logic.
- React page uses typed props.
- UI follows design docs.
- Sensitive flows audited.
