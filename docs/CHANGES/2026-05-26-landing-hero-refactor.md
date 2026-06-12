# Landing Page Hero Refactor — Remove Sequence & Add Premium Banner

Date: 2026-05-26  
Area: frontend  
Type: feat  

## Context

The previous landing page hero section utilized a Canvas-based scroll sequence (`SequenceScroll`) requiring preloading of ~100 images. This created massive page load times, high memory usage, and was unoptimized for mobile layouts. The user requested replacing this image sequence with a premium static banner, deleting its files and logic, and building a responsive, high-class landing page layout for "Djaitin SIM Konveksi" that is elegant and anti-AI-slop.

## What changed

- **Generated Premium Banner**: Used the image generator to create a professional tailoring workshop banner (`resources/images/generated/landing-banner.png`) showcasing high-end garments and production lines.
- **Removed Scroll sequence Assets**:
  - Deleted `resources/js/pages/Landing/components/SequenceScroll.tsx`.
  - Deleted the folder `resources/images/sequence` containing all sequence frame frames.
- **Redesigned Hero Section**:
  - Replaced `SequenceScroll` in `resources/js/pages/Landing/Index.tsx` with a responsive split-grid section (`#hero`).
  - Left column: Showcases prominent display header "Refined Garments. Reliable Production.", key stats metrics (Completed orders, Batch capacity, Quality warranty), and premium CTA buttons ("Mulai Sekarang", "Tentang Kami").
  - Right column: Holds the generated workshop banner inside a premium glassmorphic cards frame with subtle gold highlights.
  - Incorporated gentle framer-motion entry transitions (`motion/react`).
  - Set natural page trigger offsets and heights instead of standard `h-[420vh]`.

## Impact

- **Performance**: Instant page load times due to removing preloaded sequence image buffers.
- **Responsive Layout**: Adapts gracefully to all viewports (mobile, tablet, desktop).
- **Design Alignment**: Clean "Authority Navy + Premium Gold" visual tone with Bebas Neue and Manrope typography.

## How to test

1. Build assets:
   ```bash
   npm run build
   ```
2. Verify tests:
   ```bash
   php artisan test tests/Feature/LandingPageTest.php --compact
   ```
