# Design-first implementation prompt

Use this before implementing any UI page/component in Djaitin.

## Required reading

1. `docs/04_UI_UX.md`
2. `docs/06_DESIGN_TASTE_SYSTEM.md`
3. `docs/07_COMPONENT_PATTERNS.md`
4. `docs/08_PAGE_BLUEPRINTS.md`
5. Relevant spec folder.
6. Existing sibling pages/components.

## Objective

Build UI that feels like a premium digital atelier and a serious operations system:

- customer pages: warm, guided, fashion-aware
- office pages: dense, calm, precise
- no generic admin template feel
- no AI slop copy
- no decorative UI that hides data

## Workflow

1. Inspect current page/component convention.
2. Write a short page composition plan.
3. Reuse existing components.
4. Implement smallest page/component changes.
5. Check anti-slop checklist from `docs/06_DESIGN_TASTE_SYSTEM.md`.
6. Run `npm run types:check`, `npm run lint:check`, `npm run format:check` if frontend changed.
7. Report design pattern used and any deviation.

## Hard rules

- One primary action per screen.
- Status is semantic and labeled.
- Tables prioritize density and clarity.
- Customer flows use guided cards and clear CTA.
- Office flows use filters, tables, and precise actions.
- No emojis, fake enthusiasm, or generic marketing copy in app UI.
