# 06 — Design Taste System

> Premium design guardrail for Djaitin. The product is a digital atelier, not a generic admin template. Read this before any UI/visual work.

---

## 1. Design Philosophy

Djaitin sits at the crossroads of two audiences:

- Customers ordering custom or ready-wear clothing. They expect calm, fashion-aware UI.
- Office operators managing orders, payments, and production. They expect dense, precise UI.

A single visual system has to serve both without becoming a Bootstrap template or a marketing site.

References to hold while designing:

- Aritzia / Mr Porter / SSENSE — restrained editorial e-commerce.
- Linear / Notion / Pitch — operational density that still feels designed.
- Mercury / Stripe — financial trust, careful typography, deliberate use of color.

Anti-references:

- Generic dashboard templates with rainbow icons and 3D illustrations.
- Marketing landing patterns inside operational pages.
- Glassmorphism, neon, full-bleed gradients on everything.
- Center-aligned forms taking 30% of a 1440px screen.
- AI-style hero copy ("Empower your tailoring journey").

---

## 2. Five Hard Rules

1. **The garment, the order, and the data are the design.** Decoration last.
2. **Customer flows feel calm and fashion-grade**; office flows feel quiet and dense.
3. **One primary action per screen**; everything else is secondary.
4. **Status is semantic** with shape and label, never color alone.
5. **Consistency wins.** Reuse existing components before inventing new ones.

---

## 3. Color System

Tailwind v4 tokens defined in `resources/css/app.css`. Use semantic variables, not hard-coded hex per page.

Suggested palette:

```css
@theme {
  /* surface */
  --color-bg-app: #faf7f2;          /* warm off-white for customer */
  --color-bg-app-office: #f6f7f9;   /* neutral cool for office */
  --color-bg-surface: #ffffff;
  --color-bg-muted: #f1efe9;
  --color-border: #e7e3da;
  --color-border-strong: #cdc7ba;

  /* text */
  --color-text-primary: #1c1a17;
  --color-text-secondary: #5a554c;
  --color-text-muted: #8a847a;
  --color-text-inverse: #ffffff;

  /* brand atelier */
  --color-brand: #6b4f2c;            /* leather brown */
  --color-brand-hover: #563d20;
  --color-brand-soft: #efe6d7;
  --color-accent: #c9a875;           /* warm gold */

  /* status */
  --color-status-success: #2f7d32;
  --color-status-success-soft: #e1efe1;
  --color-status-warning: #b27314;
  --color-status-warning-soft: #fbeed1;
  --color-status-danger: #b3261e;
  --color-status-danger-soft: #f9dada;
  --color-status-neutral: #5a554c;
  --color-status-neutral-soft: #eceae3;
  --color-status-info: #1f5d8c;
  --color-status-info-soft: #dbeaf3;
}
```

Color rules:

- Brand brown is for primary action and active nav state. Not for icons everywhere.
- Status carries one meaning: success = paid/done, warning = waiting/pending, danger = rejected/refunded, info = in production/shipped.
- Customer area can lean warm (off-white, brand brown).
- Office area uses cooler neutrals to reduce visual fatigue.
- Never use more than 7 colors on the same screen.

Dark mode allowed only if every component is verified.

---

## 4. Typography

Use the existing project font stack. Do not import a new typeface for "personality" without approval.

Suggested scale:

| Token | Size | Line height | Use |
|---|---|---|---|
| display-lg | 32px | 1.15 | landing hero |
| display | 24px | 1.2 | landing section, customer hero |
| heading | 18px | 1.3 | page title, card title |
| body | 14px | 1.5 | default body, table cell |
| body-strong | 14px | 1.5 | label, emphasized cell |
| small | 12px | 1.4 | metadata, helper text, badge |
| micro | 11px | 1.3 | timestamp suffix only |

Rules:

- Never use h1 in page body. Layout already provides one.
- Tables use tabular numerals.
- Money: `Rp` prefix, no space, dot thousand separator, two decimals only when needed.
- Indonesian copy in UI, English in code.
- Avoid all-caps except for badges/codes shorter than 6 letters.

---

## 5. Spacing and Density

Tailwind 4-pt scale. Common values:

- Page outer padding: 24px desktop, 16px mobile.
- Section gap: 24px (unrelated), 16px (related).
- Card inner padding: 20px standard, 16px nested.
- Table row height: 44-48px in office, 56-64px in customer if richer per-row content.
- Form field vertical gap: 16-20px.
- Mobile bottom bar height: ~60px.

Customer pages may use slightly more breathing room (warm, calm). Office pages should compress and prioritize density.

---

## 6. Information Hierarchy

Customer page hierarchy:

```text
1. Where am I (page title / breadcrumb)
2. What is the offer/state (hero card or status)
3. What can I do (primary CTA)
4. Supporting context (info, recent orders, etc)
```

Office page hierarchy:

```text
1. Where am I
2. What is the volume/state (metric strip)
3. How do I filter
4. The data
5. What can I do per row
```

If the operator has to scroll past hero/empty area to see the table, it is wrong.

---

## 7. Status Map

Order/production/payment statuses must map to consistent tone. Suggested mapping:

| Domain status | Tone | Label (id) |
|---|---|---|
| order.draft, payment.draft | neutral | Draft |
| order.pending_quote | warning | Menunggu quote |
| order.quoted | info | Quote dikirim |
| payment.waiting_proof | warning | Menunggu bukti |
| payment.proof_uploaded | info | Bukti diunggah |
| payment.verified, order.paid | success | Lunas |
| payment.rejected | danger | Bukti ditolak |
| order.in_production, production.* | info | Produksi |
| order.shipping | info-success | Pengiriman |
| order.completed | success | Selesai |
| order.cancelled | neutral-danger | Dibatalkan |
| payment.refunded | neutral-danger | Refund |

Rules:

- Status badge must include label, not color alone.
- Use small dot or icon for color-blind accessibility.
- Do not invent custom badges per page.

---

## 8. Anti-Slop Checklist

Run through this before committing UI. If any answer is yes, fix it.

1. Did I add a hero banner that says "Welcome back, dear customer"?
2. Did I bold every other phrase in a paragraph?
3. Did I add an emoji to a button or section title?
4. Did I add a marketing CTA inside an operational page?
5. Did I use Title Case With Every Word Capitalized in headings?
6. Did I add three CTAs of equal visual weight on the same screen?
7. Did I add an animation longer than 200ms to a list reload?
8. Did I add a giant illustration on an empty state?
9. Did I add gradient/glassmorphism on a card that does not show data?
10. Did I add a "tip of the day" banner nobody asked for?
11. Did I write "Effortlessly manage" anywhere?
12. Did I round corners to 24px because it looked friendlier?
13. Did I make the danger button the same visual weight as Save?
14. Did I add a tooltip explaining a column whose name already explains itself?
15. Did I use 6 different font weights on one page?

---

## 9. Voice and Copy

Customer copy can be warm but must be specific.

Good:

```text
Pesanan kamu sudah lunas. Kami mulai produksi besok pagi.
Bukti pembayaran tersimpan. Tim kami akan verifikasi dalam 1×24 jam.
```

Bad:

```text
Yay! Terima kasih atas dukunganmu di perjalanan menjahit yang luar biasa ini!
```

Office copy must be operational.

Good:

```text
Pesanan tersimpan.
Refund tercatat dan stok dikembalikan.
Stok tidak cukup. Cek master produk.
```

Bad:

```text
Sukses! Pesanan baru telah ditambahkan ke sistem dengan sempurna.
```

Rules:

- No exclamation marks in operational copy.
- No emoji decoration in copy.
- Use `kamu` for customer, `Anda` only for legal/contract pages.
- Numbers stay numerals.
- Never apologize as the system; just say what to do next.

---

## 10. Accessibility Floor

- Focus ring visible.
- Body text vs surface contrast ≥ 4.5:1.
- Icon-only buttons have aria-label.
- Real `<th scope="col">` and `<label htmlFor>`.
- Modals trap focus; Esc closes.
- Color-only status forbidden.

---

## 11. When to Break the Rules

Break a rule only when:

1. The data legitimately demands it.
2. You record the exception in `specs/NNN_<feature>/00_SPEC.md` under a Design Deviation section.
3. The exception is local to one page, not adopted globally.

Otherwise, follow the rules. Consistency is what makes Djaitin feel premium. Inconsistency is what makes it feel cheap.
