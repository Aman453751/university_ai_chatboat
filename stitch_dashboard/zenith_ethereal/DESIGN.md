# Design System Strategy: The Breathable Interface

## 1. Overview & Creative North Star
**Creative North Star: "The Digital Sanctuary"**
This design system moves away from the aggressive "productivity-first" utility of standard health apps. Instead, it adopts an editorial, high-end approach to wellness. We treat the screen not as a dashboard, but as a series of curated, layered spaces. By breaking the rigid 12-column grid in favor of intentional asymmetry and "breathing" negative space, we create a sense of calm and luxury. The goal is to make the user feel as though they are interacting with fine, heavyweight paper or soft, frosted glass rather than a digital interface.

---

## 2. Colors & Surface Architecture
The palette is a sophisticated interplay of sage, blush, and organic off-whites. The objective is "tonal depth" rather than "structural containment."

### The "No-Line" Rule
**Prohibit 1px solid borders for sectioning.** 
Boundaries must be defined solely through background color shifts. A `surface-container-low` section sitting on a `surface` background provides enough contrast for the eye without the "visual noise" of a stroke.

### Surface Hierarchy & Nesting
Treat the UI as a physical stack of materials. 
- **Base Layer:** `surface` (#f8faf3) or `surface-bright`.
- **Secondary Content:** `surface-container-low` (#f2f4ed).
- **Interactive Modules:** Nest a `surface-container-lowest` (#ffffff) card within a `surface-container-low` section to create a soft, natural lift.

### The "Glass & Gradient" Rule
To elevate the "Zenith" experience, main CTAs and floating elements should utilize **Glassmorphism**. 
- **Floating Nav Background:** `surface` at 70% opacity with a `backdrop-blur` of 20px.
- **Signature Gradients:** For primary CTAs or progress rings, use a subtle linear gradient from `primary` (#55624d) to `primary-container` (#98a68e) at a 135-degree angle. This adds "soul" and organic depth.

---

## 3. Typography
We utilize a pairing of **Manrope** for structural authority and **Plus Jakarta Sans** for modern, approachable legibility.

- **Display & Headlines (Manrope):** Large, airy, and centered. Use `display-lg` (3.5rem) for mood-setting moments (e.g., "Good morning, Sarah"). The generous kerning and scale convey a premium editorial feel.
- **Titles & Body (Plus Jakarta Sans):** These levels provide the "intuitive" functional layer. Use `title-md` for card headings to ensure they feel grounded but elegant.
- **Hierarchy through Weight, not just Size:** Use `primary` color for headlines to keep them soft, and `on-surface-variant` (#444841) for body text to reduce high-contrast eye strain.

---

## 4. Elevation & Depth: Tonal Layering
Traditional shadows are often too "heavy" for a tranquility-focused app. We use **Ambient Softness.**

- **The Layering Principle:** Depth is achieved by "stacking." A `surface-container-highest` element should only appear on top of a `surface-dim` layer. 
- **Ambient Shadows:** When a card must float (e.g., a meditation player), use a shadow with a 40px blur, 0px spread, and 6% opacity. The shadow color must be a tinted version of `primary` (e.g., #55624d at 6%) rather than black.
- **The "Ghost Border" Fallback:** If a border is required for accessibility, use `outline-variant` (#c5c8be) at **15% opacity**. Anything higher disrupts the "Sanctuary" aesthetic.

---

## 5. Components & Primitives

### Cards & Layouts
- **Constraint:** NO divider lines. 
- **Separation:** Use `spacing-8` (2.75rem) to separate content blocks. 
- **Edge Radius:** Use `xl` (1.5rem) for main content cards to maintain a "soft-touch" feel.

### Floating Bottom Navigation
- **Style:** Unboxed and floating. No background container; instead, use a `surface` glassmorphism pill with `full` (9999px) roundedness.
- **Icons:** Thin-stroke (1pt) line-art icons. When active, use a `primary` color glow rather than a solid fill.

### Ring Charts (Wellness Progress)
- **Visuals:** Use a 12pt stroke width with `round` end-caps. 
- **Coloring:** The background track should be `surface-container-highest`. The progress fill should be the `primary` gradient mentioned in Section 2.

### Input Fields
- **Style:** Minimalist. No bottom border or box. Use a `surface-container-low` background with an `xl` corner radius. 
- **States:** On focus, transition the background color to `primary-fixed` (#d9e7cd) rather than adding a heavy border.

---

## 6. Do’s and Don’ts

### Do
- **Do** prioritize negative space. If a screen feels "full," increase the spacing scale by one increment.
- **Do** use `secondary_container` (#fed7d2) for "High-Emotion" moments like completed streaks or badges to provide a soft, warm reward.
- **Do** use asymmetrical layouts (e.g., a header aligned left with a sub-label offset to the right) to break the "standard app" feel.

### Don't
- **Don't** use solid black (#000000) anywhere. Even "on-surface" should be the soft charcoal of #191c18.
- **Don't** use sharp corners. Every interactive element must have at least a `md` (0.75rem) radius to remain "Tranquil."
- **Don't** use "Pop" animations. Use ease-in-out transitions with durations of 400ms+ to mimic the slow pace of a deep breath.

---

## 7. Token Quick-Reference

| Token | Value | Usage |
| :--- | :--- | :--- |
| **Surface Base** | `#f8faf3` | Main background |
| **Surface Nest** | `#ecefe8` | Secondary sections / Content grouping |
| **Interactive Card**| `#ffffff` | Floating modules / Task cards |
| **Primary Accent** | `#55624d` | Key icons, Headlines, Primary Buttons |
| **Soft Callout** | `#755754` | Secondary actions / Warm accents |
| **Radius: Large** | `1rem` | Standard cards and inputs |
| **Radius: XL** | `1.5rem` | Hero containers |